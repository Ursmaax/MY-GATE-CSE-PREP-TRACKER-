import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Circle, Calendar, Sparkles } from 'lucide-react';
import { loadRevisions, saveRevisions } from '../utils/storage';

export default function RevisionView() {
  const [revisions, setRevisions] = useState(() => loadRevisions());
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Data Structures');
  const [newDueDate, setNewDueDate] = useState('');

  const addRevision = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = Date.now().toString();
    const updated = {
      ...revisions,
      [id]: { id, title: newTitle, subject: newSubject, dueDate: newDueDate || new Date().toISOString().split('T')[0], completed: false }
    };
    setRevisions(updated);
    saveRevisions(updated);
    setNewTitle('');
  };

  const toggleRevision = (id) => {
    const updated = {
      ...revisions,
      [id]: { ...revisions[id], completed: !revisions[id].completed }
    };
    setRevisions(updated);
    saveRevisions(updated);
  };

  const deleteRevision = (id) => {
    const updated = { ...revisions };
    delete updated[id];
    setRevisions(updated);
    saveRevisions(updated);
  };

  const items = Object.values(revisions);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans text-white">
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl">
        <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
          ✨ SPACED REVISION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Revision & Spaced Repetition System</h2>
        <p className="text-sm text-pink-200/70 mt-1 font-medium">
          Keep core concepts fresh in your memory with scheduled revision tasks.
        </p>

        {/* Add Revision Form */}
        <form onSubmit={addRevision} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Topic to revise (e.g. AVL Tree rotations)"
            className="flex-1 bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
          />
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="bg-[#120720] border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
          >
            <option value="Data Structures">Data Structures</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="DBMS">DBMS</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
          </select>
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Revision</span>
          </button>
        </form>
      </div>

      {/* Revision List */}
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map(item => (
            <div
              key={item.id}
              className={`w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 border shadow-xl flex items-center justify-between transition-all duration-300 ${
                item.completed ? 'border-emerald-500/40 opacity-75' : 'border-pink-500/20 hover:border-pink-500/40'
              }`}
            >
              <div className="flex items-center space-x-4">
                <button onClick={() => toggleRevision(item.id)}>
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-pink-400/60" />
                  )}
                </button>
                <div>
                  <h4 className={`font-extrabold text-base ${item.completed ? 'line-through text-pink-300/50' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className="text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded border border-pink-500/30">
                      {item.subject}
                    </span>
                    <span className="text-xs text-pink-200/60 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>Due: {item.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteRevision(item.id)}
                className="text-xs text-rose-400 hover:underline px-4 py-2 font-black bg-rose-500/10 rounded-xl border border-rose-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-12 text-center border border-pink-500/20 shadow-sm">
            <p className="text-pink-200/70 text-sm font-bold">No revision items added yet. Add topics above for spaced repetition.</p>
          </div>
        )}
      </div>
    </div>
  );
}
