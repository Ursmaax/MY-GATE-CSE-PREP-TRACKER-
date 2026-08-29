import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Zap, ChevronLeft, ChevronRight, FileText, Clock, Sparkles, CloudRain, Sun, Cloud, Moon, MapPin, Wind, Droplets, Sunrise, Sunset, Flame, Play, Undo2 } from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function TodayView({ scheduleData, settings, progress, setProgress, notes, setNotes, onStartFocus }) {
  // 1. India Standard Time (IST) Clock & Real-time calculation
  const [istTime, setIstTime] = useState(() => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const seconds = istTime.getSeconds();
  const is24Hour = settings.is24Hour || false;
  
  const displayHours = is24Hour ? hours.toString().padStart(2, '0') : ((hours % 12) || 12).toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 2. Live Weather state for Srikakulam, AP
  const [weather, setWeather] = useState({
    temp: 29,
    feelsLike: 36,
    condition: 'Light Rain',
    humidity: 87,
    wind: 9,
    sunrise: '05:37 AM',
    sunset: '06:17 PM',
    lastUpdated: 'Just now',
    loading: false
  });

  useEffect(() => {
    // Fetch real weather from Open-Meteo for Srikakulam (approx 18.30°N, 83.90°E)
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.30&longitude=83.90&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata');
        const data = await res.json();
        if (data && data.current) {
          const code = data.current.weather_code;
          let cond = 'Partly Cloudy';
          if (code >= 51 && code <= 67) cond = 'Light Rain';
          else if (code >= 71 && code <= 82) cond = 'Showers';
          else if (code === 0) cond = 'Clear Sky';
          else if (code >= 1 && code <= 3) cond = 'Cloudy';

          // format sunrise & sunset
          let sunriseStr = '05:37 AM';
          let sunsetStr = '06:17 PM';
          if (data.daily && data.daily.sunrise && data.daily.sunset) {
            const sr = new Date(data.daily.sunrise[0]);
            const ss = new Date(data.daily.sunset[0]);
            sunriseStr = sr.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            sunsetStr = ss.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          }

          setWeather({
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature || data.current.temperature_2m + 3),
            condition: cond,
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            sunrise: sunriseStr,
            sunset: sunsetStr,
            lastUpdated: 'Just now',
            loading: false
          });
        }
      } catch (err) {
        console.error('Weather fetch fallback used', err);
      }
    }
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // every 30 mins
    return () => clearInterval(weatherInterval);
  }, []);

  // 3. Time-aware Greetings & Original Dynamic Motivations
  let greeting = '';
  let motivationMsg = '';
  let WeatherIcon = CloudRain;
  let weatherGradient = 'from-blue-600 via-indigo-700 to-slate-900';

  if (hours >= 0 && hours < 5) {
    greeting = '🌅 Brahmamuhurtha Awakening — The World is Asleep, Your Goal is Waiting';
    motivationMsg = '“At 3 AM in Srikakulam, while silence rules the coast, your dedication builds your IIT dream. Open the first lecture. Do not think, just execute.”';
    WeatherIcon = Moon;
    weatherGradient = 'from-slate-950 via-indigo-950 to-blue-950';
  } else if (hours >= 5 && hours < 12) {
    greeting = '☀️ Good Morning, Srikakulam Warrior';
    motivationMsg = '“Morning light over the Bay of Bengal. Your daily schedule is locked. Trust the plan, watch the lecture, master the concepts.”';
    WeatherIcon = Sun;
    weatherGradient = 'from-sky-500 via-indigo-600 to-blue-700';
  } else if (hours >= 12 && hours < 17) {
    greeting = '⚡ Afternoon Execution Peak';
    motivationMsg = '“Midday focus. Do not get distracted by alternative resources or changing teachers. Execute today’s tasks with absolute rigor.”';
    WeatherIcon = Cloud;
    weatherGradient = 'from-blue-600 via-sky-600 to-indigo-800';
  } else if (hours >= 17 && hours < 21) {
    greeting = '🌆 Evening Revision & Problem Solving';
    motivationMsg = '“As evening settles over Srikakulam, review your notes and solve practice sets. Consistency beats intensity every single time.”';
    WeatherIcon = CloudRain;
    weatherGradient = 'from-indigo-900 via-slate-900 to-blue-950';
  } else {
    greeting = '🌙 Late Night Deep Focus';
    motivationMsg = '“Late night session. Wrap up pending tasks, record your progress, and prepare for tomorrow’s triumph.”';
    WeatherIcon = Moon;
    weatherGradient = 'from-slate-900 via-indigo-950 to-slate-950';
  }

  // 4. Start Date & Day Calculation in IST
  const startDateStr = settings.startDate || '2026-08-30';
  const start = new Date(startDateStr);
  
  // Calculate difference in days between IST now and start date
  const istDateOnly = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffTime = istDateOnly - startDateOnly;
  const calculatedDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const [selectedDayNum, setSelectedDayNum] = useState(() => {
    return Math.max(1, Math.min(189, calculatedDayNum));
  });

  // If before start date (e.g. 29 Aug 2026)
  const isBeforeStart = calculatedDayNum < 1;

  const currentWeekNum = Math.ceil(Math.max(1, selectedDayNum) / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === selectedDayNum) : null;
  const actualDate = getDateFromDayNum(selectedDayNum, startDateStr);

  // 5. STREAK ENGINE — STRICTLY ONLY INCREASES WHEN SCHEDULED STUDY WORK IS COMPLETED
  // A day counts when all required tasks for that day are completed (or >= 80%)
  const calculateRealStudyStreak = () => {
    let streak = 0;
    // check backwards from today or current day
    const checkDayLimit = Math.min(selectedDayNum, calculatedDayNum);
    for (let d = checkDayLimit; d >= 1; d--) {
      // Find day tasks
      let dayTotalTasks = 0;
      let dayCompletedTasks = 0;
      scheduleData.forEach(w => {
        w.days.forEach(day => {
          if (day.dayNum === d) {
            day.subjects.forEach((sub, sIdx) => {
              sub.tasks.forEach(task => {
                dayTotalTasks++;
                if (progress[`${d}_${sIdx}_${task}`]) {
                  dayCompletedTasks++;
                }
              });
            });
          }
        });
      });

      // Day is completed if dayTotalTasks > 0 and completed == totalTasks (or >= 80%)
      const isCompleted = dayTotalTasks > 0 && (dayCompletedTasks / dayTotalTasks) >= 0.8;
      if (isCompleted) {
        streak++;
      } else if (d === calculatedDayNum) {
        // Today in progress doesn't break historical streak yet
        continue;
      } else {
        // Streak broken on past uncompleted day
        break;
      }
    }
    return streak;
  };

  const currentStudyStreak = calculateRealStudyStreak();

  // Task check toggle with undo capability toast/state
  const [lastToggled, setLastToggled] = useState(null); // { key, prevValue }

  const toggleTask = (subIdx, taskName) => {
    const key = `${selectedDayNum}_${subIdx}_${taskName}`;
    const prevVal = !!progress[key];
    const newVal = !prevVal;
    const newProgress = { ...progress, [key]: newVal };
    setProgress(newProgress);
    setLastToggled({ key, prevValue: prevVal });
  };

  const undoLastToggle = () => {
    if (!lastToggled) return;
    const { key, prevValue } = lastToggled;
    setProgress({ ...progress, [key]: prevValue });
    setLastToggled(null);
  };

  const handleNoteChange = (subIdx, text) => {
    const key = `${selectedDayNum}_${subIdx}_note`;
    setNotes({ ...notes, [key]: text });
  };

  // Today progress
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
  const isDayFullyComplete = totalTasks > 0 && completedTasks === totalTasks;

  // Find "What To Do Now" (first incomplete task)
  let currentTaskObj = null;
  if (dayData && dayData.subjects) {
    for (let sIdx = 0; sIdx < dayData.subjects.length; sIdx++) {
      const sub = dayData.subjects[sIdx];
      for (let tIdx = 0; tIdx < sub.tasks.length; tIdx++) {
        const task = sub.tasks[tIdx];
        const key = `${selectedDayNum}_${sIdx}_${task}`;
        if (!progress[key]) {
          currentTaskObj = { subject: sub.name, lecture: sub.lecture, module: sub.module, duration: sub.duration, taskName: task, sIdx };
          break;
        }
      }
      if (currentTaskObj) break;
    }
  }

  // If before start date, show countdown
  if (isBeforeStart) {
    const diffMs = start - istTime;
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-sky-500/30">
          ⚡
        </div>
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 px-4 py-1.5 rounded-full border border-sky-500/25">
            GATE 2028 COMMAND CENTER
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Preparation Begins Soon</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Your official 27-week foundational schedule starts on <span className="font-bold text-slate-800 dark:text-slate-200">30 August 2026</span>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-md mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starts In</p>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-2 text-sky-600 dark:text-sky-400">
            {hoursLeft.toString().padStart(2, '0')}:{minsLeft.toString().padStart(2, '0')}:{secsLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Undo Toast Notification */}
      {lastToggled && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-800 animate-bounce">
          <span className="text-xs font-bold">Task updated</span>
          <button
            onClick={undoLastToggle}
            className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Ultra Premium Live Srikakulam Weather & Clock Header Banner */}
      <div className={`bg-gradient-to-r ${weatherGradient} rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-sky-500/10 relative overflow-hidden border border-white/10 transition-all duration-700`}>
        {/* Ambient background glows */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            {/* Live Location & Weather Widget */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/20 shadow-inner">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Srikakulam, AP</span>
              </span>
              <span className="bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 border border-white/25">
                <WeatherIcon className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                <span>{weather.condition} • {weather.temp}°C (Feels {weather.feelsLike}°)</span>
              </span>
              <span className="bg-amber-500/25 text-amber-200 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Streak: {currentStudyStreak} Days</span>
              </span>
            </div>

            {/* Live IST Clock & Greeting */}
            <div>
              <div className="flex items-baseline space-x-3 mt-1">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-white drop-shadow">
                  {timeString} {ampm}
                </h2>
                <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">
                  IST (UTC+5:30)
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
            className="bg-white hover:bg-sky-50 text-sky-950 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-black/20 flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>START FOCUS MODE</span>
          </button>
        </div>
      </div>

      {/* Weather Detail Mini Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <Droplets className="w-5 h-5 text-sky-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Humidity</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{weather.humidity}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <Wind className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Wind</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{weather.wind} km/h</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <Sunrise className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sunrise</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{weather.sunrise}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <Sunset className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sunset</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{weather.sunset}</p>
          </div>
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
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-md">
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

      {/* WHAT SHOULD I DO RIGHT NOW? (Decision Fatigue Eliminator Card) */}
      {currentTaskObj ? (
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-sky-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              WHAT TO DO NOW • NO DECISION NEEDED
            </span>
            <p className="text-xs text-sky-100 font-bold mt-2">{currentTaskObj.subject} • {currentTaskObj.module}</p>
            <h3 className="text-xl sm:text-2xl font-black">{currentTaskObj.lecture}</h3>
            <p className="text-xs text-sky-200">Current Task: <span className="font-bold underline">{currentTaskObj.taskName}</span></p>
          </div>
          <button
            onClick={() => {
              // auto toggle this first task
              toggleTask(currentTaskObj.sIdx, currentTaskObj.taskName);
            }}
            className="bg-white text-sky-600 hover:bg-sky-50 px-5 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105 shrink-0"
          >
            <Play className="w-4 h-4 fill-sky-600" />
            <span>MARK TASK DONE</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl text-center space-y-2">
          <h3 className="text-2xl font-black">DAY COMPLETE ✅</h3>
          <p className="text-xs text-emerald-100">All required academic tasks for Day {selectedDayNum} are successfully finished. Your streak is secure.</p>
        </div>
      )}

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
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md"
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
                          className={`flex items-center space-x-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
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
