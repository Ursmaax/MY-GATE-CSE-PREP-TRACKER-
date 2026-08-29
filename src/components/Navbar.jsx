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
    <header className="sticky top-0 z-40 bg-[#070b19]/95 dark:bg-[#04060f]/95 backdrop-blur-2xl border-b border-pink-500/20 dark:border-pink-500/15 shadow-[0_4px_30px_rgba(236,72,153,0.08)] transition-colors duration-300 w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Dreamland Maahi 💗 Branding - Compact to fit 100% scale */}
          <div className="flex items-center space-x-2.5 cursor-pointer group shrink-0" onClick={() => setActiveTab('today')}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a0b2e] via-[#2d1248] to-[#0f172a] flex items-center justify-center text-pink-400 font-black text-xl border border-pink-500/40 shadow-inner">
                ✨
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight bg-gradient-to-r from-pink-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent truncate">
                  GATE 2028 DREAMLAND
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                  Maahi 💗
                </span>
              </div>
              <p className="text-[10px] text-pink-200/70 font-medium tracking-wide truncate">Magical Study Command Center</p>
            </div>
          </div>

          {/* Desktop Nav - Gorgeous glowing hover effects */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/5 dark:bg-black/30 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`flex items-center space-x-1 px-2.5 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-300 whitespace-nowrap relative group/btn ${
                    active
                      ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] scale-105 border border-pink-400/40'
                      : 'text-pink-100/70 hover:text-white hover:bg-gradient-to-r hover:from-pink-500/25 hover:to-purple-500/25 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:border-pink-500/30 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover/btn:scale-110 ${active ? 'text-white animate-pulse' : 'text-pink-300 group-hover/btn:text-pink-200'}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-500/20 text-pink-200/80 hover:text-white border border-white/10 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.25)] transition-all shadow-sm"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleFocus}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/35 hover:to-orange-500/35 text-amber-300 px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              title="Focus Mode"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce shrink-0" />
              <span className="hidden xl:inline">Focus Mode</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-500/20 text-pink-200 border border-white/10 hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.25)] transition-all text-sm"
              title="Toggle Theme"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 text-pink-200 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Compact Menu */}
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
