import React from 'react';
import { BarChart2, Flame, Award, CheckCircle2, Shield } from 'lucide-react';

export default function ProgressView({ scheduleData, progress, settings }) {
  let totalAllTasks = 0;
  let totalCompletedTasks = 0;

  scheduleData.forEach(week => {
    week.days.forEach(day => {
      day.subjects.forEach((sub, sIdx) => {
        sub.tasks.forEach(task => {
          totalAllTasks++;
          if (progress[`${day.dayNum}_${sIdx}_${task}`]) {
            totalCompletedTasks++;
          }
        });
      });
    });
  });

  const overallPct = totalAllTasks > 0 ? Math.round((totalCompletedTasks / totalAllTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full">
            PROGRESS & STREAK
          </span>
          <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Personal Command Center Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Execution metrics for your serious GATE 2028 preparation. Consistency beats intensity.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center space-x-3">
          <Flame className="w-6 h-6 animate-pulse" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">Current Streak</p>
            <p className="text-xl font-extrabold">12 Days</p>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Preparation</p>
          <h3 className="text-3xl font-extrabold mt-2 text-sky-600 dark:text-sky-400">{overallPct}%</h3>
          <p className="text-xs text-slate-500 mt-1">{totalCompletedTasks} of {totalAllTasks} total tasks completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Course Plan Phase</p>
          <h3 className="text-3xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">Week 1 / 27</h3>
          <p className="text-xs text-slate-500 mt-1">Foundational 189-day schedule</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Days Executed</p>
          <h3 className="text-3xl font-extrabold mt-2 text-emerald-600 dark:text-emerald-400">12 / 189</h3>
          <p className="text-xs text-slate-500 mt-1">Starting from {settings.startDate}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Long-Term Goal</p>
          <h3 className="text-3xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">GATE 2028</h3>
          <p className="text-xs text-slate-500 mt-1">Zero rushing, absolute mastery</p>
        </div>
      </div>

      {/* GATE 2028 Long-Term Phases Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">GATE 2028 Long-Term Roadmap</h3>
        <p className="text-xs text-slate-500">
          Because you have ample time before GATE 2028, the 27-week schedule is your foundational core. Future phases unlock as you progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">Phase 2</span>
            <h4 className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-100">Comprehensive Revision</h4>
            <p className="text-xs text-slate-500 mt-1">Scheduled spaced repetition & notes refinement.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 opacity-70">
            <span className="text-[10px] font-bold uppercase text-slate-400">Phase 3</span>
            <h4 className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-100">Previous Year Questions (PYQs)</h4>
            <p className="text-xs text-slate-500 mt-1">Exhaustive GATE CSE PYQ solving (1991-2027).</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 opacity-70">
            <span className="text-[10px] font-bold uppercase text-slate-400">Phase 4</span>
            <h4 className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-100">Full-Length Mock Tests</h4>
            <p className="text-xs text-slate-500 mt-1">Simulated exam environment & accuracy analysis.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 opacity-70">
            <span className="text-[10px] font-bold uppercase text-slate-400">Phase 5</span>
            <h4 className="font-bold text-sm mt-1 text-slate-800 dark:text-slate-100">Final Gate Revision</h4>
            <p className="text-xs text-slate-500 mt-1">Formula review & peak mental readiness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
