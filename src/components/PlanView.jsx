import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function PlanView({ scheduleData, settings, progress, setActiveTab }) {
  const [selectedWeekNum, setSelectedWeekNum] = useState(1);

  const weekData = scheduleData.find(w => w.weekNumber === selectedWeekNum) || scheduleData[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
            PLAN & SCHEDULE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Week-by-Week Execution View</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select a week to review its 7-day exact sequence mapped from your start date ({settings.startDate}).
          </p>
        </div>

        {/* Week Selector Dropdown */}
        <div className="flex items-center space-x-2.5">
          <label className="text-xs font-bold text-slate-500">Select Week:</label>
          <select
            value={selectedWeekNum}
            onChange={(e) => setSelectedWeekNum(parseInt(e.target.value))}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 shadow-inner"
          >
            {scheduleData.map(w => (
              <option key={w.weekNumber} value={w.weekNumber}>
                Week {w.weekNumber} ({w.days[0].date} to {w.days[6].date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Days List */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekData.days.map((day) => {
          const actualDate = getDateFromDayNum(day.dayNum, settings.startDate);
          
          let dayTotal = 0;
          let dayComp = 0;
          day.subjects.forEach((sub, sIdx) => {
            sub.tasks.forEach(task => {
              dayTotal++;
              if (progress[`${day.dayNum}_${sIdx}_${task}`]) dayComp++;
            });
          });

          let statusColor = 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900';
          let statusText = 'Not Started';
          let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

          if (dayComp > 0 && dayComp < dayTotal) {
            statusColor = 'border-amber-300 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/10';
            statusText = 'In Progress';
            badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
          } else if (dayTotal > 0 && dayComp === dayTotal) {
            statusColor = 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/10';
            statusText = 'Completed';
            badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
          }

          return (
            <div
              key={day.dayNum}
              className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between space-y-4 transition-all duration-300 hover:shadow-md ${statusColor}`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-sky-600 dark:text-sky-400">Day {day.dayNum}</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 dark:text-slate-100">{day.dayOfWeek}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{day.date}</p>

                <div className="mt-3.5 space-y-2">
                  {day.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="text-xs bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{sub.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate font-medium">{sub.lecture}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{dayComp} / {dayTotal} tasks</span>
                <button
                  onClick={() => setActiveTab('today')}
                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
