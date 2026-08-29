import React, { useState } from 'react';
import { Plus, Trash2, Award, TrendingUp, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans text-white">
      {/* Header & Stats Banner */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
            ✨ MAAHI 💗 MOCK TEST COMMAND
          </span>
          <h2 className="text-3xl font-black mt-3 tracking-tight text-white">Full-Length & Subject Tests</h2>
          <p className="text-sm text-pink-200/70 mt-1 font-medium">
            Track your mock test scores, accuracy trends, and readiness for GATE 2028.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-pink-500/20 text-center shadow-inner">
            <p className="text-[10px] font-black uppercase text-pink-300">Tests Taken</p>
            <p className="text-xl font-black mt-1 text-white">{totalAttempted}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-pink-500/20 text-center shadow-inner">
            <p className="text-[10px] font-black uppercase text-pink-300">Avg Score</p>
            <p className="text-xl font-black mt-1 text-pink-400">{avgPercentage}%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-pink-500/20 text-center shadow-inner">
            <p className="text-[10px] font-black uppercase text-pink-300">Best Score</p>
            <p className="text-xl font-black mt-1 text-emerald-400">{bestScore}%</p>
          </div>
        </div>
      </div>

      {/* Add Test Form */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="font-black text-lg text-white mb-4">Record New Test Score</h3>
        <form onSubmit={addTest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test Name (e.g. Mock Test 1)"
            required
            className="lg:col-span-2 bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
          />
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="bg-[#120720] border border-pink-500/25 rounded-2xl px-3 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
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
            className="bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Marks"
              required
              className="w-1/2 bg-white/5 border border-pink-500/25 rounded-2xl px-3 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
            />
            <input
              type="number"
              step="0.5"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Total"
              required
              className="w-1/2 bg-white/5 border border-pink-500/25 rounded-2xl px-3 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Save Test</span>
          </button>
        </form>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-white px-2">Test History</h3>
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map(t => (
              <div
                key={t.id}
                className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all hover:border-pink-500/40"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded border border-pink-500/30">
                      {t.testType}
                    </span>
                    <span className="text-xs text-pink-200/60 font-medium">{t.date}</span>
                  </div>
                  <h4 className="font-black text-base text-white">{t.name}</h4>
                  <p className="text-xs text-pink-200/70 font-bold">Scope: {t.subject}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-pink-400">{t.score} / {t.total}</p>
                    <p className="text-xs font-extrabold text-pink-200/60">{t.percentage}%</p>
                  </div>
                  <button
                    onClick={() => deleteTest(t.id)}
                    className="p-2.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-12 text-center border border-pink-500/20 shadow-sm">
            <p className="text-pink-200/70 text-sm font-bold">No mock or subject tests recorded yet. Record your test scores above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
