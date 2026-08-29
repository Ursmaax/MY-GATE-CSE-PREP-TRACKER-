import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function PlanView({ scheduleData, settings, progress, setActiveTab }) {
  const [selectedWeekNum, setSelectedWeekNum] = useState(1);

  const weekData = scheduleData.find(w => w.weekNumber === selectedWeekNum) || scheduleData[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
            ✨ PLAN & SCHEDULE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white">Week-by-Week Execution View</h2>
          <p className="text-sm text-pink-200/70 mt-1 font-medium">
            Select a week to review its 7-day exact sequence mapped from your start date ({settings.startDate}).
          </p>
        </div>

        {/* Week Selector Dropdown */}
        <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-pink-500/20 backdrop-blur-md">
          <label className="text-xs font-bold text-pink-200 pl-2">Select Week:</label>
          <select
            value={selectedWeekNum}
            onChange={(e) => setSelectedWeekNum(parseInt(e.target.value))}
            className="bg-[#120720] border border-pink-500/30 rounded-xl px-4 py-2.5 text-sm font-black focus:outline-none focus:ring-2 focus:ring-pink-500 text-white shadow-inner"
          >
            {scheduleData.map(w => (
              <option key={w.weekNumber} value={w.weekNumber}>
                Week {w.weekNumber} ({w.days[0].date} to {w.days[6].date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Days Grid */}
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

          let statusColor = 'border-pink-500/20 bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90';
          let statusText = 'Not Started';
          let badgeColor = 'bg-white/10 text-pink-200 border border-pink-500/20';

          if (dayComp > 0 && dayComp < dayTotal) {
            statusColor = 'border-amber-500/40 bg-gradient-to-br from-[#1e130c]/90 via-[#26150e]/90 to-[#120a07]/90';
            statusText = 'In Progress';
            badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
          } else if (dayTotal > 0 && dayComp === dayTotal) {
            statusColor = 'border-emerald-500/40 bg-gradient-to-br from-[#0a1f18]/90 via-[#0e2920]/90 to-[#07120e]/90';
            statusText = 'Completed';
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
          }

          return (
            <div
              key={day.dayNum}
              className={`rounded-3xl p-5 border backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-pink-500/50 ${statusColor}`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-pink-300">Day {day.dayNum}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>
                <h4 className="font-black text-base text-white">{day.dayOfWeek}</h4>
                <p className="text-xs text-pink-200/70 font-medium">{day.date}</p>

                <div className="mt-4 space-y-2.5">
                  {day.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="text-xs bg-white/5 p-3 rounded-2xl border border-pink-500/15">
                      <p className="font-bold text-white truncate">{sub.name}</p>
                      <p className="text-pink-200/70 truncate font-medium text-[11px]">{sub.lecture}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-pink-500/15 flex items-center justify-between text-xs font-bold text-pink-200/80">
                <span>{dayComp} / {dayTotal} tasks</span>
                <button
                  onClick={() => setActiveTab('today')}
                  className="text-pink-400 hover:text-white hover:underline flex items-center space-x-1 font-black"
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
