import React, { useState } from 'react';
import { CheckCircle2, Circle, Zap, ChevronLeft, ChevronRight, FileText, Clock, ShieldAlert } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function TodayView({ scheduleData, settings, progress, setProgress, notes, setNotes, onStartFocus }) {
  // Current day calculation or simulator
  const [selectedDayNum, setSelectedDayNum] = useState(() => {
    // default to day 1 or current date compared to start date
    const start = new Date(settings.startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(189, diffDays));
  });

  // Find day object in scheduleData
  const currentWeekNum = Math.ceil(selectedDayNum / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === selectedDayNum) : null;

  const actualDate = getDateFromDayNum(selectedDayNum, settings.startDate);

  // Task check toggle
  const toggleTask = (subIdx, taskName) => {
    const key = `${selectedDayNum}_${subIdx}_${taskName}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
  };

  // Note change
  const handleNoteChange = (subIdx, text) => {
    const key = `${selectedDayNum}_${subIdx}_note`;
    const newNotes = { ...notes, [key]: text };
    setNotes(newNotes);
  };

  // Calculate stats for today
  let totalTasks = 0;
  let completedTasks = 0;

  if (dayData && dayData.subjects) {
    dayData.subjects.forEach((sub, sIdx) => {
      sub.tasks.forEach(task => {
        totalTasks++;
        if (progress[`${selectedDayNum}_sIdx_${task}`] || progress[`${selectedDayNum}_${sIdx}_${task}`]) {
          completedTasks++;
        }
      });
    });
  }

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-sky-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            WEEK {currentWeekNum} • DAY {selectedDayNum} / 189
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            JUST FOLLOW TODAY’S PLAN.
          </h2>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Don’t redesign the plan. Execute it. Trust the schedule and take it one lecture at a time.
          </p>
        </div>
        <button
          onClick={onStartFocus}
          className="bg-white text-sky-600 hover:bg-sky-50 px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>START FOCUS MODE</span>
        </button>
      </div>

      {/* Date Navigator Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <button
          onClick={() => setSelectedDayNum(prev => Math.max(1, prev - 1))}
          className="flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>
        <div className="text-center">
          <h3 className="font-bold text-base sm:text-lg">
            {formatDateReadable(actualDate)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completionPercent === 100 ? '✅ DAY COMPLETE' : `${completedTasks} / ${totalTasks} Tasks Completed`}
          </p>
        </div>
        <button
          onClick={() => setSelectedDayNum(prev => Math.min(189, prev + 1))}
          className="flex items-center space-x-1 text-sm font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-2 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Today's Progress</span>
          <span className="text-sky-600 dark:text-sky-400">{completionPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Today's Tasks Cards */}
      <div className="space-y-4">
        {dayData && dayData.subjects && dayData.subjects.length > 0 ? (
          dayData.subjects.map((sub, sIdx) => {
            const noteKey = `${selectedDayNum}_${sIdx}_note`;
            const currentNote = notes[noteKey] || '';

            return (
              <div
                key={sIdx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-md">
                      {sub.name}
                    </span>
                    <h4 className="text-lg font-bold mt-2 text-slate-800 dark:text-slate-100">
                      {sub.lecture}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Module: {sub.module}
                    </p>
                  </div>
                  {sub.duration && (
                    <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{sub.duration}</span>
                    </div>
                  )}
                </div>

                {/* Tasks Checkboxes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Execution Tasks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sub.tasks.map((task, tIdx) => {
                      const taskKey = `${selectedDayNum}_${sIdx}_${task}`;
                      const isChecked = !!progress[taskKey];

                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(sIdx, task)}
                          className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${isChecked ? 'line-through opacity-80' : ''}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Note for this Lecture */}
                <div className="pt-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Quick Personal Note / Doubt</span>
                  </div>
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => handleNoteChange(sIdx, e.target.value)}
                    placeholder="Add a short note or formula to remember..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Scheduled Lectures Today</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Reset day or buffer day. Use this time to revise previous concepts or solve GATE PYQs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
