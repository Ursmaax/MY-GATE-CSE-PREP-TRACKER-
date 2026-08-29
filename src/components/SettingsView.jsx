import React, { useState } from 'react';
import { Settings, Download, Upload, Calendar, Lock, Shield, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans text-white">
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl">
        <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
          ✨ SETTINGS & COMMAND CONFIG
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Personalization & Data Safety</h2>
        <p className="text-sm text-pink-200/70 mt-1 font-medium">
          Configure your preparation parameters and secure your progress with local backups.
        </p>
      </div>

      {/* Start Date Configuration */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="font-black text-lg text-white flex items-center space-x-2.5">
          <Calendar className="w-5 h-5 text-pink-400" />
          <span>Preparation Start Date</span>
        </h3>
        <p className="text-xs text-pink-200/70 font-medium">
          Changing your start date automatically recalculates all 189 daily dates without altering your sequence or progress.
        </p>

        <form onSubmit={handleSaveStartDate} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/30 transition-all"
          >
            Update Start Date
          </button>
        </form>
      </div>

      {/* Backup and Data Safety */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="font-black text-lg text-white flex items-center space-x-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Data Safety & Backups</span>
        </h3>
        <p className="text-xs text-pink-200/70 font-medium">
          Your progress is stored securely in your browser's local storage. Export a JSON backup regularly to prevent data loss.
        </p>

        <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
          <button
            onClick={exportAllData}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="bg-white/5 hover:bg-white/10 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all border border-pink-500/25">
            <Upload className="w-4 h-4 text-pink-400" />
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-black text-pink-300 mt-2">{importStatus}</p>
        )}
      </div>
    </div>
  );
}
