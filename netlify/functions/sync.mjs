/**
 * GATE 2028 cross-device cloud sync — Netlify Function + Netlify Blobs.
 *
 * GET  /.netlify/functions/sync?action=health
 *      → {"ok":true,"write":true,"read":true,"delete":true}
 *
 * GET  /.netlify/functions/sync?action=get&key=XXXX-XXXX-XXXX
 * POST /.netlify/functions/sync?action=put&key=XXXX-XXXX-XXXX   body: { snapshot }
 * POST /.netlify/functions/sync?action=delete&key=XXXX-XXXX-XXXX
 */

import { getStore } from '@netlify/blobs';
import {
  STORE_NAME,
  isValidSyncKey,
  vaultBlobKey,
  runHealthProbe,
  wrapVaultRecord,
  unwrapVaultRecord,
  jsonByteLength,
  MAX_SNAPSHOT_BYTES
} from '../../src/utils/syncProtocol.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function openStore(getStoreFn, context) {
  const blobs = context?.blobs;
  if (blobs?.siteID && blobs?.token) {
    try {
      return getStoreFn({
        name: STORE_NAME,
        siteID: blobs.siteID,
        token: blobs.token
      });
    } catch {
      // Fall through to the zero-config form used by Functions v2.
    }
  }
  try {
    return getStoreFn(STORE_NAME);
  } catch {
    return getStoreFn({ name: STORE_NAME });
  }
}

async function readJsonBody(request) {
  const method = (request.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return {};
  const raw = typeof request.text === 'function' ? await request.text() : '';
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Request body is not valid JSON.');
  }
}

export async function handleSyncRequest(request, deps = {}) {
  const getStoreFn = deps.getStore || getStore;
  const context = deps.context || {};

  if ((request.method || 'GET').toUpperCase() === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  let body = {};
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message }, 400);
  }

  const method = (request.method || 'GET').toUpperCase();
  const action = String(url.searchParams.get('action') || body.action || '')
    .trim()
    .toLowerCase();
  const key = url.searchParams.get('key') || body.key || '';

  if (action === 'health' || (action === '' && method === 'GET')) {
    try {
      const store = openStore(getStoreFn, context);
      const probe = await runHealthProbe(store);
      return json(probe, probe.ok ? 200 : 503);
    } catch {
      return json({ ok: false, write: false, read: false, delete: false }, 503);
    }
  }

  if (!['get', 'put', 'delete'].includes(action)) {
    return json({ ok: false, error: `Unknown action "${action}". Use health, get, put or delete.` }, 400);
  }

  if (!isValidSyncKey(key)) {
    return json({ ok: false, error: 'A valid 12-character sync key is required.' }, 400);
  }

  let store;
  try {
    store = openStore(getStoreFn, context);
  } catch {
    return json({ ok: false, error: 'Netlify Blobs is not available in this environment.' }, 503);
  }

  const blobKey = await vaultBlobKey(key);

  if (action === 'get') {
    try {
      const raw = await store.get(blobKey, { consistency: 'strong' }).catch(() => store.get(blobKey));
      if (raw == null || raw === '') {
        return json({ ok: true, data: null });
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return json({
        ok: true,
        data: unwrapVaultRecord(parsed),
        updatedAt: parsed?.updatedAt || null
      });
    } catch (error) {
      return json({ ok: false, error: error.message || 'Failed to read vault.' }, 500);
    }
  }

  if (action === 'delete') {
    try {
      await store.delete(blobKey);
      return json({ ok: true });
    } catch (error) {
      return json({ ok: false, error: error.message || 'Failed to delete vault.' }, 500);
    }
  }

  // put
  let snapshot = body.snapshot || body.data || null;
  if (!snapshot && (body.settings || body.progress || body.quizzes || body.tests || body.notes || body.revisions)) {
    snapshot = body;
  }
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return json({ ok: false, error: 'PUT requires a JSON snapshot object.' }, 400);
  }

  const record = wrapVaultRecord({
    settings: snapshot.settings || {},
    progress: snapshot.progress || {},
    notes: snapshot.notes || {},
    revisions: snapshot.revisions || {},
    quizzes: Array.isArray(snapshot.quizzes) ? snapshot.quizzes : [],
    tests: Array.isArray(snapshot.tests) ? snapshot.tests : [],
    updatedAt: snapshot.updatedAt || new Date().toISOString()
  });

  const serialized = JSON.stringify(record);
  if (jsonByteLength(serialized) > MAX_SNAPSHOT_BYTES) {
    return json({ ok: false, error: 'Snapshot exceeds the 1 MB cloud-sync limit.' }, 413);
  }

  try {
    await store.set(blobKey, serialized);
    return json({ ok: true, updatedAt: record.updatedAt });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Failed to write vault.' }, 500);
  }
}

export default async (request, context) => handleSyncRequest(request, { getStore, context });
