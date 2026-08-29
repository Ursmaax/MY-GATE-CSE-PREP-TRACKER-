import React from 'react';
import { Calendar, CheckSquare, BookOpen, BarChart2, Repeat, Settings, Zap, Search, Shield, Menu, X, Sparkles, Award, FileSpreadsheet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSearch, onToggleFocus, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'weeks', label: '27 Weeks', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: Shield },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'tests', label: 'Tests', icon: FileSpreadsheet },
    { id: 'revision', label: 'Revision', icon: Repeat },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b19]/90 dark:bg-[#04060f]/95 backdrop-blur-2xl border-b border-pink-500/20 dark:border-pink-500/15 shadow-[0_4px_30px_rgba(236,72,153,0.08)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Dreamland Maahi 💗 Branding */}
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActiveTab('today')}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a0b2e] via-[#2d1248] to-[#0f172a] flex items-center justify-center text-pink-400 font-black text-2xl border border-pink-500/40 shadow-inner">
                ✨
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-pink-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent drop-shadow">
                  GATE 2028 DREAMLAND
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                  Maahi 💗
                </span>
              </div>
              <p className="text-xs text-pink-200/60 font-medium tracking-wide">Magical Study Command Center • Just Execute</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-white/5 dark:bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-[1.02] border border-pink-400/30'
                      : 'text-pink-100/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenSearch}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-pink-200/80 hover:text-white border border-white/10 transition-colors shadow-sm"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleFocus}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              title="Focus Mode"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
              <span>Focus Mode</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-pink-200 border border-white/10 transition-colors text-sm"
              title="Toggle Theme"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-white/5 text-pink-200 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070b19]/95 backdrop-blur-2xl border-b border-pink-500/20 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-pink-100/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              onToggleFocus();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            <Zap className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
            <span>Start Focus Mode</span>
          </button>
        </div>
      )}
    </header>
  );
}
