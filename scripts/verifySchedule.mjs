/**
 * Schedule integrity checks for the 27-week / 189-day GATE CSE roadmap.
 *
 * Run with:  npm run verify:schedule
 *
 * These assertions exist because weeks 4–27 used to be produced by a
 * placeholder loop that stamped all 7 days of a week with the *same* lecture
 * range. The phase-wise generator in src/data/scheduleData.js must guarantee
 * that every single day carries a unique, strictly advancing lecture range.
 */
import {
  initialScheduleData as schedule,
  SCHEDULE_PHASES,
  TOTAL_DAYS,
  TOTAL_WEEKS,
  getPhaseForWeek
} from '../src/data/scheduleData.js';

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

const GENERATED_FIRST_DAY = 22; // Weeks 4–27 start at day 22
const SUB_LETTER_INDEX = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

/** Turns "Lecture 24A, 24B" / "Lecture 12 to 16" into a comparable [first, last] key pair. */
function parseLectureRange(label) {
  const body = String(label)
    .replace(/^(Lecture|Revision Slot)\s*[-–]?\s*/i, '')
    .trim();
  if (!body) return null;

  const keyOf = token => {
    const m = /^(\d+)([A-F])?$/.exec(token.trim());
    if (!m) return null;
    const letter = m[2] ? SUB_LETTER_INDEX[m[2]] : 0;
    return Number(m[1]) * 10 + letter;
  };

  const rangeForm = /^(\d+[A-F]?)\s+to\s+(\d+[A-F]?)$/i.exec(body);
  if (rangeForm) {
    const first = keyOf(rangeForm[1]);
    const last = keyOf(rangeForm[2]);
    return first !== null && last !== null ? { first, last } : null;
  }

  const tokens = body.split(',').map(t => t.trim()).filter(Boolean);
  const keys = tokens.map(keyOf);
  if (keys.some(k => k === null)) return null;
  return { first: keys[0], last: keys[keys.length - 1] };
}

// ── 1. Structure ────────────────────────────────────────────────────────────
section('1. Structure');
assert(schedule.length === TOTAL_WEEKS, `expected ${TOTAL_WEEKS} weeks, got ${schedule.length}`);
schedule.forEach((week, i) => {
  assert(week.weekNumber === i + 1, `week at index ${i} has weekNumber ${week.weekNumber}`);
  assert(Array.isArray(week.days) && week.days.length === 7, `week ${week.weekNumber} must have 7 days`);
  assert(typeof week.title === 'string' && week.title.length > 0, `week ${week.weekNumber} needs a title`);
  assert(week.startDateOffset === i * 7, `week ${week.weekNumber} startDateOffset should be ${i * 7}`);
  assert(week.endDateOffset === i * 7 + 6, `week ${week.weekNumber} endDateOffset should be ${i * 7 + 6}`);
  assert(week.phase === getPhaseForWeek(week.weekNumber).id, `week ${week.weekNumber} has the wrong phase id`);
  assert(typeof week.phaseName === 'string' && week.phaseName.length > 0, `week ${week.weekNumber} is missing phaseName`);
});

const allDays = schedule.flatMap(w => w.days);
assert(allDays.length === TOTAL_DAYS, `expected ${TOTAL_DAYS} days, got ${allDays.length}`);

// ── 2. Day numbering, dates and weekday alignment ───────────────────────────
section('2. Calendar alignment');
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
allDays.forEach((day, i) => {
  assert(day.dayNum === i + 1, `day at index ${i} has dayNum ${day.dayNum}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(day.date), `day ${day.dayNum} has a malformed date: ${day.date}`);
  assert(day.dayOfWeek === DAY_NAMES[i % 7], `day ${day.dayNum} weekday mismatch: ${day.dayOfWeek}`);
});

const start = new Date(`${allDays[0].date}T00:00:00`);
allDays.forEach((day, i) => {
  const expected = new Date(start);
  expected.setDate(expected.getDate() + i);
  const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`;
  assert(day.date === expectedStr, `day ${day.dayNum} date ${day.date} should be ${expectedStr} (no gaps/duplicates)`);
});
assert(allDays[0].date === '2026-08-30', `day 1 must be 2026-08-30, got ${allDays[0].date}`);

// Timezone safety: the ISO string must round-trip to the same local weekday.
allDays.forEach(day => {
  const local = new Date(`${day.date}T00:00:00`);
  assert(DAY_NAMES[local.getDay()] === day.dayOfWeek, `day ${day.dayNum} date/weekday disagree in local time`);
});

// ── 3. No placeholder content left behind ───────────────────────────────────
section('3. Placeholder sweep');
const PLACEHOLDER_PATTERNS = [
  /Module \d+$/,                    // "Module 14"
  /^Lecture \d+ to \d+$/i,          // "Lecture 1 to 4" (the old static stub)
  /Syllabus Module Phase/i,
  /TODO|placeholder|lorem/i
];
allDays.forEach(day => {
  day.subjects.forEach(sub => {
    PLACEHOLDER_PATTERNS.forEach(rx => {
      assert(!rx.test(sub.module || ''), `day ${day.dayNum} module "${sub.module}" looks like a placeholder`);
      assert(!rx.test(sub.lecture || ''), `day ${day.dayNum} lecture "${sub.lecture}" looks like a placeholder`);
    });
    assert(!!sub.name, `day ${day.dayNum} has a subject with no name`);
    assert(!!sub.module, `day ${day.dayNum} (${sub.name}) has no module`);
    // Weeks 1-3 are transcribed verbatim from the coaching sheets, which use
    // approximate durations ("~1 Hr", "1.0+ Hr"). Generated days must be exact.
    assert(
      /^~?\d+(\.\d+)?\+? Hr$/.test(sub.duration || ''),
      `day ${day.dayNum} (${sub.name}) has a bad duration: "${sub.duration}"`
    );
    if (day.dayNum >= GENERATED_FIRST_DAY) {
      assert(
        /^\d+(\.\d+)? Hr$/.test(sub.duration || ''),
        `generated day ${day.dayNum} (${sub.name}) must use an exact duration, got "${sub.duration}"`
      );
      const hours = parseFloat(sub.duration);
      assert(hours >= 0.75 && hours <= 3.5, `generated day ${day.dayNum} (${sub.name}) duration ${hours} is out of the 0.75-3.5 Hr band`);
    }
    assert(Array.isArray(sub.tasks) && sub.tasks.length > 0, `day ${day.dayNum} (${sub.name}) has no tasks`);
    assert(!!sub.lecture, `day ${day.dayNum} (${sub.name}) has no lecture`);
  });
  assert(day.subjects.length === 2, `day ${day.dayNum} should carry 2 subject tracks, got ${day.subjects.length}`);
});

const generatedWeeks = schedule.filter(w => w.weekNumber >= 4);
const weekTitles = schedule.map(w => w.title);
assert(new Set(weekTitles).size === weekTitles.length, 'every week title must be unique');
generatedWeeks.forEach(week => {
  const firstModuleSet = week.days[0].subjects.map(s => s.module).join('|');
  assert(week.title.includes(String(week.weekNumber)), `generated week ${week.weekNumber} title must state its week number`);
  assert(firstModuleSet.length > 0, `week ${week.weekNumber} lost its module metadata`);
});

// ── 4. The core invariant: no week repeats one lecture across its 7 days ────
section('4. Every day of every week is distinct');
schedule.forEach(week => {
  const payloads = week.days.map(day =>
    day.subjects.map(s => `${s.name}::${s.module}::${s.lecture}::${s.duration}`).join('||')
  );
  const unique = new Set(payloads);
  assert(unique.size === 7, `week ${week.weekNumber} repeats day payloads (${unique.size}/7 unique)`);
});

// ── 5. Unique, strictly progressive lecture ranges per subject ──────────────
section('5. Lecture progression');
const bySubject = new Map();
allDays.forEach(day => {
  day.subjects.forEach(sub => {
    if (!bySubject.has(sub.name)) bySubject.set(sub.name, []);
    bySubject.get(sub.name).push({ dayNum: day.dayNum, sub });
  });
});

bySubject.forEach((entries, subject) => {
  const generated = entries.filter(e => e.dayNum >= GENERATED_FIRST_DAY);
  const parsed = generated
    .map(e => ({ ...e, range: parseLectureRange(e.sub.lecture) }))
    .filter(e => e.range);

  assert(
    parsed.length === generated.length,
    `${subject}: ${generated.length - parsed.length} generated day(s) have an unparseable lecture range`
  );

  // No repeated range for the same subject across the generated stretch.
  const seen = new Set();
  parsed.forEach(e => {
    const sig = `${subject}::${e.sub.lecture}`;
    assert(!seen.has(sig), `${subject}: day ${e.dayNum} repeats lecture range "${e.sub.lecture}"`);
    seen.add(sig);
  });

  // Strictly advancing, day over day.
  for (let i = 1; i < parsed.length; i++) {
    const prev = parsed[i - 1];
    const curr = parsed[i];
    assert(
      curr.range.first > prev.range.last,
      `${subject}: day ${curr.dayNum} ("${curr.sub.lecture}") does not advance past day ${prev.dayNum} ("${prev.sub.lecture}")`
    );
  }

  // Hand-off from the hand-written Weeks 1–3 must also move forward.
  if (entries.some(e => e.dayNum < GENERATED_FIRST_DAY) && parsed.length) {
    const handwritten = entries
      .filter(e => e.dayNum < GENERATED_FIRST_DAY)
      .map(e => ({ ...e, range: parseLectureRange(e.sub.lecture) }))
      .filter(e => e.range);
    const lastHandwritten = handwritten[handwritten.length - 1];
    if (lastHandwritten) {
      assert(
        parsed[0].range.first > lastHandwritten.range.last,
        `${subject}: generated start "${parsed[0].sub.lecture}" (day ${parsed[0].dayNum}) must continue past week 1-3's "${lastHandwritten.sub.lecture}" (day ${lastHandwritten.dayNum})`
      );
    }
  }
});

// ── 6. Global uniqueness of (subject, module, lecture) across all 189 days ──
section('6. Global day-level uniqueness');
const globalSigs = new Map();
allDays.forEach(day => {
  day.subjects.forEach(sub => {
    const sig = `${sub.name}::${sub.module}::${sub.lecture}`;
    assert(!globalSigs.has(sig), `duplicate lecture entry "${sig}" on days ${globalSigs.get(sig)} and ${day.dayNum}`);
    globalSigs.set(sig, day.dayNum);
  });
});

const daySignatures = allDays.map(day => day.subjects.map(s => `${s.name}|${s.module}|${s.lecture}`).join('||'));
assert(
  new Set(daySignatures).size === TOTAL_DAYS,
  `expected ${TOTAL_DAYS} unique day signatures, got ${new Set(daySignatures).size}`
);

// ── 7. Phases cover the whole roadmap exactly once ──────────────────────────
section('7. Phase coverage');
let coveredWeeks = 0;
SCHEDULE_PHASES.forEach((phase, i) => {
  assert(phase.toWeek >= phase.fromWeek, `phase ${phase.id} has an inverted week range`);
  if (i > 0) {
    assert(phase.fromWeek === SCHEDULE_PHASES[i - 1].toWeek + 1, `phase ${phase.id} must start right after phase ${SCHEDULE_PHASES[i - 1].id}`);
  }
  coveredWeeks += phase.toWeek - phase.fromWeek + 1;
});
assert(SCHEDULE_PHASES[0].fromWeek === 1, 'phase coverage must start at week 1');
assert(coveredWeeks === TOTAL_WEEKS, `phases cover ${coveredWeeks} weeks, expected ${TOTAL_WEEKS}`);

// ── 8. Coverage summary ─────────────────────────────────────────────────────
section('8. Coverage summary');
SCHEDULE_PHASES.forEach(phase => {
  const weeks = schedule.filter(w => w.weekNumber >= phase.fromWeek && w.weekNumber <= phase.toWeek);
  const subjects = Array.from(new Set(weeks.flatMap(w => w.days.flatMap(d => d.subjects.map(s => s.name)))));
  console.log(`  Phase ${phase.id} · weeks ${String(phase.fromWeek).padStart(2)}-${String(phase.toWeek).padEnd(2)} · ${subjects.length} subjects · ${subjects.join(', ')}`);
});
console.log(`\n  Total lectures scheduled: ${globalSigs.size} unique subject/day entries across ${TOTAL_DAYS} days`);

console.log(`\n${failures === 0 ? '✅' : '❌'} ${checks} assertions run, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
