import React from 'react';
import { BookOpen, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function WeeksView({ scheduleData, progress, settings }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
          27 WEEKS CURRICULUM
        </span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Complete GATE CSE Coaching Roadmap</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          All 27 weeks of verified coaching syllabus mapped sequentially starting from your preparation start date ({settings.startDate}).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          return (
            <div
              key={week.weekNumber}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800">
                    WEEK {week.weekNumber}
                  </span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                    {pct}% Complete
                  </span>
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {week.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {week.days[0].date} — {week.days[6].date}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4 p-0.5">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{completedTasks} / {totalTasks} Tasks Done</span>
                <span className="text-sky-600 dark:text-sky-400 font-black">7 Days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
