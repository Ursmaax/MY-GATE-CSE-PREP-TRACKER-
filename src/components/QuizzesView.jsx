import React, { useState } from 'react';
import { Plus, Trash2, Award, TrendingUp, CheckCircle2, Calendar, Target, BookOpen, Sparkles } from 'lucide-react';
import { loadQuizzes, saveQuizzes } from '../utils/storage';

export default function QuizzesView() {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes());
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Data Structures');
  const [topic, setTopic] = useState('');
  const [score, setScore] = useState('');
  const [total, setTotal] = useState('10');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const addQuiz = (e) => {
    e.preventDefault();
    if (!name.trim() || !score.trim()) return;

    const numScore = parseFloat(score);
    const numTotal = parseFloat(total) || 10;
    const pct = Math.round((numScore / numTotal) * 100);

    const newQuiz = {
      id: Date.now().toString(),
      name,
      subject,
      topic: topic || 'General',
      score: numScore,
      total: numTotal,
      percentage: pct,
      date
    };

    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    saveQuizzes(updated);

    setName('');
    setTopic('');
    setScore('');
  };

  const deleteQuiz = (id) => {
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    saveQuizzes(updated);
  };

  const totalAttempted = quizzes.length;
  const avgPercentage = totalAttempted > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / totalAttempted)
    : 0;
  const bestScore = totalAttempted > 0 ? Math.max(...quizzes.map(q => q.percentage)) : 0;

  // Group by subject for performance analysis
  const subjectPerformance = {};
  quizzes.forEach(q => {
    if (!subjectPerformance[q.subject]) {
      subjectPerformance[q.subject] = { totalPct: 0, count: 0 };
    }
    subjectPerformance[q.subject].totalPct += q.percentage;
    subjectPerformance[q.subject].count += 1;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn font-sans text-white">
      {/* Header & Stats Banner */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/95 via-[#120720]/95 to-[#0b0416]/95 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 border border-pink-500/25 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3.5 py-1.5 rounded-full border border-pink-500/30">
            ✨ MAAHI 💗 QUIZ COMMAND
          </span>
          <h2 className="text-3xl font-black mt-3 tracking-tight text-white">Self-Assessment Quizzes</h2>
          <p className="text-sm text-pink-200/70 mt-1 font-medium">
            Record and analyze your self-created quizzes to monitor accuracy and concept retention.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-pink-500/20 text-center shadow-inner">
            <p className="text-[10px] font-black uppercase text-pink-300">Attempted</p>
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

      {/* Subject Performance Breakdown if quizzes exist */}
      {Object.keys(subjectPerformance).length > 0 && (
        <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
          <h3 className="font-black text-lg text-white">Subject-wise Quiz Accuracy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(subjectPerformance).map(([sub, stats]) => {
              const avg = Math.round(stats.totalPct / stats.count);
              return (
                <div key={sub} className="bg-white/5 rounded-2xl p-4 border border-pink-500/15 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-white truncate">{sub}</span>
                    <span className="text-pink-400">{avg}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-pink-500/20">
                    <div className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full" style={{ width: `${avg}%` }} />
                  </div>
                  <p className="text-[10px] text-pink-200/60 font-bold">{stats.count} quiz{stats.count > 1 ? 'zes' : ''} recorded</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Quiz Form */}
      <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="font-black text-lg text-white mb-4">Record New Quiz Score</h3>
        <form onSubmit={addQuiz} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Quiz Name (e.g. Tree Quiz 1)"
            required
            className="lg:col-span-2 bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-[#120720] border border-pink-500/25 rounded-2xl px-3 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
          >
            <option value="Data Structures">Data Structures</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="DBMS">DBMS</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Discrete Mathematics">Discrete Mathematics</option>
            <option value="Digital Logic">Digital Logic</option>
            <option value="COA">COA</option>
          </select>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. AVL Trees)"
            className="bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Score"
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
            <span>Save Quiz</span>
          </button>
        </form>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-white px-2">Quiz History</h3>
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(q => (
              <div
                key={q.id}
                className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all hover:border-pink-500/40"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded border border-pink-500/30">
                      {q.subject}
                    </span>
                    <span className="text-xs text-pink-200/60 font-medium">{q.date}</span>
                  </div>
                  <h4 className="font-black text-base text-white">{q.name}</h4>
                  <p className="text-xs text-pink-200/70 font-bold">Topic: {q.topic}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-pink-400">{q.score} / {q.total}</p>
                    <p className="text-xs font-extrabold text-pink-200/60">{q.percentage}%</p>
                  </div>
                  <button
                    onClick={() => deleteQuiz(q.id)}
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
            <p className="text-pink-200/70 text-sm font-bold">No quizzes recorded yet. Add your self-assessments above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
