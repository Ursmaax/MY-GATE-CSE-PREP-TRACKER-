/**
 * Timezone / day-number regression checks for the tracker.
 *
 * Run with:  npm run verify:dates
 *
 * These exist because several views derived "today" independently, and every
 * one of them fed `settings.startDate` through `new Date('2026-08-30')` — which
 * the spec reads as *UTC* midnight, not "August 30th here". Measured damage:
 *
 *  1. ProgressView computed `now - new Date(start)` against its own raw clock,
 *     so between 00:00 and 05:30 IST it reported Day 14 while the rest of the
 *     app reported Day 15 — and the strict streak window walked back from the
 *     wrong day. (Reproduced: 15 vs 14 at 00:30 / 04:00 IST.)
 *  2. TodayView and FocusMode advertised an "IST clock" but built the day from
 *     host-local components, so their answer moved with the laptop's timezone
 *     (Day 16 in New York for the same instant everyone else called Day 15).
 *  3. getDateFromDayNum() returned a Date 5h30 into the local day, so
 *     PlanView's `{day.date} • {formatDateReadable(...)}` pair disagreed by a
 *     day for any host west of Greenwich (Sep 12 vs Sep 13).
 *  4. QuizzesView / TestsView defaulted the session date to
 *     `toISOString().slice(0, 10)`, which stamps 00:30 IST as the previous day.
 *
 * The helpers are now the single source of truth, and every assertion below
 * must hold regardless of the host timezone — which is what section 4 proves.
 */
import {
  DEFAULT_START_DATE,
  PROGRAMME_LENGTH_DAYS,
  calculateStreak,
  clampDayNum,
  countDayProgress,
  formatDateReadable,
  getDateFromDayNum,
  getDayNumFromDate,
  getTodayDayNum,
  getTodayISODate,
  parseISODate
} from '../src/utils/dateHelper.js';
import { initialScheduleData as schedule } from '../src/data/scheduleData.js';

let failures = 0;
let checks = 0;

function assert(condition, message) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${message}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

console.log(`Host timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

// ── 1. Start date parsing is local, not UTC ─────────────────────────────────
section('1. Date-only strings parse as calendar days, not UTC instants');
const start = parseISODate(DEFAULT_START_DATE);
assert(start.getFullYear() === 2026, `year parsed as ${start.getFullYear()}`);
assert(start.getMonth() === 7, `month parsed as ${start.getMonth()} (expected 7 = August)`);
assert(start.getDate() === 30, `day parsed as ${start.getDate()} (expected 30)`);
assert(
  start.getHours() === 0 && start.getMinutes() === 0,
  `start of day must be local midnight, got ${start.getHours()}:${start.getMinutes()}`
);

// The root cause, pinned as a fact rather than an assumption: `new Date` on a
// date-only string is UTC midnight, so its *local* day-of-month moves whenever
// the host is west of Greenwich. `parseISODate` must not.
const utcParsed = new Date(DEFAULT_START_DATE);
assert(
  utcParsed.getTime() === Date.UTC(2026, 7, 30),
  'sanity: new Date("2026-08-30") is defined as UTC midnight'
);
assert(
  utcParsed.getDate() === start.getDate() || utcParsed.getTimezoneOffset() > 0,
  'the old parse drifted a day west of UTC — this is exactly what the helpers avoid'
);

// ── 2. Day number <-> date round trip over the whole programme ──────────────
section('2. Every day number maps to the date the schedule advertises');
for (const day of schedule.flatMap((w) => w.days)) {
  const derived = getDateFromDayNum(day.dayNum, DEFAULT_START_DATE);
  assert(
    iso(derived) === day.date,
    `Day ${day.dayNum}: helper says ${iso(derived)}, schedule says ${day.date}`
  );
  assert(
    getDayNumFromDate(day.date, DEFAULT_START_DATE) === day.dayNum,
    `Day ${day.dayNum}: round trip from ${day.date} gave ${getDayNumFromDate(day.date, DEFAULT_START_DATE)}`
  );
  // PlanView prints `{day.date} • {formatDateReadable(actualDate)}` side by
  // side, so the two renderings of the same day must never contradict.
  const [y, m, d] = day.date.split('-').map(Number);
  assert(
    derived.getFullYear() === y && derived.getMonth() === m - 1 && derived.getDate() === d,
    `Day ${day.dayNum}: readable form "${formatDateReadable(derived)}" contradicts schedule date ${day.date}`
  );
}

// ── 3. Boundaries: day 1 and the last day, plus out-of-range input ─────────
section('3. Programme boundaries and clamping');
assert(getDayNumFromDate(DEFAULT_START_DATE, DEFAULT_START_DATE) === 1, 'start date must be Day 1');
const lastDate = iso(getDateFromDayNum(PROGRAMME_LENGTH_DAYS, DEFAULT_START_DATE));
assert(
  getDayNumFromDate(lastDate, DEFAULT_START_DATE) === PROGRAMME_LENGTH_DAYS,
  `last day ${lastDate} gave ${getDayNumFromDate(lastDate, DEFAULT_START_DATE)}`
);
assert(clampDayNum(0) === 1, 'day 0 clamps up to 1');
assert(clampDayNum(-5) === 1, 'negative days clamp to 1');
assert(clampDayNum(9999) === PROGRAMME_LENGTH_DAYS, 'overflow clamps to 189');
assert(clampDayNum('abc') === 1, 'garbage input falls back to day 1');

// ── 4. "Today" under the exact hours that used to break ─────────────────────
section('4. IST night-study window (00:00–05:30) reports the right day');
const istMorning = new Date('2026-09-13T00:30:00+05:30'); // 13 Sep, 00:30 IST
const istLateNight = new Date('2026-09-12T23:45:00+05:30'); // still 12 Sep IST
const dayForMorning = getTodayDayNum(DEFAULT_START_DATE, istMorning);
const dayForLateNight = getTodayDayNum(DEFAULT_START_DATE, istLateNight);
assert(dayForMorning === 15, `00:30 IST on 13 Sep should be Day 15, got ${dayForMorning}`);
assert(dayForLateNight === 14, `23:45 IST on 12 Sep should be Day 14, got ${dayForLateNight}`);
assert(dayForMorning - dayForLateNight === 1, 'a night crossing must advance exactly one day');

// The naive expression the views used to inline, for contrast.
assert(
  new Date(istMorning).toISOString().slice(0, 10) === '2026-09-12',
  'documented hazard: toISOString() stamps 00:30 IST as the previous UTC day'
);
assert(getTodayISODate(istMorning) === '2026-09-13', 'getTodayISODate must follow the IST calendar');
assert(getTodayISODate(istLateNight) === '2026-09-12', 'getTodayISODate must not round up');

// The same instant written from three different zones must give one answer:
// 00:30 IST == 19:00Z on 12 Sep == 15:00 New York. This is the property that
// broke when TodayView built the day from host-local components.
const sameInstant = ['2026-09-13T00:30:00+05:30', '2026-09-12T19:00:00Z', '2026-09-12T15:00:00-04:00'];
for (const text of sameInstant) {
  assert(
    getTodayDayNum(DEFAULT_START_DATE, new Date(text)) === dayForMorning,
    `instant written as ${text} must still be Day ${dayForMorning}`
  );
}

// ── 5. Day scoring and the strict streak ────────────────────────────────────
section('5. Shared day scoring + strict streak');
const dayOne = schedule.flatMap((w) => w.days)[0];
const tasksOf = (day) => day.subjects.flatMap((s, sIdx) => s.tasks.map((t) => `${sIdx}_${t}`));
const d1Keys = tasksOf(dayOne);
assert(d1Keys.length > 0, 'day 1 must have scheduled tasks');
const { total: t1, completed: c1 } = countDayProgress(schedule, 1, {});
assert(t1 === d1Keys.length && c1 === 0, `empty progress scored ${c1}/${t1}, expected 0/${d1Keys.length}`);

const fullProgress = {};
for (const k of d1Keys) fullProgress[`1_${k}`] = true;
const scored = countDayProgress(schedule, 1, fullProgress);
assert(scored.isDayComplete === true, 'a fully checked day must score as complete');
assert(calculateStreak(schedule, fullProgress, 1, 1) === 1, 'streak counts day 1 as complete');

const partial = {};
const halfKeys = tasksOf(dayOne);
for (const k of halfKeys.slice(0, 1)) partial[`1_${k}`] = true;
assert(
  countDayProgress(schedule, 1, partial).isDayComplete === false,
  'one task out of several must not cross the 80% line'
);

// Today is in progress (day 3, nothing done) — it must not break the run.
const upToTwo = {};
for (const day of schedule.flatMap((w) => w.days)) {
  if (day.dayNum > 2) continue;
  for (const k of tasksOf(day)) upToTwo[`${day.dayNum}_${k}`] = true;
}
assert(
  calculateStreak(schedule, upToTwo, 3, 3) === 2,
  `streak through an unfinished today should be 2, got ${calculateStreak(schedule, upToTwo, 3, 3)}`
);
// Day 2 missing stops the run before it ever reaches day 1, so the raw count
// is 0 — TodayView's Math.max(streak, 1) is a display floor, not the metric.
const onlyOne = {};
for (const k of d1Keys) onlyOne[`1_${k}`] = true;
assert(calculateStreak(schedule, onlyOne, 3, 3) === 0, 'a gap in the middle must stop the streak');

console.log(`\n${failures === 0 ? '✅' : '❌'} ${checks} assertions run, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
