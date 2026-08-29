import React, { useState } from 'react';
import { Repeat, Plus, CheckCircle2, Circle, Calendar } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
          SPACED REVISION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Revision & Spaced Repetition System</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keep core concepts fresh in your memory with scheduled revision tasks.
        </p>

        {/* Add Revision Form */}
        <form onSubmit={addRevision} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Topic to revise (e.g. AVL Tree rotations)"
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
          />
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
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
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Revision</span>
          </button>
        </form>
      </div>

      {/* Revision List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map(item => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm flex items-center justify-between transition-all duration-300 ${
                item.completed ? 'border-emerald-300 dark:border-emerald-800 opacity-75' : 'border-slate-200/80 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <button onClick={() => toggleRevision(item.id)}>
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400" />
                  )}
                </button>
                <div>
                  <h4 className={`font-extrabold text-base ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center space-x-2.5 mt-1.5">
                    <span className="text-[10px] font-black uppercase bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-2.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {item.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteRevision(item.id)}
                className="text-xs text-rose-500 hover:underline px-3 py-1.5 font-bold"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-bold">No revision items added yet. Add topics above for spaced repetition.</p>
          </div>
        )}
      </div>
    </div>
  );
}
