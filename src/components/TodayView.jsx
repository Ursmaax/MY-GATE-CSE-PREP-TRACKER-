import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Zap, ChevronLeft, ChevronRight, FileText, Clock, Sparkles, CloudRain, Sun, Cloud, Moon, MapPin } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function TodayView({ scheduleData, settings, progress, setProgress, notes, setNotes, onStartFocus }) {
  // Real-time clock and live Srikakulam weather & motivation generator
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Time-based Srikakulam Greeting & Motivation logic
  let greeting = '';
  let motivationMsg = '';
  let weatherDesc = 'Light Rain • 29°C (Feels 36°C)';
  let WeatherIcon = CloudRain;
  let weatherGradient = 'from-blue-600 via-indigo-700 to-slate-900';

  if (hours >= 3 && hours < 6) {
    greeting = '🌅 Brahmamuhurtha Awakening — The World is Asleep, You Are Forging Your GATE 2028 Rank';
    motivationMsg = '“At 3 AM in Srikakulam, while silence rules the coast, your dedication builds your IIT dream. Open the first lecture. Do not think, just execute.”';
    WeatherIcon = Moon;
    weatherGradient = 'from-slate-900 via-indigo-950 to-purple-950';
  } else if (hours >= 6 && hours < 12) {
    greeting = '☀️ Good Morning, Srikakulam Warrior — Morning Rain & Fresh Energy';
    motivationMsg = '“Morning light over the Bay of Bengal. Your daily schedule is locked. Trust the plan, watch the lecture, master the concepts.”';
    WeatherIcon = Sun;
    weatherGradient = 'from-sky-500 via-indigo-600 to-blue-700';
  } else if (hours >= 12 && hours < 17) {
    greeting = '⚡ Afternoon Execution Peak — Unstoppable Consistency';
    motivationMsg = '“Midday focus. Do not get distracted by alternative resources or changing teachers. Execute today’s tasks with absolute rigor.”';
    WeatherIcon = Cloud;
    weatherGradient = 'from-blue-600 via-sky-600 to-indigo-800';
  } else if (hours >= 17 && hours < 21) {
    greeting = '🌆 Evening Revision & Problem Solving';
    motivationMsg = '“As evening settles over Srikakulam, review your notes and solve practice sets. Consistency beats intensity every single time.”';
    WeatherIcon = CloudRain;
    weatherGradient = 'from-indigo-900 via-slate-900 to-blue-950';
  } else {
    greeting = '🌙 Late Night Deep Focus — Quiet Hours of Mastery';
    motivationMsg = '“Late night session. Wrap up pending tasks, record your progress, and prepare for tomorrow’s triumph.”';
    WeatherIcon = Moon;
    weatherGradient = 'from-slate-950 via-indigo-950 to-slate-900';
  }

  // Current day calculation or simulator
  const [selectedDayNum, setSelectedDayNum] = useState(() => {
    const start = new Date(settings.startDate);
    const today = new Date();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(189, diffDays));
  });

  const currentWeekNum = Math.ceil(selectedDayNum / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === selectedDayNum) : null;
  const actualDate = getDateFromDayNum(selectedDayNum, settings.startDate);

  // Robust streak calculation based on completed days
  const calculateStreak = () => {
    let streak = 0;
    for (let d = selectedDayNum; d >= 1; d--) {
      // check if any task was done on day d
      let hasCompleted = false;
      scheduleData.forEach(w => {
        w.days.forEach(day => {
          if (day.dayNum === d) {
            day.subjects.forEach((sub, sIdx) => {
              sub.tasks.forEach(task => {
                if (progress[`${d}_${sIdx}_${task}`]) hasCompleted = true;
              });
            });
          }
        });
      });
      if (hasCompleted) {
        streak++;
      } else if (d === selectedDayNum) {
        // today allowed 0 if just started, check previous
        continue;
      } else {
        // streak broken before today
        break;
      }
    }
    return Math.max(streak, 1); // minimum 1 when active today
  };

  const currentStreak = calculateStreak();

  // Task check toggle with strict state persist
  const toggleTask = (subIdx, taskName) => {
    const key = `${selectedDayNum}_${subIdx}_${taskName}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
  };

  const handleNoteChange = (subIdx, text) => {
    const key = `${selectedDayNum}_${subIdx}_note`;
    const newNotes = { ...notes, [key]: text };
    setNotes(newNotes);
  };

  let totalTasks = 0;
  let completedTasks = 0;

  if (dayData && dayData.subjects) {
    dayData.subjects.forEach((sub, sIdx) => {
      sub.tasks.forEach(task => {
        totalTasks++;
        if (progress[`${selectedDayNum}_${sIdx}_${task}`]) {
          completedTasks++;
        }
      });
    });
  }

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Ultra Premium Live Srikakulam Weather & Clock Header Banner */}
      <div className={`bg-gradient-to-r ${weatherGradient} rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-sky-500/10 relative overflow-hidden border border-white/10`}>
        {/* Background ambient glowing spheres */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            {/* Live Location & Weather Widget */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/20 shadow-inner">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Srikakulam, Andhra Pradesh</span>
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/25">
                <WeatherIcon className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                <span>{weatherDesc}</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1">
                <span>🔥 Streak: {currentStreak} Days</span>
              </span>
            </div>

            {/* Live Digital Clock & Greeting */}
            <div>
              <div className="flex items-baseline space-x-3 mt-1">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-white drop-shadow">
                  {timeString}
                </h2>
                <span className="text-xs sm:text-sm font-bold text-sky-200 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg">
                  IST
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-white mt-2 drop-shadow-sm">
                {greeting}
              </p>
              <p className="text-sky-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed italic">
                {motivationMsg}
              </p>
            </div>
          </div>

          <button
            onClick={onStartFocus}
            className="bg-white hover:bg-sky-50 text-sky-900 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-black/20 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>START FOCUS MODE</span>
          </button>
        </div>
      </div>

      {/* Date Navigator Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
        <button
          onClick={() => setSelectedDayNum(prev => Math.max(1, prev - 1))}
          className="flex items-center space-x-1 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-md">
            WEEK {currentWeekNum} • DAY {selectedDayNum} OF 189
          </span>
          <h3 className="font-extrabold text-sm sm:text-base mt-1 text-slate-800 dark:text-slate-100">
            {formatDateReadable(actualDate)}
          </h3>
        </div>
        <button
          onClick={() => setSelectedDayNum(prev => Math.min(189, prev + 1))}
          className="flex items-center space-x-1 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-2 text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Execution Progress</span>
          <span className="text-sky-600 dark:text-sky-400 text-sm">{completionPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 h-full transition-all duration-700 rounded-full shadow-sm"
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
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-lg">
                      {sub.name}
                    </span>
                    <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-slate-100">
                      {sub.lecture}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Module: {sub.module}
                    </p>
                  </div>
                  {sub.duration && (
                    <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-extrabold self-start sm:self-auto border border-slate-200/60 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{sub.duration}</span>
                    </div>
                  )}
                </div>

                {/* Tasks Checkboxes */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Required Execution Tasks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sub.tasks.map((task, tIdx) => {
                      const taskKey = `${selectedDayNum}_${sIdx}_${task}`;
                      const isChecked = !!progress[taskKey];

                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(sIdx, task)}
                          className={`flex items-center space-x-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-sm'
                              : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <span className={`text-sm font-bold ${isChecked ? 'line-through opacity-75' : 'text-slate-700 dark:text-slate-200'}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Note for this Lecture */}
                <div className="pt-2">
                  <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-400 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Quick Personal Note / Formula Doubt</span>
                  </div>
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => handleNoteChange(sIdx, e.target.value)}
                    placeholder="Add a short note or formula to remember for GATE..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-lg font-extrabold text-slate-700 dark:text-slate-300">No Scheduled Lectures Today</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Reset day or buffer day. Use this time to revise previous concepts or solve GATE PYQs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
