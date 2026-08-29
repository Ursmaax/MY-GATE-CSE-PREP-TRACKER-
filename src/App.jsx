import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TodayView from './components/TodayView';
import PlanView from './components/PlanView';
import WeeksView from './components/WeeksView';
import SubjectsView from './components/SubjectsView';
import ProgressView from './components/ProgressView';
import QuizzesView from './components/QuizzesView';
import TestsView from './components/TestsView';
import RevisionView from './components/RevisionView';
import SettingsView from './components/SettingsView';
import FocusMode from './components/FocusMode';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';
import { initialScheduleData } from './data/scheduleData';
import { loadSettings, saveSettings, loadProgress, saveProgress, loadNotes, saveNotes, loadRevisions, loadQuizzes, loadTests } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [settings, setSettings] = useState(() => loadSettings());
  const [progress, setProgress] = useState(() => loadProgress());
  const [notes, setNotes] = useState(() => loadNotes());
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gate2028_cloud_user');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return null;
  });
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  useEffect(() => {
    saveSettings({ ...settings, darkMode });
  }, [settings, darkMode]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('gate2028_cloud_user');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setSearchOpen(true)}
        onToggleFocus={() => setFocusModeOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'today' && (
          <TodayView
            scheduleData={initialScheduleData}
            settings={settings}
            setSettings={setSettings}
            progress={progress}
            setProgress={setProgress}
            notes={notes}
            setNotes={setNotes}
            onStartFocus={() => setFocusModeOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'plan' && (
          <PlanView
            scheduleData={initialScheduleData}
            settings={settings}
            progress={progress}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'weeks' && (
          <WeeksView
            scheduleData={initialScheduleData}
            progress={progress}
            settings={settings}
          />
        )}
        {activeTab === 'subjects' && (
          <SubjectsView
            scheduleData={initialScheduleData}
            progress={progress}
          />
        )}
        {activeTab === 'progress' && (
          <ProgressView
            scheduleData={initialScheduleData}
            progress={progress}
            settings={settings}
          />
        )}
        {activeTab === 'quizzes' && (
          <QuizzesView />
        )}
        {activeTab === 'tests' && (
          <TestsView />
        )}
        {activeTab === 'revision' && (
          <RevisionView />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </main>

      {/* Focus Mode Overlay */}
      {focusModeOpen && (
        <FocusMode
          scheduleData={initialScheduleData}
          settings={settings}
          progress={progress}
          setProgress={setProgress}
          onClose={() => setFocusModeOpen(false)}
        />
      )}

      {/* Global Search Modal */}
      {searchOpen && (
        <SearchModal
          scheduleData={initialScheduleData}
          onClose={() => setSearchOpen(false)}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          user={user}
          setUser={setUser}
        />
      )}
    </div>
  );
}
