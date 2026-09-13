/**
 * Headless verification for cross-device Netlify Blobs cloud sync.
 *
 * Run with:  npm run verify:sync
 */
import { build } from 'esbuild';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  generateSyncKey,
  normalizeSyncKey,
  formatSyncKey,
  isValidSyncKey,
  hashSyncKey,
  vaultBlobKey,
  mergeSnapshots,
  fingerprintSnapshot,
  runHealthProbe,
  wrapVaultRecord,
  unwrapVaultRecord,
  KEY_LENGTH,
  KEY_ALPHABET
} from '../src/utils/syncProtocol.js';
import { handleSyncRequest } from '../netlify/functions/sync.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
let checks = 0;
function assert(condition, message) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${message}`);
  }
}

function createMemoryStore() {
  const map = new Map();
  return {
    async set(key, value) {
      map.set(key, value);
    },
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async delete(key) {
      map.delete(key);
    },
    _map: map
  };
}

function createFailingStore(stage) {
  const inner = createMemoryStore();
  return {
    async set(key, value) {
      if (stage === 'write') throw new Error('write blocked');
      return inner.set(key, value);
    },
    async get(key) {
      if (stage === 'read') throw new Error('read blocked');
      return inner.get(key);
    },
    async delete(key) {
      if (stage === 'delete') throw new Error('delete blocked');
      return inner.delete(key);
    }
  };
}

async function invoke(store, url, { method = 'GET', body } = {}) {
  const init = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const request = new Request(url, init);
  return handleSyncRequest(request, { getStore: () => store, context: {} });
}

console.log('\n1. Sync key generation, normalize, format, hash');
const key = generateSyncKey();
assert(isValidSyncKey(key), `generated key should be valid, got "${key}"`);
assert(key.split('-').length === 3, 'generated key should be grouped XXXX-XXXX-XXXX');
assert(normalizeSyncKey(key).length === KEY_LENGTH, 'normalized key is 12 chars');
assert([...normalizeSyncKey(key)].every((c) => KEY_ALPHABET.includes(c)), 'key chars stay inside the alphabet');
assert(formatSyncKey(normalizeSyncKey(key)) === key, 'format ∘ normalize is identity for generated keys');
assert(isValidSyncKey(normalizeSyncKey(key)), 'key remains valid without dashes');
assert(isValidSyncKey(`  ${key.toLowerCase()}  `), 'lowercase + whitespace is accepted');
assert(!isValidSyncKey('SHORT'), 'short keys are rejected');
assert(!isValidSyncKey('AAAA-AAAA-AAA!'), 'symbols outside the alphabet are rejected');
assert(!isValidSyncKey('IIII-IIII-IIII'), 'ambiguous I is not in the alphabet');

const hashA = await hashSyncKey(key);
const hashB = await hashSyncKey(key.toLowerCase().replace(/-/g, ' '));
assert(hashA === hashB && hashA.length === 64, 'hash is dash/case-insensitive SHA-256 hex');
assert((await vaultBlobKey(key)).startsWith('vault/'), 'vault blob keys are namespaced');

console.log('\n2. Snapshot merge (progress OR, union by id, notes, settings defaults)');
const local = {
  settings: { startDate: '2026-08-30', studentName: 'GATE 2028 Aspirant', darkMode: true, aptitudeMinutes: 30 },
  progress: { '1_0_Lecture 1': true, '2_0_Lecture 2': false },
  notes: { '1_0': 'local note that is longer than remote' },
  revisions: { r1: { id: 'r1', title: 'AVL', completed: false } },
  quizzes: [{ id: 'q1', name: 'Local Quiz', date: '2026-09-12', percentage: 80 }],
  tests: [{ id: 't1', name: 'Local Test', date: '2026-09-10', percentage: 40 }],
  updatedAt: '2026-09-13T01:00:00.000Z'
};
const remote = {
  settings: { startDate: '2026-09-01', studentName: 'Maahi 💗', darkMode: false, aptitudeMinutes: 45 },
  progress: { '1_0_Lecture 1': false, '3_0_Lecture 3': true },
  notes: { '1_0': 'short', '2_0': 'remote only' },
  revisions: { r1: { id: 'r1', title: 'AVL', completed: true }, r2: { id: 'r2', title: 'OS', completed: false } },
  quizzes: [{ id: 'q2', name: 'Remote Quiz', date: '2026-09-13', percentage: 90 }],
  tests: [{ id: 't1', name: 'Local Test renamed remotely', date: '2026-09-10', percentage: 40 }],
  updatedAt: '2026-09-13T00:00:00.000Z'
};
const merged = mergeSnapshots(local, remote);
assert(merged.progress['1_0_Lecture 1'] === true, 'completed tasks must win over incomplete');
assert(merged.progress['3_0_Lecture 3'] === true, 'remote-only progress is kept');
assert(merged.notes['1_0'].includes('longer'), 'longer note wins');
assert(merged.notes['2_0'] === 'remote only', 'remote-only notes are kept');
assert(merged.quizzes.length === 2, 'quizzes union by id');
assert(merged.tests.length === 1 && merged.tests[0].name === 'Local Test', 'same-id tests prefer local');
assert(merged.revisions.r1.completed === true, 'completed revision wins');
assert(merged.revisions.r2.title === 'OS', 'remote-only revisions are kept');
assert(merged.settings.startDate === '2026-09-01', 'factory start date yields to a customized remote date');
assert(merged.settings.studentName === 'Maahi 💗', 'factory student name yields to a customized remote name');
assert(merged.settings.darkMode === true, 'local UI prefs overlay remote');
assert(fingerprintSnapshot(merged) === fingerprintSnapshot(mergeSnapshots(merged, remote)), 'merge is idempotent against remote');

console.log('\n3. Health probe against an in-memory Blobs store');
const mem = createMemoryStore();
const healthy = await runHealthProbe(mem);
assert(healthy.ok === true && healthy.write === true && healthy.read === true && healthy.delete === true,
  `healthy probe should be all-true, got ${JSON.stringify(healthy)}`);
assert([...mem._map.keys()].every((k) => !String(k).startsWith('health/')), 'health probe must delete its leftover key');

const writeFail = await runHealthProbe(createFailingStore('write'));
assert(writeFail.ok === false && writeFail.write === false, 'write failure is reported');
const readFail = await runHealthProbe(createFailingStore('read'));
assert(readFail.write === true && readFail.read === false && readFail.ok === false, 'read failure is reported after a successful write');
const deleteFail = await runHealthProbe(createFailingStore('delete'));
assert(deleteFail.write === true && deleteFail.delete === false && deleteFail.ok === false, 'delete failure is reported');

console.log('\n4. Netlify function: health / get / put / delete');
const store = createMemoryStore();
const healthRes = await invoke(store, 'https://maahigate.netlify.app/.netlify/functions/sync?action=health');
assert(healthRes.status === 200, `health should be HTTP 200, got ${healthRes.status}`);
const healthJson = await healthRes.json();
assert(JSON.stringify(healthJson) === JSON.stringify({ ok: true, write: true, read: true, delete: true }),
  `health JSON must be exactly the four flags, got ${JSON.stringify(healthJson)}`);
assert(healthRes.headers.get('content-type').includes('application/json'), 'health is JSON');
assert(healthRes.headers.get('access-control-allow-origin') === '*', 'CORS is open so GitHub Pages can sync too');

const optionsRes = await invoke(store, 'https://maahigate.netlify.app/.netlify/functions/sync', { method: 'OPTIONS' });
assert(optionsRes.status === 204, 'OPTIONS preflight returns 204');

const badKey = await invoke(store, 'https://maahigate.netlify.app/.netlify/functions/sync?action=get&key=nope');
assert(badKey.status === 400, 'invalid key is rejected');

const emptyGet = await invoke(store, `https://maahigate.netlify.app/.netlify/functions/sync?action=get&key=${encodeURIComponent(key)}`);
const emptyJson = await emptyGet.json();
assert(emptyGet.status === 200 && emptyJson.ok === true && emptyJson.data === null, 'empty vault returns data:null');

const snapshot = {
  settings: { startDate: '2026-09-01' },
  progress: { '1_0_L1': true },
  notes: {},
  revisions: {},
  quizzes: [{ id: 'q1', name: 'Trees', date: '2026-09-12' }],
  tests: [],
  updatedAt: '2026-09-13T02:00:00.000Z'
};
const putRes = await invoke(
  store,
  `https://maahigate.netlify.app/.netlify/functions/sync?action=put&key=${encodeURIComponent(key)}`,
  { method: 'POST', body: { snapshot } }
);
const putJson = await putRes.json();
assert(putRes.status === 200 && putJson.ok === true, `put should succeed, got ${putRes.status} ${JSON.stringify(putJson)}`);

const getRes = await invoke(store, `https://maahigate.netlify.app/.netlify/functions/sync?action=get&key=${encodeURIComponent(key.toLowerCase())}`);
const getJson = await getRes.json();
assert(getJson.ok === true && getJson.data.progress['1_0_L1'] === true, 'get returns the stored snapshot');
assert(getJson.data.quizzes[0].name === 'Trees', 'quiz payload survives the vault round-trip');
assert(unwrapVaultRecord(wrapVaultRecord(snapshot)).quizzes[0].id === 'q1', 'wrap/unwrap is lossless');

const delRes = await invoke(
  store,
  `https://maahigate.netlify.app/.netlify/functions/sync?action=delete&key=${encodeURIComponent(key)}`,
  { method: 'POST' }
);
assert((await delRes.json()).ok === true, 'delete reports ok');
const afterDel = await (await invoke(store, `https://maahigate.netlify.app/.netlify/functions/sync?action=get&key=${encodeURIComponent(key)}`)).json();
assert(afterDel.data === null, 'vault is empty after delete');

const unknown = await invoke(store, 'https://maahigate.netlify.app/.netlify/functions/sync?action=explode');
assert(unknown.status === 400, 'unknown actions are rejected');

const brokenHealth = await invoke(createFailingStore('write'), 'https://maahigate.netlify.app/.netlify/functions/sync?action=health');
assert(brokenHealth.status === 503, 'failed health probe is HTTP 503');
const brokenJson = await brokenHealth.json();
assert(brokenJson.ok === false && brokenJson.write === false, 'failed health still returns the four flags');

console.log('\n5. Settings panel exposes Generate + Connect & Sync');
const cacheRoot = path.join(root, 'node_modules', '.cache');
mkdirSync(cacheRoot, { recursive: true });
const workDir = mkdtempSync(path.join(cacheRoot, 'sync-smoke-'));
const stubPath = path.join(workDir, 'stub.mjs');
writeFileSync(stubPath, `
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};
if (typeof globalThis.window === 'undefined') {
  globalThis.window = { location: { hostname: 'maahigate.netlify.app', origin: 'https://maahigate.netlify.app', reload() {} }, addEventListener() {}, removeEventListener() {} };
}
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { writeText: async () => {} } },
    configurable: true
  });
} catch {
  /* Node 22 already exposes navigator; clipboard is unused during SSR. */
}
globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, write: true, read: true, delete: true, data: null }), { headers: { 'content-type': 'application/json' } });
`);
const entryPath = path.join(workDir, 'entry.jsx');
writeFileSync(entryPath, `
import './stub.mjs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SettingsView from ${JSON.stringify(path.join(root, 'src/components/SettingsView.jsx'))};
export function renderSettings() {
  return renderToStaticMarkup(React.createElement(SettingsView, {
    settings: { startDate: '2026-08-30' },
    setSettings: () => {}
  }));
}
`);
const outfile = path.join(workDir, 'bundle.mjs');
try {
  await build({
    absWorkingDir: root,
    entryPoints: [entryPath],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    jsx: 'automatic',
    target: 'node18',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent'
  });
  const mod = await import(pathToFileURL(outfile).href);
  const html = mod.renderSettings();
  assert(html.includes('Cross-Device Cloud Sync'), 'Settings heading is missing');
  assert(html.includes('Generate'), 'Generate button is missing');
  assert(html.includes('Connect') && html.includes('Sync'), 'Connect & Sync button is missing');
  assert(html.includes('XXXX-XXXX-XXXX'), 'key placeholder is missing');
} catch (error) {
  failures++;
  console.error(`  ✗ Settings smoke crashed: ${error && error.message ? error.message : error}`);
  if (error && error.stack) console.error(error.stack.split('\n').slice(0, 8).join('\n'));
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

const functionSource = readFileSync(path.join(root, 'netlify/functions/sync.mjs'), 'utf8');
assert(functionSource.includes('@netlify/blobs'), 'function must use Netlify Blobs');
assert(functionSource.includes('action=health') || functionSource.includes("action === 'health'"), 'function documents the health action');

const toml = readFileSync(path.join(root, 'netlify.toml'), 'utf8');
assert(toml.includes('netlify/functions'), 'netlify.toml must declare the functions directory');

console.log(`\n${failures === 0 ? '✅' : '❌'} ${checks} assertions run, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
