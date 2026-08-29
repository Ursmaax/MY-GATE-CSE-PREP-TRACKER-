import React from 'react';
import { BarChart2, Flame, Award, CheckCircle2, Shield, Target, TrendingUp, BookOpen } from 'lucide-react';
import { loadQuizzes, loadTests } from '../utils/storage';

export default function ProgressView({ scheduleData, progress, settings }) {
  const quizzes = loadQuizzes();
  const tests = loadTests();

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

  // Strict study streak calculation
  const today = new Date();
  const start = new Date(settings.startDate);
  const currentDayNum = Math.max(1, Math.min(189, Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1));

  let streak = 0;
  for (let d = currentDayNum; d >= 1; d--) {
    let dayTotal = 0;
    let dayCompleted = 0;
    scheduleData.forEach(w => {
      w.days.forEach(day => {
        if (day.dayNum === d) {
          day.subjects.forEach((sub, sIdx) => {
            sub.tasks.forEach(task => {
              dayTotal++;
              if (progress[`${d}_${sIdx}_${task}`]) dayCompleted++;
            });
          });
        }
      });
    });
    const isCompleted = dayTotal > 0 && (dayCompleted / dayTotal) >= 0.8;
    if (isCompleted) {
      streak++;
    } else if (d === currentDayNum) {
      continue;
    } else {
      break;
    }
  }
  const calculatedStreak = streak;

  const avgQuizPct = quizzes.length > 0 ? Math.round(quizzes.reduce((a, q) => a + q.percentage, 0) / quizzes.length) : 0;
  const avgTestPct = tests.length > 0 ? Math.round(tests.reduce((a, t) => a + t.percentage, 0) / tests.length) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-3.5 py-1.5 rounded-full border border-pink-200 dark:border-pink-800">
            MAAHI 💗 ANALYTICS & PROGRESS
          </span>
          <h2 className="text-3xl font-black mt-2 tracking-tight">Command Center Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Execution metrics, quiz performance, and mock test trends for your serious GATE 2028 preparation.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white px-7 py-4 rounded-3xl shadow-xl shadow-orange-500/25 flex items-center space-x-4">
          <Flame className="w-8 h-8 animate-bounce text-amber-200" />
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-90">Study Streak</p>
            <p className="text-2xl font-black">{calculatedStreak} Days</p>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Overall Preparation</p>
          <h3 className="text-3xl font-black text-sky-600 dark:text-sky-400">{overallPct}%</h3>
          <p className="text-xs text-slate-500 font-bold">{totalCompletedTasks} of {totalAllTasks} total tasks completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Quiz Performance</p>
          <h3 className="text-3xl font-black text-pink-600 dark:text-pink-400">{avgQuizPct}%</h3>
          <p className="text-xs text-slate-500 font-bold">{quizzes.length} Quizzes recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Mock Test Average</p>
          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{avgTestPct}%</h3>
          <p className="text-xs text-slate-500 font-bold">{tests.length} Tests recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Days Executed</p>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Day {currentDayNum} / 189</h3>
          <p className="text-xs text-slate-500 font-bold">Starting from {settings.startDate}</p>
        </div>
      </div>

      {/* GATE 2028 Long-Term Phases Roadmap */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">GATE 2028 Long-Term Roadmap</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Because you have ample time before GATE 2028, the 27-week schedule is your foundational core. Future phases unlock as you progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-3xl p-6 transition-transform hover:scale-[1.02]">
            <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400">Phase 2</span>
            <h4 className="font-black text-sm mt-1.5 text-slate-900 dark:text-slate-100">Comprehensive Revision</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Scheduled spaced repetition & notes refinement.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-slate-400">Phase 3</span>
            <h4 className="font-black text-sm mt-1.5 text-slate-900 dark:text-slate-100">Previous Year Questions (PYQs)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Exhaustive GATE CSE PYQ solving (1991-2027).</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-slate-400">Phase 4</span>
            <h4 className="font-black text-sm mt-1.5 text-slate-900 dark:text-slate-100">Full-Length Mock Tests</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Simulated exam environment & accuracy analysis.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-slate-400">Phase 5</span>
            <h4 className="font-black text-sm mt-1.5 text-slate-900 dark:text-slate-100">Final Gate Revision</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Formula review & peak mental readiness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
