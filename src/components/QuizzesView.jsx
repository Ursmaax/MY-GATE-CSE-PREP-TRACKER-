import React, { useState } from 'react';
import { Plus, Trash2, Award, TrendingUp, CheckCircle2, Calendar, BookOpen } from 'lucide-react';
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

  // Analytics
  const totalAttempted = quizzes.length;
  const avgPercentage = totalAttempted > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / totalAttempted)
    : 0;
  const bestScore = totalAttempted > 0 ? Math.max(...quizzes.map(q => q.percentage)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn font-sans">
      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-800">
            MAAHI 💗 QUIZ COMMAND
          </span>
          <h2 className="text-3xl font-black mt-2 tracking-tight">Self-Assessment Quizzes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Record and analyze your self-created quizzes to monitor accuracy and concept retention.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Attempted</p>
            <p className="text-xl font-black mt-1 text-slate-900 dark:text-slate-100">{totalAttempted}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Avg Score</p>
            <p className="text-xl font-black mt-1 text-sky-600 dark:text-sky-400">{avgPercentage}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Best Score</p>
            <p className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{bestScore}%</p>
          </div>
        </div>
      </div>

      {/* Add Quiz Form */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 mb-4">Record New Quiz Score</h3>
        <form onSubmit={addQuiz} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Quiz Name (e.g. Tree Quiz 1)"
            required
            className="lg:col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
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
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
          />
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Score"
              required
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
            />
            <input
              type="number"
              step="0.5"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Total"
              required
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Save Quiz</span>
          </button>
        </form>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 px-2">Quiz History</h3>
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(q => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 rounded border border-pink-200 dark:border-pink-800">
                      {q.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{q.date}</span>
                  </div>
                  <h4 className="font-black text-base text-slate-900 dark:text-slate-100">{q.name}</h4>
                  <p className="text-xs text-slate-500 font-bold">Topic: {q.topic}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-black text-sky-600 dark:text-sky-400">{q.score} / {q.total}</p>
                    <p className="text-xs font-extrabold text-slate-400">{q.percentage}%</p>
                  </div>
                  <button
                    onClick={() => deleteQuiz(q.id)}
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
            <p className="text-slate-500 text-sm font-bold">No quizzes recorded yet. Add your self-assessments above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
