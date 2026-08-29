import React, { useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

export default function SearchModal({ scheduleData, onClose, setActiveTab }) {
  const [query, setQuery] = useState('');

  const results = [];
  if (query.trim().length > 1) {
    const q = query.toLowerCase();
    scheduleData.forEach(week => {
      week.days.forEach(day => {
        day.subjects.forEach(sub => {
          if (
            sub.name.toLowerCase().includes(q) ||
            sub.lecture.toLowerCase().includes(q) ||
            sub.module.toLowerCase().includes(q)
          ) {
            results.push({
              weekNum: week.weekNumber,
              dayNum: day.dayNum,
              date: day.date,
              subject: sub.name,
              lecture: sub.lecture
            });
          }
        });
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-20">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lectures, subjects, modules (e.g. 'Pointers', 'AVL Tree')..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-base focus:outline-none"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {query.trim().length <= 1 ? (
            <p className="text-center text-xs text-slate-400 py-8">Type at least 2 characters to search across all 27 weeks...</p>
          ) : results.length > 0 ? (
            results.slice(0, 30).map((res, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onClose();
                  setActiveTab('today');
                }}
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded">
                      Week {res.weekNum} • Day {res.dayNum}
                    </span>
                    <span className="text-xs text-slate-400">{res.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-1">{res.lecture}</h4>
                  <p className="text-xs text-slate-500">{res.subject}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-slate-400 py-8">No matching lectures found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
