import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  Award,
  CalendarDays,
  Download,
  FileJson,
  FileSpreadsheet,
  Filter,
  Inbox,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import { loadQuizzes, saveQuizzes, loadTests, saveTests } from '../utils/storage';
import { GATE_SUBJECTS } from '../data/subjects';

// Self-assessment quizzes have no `testType` of their own, so the archive
// gives them one label to keep every record filterable by a single dimension.
const QUIZ_TYPE = 'Self Quiz';

const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Newest first' },
  { id: 'date-asc', label: 'Oldest first' },
  { id: 'score-desc', label: 'Highest score' },
  { id: 'score-asc', label: 'Lowest score' },
  { id: 'name-asc', label: 'Name (A–Z)' }
];

/* ───────────────────────── helpers ───────────────────────── */

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeDate(raw) {
  // Records are stored as ISO `YYYY-MM-DD`; tolerate missing/garbage values so
  // one bad entry can never hide the rest of the archive.
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return 'Undated';
}

function percentageOf(record) {
  const total = toNumber(record.total, 0);
  if (toNumber(record.percentage, null) !== null && total === 0) return toNumber(record.percentage);
  if (total > 0) return Math.round((toNumber(record.score) / total) * 100);
  return toNumber(record.percentage);
}

function readableDate(isoDate) {
  if (isoDate === 'Undated') return 'Undated entries';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function relativeDate(isoDate) {
  if (isoDate === 'Undated') return '';
  const today = new Date();
  const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const diffDays = Math.round((midnightToday - target) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1) return `${diffDays} days ago`;
  return `in ${Math.abs(diffDays)} days`;
}

function scoreTone(pct) {
  if (pct >= 80) return { text: 'text-emerald-300', bar: 'from-emerald-500 to-teal-400', chip: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
  if (pct >= 60) return { text: 'text-amber-300', bar: 'from-amber-500 to-yellow-400', chip: 'bg-amber-500/20 text-amber-200 border-amber-500/30' };
  if (pct >= 40) return { text: 'text-orange-300', bar: 'from-orange-500 to-amber-400', chip: 'bg-orange-500/20 text-orange-200 border-orange-500/30' };
  return { text: 'text-rose-300', bar: 'from-rose-500 to-pink-400', chip: 'bg-rose-500/20 text-rose-200 border-rose-500/30' };
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function csvEscape(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export const CSV_COLUMNS = [
  { key: 'date', header: 'Date' },
  { key: 'sourceLabel', header: 'Source' },
  { key: 'type', header: 'Type' },
  { key: 'name', header: 'Name' },
  { key: 'subject', header: 'Subject' },
  { key: 'topic', header: 'Topic' },
  { key: 'score', header: 'Score' },
  { key: 'total', header: 'Total' },
  { key: 'percentage', header: 'Percentage' }
];

/** Builds the JSON export document for the records currently on screen. */
export function buildArchiveJson({ groups, stats, filters, exportedAt }) {
  return {
    exportedAt,
    source: 'GATE 2028 Dreamland Command Center — Unified Archive',
    appliedFilters: {
      search: filters.query || null,
      source: filters.sourceFilter,
      type: filters.typeFilter === 'all' ? null : filters.typeFilter,
      subject: filters.subjectFilter === 'all' ? null : filters.subjectFilter,
      sort: filters.sortMode
    },
    summary: {
      totalRecords: stats.total,
      quizzes: stats.quizCount,
      tests: stats.testCount,
      averagePercentage: stats.avg,
      bestPercentage: stats.best,
      dateFrom: stats.firstDate,
      dateTo: stats.lastDate,
      spanDays: stats.spanDays
    },
    groups: groups.map((group) => ({
      date: group.date,
      recordCount: group.items.length,
      averagePercentage: group.avg,
      records: group.items.map((r) => ({
        date: r.date,
        source: r.sourceLabel,
        type: r.type,
        name: r.name,
        subject: r.subject,
        topic: r.topic || null,
        score: r.score,
        total: r.total,
        percentage: r.percentage
      }))
    }))
  };
}

/** Builds an Excel-friendly CSV (BOM + CRLF) for the records on screen. */
export function buildArchiveCsv(groups) {
  const lines = [
    CSV_COLUMNS.map((c) => csvEscape(c.header)).join(','),
    ...groups.flatMap((group) => group.items).map((r) => CSV_COLUMNS.map((c) => csvEscape(r[c.key])).join(','))
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

/* ───────────────────────── component ───────────────────────── */

export default function ArchiveView({ setActiveTab }) {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes());
  const [tests, setTests] = useState(() => loadTests());
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // all | quiz | test
  const [typeFilter, setTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortMode, setSortMode] = useState('date-desc');
  const [exportFlash, setExportFlash] = useState('');

  // Keep the archive in sync when another browser tab writes to localStorage.
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key || e.key.startsWith('gate2028_')) {
        setQuizzes(loadQuizzes());
        setTests(loadTests());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!exportFlash) return undefined;
    const timer = setTimeout(() => setExportFlash(''), 2600);
    return () => clearTimeout(timer);
  }, [exportFlash]);

  // One flat, normalised list holding every saved quiz and every saved test.
  const records = useMemo(() => {
    const fromQuizzes = quizzes.map((q) => ({
      key: `quiz_${q.id}`,
      source: 'quiz',
      sourceLabel: 'Quiz',
      id: q.id,
      name: q.name || 'Untitled quiz',
      type: QUIZ_TYPE,
      subject: q.subject || 'Unspecified',
      topic: q.topic || '',
      score: toNumber(q.score),
      total: toNumber(q.total, 10),
      percentage: percentageOf(q),
      date: safeDate(q.date)
    }));

    const fromTests = tests.map((t) => ({
      key: `test_${t.id}`,
      source: 'test',
      sourceLabel: 'Test',
      id: t.id,
      name: t.name || 'Untitled test',
      type: t.testType || 'Mock Test',
      subject: t.subject || 'Full Syllabus / Core',
      topic: '',
      score: toNumber(t.score),
      total: toNumber(t.total, 100),
      percentage: percentageOf(t),
      date: safeDate(t.date)
    }));

    return [...fromQuizzes, ...fromTests];
  }, [quizzes, tests]);

  // Filter option lists are derived from what actually exists in the archive,
  // so a subject/type that was typed free-form in Tests still shows up.
  const typeOptions = useMemo(() => {
    const counts = new Map();
    records.forEach((r) => counts.set(r.type, (counts.get(r.type) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [records]);

  const subjectOptions = useMemo(() => {
    const counts = new Map();
    records.forEach((r) => counts.set(r.subject, (counts.get(r.subject) || 0) + 1));
    // Known GATE subjects first (canonical order), then any free-text extras.
    const known = GATE_SUBJECTS.filter((s) => counts.has(s));
    const extra = Array.from(counts.keys())
      .filter((s) => !GATE_SUBJECTS.includes(s))
      .sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
    return [...known, ...extra].map((s) => ({ name: s, count: counts.get(s) }));
  }, [records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (subjectFilter !== 'all' && r.subject !== subjectFilter) return false;
      if (!q) return true;
      return [r.name, r.subject, r.topic, r.type, r.date, r.sourceLabel, `${r.score}/${r.total}`]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [records, query, sourceFilter, typeFilter, subjectFilter]);

  const stats = useMemo(() => {
    const list = filtered;
    const total = list.length;
    const quizCount = list.filter((r) => r.source === 'quiz').length;
    const testCount = total - quizCount;
    const avg = total ? Math.round(list.reduce((acc, r) => acc + r.percentage, 0) / total) : 0;
    const best = total ? Math.max(...list.map((r) => r.percentage)) : 0;
    const dated = list.map((r) => r.date).filter((d) => d !== 'Undated').sort();
    const spanDays = dated.length > 1
      ? Math.round((new Date(`${dated[dated.length - 1]}T00:00:00`) - new Date(`${dated[0]}T00:00:00`)) / 86400000) + 1
      : dated.length;
    return {
      total,
      quizCount,
      testCount,
      avg,
      best,
      spanDays,
      firstDate: dated[0] || null,
      lastDate: dated[dated.length - 1] || null
    };
  }, [filtered]);

  // Grouped by date — the archive's primary reading order.
  const groups = useMemo(() => {
    const ascending = sortMode === 'date-asc';
    const map = new Map();
    filtered.forEach((r) => {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date).push(r);
    });

    const sortedDates = Array.from(map.keys()).sort((a, b) => {
      if (a === 'Undated') return 1;
      if (b === 'Undated') return -1;
      return ascending ? a.localeCompare(b) : b.localeCompare(a);
    });

    return sortedDates.map((date) => {
      const items = [...map.get(date)].sort((a, b) => {
        if (sortMode === 'score-desc') return b.percentage - a.percentage || a.name.localeCompare(b.name);
        if (sortMode === 'score-asc') return a.percentage - b.percentage || a.name.localeCompare(b.name);
        if (sortMode === 'name-asc') return a.name.localeCompare(b.name);
        return b.percentage - a.percentage || a.name.localeCompare(b.name);
      });
      const dayAvg = Math.round(items.reduce((acc, r) => acc + r.percentage, 0) / items.length);
      return {
        date,
        items,
        avg: dayAvg,
        best: Math.max(...items.map((r) => r.percentage)),
        quizzes: items.filter((r) => r.source === 'quiz').length,
        tests: items.filter((r) => r.source === 'test').length
      };
    });
  }, [filtered, sortMode]);

  const hasFilters = query.trim() !== '' || sourceFilter !== 'all' || typeFilter !== 'all' || subjectFilter !== 'all';

  const resetFilters = () => {
    setQuery('');
    setSourceFilter('all');
    setTypeFilter('all');
    setSubjectFilter('all');
  };

  const removeRecord = (record) => {
    const ok = window.confirm(
      `Remove "${record.name}" (${record.date}) from the archive?\nThis permanently deletes the saved ${record.sourceLabel.toLowerCase()} record.`
    );
    if (!ok) return;
    if (record.source === 'quiz') {
      const updated = quizzes.filter((q) => q.id !== record.id);
      setQuizzes(updated);
      saveQuizzes(updated);
    } else {
      const updated = tests.filter((t) => t.id !== record.id);
      setTests(updated);
      saveTests(updated);
    }
  };

  const exportStamp = new Date().toISOString().split('T')[0];

  // Both exports always write exactly what is currently on screen, so a filtered
  // view exports only the filtered slice.
  const exportJSON = () => {
    if (!filtered.length) return;
    const payload = buildArchiveJson({
      groups,
      stats,
      filters: { query: query.trim(), sourceFilter, typeFilter, subjectFilter, sortMode },
      exportedAt: new Date().toISOString()
    });
    downloadFile(JSON.stringify(payload, null, 2), `GATE_2028_Archive_${exportStamp}.json`, 'application/json');
    setExportFlash(`Exported ${stats.total} record${stats.total === 1 ? '' : 's'} as JSON`);
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const rowCount = groups.reduce((acc, g) => acc + g.items.length, 0);
    downloadFile(buildArchiveCsv(groups), `GATE_2028_Archive_${exportStamp}.csv`, 'text/csv;charset=utf-8;');
    setExportFlash(`Exported ${rowCount} row${rowCount === 1 ? '' : 's'} as CSV`);
  };

  const sourcePills = [
    { id: 'all', label: 'All records', count: records.length, icon: Layers },
    { id: 'quiz', label: 'Quizzes', count: records.filter((r) => r.source === 'quiz').length, icon: Award },
    { id: 'test', label: 'Tests', count: records.filter((r) => r.source === 'test').length, icon: Target }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans text-white">
      {/* Header & Stats Banner */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30 inline-flex items-center space-x-1.5">
            <Archive className="w-3.5 h-3.5" />
            <span>✨ MAAHI 💗 ARCHIVE VAULT</span>
          </span>
          <h2 className="text-3xl font-black mt-3 tracking-tight text-white">Unified Quiz &amp; Test Archive</h2>
          <p className="text-sm text-pink-200/70 mt-1 font-medium max-w-2xl">
            Every self-assessment quiz and every mock / subject / PYQ test in one chronological vault —
            searchable, filterable and exportable.
          </p>
          {stats.firstDate && (
            <p className="text-xs text-pink-300/60 font-bold mt-3 flex items-center space-x-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>
                Spanning {stats.spanDays} day{stats.spanDays === 1 ? '' : 's'} · {stats.firstDate} → {stats.lastDate}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {[
            { label: 'Archived', value: stats.total, tone: 'text-white' },
            { label: 'Quizzes', value: stats.quizCount, tone: 'text-pink-400' },
            { label: 'Avg Score', value: `${stats.avg}%`, tone: 'text-indigo-300' },
            { label: 'Best Score', value: `${stats.best}%`, tone: 'text-emerald-400' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-pink-500/20 text-center shadow-inner min-w-[92px]">
              <p className="text-[10px] font-black uppercase text-pink-300">{stat.label}</p>
              <p className={`text-xl font-black mt-1 ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {records.length === 0 ? (
        /* Nothing saved yet — point back at the source tabs */
        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-12 text-center border border-pink-500/20 shadow-sm space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
            <Inbox className="w-7 h-7 text-pink-300" />
          </div>
          <div>
            <h3 className="font-black text-xl text-white">The archive vault is empty</h3>
            <p className="text-pink-200/70 text-sm font-bold mt-2 max-w-md mx-auto">
              Save a quiz score or a mock test result and it will automatically land here, grouped by date
              and ready to export.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {setActiveTab && (
              <>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/30 flex items-center space-x-2 transition-all transform hover:scale-105"
                >
                  <Award className="w-4 h-4" />
                  <span>Record a Quiz</span>
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="bg-white/10 hover:bg-white/20 text-white font-black px-6 py-3 rounded-2xl text-sm border border-pink-500/30 flex items-center space-x-2 transition-all"
                >
                  <Target className="w-4 h-4" />
                  <span>Record a Test</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-5 sm:p-7 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-5">
            {/* Source pills */}
            <div className="flex flex-wrap gap-2.5">
              {sourcePills.map((pill) => {
                const Icon = pill.icon;
                const active = sourceFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSourceFilter(pill.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                      active
                        ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white border-pink-400/40 shadow-[0_0_20px_rgba(236,72,153,0.45)]'
                        : 'bg-white/5 text-pink-100/70 border-pink-500/20 hover:text-white hover:bg-pink-500/15'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-white/25' : 'bg-pink-500/20'}`}>{pill.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search + selects + export */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-pink-300/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, subject, topic, type or date…"
                  className="w-full bg-white/5 border border-pink-500/25 rounded-2xl pl-11 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    title="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-pink-300/70 hover:text-white hover:bg-pink-500/25"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-3 relative">
                <Filter className="w-4 h-4 text-pink-300/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter by type"
                  className="w-full appearance-none bg-[#120720] border border-pink-500/25 rounded-2xl pl-11 pr-9 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                >
                  <option value="all">All types</option>
                  {typeOptions.map(([type, count]) => (
                    <option key={type} value={type}>{type} ({count})</option>
                  ))}
                </select>
                <Sparkles className="w-3.5 h-3.5 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="lg:col-span-3 relative">
                <Layers className="w-4 h-4 text-pink-300/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  aria-label="Filter by subject"
                  className="w-full appearance-none bg-[#120720] border border-pink-500/25 rounded-2xl pl-11 pr-9 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                >
                  <option value="all">All subjects</option>
                  {subjectOptions.map((opt) => (
                    <option key={opt.name} value={opt.name}>{opt.name} ({opt.count})</option>
                  ))}
                </select>
                <Sparkles className="w-3.5 h-3.5 text-pink-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="lg:col-span-2 relative">
                <ArrowUpDown className="w-4 h-4 text-pink-300/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  aria-label="Sort archive"
                  className="w-full appearance-none bg-[#120720] border border-pink-500/25 rounded-2xl pl-11 pr-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result meta + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-pink-500/15">
              <p className="text-xs font-bold text-pink-200/70">
                Showing <span className="text-white font-black">{filtered.length}</span> of{' '}
                <span className="text-white font-black">{records.length}</span> archived record
                {records.length === 1 ? '' : 's'} across{' '}
                <span className="text-white font-black">{groups.length}</span> date
                {groups.length === 1 ? '' : 's'}
                {hasFilters && <span className="text-pink-300"> · filtered</span>}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-white/5 hover:bg-rose-500/20 text-pink-100/80 hover:text-white border border-pink-500/25 hover:border-rose-500/40 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={exportJSON}
                  disabled={!filtered.length}
                  title="Download the current view as JSON"
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-white/5 hover:bg-pink-500/25 text-pink-100 border border-pink-500/25 hover:border-pink-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={exportCSV}
                  disabled={!filtered.length}
                  title="Download the current view as CSV (Excel-ready)"
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-pink-500/30 transition-all transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {exportFlash && (
              <p className="text-xs font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center space-x-2 animate-fadeIn">
                <Download className="w-3.5 h-3.5" />
                <span>{exportFlash}</span>
              </p>
            )}
          </div>

          {/* Grouped archive */}
          {groups.length === 0 ? (
            <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-12 text-center border border-pink-500/20 space-y-4">
              <Search className="w-8 h-8 text-pink-300/60 mx-auto" />
              <p className="text-pink-200/70 text-sm font-bold">No archived record matches those filters.</p>
              <button
                onClick={resetFilters}
                className="mx-auto flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-lg shadow-pink-500/25"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear all filters</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section
                  key={group.date}
                  className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* Date group header */}
                  <header className="px-5 sm:px-7 py-4 border-b border-pink-500/20 bg-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500/30 to-indigo-500/30 border border-pink-500/40 flex items-center justify-center">
                        <CalendarDays className="w-4.5 h-4.5 text-pink-200" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-black text-base sm:text-lg text-white tracking-tight truncate">
                          {readableDate(group.date)}
                        </h3>
                        <p className="text-[11px] font-bold text-pink-200/60">
                          {group.date !== 'Undated' && <span className="mr-2 text-pink-300">{relativeDate(group.date)}</span>}
                          {group.items.length} record{group.items.length === 1 ? '' : 's'}
                          {group.quizzes > 0 && ` · ${group.quizzes} quiz${group.quizzes === 1 ? '' : 'zes'}`}
                          {group.tests > 0 && ` · ${group.tests} test${group.tests === 1 ? '' : 's'}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black uppercase text-pink-300 bg-pink-500/15 border border-pink-500/25 px-3 py-1.5 rounded-xl">
                        Avg {group.avg}%
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                        Best {group.best}%
                      </span>
                    </div>
                  </header>

                  {/* Records */}
                  <ul className="divide-y divide-pink-500/10">
                    {group.items.map((record) => {
                      const tone = scoreTone(record.percentage);
                      const isQuiz = record.source === 'quiz';
                      return (
                        <li
                          key={record.key}
                          className="px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-pink-500/5"
                        >
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border inline-flex items-center space-x-1 ${
                                  isQuiz
                                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                    : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
                                }`}
                              >
                                {isQuiz ? <Award className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                                <span>{record.type}</span>
                              </span>
                              <span className="text-[10px] font-black uppercase bg-white/5 text-pink-100/80 px-2.5 py-0.5 rounded border border-white/10">
                                {record.subject}
                              </span>
                              {record.topic && (
                                <span className="text-[10px] font-bold text-pink-200/50 uppercase tracking-wide">
                                  Topic: {record.topic}
                                </span>
                              )}
                            </div>
                            <h4 className="font-black text-sm sm:text-base text-white truncate">{record.name}</h4>
                            <div className="w-full max-w-xs bg-white/10 h-1.5 rounded-full overflow-hidden border border-pink-500/15">
                              <div
                                className={`bg-gradient-to-r ${tone.bar} h-full rounded-full transition-all duration-700`}
                                style={{ width: `${Math.min(100, Math.max(0, record.percentage))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-right">
                              <p className={`text-base font-black ${tone.text}`}>
                                {record.score} / {record.total}
                              </p>
                              <p className="text-[11px] font-extrabold text-pink-200/60">{record.percentage}%</p>
                            </div>
                            <button
                              onClick={() => removeRecord(record)}
                              title={`Delete this ${record.sourceLabel.toLowerCase()}`}
                              className="p-2.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

              <p className="text-center text-[11px] font-bold text-pink-200/40 pt-2 flex items-center justify-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  Archive reads live from local storage — records saved in the Quizzes and Tests tabs appear here instantly.
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
