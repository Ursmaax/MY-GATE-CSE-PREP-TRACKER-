// LocalStorage utility for GATE 2028 Study Tracker (Upgraded with Quizzes and Tests persistence)

const STORAGE_KEY_PROGRESS = 'gate2028_progress_v1';
const STORAGE_KEY_SETTINGS = 'gate2028_settings_v1';
const STORAGE_KEY_NOTES = 'gate2028_notes_v1';
const STORAGE_KEY_REVISIONS = 'gate2028_revisions_v1';
const STORAGE_KEY_QUIZZES = 'gate2028_quizzes_v1';
const STORAGE_KEY_TESTS = 'gate2028_tests_v1';

export function loadSettings() {
  const defaultSettings = {
    startDate: '2026-08-30',
    lockToday: false,
    showAptitude: true,
    aptitudeMinutes: 30,
    darkMode: true,
    is24Hour: false,
    studentName: 'GATE 2028 Aspirant'
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

const dataListeners = new Set();

export function subscribeDataChanges(fn) {
  dataListeners.add(fn);
  return () => dataListeners.delete(fn);
}

function notifyDataChanged(silent) {
  if (silent) return;
  for (const fn of dataListeners) {
    try {
      fn();
    } catch (e) {
      console.error('Data-change listener failed', e);
    }
  }
}

export function saveSettings(settings, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveProgress(progress, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

export function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTES);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveNotes(notes, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function loadRevisions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REVISIONS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveRevisions(revisions, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(revisions));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save revisions', e);
  }
}

export function loadQuizzes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_QUIZZES);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveQuizzes(quizzes, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(quizzes));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save quizzes', e);
  }
}

export function loadTests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TESTS);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveTests(tests, { silent = false } = {}) {
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
    notifyDataChanged(silent);
  } catch (e) {
    console.error('Failed to save tests', e);
  }
}

export function exportAllData() {
  const data = {
    settings: loadSettings(),
    progress: loadProgress(),
    notes: loadNotes(),
    revisions: loadRevisions(),
    quizzes: loadQuizzes(),
    tests: loadTests(),
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GATE_2028_Command_Center_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function collectSnapshot() {
  return {
    settings: loadSettings(),
    progress: loadProgress(),
    notes: loadNotes(),
    revisions: loadRevisions(),
    quizzes: loadQuizzes(),
    tests: loadTests(),
    updatedAt: new Date().toISOString()
  };
}

export function applySnapshot(snapshot, { silent = true } = {}) {
  if (!snapshot || typeof snapshot !== 'object') return;
  const opts = { silent };
  if (snapshot.settings) saveSettings(snapshot.settings, opts);
  if (snapshot.progress) saveProgress(snapshot.progress, opts);
  if (snapshot.notes) saveNotes(snapshot.notes, opts);
  if (snapshot.revisions) saveRevisions(snapshot.revisions, opts);
  if (snapshot.quizzes) saveQuizzes(snapshot.quizzes, opts);
  if (snapshot.tests) saveTests(snapshot.tests, opts);
}

export function importAllData(jsonString, onSuccess, onError) {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
    if (data.progress) localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data.progress));
    if (data.notes) localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(data.notes));
    if (data.revisions) localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(data.revisions));
    if (data.quizzes) localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data.quizzes));
    if (data.tests) localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(data.tests));
    onSuccess && onSuccess();
  } catch (e) {
    onError && onError(e);
  }
}
