import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function PlanView({ scheduleData, settings, progress, setActiveTab }) {
  const [selectedWeekNum, setSelectedWeekNum] = useState(1);

  const weekData = scheduleData.find(w => w.weekNumber === selectedWeekNum) || scheduleData[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full">
            PLAN & SCHEDULE
          </span>
          <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Week-by-Week Execution View</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a week to review its 7-day exact sequence mapped from your start date ({settings.startDate}).
          </p>
        </div>

        {/* Week Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Select Week:</label>
          <select
            value={selectedWeekNum}
            onChange={(e) => setSelectedWeekNum(parseInt(e.target.value))}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekData.days.map((day) => {
          const actualDate = getDateFromDayNum(day.dayNum, settings.startDate);
          
          // Calculate status for this day
          let dayTotal = 0;
          let dayComp = 0;
          day.subjects.forEach((sub, sIdx) => {
            sub.tasks.forEach(task => {
              dayTotal++;
              if (progress[`${day.dayNum}_${sIdx}_${task}`]) dayComp++;
            });
          });

          let statusColor = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
          let statusText = 'Not Started';
          let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

          if (dayComp > 0 && dayComp < dayTotal) {
            statusColor = 'border-amber-300 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10';
            statusText = 'In Progress';
            badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
          } else if (dayTotal > 0 && dayComp === dayTotal) {
            statusColor = 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10';
            statusText = 'Completed';
            badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
          }

          return (
            <div
              key={day.dayNum}
              className={`rounded-2xl p-4 border shadow-sm flex flex-col justify-between space-y-4 ${statusColor}`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Day {day.dayNum}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{day.dayOfWeek}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{day.date}</p>

                <div className="mt-3 space-y-2">
                  {day.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="text-xs bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl">
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{sub.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate">{sub.lecture}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{dayComp} / {dayTotal} tasks</span>
                <button
                  onClick={() => setActiveTab('today')}
                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-0.5"
                >
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
