/**
 * Shared protocol for GATE 2028 cross-device cloud sync.
 *
 * Used by the Netlify Blobs function and by the browser client so key
 * hashing, snapshot merging and the health probe stay in lockstep.
 */

export const STORE_NAME = 'gate-cse-sync';
export const PROTOCOL_VERSION = 1;
export const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const KEY_LENGTH = 12;
export const HASH_NAMESPACE = 'gate2028.cloud-sync.v1';
export const MAX_SNAPSHOT_BYTES = 1_000_000;

export function generateSyncKey(randomSource = globalThis.crypto) {
  if (!randomSource || typeof randomSource.getRandomValues !== 'function') {
    throw new Error('A crypto source with getRandomValues is required to generate a sync key.');
  }
  const bytes = new Uint8Array(KEY_LENGTH);
  randomSource.getRandomValues(bytes);
  const chars = [...bytes].map((b) => KEY_ALPHABET[b % KEY_ALPHABET.length]);
  return formatSyncKey(chars.join(''));
}

export function normalizeSyncKey(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatSyncKey(input) {
  const normalized = normalizeSyncKey(input);
  if (normalized.length !== KEY_LENGTH) return normalized;
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}`;
}

export function isValidSyncKey(input) {
  const normalized = normalizeSyncKey(input);
  if (normalized.length !== KEY_LENGTH) return false;
  for (const char of normalized) {
    if (!KEY_ALPHABET.includes(char)) return false;
  }
  return true;
}

export async function hashSyncKey(input) {
  const normalized = normalizeSyncKey(input);
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error('WebCrypto is required to hash a sync key.');
  }
  const bytes = new TextEncoder().encode(`${HASH_NAMESPACE}:${normalized}`);
  const digest = await cryptoObj.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function vaultBlobKey(input) {
  return `vault/${await hashSyncKey(input)}`;
}

export function emptySnapshot() {
  return {
    settings: {},
    progress: {},
    notes: {},
    revisions: {},
    quizzes: [],
    tests: [],
    updatedAt: null
  };
}

export function fingerprintSnapshot(snapshot = {}) {
  const payload = {
    settings: pickSettingsForSync(snapshot.settings || {}),
    progress: snapshot.progress || {},
    notes: snapshot.notes || {},
    revisions: snapshot.revisions || {},
    quizzes: snapshot.quizzes || [],
    tests: snapshot.tests || []
  };
  return JSON.stringify(payload);
}

function pickSettingsForSync(settings) {
  return {
    startDate: settings.startDate || '',
    lockToday: !!settings.lockToday,
    showAptitude: settings.showAptitude !== false,
    aptitudeMinutes: settings.aptitudeMinutes ?? 30,
    studentName: settings.studentName || ''
  };
}

function mergeBoolMap(local = {}, remote = {}) {
  const out = { ...remote };
  for (const [key, value] of Object.entries(local || {})) {
    out[key] = Boolean(out[key] || value);
  }
  return out;
}

function mergeNotes(local = {}, remote = {}) {
  const keys = new Set([...Object.keys(remote || {}), ...Object.keys(local || {})]);
  const out = {};
  for (const key of keys) {
    const a = local?.[key];
    const b = remote?.[key];
    if (a == null || a === '') out[key] = b;
    else if (b == null || b === '') out[key] = a;
    else if (a === b) out[key] = a;
    else if (String(a).length !== String(b).length) {
      out[key] = String(a).length >= String(b).length ? a : b;
    } else {
      out[key] = String(a) >= String(b) ? a : b;
    }
  }
  return out;
}

function mergeById(localList = [], remoteList = []) {
  const map = new Map();
  for (const item of [...(remoteList || []), ...(localList || [])]) {
    if (!item || item.id == null) continue;
    map.set(String(item.id), item);
  }
  return [...map.values()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

function mergeRevisions(local = {}, remote = {}) {
  const keys = new Set([...Object.keys(remote || {}), ...Object.keys(local || {})]);
  const out = {};
  for (const key of keys) {
    const a = local?.[key];
    const b = remote?.[key];
    if (!a) out[key] = b;
    else if (!b) out[key] = a;
    else out[key] = { ...b, ...a, completed: Boolean(a.completed || b.completed) };
  }
  return out;
}

const DEFAULT_START_DATE = '2026-08-30';
const DEFAULT_STUDENT_NAME = 'GATE 2028 Aspirant';

function mergeSettings(local = {}, remote = {}) {
  const out = { ...(remote || {}), ...(local || {}) };
  if (
    (local?.startDate === DEFAULT_START_DATE || !local?.startDate) &&
    remote?.startDate &&
    remote.startDate !== DEFAULT_START_DATE
  ) {
    out.startDate = remote.startDate;
  }
  if (
    (!local?.studentName || local.studentName === DEFAULT_STUDENT_NAME) &&
    remote?.studentName &&
    remote.studentName !== DEFAULT_STUDENT_NAME
  ) {
    out.studentName = remote.studentName;
  }
  return out;
}

export function mergeSnapshots(local, remote) {
  if (!remote) return local || emptySnapshot();
  if (!local) return remote;
  return {
    settings: mergeSettings(local.settings, remote.settings),
    progress: mergeBoolMap(local.progress, remote.progress),
    notes: mergeNotes(local.notes, remote.notes),
    revisions: mergeRevisions(local.revisions, remote.revisions),
    quizzes: mergeById(local.quizzes, remote.quizzes),
    tests: mergeById(local.tests, remote.tests),
    updatedAt: new Date().toISOString()
  };
}

export function wrapVaultRecord(snapshot) {
  return {
    v: PROTOCOL_VERSION,
    updatedAt: snapshot?.updatedAt || new Date().toISOString(),
    snapshot
  };
}

export function unwrapVaultRecord(record) {
  if (!record) return null;
  if (record.snapshot) return record.snapshot;
  return record;
}

async function storeGet(store, key) {
  try {
    return await store.get(key, { consistency: 'strong' });
  } catch {
    return store.get(key);
  }
}

/**
 * Prove Netlify Blobs can write, read and delete. Returns exactly:
 * { ok, write, read, delete }
 */
export async function runHealthProbe(store) {
  const result = { ok: false, write: false, read: false, delete: false };
  if (!store || typeof store.set !== 'function') return result;

  const key = `health/probe-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const payload = `ok:${key}`;

  try {
    await store.set(key, payload);
    result.write = true;
  } catch {
    return result;
  }

  try {
    const got = await storeGet(store, key);
    result.read = got === payload;
  } catch {
    result.read = false;
  }

  try {
    await store.delete(key);
    let leftover = undefined;
    try {
      leftover = await storeGet(store, key);
    } catch {
      leftover = null;
    }
    result.delete = leftover == null;
  } catch {
    result.delete = false;
  }

  result.ok = result.write && result.read && result.delete;
  return result;
}

export function jsonByteLength(value) {
  return new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).length;
}
