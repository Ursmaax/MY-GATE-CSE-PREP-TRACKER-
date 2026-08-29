import React, { useState } from 'react';
import { Settings, Download, Upload, Calendar, Lock, Shield } from 'lucide-react';
import { exportAllData, importAllData } from '../utils/storage';

export default function SettingsView({ settings, setSettings }) {
  const [startDateInput, setStartDateInput] = useState(settings.startDate);
  const [importStatus, setImportStatus] = useState('');

  const handleSaveStartDate = (e) => {
    e.preventDefault();
    const updated = { ...settings, startDate: startDateInput };
    setSettings(updated);
    alert('Start date updated successfully! All week/day dates recalculated.');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importAllData(
        event.target.result,
        () => {
          setImportStatus('Backup restored successfully! Refreshing page...');
          setTimeout(() => window.location.reload(), 1500);
        },
        (err) => setImportStatus('Failed to restore backup: Invalid JSON file.')
      );
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
          SETTINGS & COMMAND CONFIG
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Personalization & Data Safety</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your preparation parameters and secure your progress with local backups.
        </p>
      </div>

      {/* Start Date Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2.5">
          <Calendar className="w-5 h-5 text-sky-500" />
          <span>Preparation Start Date</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Changing your start date automatically recalculates all 189 daily dates without altering your sequence or progress.
        </p>

        <form onSubmit={handleSaveStartDate} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            Update Start Date
          </button>
        </form>
      </div>

      {/* Backup and Data Safety */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2.5">
          <Shield className="w-5 h-5 text-emerald-500" />
          <span>Data Safety & Backups</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Your progress is stored securely in your browser's local storage. Export a JSON backup regularly to prevent data loss.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
          <button
            onClick={exportAllData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-black text-sky-600 dark:text-sky-400 mt-2">{importStatus}</p>
        )}
      </div>
    </div>
  );
}
