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

  // 2. LIVE GEOLOCATION WEATHER DETECTION
  const [locationName, setLocationName] = useState('Detecting Location...');
  const [weather, setWeather] = useState({
    temp: 29,
    feelsLike: 35,
    condition: 'Pleasant',
    humidity: 75,
    wind: 10,
    sunrise: '05:40 AM',
    sunset: '06:15 PM',
    lastUpdated: 'Live',
    isOffline: false
  });

  useEffect(() => {
    async function fetchLiveLocationAndWeather() {
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (!geoRes.ok) throw new Error('IP geolocation failed');
        const geoData = await geoRes.json();
        
        const lat = geoData.latitude || 17.3850;
        const lon = geoData.longitude || 78.4867;
        const cityName = geoData.city || 'Your Location';
        const regionName = geoData.region || '';
        setLocationName(`${cityName}, ${regionName}`);

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata`);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const wData = await weatherRes.json();

        if (wData && wData.current) {
          const code = wData.current.weather_code;
          let cond = 'Partly Cloudy';
          if (code >= 51 && code <= 67) cond = 'Light Rain';
          else if (code >= 71 && code <= 82) cond = 'Showers';
          else if (code === 0) cond = 'Clear Sky';
          else if (code >= 1 && code <= 3) cond = 'Cloudy';

          let sunriseStr = '05:40 AM';
          let sunsetStr = '06:15 PM';
          if (wData.daily && wData.daily.sunrise && wData.daily.sunset) {
            const sr = new Date(wData.daily.sunrise[0]);
            const ss = new Date(wData.daily.sunset[0]);
            sunriseStr = sr.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            sunsetStr = ss.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          }

          const liveW = {
            temp: Math.round(wData.current.temperature_2m),
            feelsLike: Math.round(wData.current.apparent_temperature || wData.current.temperature_2m + 2),
            condition: cond,
            humidity: wData.current.relative_humidity_2m,
            wind: Math.round(wData.current.wind_speed_10m),
            sunrise: sunriseStr,
            sunset: sunsetStr,
            lastUpdated: 'Live GPS/IP',
            isOffline: false
          };
          setWeather(liveW);
          localStorage.setItem('gate2028_live_weather_cache', JSON.stringify({ liveW, locationName: `${cityName}, ${regionName}` }));
        }
      } catch (err) {
        const cached = localStorage.getItem('gate2028_live_weather_cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setWeather(parsed.liveW);
            setLocationName(parsed.locationName);
          } catch(e) {}
        } else {
          setLocationName('India (IST)');
        }
      }
    }

    fetchLiveLocationAndWeather();
  }, []);

  // 3. Immersive Dreamland Atmospheric Themes (Deep Magical Pink/Purple & Starry Cosmos)
  let environmentName = 'Starlight Dream';
  let greeting = '';
  let motivationMsg = '';
  let WeatherIcon = Moon;
  let heroGradient = 'from-[#12071f] via-[#1f0d3d] to-[#0d0922]';
  let accentGlow = 'bg-pink-500/20';

  if (hours >= 0 && hours < 5) {
    environmentName = 'Brahmamuhurtha Dream';
    greeting = 'Good morning. The starlight whispers your IIT dream.';
    motivationMsg = '“At 3 AM, while the universe rests, your dedication builds your destiny, Maahi 💗.”';
    WeatherIcon = Moon;
    heroGradient = 'from-[#0a0314] via-[#16082b] to-[#0c051a]';
    accentGlow = 'bg-purple-500/25';
  } else if (hours >= 5 && hours < 8) {
    environmentName = 'Magical Dawn';
    greeting = 'Good morning. First pink light over the horizon.';
    motivationMsg = '“The path is clear. The schedule is locked. Execute today’s plan with absolute grace.”';
    WeatherIcon = Sunrise;
    heroGradient = 'from-[#140824] via-[#24103f] to-[#12082b]';
    accentGlow = 'bg-rose-500/20';
  } else if (hours >= 8 && hours < 17) {
    environmentName = 'Radiant Daylight';
    greeting = hours < 12 ? 'Good morning ☀️' : 'Good afternoon.';
    motivationMsg = '“One lecture at a time. No subject switching. Trust the coaching schedule, Maahi 💗.”';
    WeatherIcon = Sun;
    heroGradient = 'from-[#100c24] via-[#1c123d] to-[#0f172a]';
    accentGlow = 'bg-pink-500/20';
  } else if (hours >= 17 && hours < 20) {
    environmentName = 'Twilight Dusk';
    greeting = 'Good evening.';
    motivationMsg = '“As twilight settles, review your notes and lock in your practice sets with confidence.”';
    WeatherIcon = Sunset;
    heroGradient = 'from-[#1f092b] via-[#33114a] to-[#140826]';
    accentGlow = 'bg-pink-500/25';
  } else {
    environmentName = 'Deep Dreamland Cosmos';
    greeting = 'Good night.';
    motivationMsg = '“Today’s work is done. Sleep peacefully knowing you moved closer to GATE 2028, Maahi 💗.”';
    WeatherIcon = Moon;
    heroGradient = 'from-[#080312] via-[#130724] to-[#0b0417]';
    accentGlow = 'bg-indigo-500/25';
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

  const currentWeekNum = Math.ceil(Math.max(1, selectedDayNum) / 7);
  const weekData = scheduleData.find(w => w.weekNumber === currentWeekNum) || scheduleData[0];
  const dayData = weekData ? weekData.days.find(d => d.dayNum === selectedDayNum) : null;
  const actualDate = getDateFromDayNum(selectedDayNum, startDateStr);

  // 5. STREAK ENGINE — STRICTLY ONLY INCREASES WHEN SCHEDULED STUDY WORK IS COMPLETED (>=80%)
  const calculateRealStudyStreak = () => {
    let streak = 0;
    const checkDayLimit = Math.min(selectedDayNum, Math.max(1, calculatedDayNum));
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
    return Math.max(streak, 1);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Undo Toast Notification */}
      {lastToggled && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#150a26] text-pink-200 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3.5 border border-pink-500/30 animate-bounce">
          <span className="text-xs font-bold">Task updated</span>
          <button
            onClick={undoLastToggle}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shadow-md"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* DREAMLAND CINEMATIC HERO COMPOSITION */}
      <div className={`bg-gradient-to-br ${heroGradient} rounded-[2.5rem] p-8 sm:p-12 text-white shadow-[0_10px_50px_rgba(236,72,153,0.15)] relative overflow-hidden border border-pink-500/20 transition-all duration-1000`}>
        {/* Ambient atmospheric glowing starlight */}
        <div className={`absolute -right-20 -top-20 w-80 h-80 ${accentGlow} rounded-full blur-[120px] pointer-events-none`} />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero: Time, Environment & Greeting */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-white/10 backdrop-blur-xl text-pink-200 text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-pink-500/30 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                <span>{locationName}</span>
              </span>
              <span className="bg-white/10 backdrop-blur-xl text-pink-200 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-2 border border-pink-500/30">
                <WeatherIcon className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                <span>{environmentName} • {weather.temp}°C</span>
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-500/30 flex items-center space-x-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Streak: {currentStudyStreak} Days</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <h1 className="text-5xl sm:text-6xl font-black tracking-tighter font-mono text-white drop-shadow-[0_2px_15px_rgba(236,72,153,0.4)]">
                  {timeString}
                </h1>
                <span className="text-xs font-black text-pink-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                  {ampm} • IST
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-pink-100 tracking-tight">
                {greeting}
              </p>
              <p className="text-pink-200/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium italic">
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
                    : 'bg-white/10 hover:bg-white/20 text-pink-100 backdrop-blur-md border border-pink-500/30'
                }`}
              >
                {settings.lockToday ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{settings.lockToday ? 'TODAY LOCKED' : 'LOCK TODAY'}</span>
              </button>

              <button
                onClick={onStartFocus}
                className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(236,72,153,0.4)] flex items-center space-x-2.5 transition-all transform hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>START FOCUS MODE</span>
              </button>
            </div>
          </div>

          {/* Right Hero: Dreamland Weather Card & Core Stats */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-pink-500/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">Maahi 💗 Dreamland</p>
                <h3 className="text-lg font-black mt-0.5 text-white">WEEK {currentWeekNum} • DAY {selectedDayNum}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center font-black text-xl text-white border border-pink-400/40 shadow-md">
                {completionPercent}%
              </div>
            </div>

            {/* Weather Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="bg-white/5 rounded-2xl p-3.5 border border-pink-500/15 flex items-center space-x-3">
                <Droplets className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-pink-200/60 uppercase">Humidity</p>
                  <p className="text-sm font-black text-white">{weather.humidity}%</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-pink-500/15 flex items-center space-x-3">
                <Wind className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-pink-200/60 uppercase">Wind</p>
                  <p className="text-sm font-black text-white">{weather.wind} km/h</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-pink-500/15 flex items-center space-x-3">
                <Sunrise className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-pink-200/60 uppercase">Sunrise</p>
                  <p className="text-sm font-black text-white">{weather.sunrise}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3.5 border border-pink-500/15 flex items-center space-x-3">
                <Sunset className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-pink-200/60 uppercase">Sunset</p>
                  <p className="text-sm font-black text-white">{weather.sunset}</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-pink-500/20">
                <div
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-extrabold text-pink-200/80 mt-2 uppercase tracking-wider">
                <span>Today's Progress</span>
                <span>{completedTasks} / {totalTasks} Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-500/20 shadow-sm flex items-center justify-between transition-colors">
        <button
          onClick={() => setSelectedDayNum(prev => Math.max(1, prev - 1))}
          className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Day</span>
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-800">
            Maahi 💗 Schedule
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
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-pink-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/10">
          <div className="space-y-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/25">
              WHAT TO DO NOW • NO DECISION NEEDED
            </span>
            <p className="text-xs text-pink-100 font-extrabold tracking-wide uppercase mt-1">{currentTaskObj.subject} • {currentTaskObj.module}</p>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{currentTaskObj.lecture}</h3>
            <p className="text-xs text-pink-200 font-medium">Current Action: <span className="font-bold underline text-white">{currentTaskObj.taskName}</span></p>
            {nextTaskObj && (
              <p className="text-[11px] text-pink-200/80">Next up: {nextTaskObj.lecture} ({nextTaskObj.taskName})</p>
            )}
          </div>
          <button
            onClick={() => toggleTask(currentTaskObj.sIdx, currentTaskObj.taskName)}
            className="bg-white hover:bg-pink-50 text-pink-950 px-8 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-2xl flex items-center space-x-2.5 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-pink-950" />
            <span>MARK TASK DONE</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-2xl text-center space-y-3">
          <h3 className="text-3xl font-black">DAY COMPLETE ✅</h3>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">All planned academic work for Day {selectedDayNum} is successfully executed, Maahi 💗. Your study streak is secure.</p>
        </div>
      )}

      {/* Today's Tasks Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Today's Executable Plan</h4>
          <span className="text-xs font-black text-pink-600 dark:text-pink-400">{completedTasks} / {totalTasks} Complete</span>
        </div>

        {dayData && dayData.subjects && dayData.subjects.length > 0 ? (
          dayData.subjects.map((sub, sIdx) => {
            const noteKey = `${selectedDayNum}_${sIdx}_note`;
            const currentNote = notes[noteKey] || '';

            return (
              <div
                key={sIdx}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-pink-500/15 dark:border-pink-500/10 shadow-sm space-y-5 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-3.5 py-1.5 rounded-xl border border-pink-200 dark:border-pink-800">
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
                      <Clock className="w-3.5 h-3.5 text-pink-500" />
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
                              : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-700'
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
                    <FileText className="w-3.5 h-3.5 text-pink-500" />
                    <span>Quick Personal Note / Formula Doubt</span>
                  </div>
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => handleNoteChange(sIdx, e.target.value)}
                    placeholder="Add a short note or formula to remember for GATE..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-pink-500/20 shadow-sm">
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
