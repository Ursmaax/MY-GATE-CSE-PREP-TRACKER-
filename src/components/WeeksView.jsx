import React from 'react';
import { BookOpen, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function WeeksView({ scheduleData, progress, settings }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full">
          27 WEEKS CURRICULUM
        </span>
        <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Complete GATE CSE Coaching Roadmap</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          All 27 weeks of verified coaching syllabus mapped sequentially starting from your preparation start date ({settings.startDate}).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-lg">
                    WEEK {week.weekNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {pct}% Complete
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {week.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {week.days[0].date} — {week.days[6].date}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{completedTasks} / {totalTasks} Tasks Done</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">7 Days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
