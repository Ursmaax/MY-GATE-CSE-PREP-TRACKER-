// LocalStorage utility for GATE 2028 Study Tracker

const STORAGE_KEY_PROGRESS = 'gate2028_progress_v1';
const STORAGE_KEY_SETTINGS = 'gate2028_settings_v1';
const STORAGE_KEY_NOTES = 'gate2028_notes_v1';
const STORAGE_KEY_CUSTOM_SCHEDULE = 'gate2028_custom_schedule_v1';
const STORAGE_KEY_REVISIONS = 'gate2028_revisions_v1';

export function loadSettings() {
  const defaultSettings = {
    startDate: '2026-08-30',
    lockToday: false,
    showAptitude: true,
    aptitudeMinutes: 30,
    darkMode: true,
    studentName: 'GATE 2028 Aspirant'
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Progress format: { "dayNum_subIdx_taskName": true/false }
export function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

// Notes format: { "dayNum_subIdx": "note text" }
export function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_NOTES);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

// Revisions format: { id: { title, subject, dueDate, status, notes } }
export function loadRevisions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REVISIONS);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function saveRevisions(revisions) {
  try {
    localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(revisions));
  } catch (e) {
    console.error('Failed to save revisions', e);
  }
}

export function exportAllData() {
  const data = {
    settings: loadSettings(),
    progress: loadProgress(),
    notes: loadNotes(),
    revisions: loadRevisions(),
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GATE_2028_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(jsonString, onSuccess, onError) {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
    if (data.progress) localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data.progress));
    if (data.notes) localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(data.notes));
    if (data.revisions) localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(data.revisions));
    onSuccess && onSuccess();
  } catch (e) {
    onError && onError(e);
  }
}
