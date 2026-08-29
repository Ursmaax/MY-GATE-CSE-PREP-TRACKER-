import React from 'react';
import { Calendar, CheckSquare, BookOpen, BarChart2, Repeat, Settings, Zap, Search, Shield, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSearch, onToggleFocus, darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'weeks', label: '27 Weeks', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: Shield },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'revision', label: 'Revision', icon: Repeat },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('today')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-xl">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                GATE 2028 COMMAND
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Just Execute the Plan</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Global Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleFocus}
              className="hidden sm:flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-amber-500/20"
              title="Focus Mode"
            >
              <Zap className="w-4 h-4" />
              <span>Focus</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              onToggleFocus();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <Zap className="w-5 h-5" />
            <span>Start Focus Mode</span>
          </button>
        </div>
      )}
    </header>
  );
}
