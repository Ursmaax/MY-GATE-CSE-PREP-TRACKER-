import React, { useState } from 'react';
import { Shield, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export default function SubjectsView({ scheduleData, progress }) {
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjectsList = [
    'All',
    'C Programming',
    'Data Structures',
    'Algorithms',
    'Discrete Mathematics',
    'Theory of Computation',
    'Compiler Design',
    'Digital Logic',
    'Computer Organization & Architecture',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Engineering Mathematics',
    'Fundamentals (Aptitude Package)'
  ];

  const subjectStats = {};
  subjectsList.filter(s => s !== 'All').forEach(sub => {
    subjectStats[sub] = { totalTasks: 0, completedTasks: 0, lecturesCount: 0 };
  });

  scheduleData.forEach(week => {
    week.days.forEach(day => {
      day.subjects.forEach((sub, sIdx) => {
        let matchedSub = Object.keys(subjectStats).find(s => sub.name.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sub.name.toLowerCase()));
        if (!matchedSub) matchedSub = 'Database Management Systems';

        sub.tasks.forEach(task => {
          subjectStats[matchedSub].totalTasks++;
          if (progress[`${day.dayNum}_${sIdx}_${task}`]) {
            subjectStats[matchedSub].completedTasks++;
          }
        });
        subjectStats[matchedSub].lecturesCount++;
      });
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
          SUBJECT TRACKER
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">GATE CSE Core & Engineering Subjects</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor completion percentages across all core computer science subjects and mathematics.
        </p>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {subjectsList.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                selectedSubject === sub
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(subjectStats)
          .filter(([subName]) => selectedSubject === 'All' || subName === selectedSubject)
          .map(([subName, stats]) => {
            const pct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

            return (
              <div
                key={subName}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800">
                      GATE CSE
                    </span>
                    <h3 className="font-black text-base mt-2.5 text-slate-900 dark:text-slate-100">{subName}</h3>
                  </div>
                  <span className="text-lg font-black text-sky-600 dark:text-sky-400">{pct}%</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-bold">
                  <span>Scheduled Lectures: {stats.lecturesCount}</span>
                  <span>{stats.completedTasks} / {stats.totalTasks} Tasks</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
