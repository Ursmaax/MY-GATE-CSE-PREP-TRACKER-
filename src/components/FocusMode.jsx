import React from 'react';
import { X, CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function FocusMode({ scheduleData, settings, progress, setProgress, onClose }) {
  const start = new Date(settings.startDate);
  const today = new Date();
  const diffTime = today - start;
  const currentDayNum = Math.max(1, Math.min(189, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1));

  const currentWeekNum = Math.ceil(currentDayNum / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === currentDayNum) : null;
  const actualDate = getDateFromDayNum(currentDayNum, settings.startDate);

  const toggleTask = (subIdx, taskName) => {
    const key = `${currentDayNum}_${subIdx}_${taskName}`;
    setProgress({ ...progress, [key]: !progress[key] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-12 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="font-extrabold tracking-wider text-sm uppercase text-amber-400">FOCUS MODE • EXECUTE ONLY</span>
        </div>
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-slate-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Focus Content */}
      <div className="max-w-2xl mx-auto w-full space-y-8 text-center my-auto py-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/85 px-4 py-1.5 rounded-full border border-sky-800">
            DAY {currentDayNum} • {formatDateReadable(actualDate)}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
            “Your only job is to finish today.”
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No subject switching. No redesigning the plan. Trust the schedule.
          </p>
        </div>

        {/* Current Tasks */}
        <div className="space-y-4 text-left">
          {dayData && dayData.subjects && dayData.subjects.map((sub, sIdx) => (
            <div key={sIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold uppercase text-sky-400">{sub.name}</span>
                  <h3 className="text-xl font-bold mt-1 text-white">{sub.lecture}</h3>
                </div>
                {sub.duration && (
                  <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-lg">
                    {sub.duration}
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-2">
                {sub.tasks.map((task, tIdx) => {
                  const taskKey = `${currentDayNum}_${sIdx}_${task}`;
                  const isChecked = !!progress[taskKey];

                  return (
                    <div
                      key={tIdx}
                      onClick={() => toggleTask(sIdx, task)}
                      className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 shrink-0" />
                      )}
                      <span className={`text-base font-medium ${isChecked ? 'line-through opacity-75' : ''}`}>
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
      <div className="text-center pb-4">
        <button
          onClick={onClose}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition-colors"
        >
          Exit Focus Mode & Return
        </button>
      </div>
    </div>
  );
}
