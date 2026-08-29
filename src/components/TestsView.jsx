import React, { useState } from 'react';
import { Plus, Trash2, Award, TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import { loadTests, saveTests } from '../utils/storage';

export default function TestsView() {
  const [tests, setTests] = useState(() => loadTests());
  const [name, setName] = useState('');
  const [testType, setTestType] = useState('Mock Test');
  const [subject, setSubject] = useState('Full Syllabus / Core');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('100');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const addTest = (e) => {
    e.preventDefault();
    if (!name.trim() || !score.trim()) return;

    const numScore = parseFloat(score);
    const numTotal = parseFloat(total) || 100;
    const pct = Math.round((numScore / numTotal) * 100);

    const newTest = {
      id: Date.now().toString(),
      name,
      testType,
      subject,
      score: numScore,
      total: numTotal,
      percentage: pct,
      date
    };

    const updated = [newTest, ...tests];
    setTests(updated);
    saveTests(updated);

    setName('');
    setScore('');
  };

  const deleteTest = (id) => {
    const updated = tests.filter(t => t.id !== id);
    setTests(updated);
    saveTests(updated);
  };

  const totalAttempted = tests.length;
  const avgPercentage = totalAttempted > 0 
    ? Math.round(tests.reduce((acc, t) => acc + t.percentage, 0) / totalAttempted)
    : 0;
  const bestScore = totalAttempted > 0 ? Math.max(...tests.map(t => t.percentage)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            MAAHI 💗 MOCK TEST COMMAND
          </span>
          <h2 className="text-3xl font-black mt-2 tracking-tight">Full-Length & Subject Tests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track your mock test scores, accuracy trends, and readiness for GATE 2028.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Tests Taken</p>
            <p className="text-xl font-black mt-1 text-slate-900 dark:text-slate-100">{totalAttempted}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Avg Score</p>
            <p className="text-xl font-black mt-1 text-indigo-600 dark:text-indigo-400">{avgPercentage}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Best Score</p>
            <p className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{bestScore}%</p>
          </div>
        </div>
      </div>

      {/* Add Test Form */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 mb-4">Record New Test Score</h3>
        <form onSubmit={addTest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test Name (e.g. Mock Test 1)"
            required
            className="lg:col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          >
            <option value="Mock Test">Mock Test</option>
            <option value="Subject Test">Subject Test</option>
            <option value="PYQ Test">PYQ Test</option>
          </select>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject / Scope"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Marks"
              required
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
            <input
              type="number"
              step="0.5"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Total"
              required
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Save Test</span>
          </button>
        </form>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 px-2">Test History</h3>
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(t => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {t.testType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{t.date}</span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-slate-100">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-bold">Scope: {t.subject}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{t.score} / {t.total}</p>
                    <p className="text-xs font-extrabold text-slate-400">{t.percentage}%</p>
                  </div>
                  <button
                    onClick={() => deleteTest(t.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 text-sm font-bold">No mock or subject tests recorded yet. Record your test scores above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
