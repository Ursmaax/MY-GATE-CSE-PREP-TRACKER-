/**
 * Browser client for GATE 2028 cross-device cloud sync.
 *
 * Talks to `/.netlify/functions/sync`, which persists snapshots in Netlify Blobs.
 * A generated key is the only credential — treat it like a password.
 */

import {
  formatSyncKey,
  generateSyncKey,
  isValidSyncKey,
  mergeSnapshots,
  fingerprintSnapshot
} from './syncProtocol';
import {
  collectSnapshot,
  applySnapshot,
  subscribeDataChanges
} from './storage';

export const SYNC_KEY_STORAGE = 'gate2028_sync_key';
export const SYNC_META_STORAGE = 'gate2028_sync_meta';
export const PRODUCTION_SYNC_ORIGIN = 'https://maahigate.netlify.app';

const PUSH_DEBOUNCE_MS = 1600;

export function getSyncEndpoint() {
  if (typeof window === 'undefined') {
    return `${PRODUCTION_SYNC_ORIGIN}/.netlify/functions/sync`;
  }
  const host = window.location.hostname || '';
  if (host.endsWith('netlify.app') || host === 'localhost' || host === '127.0.0.1') {
    // Same-origin on the Netlify site. Local Vite has no function, so we
    // fall through to production unless a relative endpoint is reachable —
    // localhost still uses production so phone ↔ laptop testing works.
    if (host.endsWith('netlify.app')) {
      return `${window.location.origin}/.netlify/functions/sync`;
    }
  }
  return `${PRODUCTION_SYNC_ORIGIN}/.netlify/functions/sync`;
}

export function loadSyncKey() {
  try {
    const raw = localStorage.getItem(SYNC_KEY_STORAGE);
    return raw ? formatSyncKey(raw) : '';
  } catch {
    return '';
  }
}

export function saveSyncKey(key) {
  const formatted = formatSyncKey(key);
  localStorage.setItem(SYNC_KEY_STORAGE, formatted);
  return formatted;
}

export function clearSyncKey() {
  try {
    localStorage.removeItem(SYNC_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

export function loadSyncMeta() {
  try {
    const raw = localStorage.getItem(SYNC_META_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSyncMeta(meta) {
  try {
    localStorage.setItem(SYNC_META_STORAGE, JSON.stringify({ ...loadSyncMeta(), ...meta }));
  } catch {
    /* ignore */
  }
}

async function callSync(action, { key, snapshot, method } = {}) {
  const endpoint = getSyncEndpoint();
  const url = new URL(endpoint);
  url.searchParams.set('action', action);
  if (key) url.searchParams.set('key', normalizeForQuery(key));

  const init = {
    method: method || (snapshot ? 'POST' : 'GET'),
    headers: { Accept: 'application/json' }
  };

  if (snapshot) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify({ snapshot });
  }

  const response = await fetch(url.toString(), init);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok && !body) {
    throw new Error(`Cloud sync failed (${response.status})`);
  }
  return { ok: response.ok, status: response.status, body };
}

function normalizeForQuery(key) {
  return formatSyncKey(key);
}

export async function fetchCloudHealth() {
  try {
    const { body } = await callSync('health');
    return body || { ok: false, write: false, read: false, delete: false };
  } catch {
    return { ok: false, write: false, read: false, delete: false };
  }
}

export async function pullCloudSnapshot(key) {
  const { body } = await callSync('get', { key });
  if (!body?.ok) {
    throw new Error(body?.error || 'Could not read the cloud vault.');
  }
  return body.data || null;
}

export async function pushCloudSnapshot(key, snapshot = collectSnapshot()) {
  const { body } = await callSync('put', { key, snapshot, method: 'POST' });
  if (!body?.ok) {
    throw new Error(body?.error || 'Could not write the cloud vault.');
  }
  saveSyncMeta({ lastSyncedAt: new Date().toISOString(), lastError: '', lastAction: 'push' });
  return body;
}

export function createLocalKey() {
  const key = generateSyncKey();
  saveSyncKey(key);
  return key;
}

/**
 * Connect this device to a vault and reconcile local + remote data.
 * Returns { key, merged, applied, created }.
 */
export async function connectAndSync(rawKey) {
  if (!isValidSyncKey(rawKey)) {
    throw new Error('That key is not valid. Use Generate, or type the 12-character key from your other device.');
  }
  const key = saveSyncKey(rawKey);
  const local = collectSnapshot();
  const remote = await pullCloudSnapshot(key);
  const merged = remote ? mergeSnapshots(local, remote) : local;
  const localFp = fingerprintSnapshot(local);
  const mergedFp = fingerprintSnapshot(merged);
  const applied = mergedFp !== localFp;

  if (applied) {
    applySnapshot(merged, { silent: true });
  }

  await pushCloudSnapshot(key, { ...merged, updatedAt: new Date().toISOString() });
  saveSyncMeta({
    lastSyncedAt: new Date().toISOString(),
    lastError: '',
    lastAction: remote ? 'connect-merge' : 'connect-create'
  });

  return { key, merged, applied, created: !remote };
}

export async function syncNow() {
  const key = loadSyncKey();
  if (!key) throw new Error('Generate or enter a sync key first.');
  return connectAndSync(key);
}

export function disconnectThisDevice() {
  clearSyncKey();
  saveSyncMeta({ lastAction: 'disconnect', lastError: '' });
}

let pushTimer = null;
let initCleanup = null;

async function debouncedPush() {
  const key = loadSyncKey();
  if (!key) return;
  try {
    await pushCloudSnapshot(key);
  } catch (error) {
    saveSyncMeta({ lastError: error.message || String(error) });
  }
}

export function initCloudSync({ onRemoteApplied } = {}) {
  if (initCleanup) initCleanup();

  let cancelled = false;

  const unsubscribe = subscribeDataChanges(() => {
    if (!loadSyncKey()) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      if (!cancelled) debouncedPush();
    }, PUSH_DEBOUNCE_MS);
  });

  (async () => {
    const key = loadSyncKey();
    if (!key || cancelled) return;
    try {
      const local = collectSnapshot();
      const remote = await pullCloudSnapshot(key);
      if (cancelled || !remote) return;
      const merged = mergeSnapshots(local, remote);
      if (fingerprintSnapshot(merged) !== fingerprintSnapshot(local)) {
        applySnapshot(merged, { silent: true });
        saveSyncMeta({ lastSyncedAt: new Date().toISOString(), lastAction: 'boot-pull' });
        if (typeof onRemoteApplied === 'function') onRemoteApplied(merged);
      }
    } catch (error) {
      saveSyncMeta({ lastError: error.message || String(error) });
    }
  })();

  initCleanup = () => {
    cancelled = true;
    unsubscribe();
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = null;
  };
  return initCleanup;
}
