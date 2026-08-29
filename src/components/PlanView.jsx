import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, ChevronRight, Sparkles, BookOpen, Layers } from 'lucide-react';
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
            Select a week to review its 7-day detailed curriculum mapped from your start date ({settings.startDate}).
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

      {/* Week Days Expanded List (Giving full breathing room instead of narrow cramped columns) */}
      <div className="space-y-6">
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

          const completionPct = dayTotal > 0 ? Math.round((dayComp / dayTotal) * 100) : 0;

          return (
            <div
              key={day.dayNum}
              className={`w-full rounded-[2.2rem] p-6 sm:p-8 border backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all duration-300 hover:border-pink-500/40 ${statusColor}`}
            >
              {/* Left Day Info */}
              <div className="space-y-2 lg:w-1/4">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-black bg-pink-500/20 text-pink-300 px-3 py-1 rounded-xl border border-pink-500/30">
                    Day {day.dayNum}
                  </span>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${badgeColor}`}>
                    {statusText}
                  </span>
                </div>
                <h3 className="font-black text-2xl text-white">{day.dayOfWeek}</h3>
                <p className="text-xs text-pink-200/70 font-bold">{day.date} • {formatDateReadable(actualDate)}</p>
                
                <div className="pt-2">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-pink-500/20">
                    <div className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
                  </div>
                  <p className="text-[11px] text-pink-200/70 font-black mt-1.5">{dayComp} / {dayTotal} tasks completed ({completionPct}%)</p>
                </div>
              </div>

              {/* Middle Subjects / Lectures Expanded Details */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {day.subjects.map((sub, sIdx) => (
                  <div key={sIdx} className="bg-white/5 p-4 rounded-2xl border border-pink-500/15 space-y-1.5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider bg-pink-500/15 px-2.5 py-0.5 rounded border border-pink-500/25">
                        {sub.name}
                      </span>
                      {sub.duration && (
                        <span className="text-[11px] font-black text-pink-200/80 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-pink-400" />
                          <span>{sub.duration}</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-base text-white mt-1">{sub.lecture}</h4>
                    <p className="text-xs text-pink-200/70 font-medium">Module: {sub.module}</p>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {sub.tasks.map((task, tIdx) => {
                        const taskKey = `${day.dayNum}_${sIdx}_${task}`;
                        const isDone = !!progress[taskKey];
                        return (
                          <span key={tIdx} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${isDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 line-through' : 'bg-white/5 border-white/10 text-pink-100/70'}`}>
                            {task}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Action */}
              <div className="shrink-0">
                <button
                  onClick={() => setActiveTab('today')}
                  className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg shadow-pink-500/30 flex items-center space-x-2 transition-all transform hover:scale-105"
                >
                  <span>Execute Day</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
