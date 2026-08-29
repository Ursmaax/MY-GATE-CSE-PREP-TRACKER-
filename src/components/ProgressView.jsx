import React from 'react';
import { BarChart2, Flame, Award, CheckCircle2, Shield, Target, TrendingUp, BookOpen, Check, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
            ✨ MAAHI 💗 ANALYTICS & PROGRESS
          </span>
          <h2 className="text-3xl font-black mt-3 tracking-tight text-white">Command Center Dashboard</h2>
          <p className="text-sm text-pink-200/70 mt-1 font-medium">
            Execution metrics, quiz performance, and mock test trends for your serious GATE 2028 preparation.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white px-7 py-4 rounded-3xl shadow-xl shadow-orange-500/25 flex items-center space-x-4 border border-amber-400/30">
          <Flame className="w-8 h-8 animate-bounce text-amber-200" />
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-95">Study Streak</p>
            <p className="text-2xl font-black">{calculatedStreak} Days</p>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-xs font-black text-pink-300 uppercase tracking-wider">Overall Preparation</p>
          <h3 className="text-3xl font-black text-white">{overallPct}%</h3>
          <p className="text-xs text-pink-200/70 font-bold">{totalCompletedTasks} of {totalAllTasks} total tasks completed</p>
        </div>

        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-xs font-black text-pink-300 uppercase tracking-wider">Quiz Performance</p>
          <h3 className="text-3xl font-black text-white">{avgQuizPct}%</h3>
          <p className="text-xs text-pink-200/70 font-bold">{quizzes.length} Quizzes recorded</p>
        </div>

        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-xs font-black text-pink-300 uppercase tracking-wider">Mock Test Average</p>
          <h3 className="text-3xl font-black text-white">{avgTestPct}%</h3>
          <p className="text-xs text-pink-200/70 font-bold">{tests.length} Tests recorded</p>
        </div>

        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-xs font-black text-pink-300 uppercase tracking-wider">Days Executed</p>
          <h3 className="text-3xl font-black text-white">Day {currentDayNum} / 189</h3>
          <p className="text-xs text-pink-200/70 font-bold">Starting from {settings.startDate}</p>
        </div>
      </div>

      {/* GATE 2028 Long-Term Phases Roadmap */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-pink-500/25 shadow-2xl space-y-4 text-white">
        <h3 className="font-black text-xl text-white">GATE 2028 Long-Term Roadmap</h3>
        <p className="text-xs sm:text-sm text-pink-200/70 font-medium">
          Because you have ample time before GATE 2028, the 27-week schedule is your foundational core. Future phases unlock as you progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 border border-pink-500/30 rounded-3xl p-6 transition-transform hover:scale-[1.02] shadow-inner">
            <span className="text-[10px] font-black uppercase text-pink-300">Phase 2</span>
            <h4 className="font-black text-sm mt-1.5 text-white">Comprehensive Revision</h4>
            <p className="text-xs text-pink-200/70 mt-1 font-medium">Scheduled spaced repetition & notes refinement.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-pink-300/60">Phase 3</span>
            <h4 className="font-black text-sm mt-1.5 text-white">Previous Year Questions (PYQs)</h4>
            <p className="text-xs text-pink-200/60 mt-1 font-medium">Exhaustive GATE CSE PYQ solving (1991-2027).</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-pink-300/60">Phase 4</span>
            <h4 className="font-black text-sm mt-1.5 text-white">Full-Length Mock Tests</h4>
            <p className="text-xs text-pink-200/60 mt-1 font-medium">Simulated exam environment & accuracy analysis.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 opacity-75">
            <span className="text-[10px] font-black uppercase text-pink-300/60">Phase 5</span>
            <h4 className="font-black text-sm mt-1.5 text-white">Final Gate Revision</h4>
            <p className="text-xs text-pink-200/60 mt-1 font-medium">Formula review & peak mental readiness.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
