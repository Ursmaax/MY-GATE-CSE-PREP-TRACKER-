import { createClient } from '@supabase/supabase-js';

// Get credentials from localStorage or env
export function getSupabaseCredentials() {
  const saved = localStorage.getItem('gate2028_supabase_creds');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}

export function saveSupabaseCredentials(url, anonKey) {
  localStorage.setItem('gate2028_supabase_creds', JSON.stringify({ url, anonKey }));
}

let supabaseInstance = null;

export function getSupabaseClient() {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(creds.url, creds.anonKey);
    } catch (e) {
      console.error("Failed to initialize Supabase", e);
      return null;
    }
  }
  return supabaseInstance;
}
