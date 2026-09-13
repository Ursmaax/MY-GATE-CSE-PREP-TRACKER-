// Shared date utilities for the GATE 2028 tracker.
//
// WHY THIS FILE EXISTS
// The schedule in `src/data/scheduleData.js` stamps every day with a calendar
// date built from *local* date components (see its `isoDateFor`), and progress
// is keyed by day number (`${dayNum}_${subjectIdx}_${task}`). Every view that
// needs "what day is it?" has to derive the same number the same way, or the
// two disagree.
//
// THE BUG THIS FIXES
// `new Date('2026-08-30')` does not mean "August 30th in your timezone" — the
// ECMAScript spec parses a date-only string as UTC midnight. For IST (UTC+5:30)
// that instant is `Aug 30 05:30` local, i.e. already 5h30 past the start of the
// day. Any code that then formats that Date, or diffs it against a locally
// built date, silently shifts by one day between 00:00 and 05:30 local time —
// exactly the Brahmamuhurtha study window this app is designed around.
//
// THE RULE
// Never `new Date(dateOnlyString)`. Always go through `parseISODate` below, so
// both sides of every subtraction are local midnights and the difference is a
// whole number of days.

export const PROGRAMME_LENGTH_DAYS = 189;
export const DEFAULT_START_DATE = '2026-08-30';

// Asia/Kolkata is UTC+5:30 year-round (no DST), which is the reference frame
// the whole plan is written against.
const TRACKER_TIME_ZONE = 'Asia/Kolkata';

/** 'YYYY-MM-DD' -> a Date at *local* midnight, so formatting it never drifts. */
export function parseISODate(isoDateStr) {
  const match = /^\d{4}-\d{2}-\d{2}$/.test(isoDateStr || '')
    ? isoDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    : null;
  if (!match) {
    // Anything that isn't a plain calendar date (full timestamps, Date objects
    // stringified, legacy values) falls back to normal parsing rather than
    // throwing — a bad start date should degrade, not blank the app.
    return new Date(isoDateStr);
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Today's calendar date as 'YYYY-MM-DD', in the tracker's own timezone. */
export function getTodayISODate(referenceDate = new Date()) {
  // Intl gives us the wall-clock date for a specific zone without hand-rolling
  // offsets, so this stays correct if the host is not itself on IST.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TRACKER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(referenceDate);
  const pick = (type) => parts.find((p) => p.type === type)?.value;
  const year = pick('year');
  const month = pick('month');
  const day = pick('day');
  if (year && month && day) return `${year}-${month}-${day}`;
  return `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}-${String(referenceDate.getDate()).padStart(2, '0')}`;
}

/**
 * How many whole days `targetDateStr` is from `startDateStr`, 1-based:
 * the start date itself is Day 1. Both operands are parsed as calendar dates,
 * so the result is a pure day count with no time-of-day component.
 */
export function getDayNumFromDate(targetDateStr, startDateStr = DEFAULT_START_DATE) {
  const start = startOfLocalDay(parseISODate(startDateStr));
  const target = startOfLocalDay(parseISODate(targetDateStr));
  const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Day number for "today", clamped into the 1..189 programme window.
 *
 * Clamping matters: before the start date the raw count is zero or negative,
 * which previously leaked through as a day key no task ever matched.
 */
export function getTodayDayNum(startDateStr = DEFAULT_START_DATE, referenceDate = new Date()) {
  const inZone = new Intl.DateTimeFormat('en-CA', {
    timeZone: TRACKER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(referenceDate);
  return clampDayNum(getDayNumFromDate(inZone, startDateStr));
}

export function clampDayNum(dayNum) {
  const asInt = Math.trunc(Number(dayNum));
  if (!Number.isFinite(asInt)) return 1;
  return Math.max(1, Math.min(PROGRAMME_LENGTH_DAYS, asInt));
}

/** The calendar Date for a given day number — local midnight, so it formats safely. */
export function getDateFromDayNum(dayNum, startDateStr = DEFAULT_START_DATE) {
  const start = startOfLocalDay(parseISODate(startDateStr));
  start.setDate(start.getDate() + (Math.trunc(Number(dayNum)) || 1) - 1);
  return start;
}

export function formatDateReadable(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Completed / scheduled task counts for one day number, plus the >=80% flag the
 * streak engine requires. Lives here so TodayView, FocusMode and ProgressView
 * cannot drift apart on how a day is scored — they previously each had their own
 * copy of this loop with subtly different day-number arithmetic.
 */
export function countDayProgress(scheduleData, dayNum, progress) {
  let total = 0;
  let completed = 0;
  for (const week of scheduleData) {
    const day = week.days.find((d) => d.dayNum === dayNum);
    if (!day) continue;
    day.subjects.forEach((sub, sIdx) => {
      sub.tasks.forEach((task) => {
        total += 1;
        if (progress[`${dayNum}_${sIdx}_${task}`]) completed += 1;
      });
    });
    break;
  }
  return { total, completed, isDayComplete: total > 0 && completed / total >= 0.8 };
}

/**
 * Strict study streak: consecutive completed days walking backwards from
 * `startDay`. `skipDay` (normally *today*, regardless of which day you are
 * browsing) is allowed to be incomplete without breaking the run — a partially
 * finished today does not erase yesterday's streak. That is the behaviour every
 * view already had, now defined once.
 */
export function calculateStreak(scheduleData, progress, startDay, skipDay = startDay) {
  let streak = 0;
  const from = Math.trunc(Number(startDay)) || 0;
  for (let day = from; day >= 1; day -= 1) {
    const { isDayComplete } = countDayProgress(scheduleData, day, progress);
    if (isDayComplete) {
      streak += 1;
    } else if (day === skipDay) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}
