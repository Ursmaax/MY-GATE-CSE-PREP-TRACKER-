import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Zap, ChevronLeft, ChevronRight, FileText, Clock, 
  Sparkles, CloudRain, Sun, Cloud, Moon, MapPin, Wind, Droplets, Sunrise, 
  Sunset, Flame, Play, Undo2, Lock, Unlock, Calendar, BookOpen, BarChart2, 
  Repeat, Settings, Search, Shield, RefreshCw, Check, ArrowRight, Target, Compass
} from 'lucide-react';
import { getDateFromDayNum, formatDateReadable } from '../utils/dateHelper';

export default function TodayView({ scheduleData, settings, setSettings, progress, setProgress, notes, setNotes, onStartFocus, setActiveTab }) {
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
  const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')}`;

  // 2. Live Weather state for Srikakulam, AP with caching & offline resilience
  const [weather, setWeather] = useState(() => {
    const cached = localStorage.getItem('gate2028_weather_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    return {
      temp: 29,
      feelsLike: 36,
      condition: 'Light Rain',
      humidity: 87,
      wind: 9,
      sunrise: '05:37 AM',
      sunset: '06:17 PM',
      lastUpdated: 'Cached',
      isOffline: false
    };
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.30&longitude=83.90&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (data && data.current) {
          const code = data.current.weather_code;
          let cond = 'Partly Cloudy';
          if (code >= 51 && code <= 67) cond = 'Light Rain';
          else if (code >= 71 && code <= 82) cond = 'Showers';
          else if (code === 0) cond = 'Clear Sky';
          else if (code >= 1 && code <= 3) cond = 'Cloudy';

          let sunriseStr = '05:37 AM';
          let sunsetStr = '06:17 PM';
          if (data.daily && data.daily.sunrise && data.daily.sunset) {
            const sr = new Date(data.daily.sunrise[0]);
            const ss = new Date(data.daily.sunset[0]);
            sunriseStr = sr.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            sunsetStr = ss.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          }

          const newW = {
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature || data.current.temperature_2m + 3),
            condition: cond,
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            sunrise: sunriseStr,
            sunset: sunsetStr,
            lastUpdated: 'Just now',
            isOffline: false
          };
          setWeather(newW);
          localStorage.setItem('gate2028_weather_cache', JSON.stringify(newW));
        }
      } catch (err) {
        setWeather(prev => ({ ...prev, lastUpdated: 'Last synced earlier', isOffline: true }));
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Immersive Cinematic Atmospheric Themes based on IST Time & Weather
  let environmentName = 'Night Sky';
  let greeting = '';
  let motivationMsg = '';
  let WeatherIcon = Moon;
  let atmosphereBg = 'bg-[#060913] text-slate-100 border-white/10';
  let heroGradient = 'from-slate-950 via-[#0B1021] to-[#121936]';
  let accentGlow = 'bg-sky-500/10';

  if (hours >= 0 && hours < 5) {
    environmentName = 'Brahmamuhurtha Calm';
    greeting = 'Good morning. The world is quiet. This is your time.';
    motivationMsg = '“At 3 AM in Srikakulam, while silence rules the coast, your dedication builds your IIT dream.”';
    WeatherIcon = Moon;
    heroGradient = 'from-[#03050B] via-[#090D1C] to-[#111732]';
    accentGlow = 'bg-indigo-500/10';
  } else if (hours >= 5 && hours < 8) {
    environmentName = 'Pre-Dawn Horizon';
    greeting = 'Good morning. First light over Srikakulam.';
    motivationMsg = '“The syllabus is fixed. The date is locked. Execute today’s plan with absolute calm.”';
    WeatherIcon = Sunrise;
    heroGradient = 'from-[#0B0F1F] via-[#151B35] to-[#252A50]';
    accentGlow = 'bg-amber-500/10';
  } else if (hours >= 8 && hours < 17) {
    environmentName = 'Daylight Focus';
    greeting = hours < 12 ? 'Good morning ☀️' : 'Good afternoon.';
    motivationMsg = '“One lecture at a time. No subject switching. Trust the coaching schedule.”';
    WeatherIcon = Sun;
    heroGradient = 'from-[#0F172A] via-[#1E293B] to-[#334155]';
    accentGlow = 'bg-sky-500/10';
  } else if (hours >= 17 && hours < 20) {
    environmentName = 'Warm Sunset';
    greeting = 'Good evening.';
    motivationMsg = '“As evening settles over the coast, review your notes and lock in your practice sets.”';
    WeatherIcon = Sunset;
    heroGradient = 'from-[#1A1025] via-[#241638] to-[#3B225C]';
    accentGlow = 'bg-orange-500/10';
  } else {
    environmentName = 'Deep Night Cosmos';
    greeting = 'Good night.';
    motivationMsg = '“Today’s work is done. Sleep knowing you moved one step closer to GATE 2028.”';
    WeatherIcon = Moon;
    heroGradient = 'from-[#05070E] via-[#0D1122] to-[#161D3A]';
    accentGlow = 'bg-indigo-500/10';
  }

  // 4. Start Date & Day Calculation in IST
  const startDateStr = settings.startDate || '2026-08-30';
  const start = new Date(startDateStr);
  
  const istDateOnly = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffTime = istDateOnly - startDateOnly;
  const calculatedDayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const [selectedDayNum, setSelectedDayNum] = useState(() => {
    return Math.max(1, Math.min(189, calculatedDayNum));
  });

  const isBeforeStart = calculatedDayNum < 1;

  const currentWeekNum = Math.ceil(Math.max(1, selectedDayNum) / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === selectedDayNum) : null;
  const actualDate = getDateFromDayNum(selectedDayNum, startDateStr);

  // 5. STREAK ENGINE — STRICTLY ONLY INCREASES WHEN SCHEDULED STUDY WORK IS COMPLETED (>=80%)
  const calculateRealStudyStreak = () => {
    let streak = 0;
    const checkDayLimit = Math.min(selectedDayNum, calculatedDayNum);
    for (let d = checkDayLimit; d >= 1; d--) {
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

      const isCompleted = dayTotalTasks > 0 && (dayCompletedTasks / dayTotalTasks) >= 0.8;
      if (isCompleted) {
        streak++;
      } else if (d === calculatedDayNum) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStudyStreak = calculateRealStudyStreak();

  // Task check toggle with undo capability toast/state
  const [lastToggled, setLastToggled] = useState(null);

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
    const key = `${selectedDayNum}_${sIdx}_note`;
    setNotes({ ...notes, [key]: text });
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
  const isDayFullyComplete = totalTasks > 0 && completedTasks === totalTasks;

  // Find "What To Do Now" (first incomplete task)
  let currentTaskObj = null;
  let nextTaskObj = null;
  if (dayData && dayData.subjects) {
    let foundCurrent = false;
    dayData.subjects.forEach((sub, sIdx) => {
      sub.tasks.forEach((task, tIdx) => {
        const key = `${selectedDayNum}_${sIdx}_${task}`;
        if (!progress[key]) {
          if (!foundCurrent) {
            currentTaskObj = { subject: sub.name, lecture: sub.lecture, module: sub.module, duration: sub.duration, taskName: task, sIdx };
            foundCurrent = true;
          } else if (!nextTaskObj) {
            nextTaskObj = { lecture: sub.lecture, taskName: task };
          }
        }
      });
    });
  }

  // If before start date
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Undo Toast Notification */}
      {lastToggled && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3.5 border border-slate-800 animate-bounce">
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

      {/* REIMAGINED CINEMATIC HERO COMPOSITION */}
      <div className={`bg-gradient-to-br ${heroGradient} rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10 transition-all duration-1000`}>
        {/* Ambient atmospheric lighting */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 ${accentGlow} rounded-full blur-[100px] pointer-events-none`} />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero: Time, Environment & Greeting */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-white/10 backdrop-blur-xl text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-white/15 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Srikakulam, AP</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xl text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-white/15">
                <WeatherIcon className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                <span>{environmentName} • {weather.temp}°C</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-500/30 flex items-center space-x-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Streak: {currentStudyStreak} Days</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter font-mono text-white drop-shadow-md">
                  {timeString}
                </h1>
                <span className="text-xs font-black text-sky-200 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg">
                  {ampm} • IST
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {greeting}
              </p>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed font-medium italic">
                {motivationMsg}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const newLock = !settings.lockToday;
                  setSettings({ ...settings, lockToday: newLock });
                }}
                className={`px-5 py-3.5 rounded-2xl font-black text-xs flex items-center space-x-2 transition-all shadow-md ${
                  settings.lockToday
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15'
                }`}
              >
                {settings.lockToday ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{settings.lockToday ? 'TODAY LOCKED' : 'LOCK TODAY'}</span>
              </button>

              <button
                onClick={onStartFocus}
                className="bg-white hover:bg-sky-50 text-slate-950 px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-black/25 flex items-center space-x-2.5 transition-all transform hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>START FOCUS MODE</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Embedded Weather Card & Core Stats */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">GATE 2028 COMMAND</p>
                <h3 className="text-lg font-black mt-0.5">WEEK {currentWeekNum} • DAY {selectedDayNum}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center font-black text-xl text-sky-200 border border-white/20 shadow-inner">
                {completionPercent}%
              </div>
            </div>

            {/* Weather Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center space-x-3">
                <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Humidity</p>
                  <p className="text-sm font-black">{weather.humidity}%</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center space-x-3">
                <Wind className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Wind</p>
                  <p className="text-sm font-black">{weather.wind} km/h</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center space-x-3">
                <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Sunrise</p>
                  <p className="text-sm font-black">{weather.sunrise}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 flex items-center space-x-3">
                <Sunset className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Sunset</p>
                  <p className="text-sm font-black">{weather.sunset}</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-sky-400 to-indigo-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-300 mt-2 uppercase tracking-wider">
                <span>Today's Progress</span>
                <span>{completedTasks} / {totalTasks} Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
        <button
          onClick={() => setSelectedDayNum(prev => Math.max(1, prev - 1))}
          className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
            DATE MAPPING ACTIVE
          </span>
          <h3 className="font-black text-base sm:text-lg mt-1 text-slate-900 dark:text-slate-100">
            {formatDateReadable(actualDate)}
          </h3>
        </div>
        <button
          onClick={() => setSelectedDayNum(prev => Math.min(189, prev + 1))}
          className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* WHAT SHOULD I DO NOW? (Decision Fatigue Eliminator Card) */}
      {currentTaskObj ? (
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-sky-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/10">
          <div className="space-y-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/25">
              WHAT TO DO NOW • NO DECISION NEEDED
            </span>
            <p className="text-xs text-sky-100 font-extrabold tracking-wide uppercase mt-1">{currentTaskObj.subject} • {currentTaskObj.module}</p>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{currentTaskObj.lecture}</h3>
            <p className="text-xs text-sky-200 font-medium">Current Action: <span className="font-bold underline text-white">{currentTaskObj.taskName}</span></p>
            {nextTaskObj && (
              <p className="text-[11px] text-sky-200/80">Next up: {nextTaskObj.lecture} ({nextTaskObj.taskName})</p>
            )}
          </div>
          <button
            onClick={() => toggleTask(currentTaskObj.sIdx, currentTaskObj.taskName)}
            className="bg-white hover:bg-sky-50 text-sky-950 px-8 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-2xl flex items-center space-x-2.5 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-sky-950" />
            <span>MARK TASK DONE</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-2xl text-center space-y-3">
          <h3 className="text-3xl font-black">DAY COMPLETE ✅</h3>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">All planned academic work for Day {selectedDayNum} is successfully executed. Your study streak is secure.</p>
        </div>
      )}

      {/* Today's Tasks Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Today's Executable Plan</h4>
          <span className="text-xs font-black text-sky-600 dark:text-sky-400">{completedTasks} / {totalTasks} Complete</span>
        </div>

        {dayData && dayData.subjects && dayData.subjects.length > 0 ? (
          dayData.subjects.map((sub, sIdx) => {
            const noteKey = `${selectedDayNum}_${sIdx}_note`;
            const currentNote = notes[noteKey] || '';

            return (
              <div
                key={sIdx}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3.5 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
                      {sub.name}
                    </span>
                    <h4 className="text-xl font-black mt-3 text-slate-900 dark:text-slate-100">
                      {sub.lecture}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold">
                      Module: {sub.module}
                    </p>
                  </div>
                  {sub.duration && (
                    <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-2xl text-xs font-black self-start sm:self-auto border border-slate-200/60 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{sub.duration}</span>
                    </div>
                  )}
                </div>

                {/* Tasks Checkboxes */}
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Required Execution Tasks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sub.tasks.map((task, tIdx) => {
                      const taskKey = `${selectedDayNum}_${sIdx}_${task}`;
                      const isChecked = !!progress[taskKey];

                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(sIdx, task)}
                          className={`flex items-center space-x-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                            isChecked
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-sm'
                              : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5.5 h-5.5 text-slate-400 shrink-0" />
                          )}
                          <span className={`text-sm font-bold ${isChecked ? 'line-through opacity-75' : 'text-slate-800 dark:text-slate-200'}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Note for this Lecture */}
                <div className="pt-2">
                  <div className="flex items-center space-x-1.5 text-xs font-black text-slate-400 mb-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Quick Personal Note / Formula Doubt</span>
                  </div>
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => handleNoteChange(sIdx, e.target.value)}
                    placeholder="Add a short note or formula to remember for GATE..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="text-lg font-black text-slate-700 dark:text-slate-300">No Scheduled Lectures Today</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Reset day or buffer day. Use this time to revise previous concepts or solve GATE PYQs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
