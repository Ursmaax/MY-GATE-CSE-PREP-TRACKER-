/**
 * Render smoke test for the Archive module.
 *
 * Run with:  npm run smoke:archive
 *
 * Bundles src/components/ArchiveView.jsx with esbuild (already present via
 * Vite) and server-renders it against a stubbed localStorage, so we can assert
 * that quizzes + tests really do merge, group by date, filter and expose both
 * export actions — without needing a browser.
 */
import { build } from 'esbuild';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The scratch entry must live inside the project so esbuild can resolve
// react / react-dom from the repo's node_modules. node_modules is gitignored.
const cacheRoot = path.join(root, 'node_modules', '.cache');
mkdirSync(cacheRoot, { recursive: true });
const workDir = mkdtempSync(path.join(cacheRoot, 'archive-smoke-'));

const SEED = {
  quizzes: [
    { id: 'q1', name: 'Tree Traversal Quiz', subject: 'Data Structures', topic: 'BST Traversals', score: 8, total: 10, percentage: 80, date: '2026-09-10' },
    { id: 'q2', name: 'Propositional Logic Quiz', subject: 'Discrete Mathematics', topic: 'Normal Forms', score: 6.5, total: 10, percentage: 65, date: '2026-09-12' },
    { id: 'q3', name: 'Linear Algebra Drill', subject: 'Engineering Mathematics', topic: 'Eigenvalues', score: 9, total: 10, percentage: 90, date: '2026-09-12' }
  ],
  tests: [
    { id: 't1', name: 'Mock Test 1', testType: 'Mock Test', subject: 'Full Syllabus / Core', score: 42, total: 100, percentage: 42, date: '2026-09-11' },
    { id: 't2', name: 'PYQ 2024 Paper', testType: 'PYQ Test', subject: 'Full Syllabus / Core', score: 57, total: 100, percentage: 57, date: '2026-09-12' },
    { id: 't3', name: 'Digital Logic Subject Test', testType: 'Subject Test', subject: 'Digital Logic', score: 18, total: 25, percentage: 72, date: '2026-09-09' },
    // No date + free-text subject: the archive must stay robust and still show it.
    { id: 't4', name: 'Legacy Untracked Test', testType: 'Mock Test', subject: 'Custom Notes Subject', score: 30, total: 60, percentage: 50 }
  ]
};

const ALL_RECORDS = [...SEED.quizzes, ...SEED.tests];

const stubPath = path.join(workDir, 'stub.mjs');
writeFileSync(stubPath, `
const seed = ${JSON.stringify(SEED)};

const store = new Map([
  ['gate2028_quizzes_v1', JSON.stringify(seed.quizzes)],
  ['gate2028_tests_v1', JSON.stringify(seed.tests)]
]);

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    confirm: () => false
  };
}

export function clearArchive() {
  store.delete('gate2028_quizzes_v1');
  store.delete('gate2028_tests_v1');
}

export function restoreArchive() {
  store.set('gate2028_quizzes_v1', JSON.stringify(seed.quizzes));
  store.set('gate2028_tests_v1', JSON.stringify(seed.tests));
}
`);

const entryPath = path.join(workDir, 'entry.jsx');
writeFileSync(entryPath, `
import { clearArchive, restoreArchive } from './stub.mjs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ArchiveView from ${JSON.stringify(path.join(root, 'src/components/ArchiveView.jsx'))};

export function renderArchive() {
  return renderToStaticMarkup(React.createElement(ArchiveView, { setActiveTab: () => {} }));
}

export { clearArchive, restoreArchive };
export { buildArchiveCsv, buildArchiveJson, csvEscape } from ${JSON.stringify(path.join(root, 'src/components/ArchiveView.jsx'))};
`);

const outfile = path.join(workDir, 'bundle.mjs');

let failures = 0;
let checks = 0;
function assert(condition, message) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  ✗ ${message}`);
  }
}

try {
  await build({
    absWorkingDir: root,
    entryPoints: [entryPath],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    // Only our own source is bundled; react / react-dom / lucide-react stay
    // external so Node loads their CJS builds natively at runtime.
    packages: 'external',
    jsx: 'automatic',
    target: 'node18',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent'
  });

  const mod = await import(pathToFileURL(outfile).href);

  console.log('\n1. Populated archive renders');
  const html = mod.renderArchive();
  assert(html.length > 2000, 'rendered markup looks suspiciously small');
  assert(html.includes('Unified Quiz &amp; Test Archive'), 'archive heading is missing');
  assert(html.includes('ARCHIVE VAULT'), 'archive badge is missing');

  ALL_RECORDS.forEach((record) => {
    assert(html.includes(record.name), `record "${record.name}" was not merged into the archive`);
  });

  console.log('\n2. Grouped by date (newest first)');
  const expectedOrder = [
    'September 12, 2026',
    'September 11, 2026',
    'September 10, 2026',
    'September 9, 2026',
    'Undated entries'
  ];
  let lastIndex = -1;
  expectedOrder.forEach((label) => {
    const index = html.indexOf(label);
    assert(index !== -1, `date group "${label}" is missing`);
    assert(index > lastIndex, `date group "${label}" is out of order`);
    lastIndex = index;
  });
  // The 12 Sep group must hold quizzes and tests side by side.
  const sept12 = html.slice(html.indexOf('September 12, 2026'), html.indexOf('September 11, 2026'));
  assert(sept12.includes('Propositional Logic Quiz') && sept12.includes('PYQ 2024 Paper'),
    'quizzes and tests are not merged inside the same date group');
  assert(sept12.includes('3 records'), 'the 12 Sep group should report 3 records');
  assert(sept12.includes('Avg 71%'), 'the 12 Sep group average should be 71%');

  console.log('\n3. Types & subjects survive the merge');
  ['Self Quiz', 'Mock Test', 'PYQ Test', 'Subject Test'].forEach((type) => {
    assert(html.includes(type), `type "${type}" is missing`);
  });
  ['Data Structures', 'Discrete Mathematics', 'Digital Logic', 'Custom Notes Subject'].forEach((subject) => {
    assert(html.includes(subject), `subject "${subject}" is missing from the archive`);
  });
  assert(html.includes('Topic: Normal Forms'), 'quiz topics should be surfaced');

  console.log('\n4. Stats, filters and export actions');
  assert(html.includes('Export JSON'), 'JSON export button is missing');
  assert(html.includes('Export CSV'), 'CSV export button is missing');
  assert(html.includes('All types'), 'type filter control is missing');
  assert(html.includes('All subjects'), 'subject filter control is missing');
  assert(html.includes('All records'), 'source pill row is missing');
  assert(html.includes('Newest first'), 'sort control is missing');
  assert(html.includes('Search name, subject, topic, type or date'), 'search control is missing');
  assert(html.includes('>7<'), 'expected 7 archived records in the stats banner');
  assert(html.includes('>5<'), 'expected 5 date groups reported');
  assert(html.includes('Avg Score'), 'average stat tile is missing');
  assert(html.includes('>65%<'), 'overall average should be 65% for the seeded data');
  assert(html.includes('>90%<'), 'overall best should be 90% for the seeded data');
  assert(html.includes('Spanning 4 days'), 'date span should cover 9-12 Sep (4 days)');

  console.log('\n5. Empty state');
  mod.clearArchive();
  const emptyHtml = mod.renderArchive();
  assert(emptyHtml.includes('The archive vault is empty'), 'empty-state heading is missing');
  assert(emptyHtml.includes('Record a Quiz'), 'empty state should link back to the Quizzes tab');
  assert(emptyHtml.includes('Record a Test'), 'empty state should link back to the Tests tab');
  assert(!emptyHtml.includes('Mock Test 1'), 'empty state must not list stale records');

  mod.restoreArchive();
  const restoredHtml = mod.renderArchive();
  assert(restoredHtml.includes('Mock Test 1'), 'archive should repopulate once records are back');

  console.log('\n6. Export payload formats');
  const exportGroups = [
    {
      date: '2026-09-12',
      avg: 71,
      best: 90,
      items: [
        { date: '2026-09-12', sourceLabel: 'Test', type: 'Mock Test', name: 'Mock, "Alpha" Edition', subject: 'Full Syllabus / Core', topic: '', score: 42, total: 100, percentage: 42 },
        { date: '2026-09-12', sourceLabel: 'Quiz', type: 'Self Quiz', name: 'Line\nBreak Quiz', subject: 'Data Structures', topic: 'Heaps, Trees', score: 8, total: 10, percentage: 80 }
      ]
    }
  ];
  const exportStats = { total: 2, quizCount: 1, testCount: 1, avg: 61, best: 80, spanDays: 1, firstDate: '2026-09-12', lastDate: '2026-09-12' };

  const csv = mod.buildArchiveCsv(exportGroups);
  const csvLines = csv.replace(/^\uFEFF/, '').split('\r\n');
  assert(csv.charCodeAt(0) === 0xFEFF, 'CSV must start with a UTF-8 BOM for Excel');
  assert(csvLines.length === 3, `CSV should have a header + 2 rows, got ${csvLines.length} lines`);
  assert(csvLines[0] === 'Date,Source,Type,Name,Subject,Topic,Score,Total,Percentage', `unexpected CSV header: ${csvLines[0]}`);
  assert(csvLines[1] === '2026-09-12,Test,Mock Test,"Mock, ""Alpha"" Edition",Full Syllabus / Core,,42,100,42', `commas/quotes not escaped: ${csvLines[1]}`);
  assert(csvLines[2] === '2026-09-12,Quiz,Self Quiz,"Line\nBreak Quiz",Data Structures,"Heaps, Trees",8,10,80', `newlines/commas not escaped: ${csvLines[2]}`);
  assert(mod.csvEscape('plain') === 'plain', 'csvEscape should leave plain values untouched');
  assert(mod.csvEscape(null) === '' && mod.csvEscape(undefined) === '', 'csvEscape should render null/undefined as empty');

  const payload = mod.buildArchiveJson({
    groups: exportGroups,
    stats: exportStats,
    filters: { query: 'alpha', sourceFilter: 'test', typeFilter: 'all', subjectFilter: 'all', sortMode: 'date-desc' },
    exportedAt: '2026-09-13T00:00:00.000Z'
  });
  assert(payload.exportedAt === '2026-09-13T00:00:00.000Z', 'JSON export must stamp its generation time');
  assert(payload.summary.totalRecords === 2 && payload.summary.quizzes === 1 && payload.summary.tests === 1, 'JSON summary counts are wrong');
  assert(payload.summary.averagePercentage === 61 && payload.summary.bestPercentage === 80, 'JSON summary scores are wrong');
  assert(payload.appliedFilters.search === 'alpha' && payload.appliedFilters.source === 'test', 'JSON export must echo the applied filters');
  assert(payload.appliedFilters.type === null && payload.appliedFilters.subject === null, '"all" filters should serialise as null');
  assert(payload.groups.length === 1 && payload.groups[0].recordCount === 2, 'JSON groups must mirror the on-screen grouping');
  assert(payload.groups[0].records[0].name === 'Mock, "Alpha" Edition', 'JSON record names must not be mangled');
  assert(payload.groups[0].records[0].topic === null, 'empty topics should serialise as null');
  assert(JSON.parse(JSON.stringify(payload)).summary.totalRecords === 2, 'JSON payload must be fully serialisable');
} catch (error) {
  failures++;
  console.error(`\n  ✗ Smoke test crashed: ${error && error.message ? error.message : error}`);
  if (error && error.stack) console.error(error.stack.split('\n').slice(0, 8).join('\n'));
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`\n${failures === 0 ? '✅' : '❌'} ${checks} assertions run, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
