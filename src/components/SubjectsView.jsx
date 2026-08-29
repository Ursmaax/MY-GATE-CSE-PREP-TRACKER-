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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans relative">
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl text-white">
        <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
          ✨ SUBJECT TRACKER
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">GATE CSE Core & Engineering Subjects</h2>
        <p className="text-sm text-pink-200/70 mt-1 font-medium">
          Monitor completion percentages across all core computer science subjects and mathematics.
        </p>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap gap-2.5 mt-6">
          {subjectsList.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                selectedSubject === sub
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-lg shadow-pink-500/30 scale-105 border border-pink-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-pink-100/70 border border-white/10'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(subjectStats)
          .filter(([subName]) => selectedSubject === 'All' || subName === selectedSubject)
          .map(([subName, stats]) => {
            const pct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

            return (
              <div
                key={subName}
                className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-5 transition-all duration-300 hover:border-pink-500/40 hover:shadow-[0_15px_40px_rgba(236,72,153,0.15)] group relative overflow-hidden"
              >
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/20 transition-all duration-500" />

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 px-3 py-1 rounded-lg border border-pink-500/30">
                      GATE CSE
                    </span>
                    <h3 className="font-black text-lg mt-3 text-white tracking-tight">{subName}</h3>
                  </div>
                  <span className="text-xl font-black text-pink-400 bg-pink-500/10 px-3.5 py-1.5 rounded-2xl border border-pink-500/25">{pct}%</span>
                </div>

                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-pink-500/20 relative z-10">
                  <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ width: `${pct}%` }} />
                </div>

                <div className="pt-4 border-t border-pink-500/15 flex justify-between items-center text-xs text-pink-200/80 font-bold relative z-10">
                  <span>Scheduled Lectures: <strong className="text-white">{stats.lecturesCount}</strong></span>
                  <span className="text-pink-300">{stats.completedTasks} / {stats.totalTasks} Tasks</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
