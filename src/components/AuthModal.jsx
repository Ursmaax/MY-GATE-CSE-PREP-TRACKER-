import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User, LogIn, Cloud, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { getSupabaseClient, getSupabaseCredentials, saveSupabaseCredentials } from '../utils/supabaseClient';

export default function AuthModal({ isOpen, onClose, user, setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Maahi 💗');
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.url) setUrlInput(creds.url);
    if (creds.anonKey) setKeyInput(creds.anonKey);
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveSupabaseCredentials(urlInput.trim(), keyInput.trim());
    setShowConfig(false);
    setSuccessMsg('Supabase credentials saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const client = getSupabaseClient();
    if (!client) {
      setError('Please configure Supabase URL and Anon Key below first, or continue in Local Mode.');
      setLoading(false);
      setShowConfig(true);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        setSuccessMsg('Account created successfully! Check your email or sign in.');
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || name
          });
          localStorage.setItem('gate2028_cloud_user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || name
          }));
          onClose();
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-gradient-to-br from-[#180a2c] via-[#120720] to-[#0b0416] rounded-[2.5rem] p-8 border border-pink-500/30 shadow-[0_20px_60px_rgba(236,72,153,0.3)] text-white relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-pink-200 border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 items-center justify-center text-white text-2xl shadow-lg mb-1">
            ✨
          </div>
          <h3 className="text-2xl font-black text-white">GATE 2028 Cloud Sync</h3>
          <p className="text-xs text-pink-200/70 font-medium">
            Sign in or connect Supabase to sync your Maahi 💗 progress across all devices for years.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3.5 rounded-2xl text-xs font-bold mb-4 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {!showConfig ? (
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider block mb-1.5">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maahi 💗"
                    required
                    className="w-full bg-white/5 border border-pink-500/25 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maahi@gate2028.live"
                  required
                  className="w-full bg-white/5 border border-pink-500/25 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-pink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-pink-500/25 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-pink-300/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Processing...' : (isSignUp ? 'Create Cloud Account' : 'Sign In to Cloud Sync')}</span>
            </button>

            <div className="flex justify-between items-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-pink-300 hover:underline font-bold"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="text-purple-300 hover:underline font-bold flex items-center space-x-1"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Configure Supabase</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <h4 className="font-black text-sm text-pink-300">Supabase Connection Setup</h4>
            <p className="text-xs text-pink-200/70">
              Enter your free Supabase Project URL and Anon API Key to enable cloud persistence.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider block mb-1">Project URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3 text-xs text-white placeholder-pink-300/40"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider block mb-1">Anon / Public API Key</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3 text-xs text-white placeholder-pink-300/40"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-black py-3 rounded-2xl text-xs shadow-lg"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="bg-white/10 text-pink-200 font-bold px-4 py-3 rounded-2xl text-xs"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
