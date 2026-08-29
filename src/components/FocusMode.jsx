import React from 'react';
import { X, CheckCircle2, Circle, Clock, Zap, Play, Sparkles } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function FocusMode({ scheduleData, settings, progress, setProgress, onClose }) {
  const istTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const startDateStr = settings.startDate || '2026-08-30';
  const start = new Date(startDateStr);
  
  const istDateOnly = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffTime = istDateOnly - startDateOnly;
  const currentDayNum = Math.max(1, Math.min(189, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1));

  const currentWeekNum = Math.ceil(currentDayNum / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === currentDayNum) : null;
  const actualDate = getDateFromDayNum(currentDayNum, startDateStr);

  const toggleTask = (subIdx, taskName) => {
    const key = `${currentDayNum}_${subIdx}_${taskName}`;
    setProgress({ ...progress, [key]: !progress[key] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080312]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 text-white overflow-y-auto animate-fadeIn font-sans">
      {/* Floating Magic Blossoms Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-12 left-10 w-3 h-3 bg-pink-400/50 rounded-full blur-[1px] animate-pulse" />
        <div className="absolute top-48 right-16 w-4 h-4 bg-rose-400/40 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-3.5 h-3.5 bg-purple-400/40 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full relative z-10">
        <div className="flex items-center space-x-2.5 bg-white/10 px-4 py-2 rounded-2xl border border-pink-500/30 backdrop-blur-xl">
          <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce" />
          <span className="font-black tracking-wider text-xs uppercase text-pink-200">MAAHI 💗 FOCUS MODE • JUST EXECUTE</span>
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl text-pink-200 border border-pink-500/30 transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Focus Content */}
      <div className="max-w-3xl mx-auto w-full space-y-8 text-center my-auto py-8 relative z-10">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/25 px-4 py-1.5 rounded-full border border-pink-500/40 shadow-sm inline-block">
            ✨ DAY {currentDayNum} • {formatDateReadable(actualDate)}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(236,72,153,0.4)]">
            “Your only job is to finish today, Maahi 💗.”
          </h2>
          <p className="text-sm sm:text-base text-pink-200/80 font-medium italic">
            No subject switching. No redesigning the plan. Trust the coaching schedule and execute with absolute calm.
          </p>
        </div>

        {/* Current Tasks - Liquid Glass Cards */}
        <div className="space-y-5 text-left">
          {dayData && dayData.subjects && dayData.subjects.map((sub, sIdx) => (
            <div key={sIdx} className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 px-3 py-1 rounded-lg border border-pink-500/30">{sub.name}</span>
                  <h3 className="text-xl font-black mt-2 text-white">{sub.lecture}</h3>
                </div>
                {sub.duration && (
                  <span className="bg-white/10 text-pink-200 text-xs font-black px-4 py-2 rounded-2xl border border-pink-500/20">
                    {sub.duration}
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-1">
                {sub.tasks.map((task, tIdx) => {
                  const taskKey = `${currentDayNum}_${sIdx}_${task}`;
                  const isChecked = !!progress[taskKey];

                  return (
                    <div
                      key={tIdx}
                      onClick={() => toggleTask(sIdx, task)}
                      className={`flex items-center space-x-4 p-4.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        isChecked
                          ? 'bg-gradient-to-r from-emerald-950/75 to-teal-950/75 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-white/5 hover:bg-white/10 border-pink-500/20 text-pink-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-pink-400/60 shrink-0" />
                      )}
                      <span className={`text-sm sm:text-base font-bold tracking-wide ${isChecked ? 'line-through opacity-80 text-emerald-300' : 'text-white'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4 relative z-10">
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-xl shadow-pink-500/30 transition-all transform hover:scale-105"
        >
          Exit Focus Mode & Return
        </button>
      </div>
    </div>
  );
}
