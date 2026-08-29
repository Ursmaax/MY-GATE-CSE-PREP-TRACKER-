import React from 'react';
import { BookOpen, CheckCircle2, Clock, ChevronRight, Sparkles, Trophy } from 'lucide-react';

export default function WeeksView({ scheduleData, progress, settings }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl text-white">
        <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
          ✨ 27 WEEKS CURRICULUM
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Complete GATE CSE Coaching Roadmap</h2>
        <p className="text-sm text-pink-200/70 mt-1 font-medium">
          All 27 weeks of verified coaching syllabus mapped sequentially starting from your preparation start date ({settings.startDate}).
        </p>
      </div>

      {/* Enlarged Immersive Week Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {scheduleData.map((week) => {
          let totalTasks = 0;
          let completedTasks = 0;

          week.days.forEach(day => {
            day.subjects.forEach((sub, sIdx) => {
              sub.tasks.forEach(task => {
                totalTasks++;
                if (progress[`${day.dayNum}_${sIdx}_${task}`]) {
                  completedTasks++;
                }
              });
            });
          });

          const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const isComplete = pct === 100;

          return (
            <div
              key={week.weekNumber}
              className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-pink-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-6 transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_20px_50px_rgba(236,72,153,0.2)] group relative overflow-hidden flex flex-col justify-between"
            >
              {/* Ambient starlight glow */}
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-pink-500/25 transition-all duration-700" />

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black bg-gradient-to-r from-pink-500/25 to-purple-500/25 text-pink-300 px-4 py-1.5 rounded-2xl border border-pink-500/40 shadow-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>WEEK {week.weekNumber}</span>
                  </span>
                  <span className="text-sm font-black text-pink-200 bg-white/5 px-4 py-1.5 rounded-2xl border border-white/10">
                    {pct}% Completed
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight mt-2">
                    {week.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-200/70 mt-1 font-semibold flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-pink-400" />
                    <span>{week.days[0].date} — {week.days[6].date}</span>
                  </p>
                </div>

                {/* Sub-subjects / Modules preview */}
                <div className="bg-white/5 rounded-2xl p-4 border border-pink-500/15 space-y-2">
                  <p className="text-[10px] font-black uppercase text-pink-300 tracking-wider">Week Curriculum Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(week.days.flatMap(d => d.subjects.map(s => s.name)))).map((subName, i) => (
                      <span key={i} className="text-xs bg-white/5 text-pink-100 px-3 py-1 rounded-xl border border-white/10 font-medium">
                        {subName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Large Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-pink-500/20">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-pink-200/80 font-bold uppercase tracking-wider">
                    <span>Execution Status</span>
                    <span className="text-white font-black">{completedTasks} / {totalTasks} Tasks Done</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-pink-500/15 flex items-center justify-between text-xs text-pink-200 font-bold relative z-10">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span>7 Full Days of Structured Execution</span>
                </span>
                {isComplete && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 font-black flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Week Finished</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
