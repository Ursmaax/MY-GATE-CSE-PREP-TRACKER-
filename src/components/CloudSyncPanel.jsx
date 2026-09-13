import React, { useEffect, useState } from 'react';
import { Cloud, KeyRound, Copy, RefreshCw, Unplug, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import {
  loadSyncKey,
  loadSyncMeta,
  connectAndSync,
  createLocalKey,
  pushCloudSnapshot,
  disconnectThisDevice,
  fetchCloudHealth
} from '../utils/cloudSync';
import { isValidSyncKey, formatSyncKey } from '../utils/syncProtocol';

function healthLabel(health) {
  if (!health) return 'Checking Netlify Blobs…';
  if (health.ok) return 'Netlify Blobs ready · write · read · delete';
  const parts = [
    health.write ? 'write ✓' : 'write ✗',
    health.read ? 'read ✓' : 'read ✗',
    health.delete ? 'delete ✓' : 'delete ✗'
  ];
  return `Blobs not ready (${parts.join(' · ')})`;
}

export default function CloudSyncPanel() {
  const [keyInput, setKeyInput] = useState(() => loadSyncKey());
  const [connectedKey, setConnectedKey] = useState(() => loadSyncKey());
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState(null);
  const [meta, setMeta] = useState(() => loadSyncMeta());

  useEffect(() => {
    let cancelled = false;
    fetchCloudHealth().then((result) => {
      if (!cancelled) setHealth(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const connected = Boolean(connectedKey);

  const handleCopy = async () => {
    const value = formatSyncKey(keyInput);
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy automatically — select the key and copy it yourself.');
    }
  };

  const handleGenerate = async () => {
    setError('');
    setStatus('');
    setBusy('generate');
    try {
      const key = createLocalKey();
      setKeyInput(key);
      await pushCloudSnapshot(key);
      setConnectedKey(key);
      setMeta(loadSyncMeta());
      setStatus('Key generated and this device is uploading to the cloud vault. Enter the same key on your other device, then Connect & Sync.');
    } catch (err) {
      setError(err.message || 'Could not generate a cloud vault. Is this the Netlify site?');
    } finally {
      setBusy('');
    }
  };

  const handleConnect = async () => {
    setError('');
    setStatus('');
    setBusy('connect');
    try {
      const result = await connectAndSync(keyInput);
      setKeyInput(result.key);
      setConnectedKey(result.key);
      setMeta(loadSyncMeta());
      if (result.applied) {
        setStatus('Merged cloud + local data. Reloading so every tab picks up the vault…');
        setTimeout(() => window.location.reload(), 700);
      } else if (result.created) {
        setStatus('Connected. This device created the cloud vault — enter the same key on your other device to pull it down.');
      } else {
        setStatus('Connected & synced. Both devices now share the same vault.');
      }
    } catch (err) {
      setError(err.message || 'Connect & Sync failed.');
    } finally {
      setBusy('');
    }
  };

  const handleDisconnect = () => {
    disconnectThisDevice();
    setConnectedKey('');
    setStatus('This device is disconnected. The cloud vault is still there — reconnect with the same key any time.');
    setMeta(loadSyncMeta());
  };

  const lastSynced = meta?.lastSyncedAt
    ? new Date(meta.lastSyncedAt).toLocaleString()
    : null;

  return (
    <div className="w-full bg-gradient-to-br from-[#180a2c]/90 via-[#120720]/90 to-[#0b0416]/90 backdrop-blur-2xl rounded-[2.2rem] p-6 sm:p-8 border border-pink-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-5">
      <h3 className="font-black text-lg text-white flex items-center space-x-2.5">
        <Cloud className="w-5 h-5 text-sky-400" />
        <span>Cross-Device Cloud Sync</span>
      </h3>
      <p className="text-xs text-pink-200/70 font-medium leading-relaxed">
        Keep Maahi 💗 progress identical on phone, laptop and tablet. Generate a key on one device,
        enter the same key on the other, then <span className="text-pink-200 font-black">Connect &amp; Sync</span>.
        No account, no Supabase — the vault lives in Netlify Blobs on this site.
      </p>

      <ol className="text-[11px] text-pink-100/80 font-bold space-y-1.5 bg-white/5 rounded-2xl p-4 border border-pink-500/15 list-decimal list-inside">
        <li>Tap <span className="text-white">Generate</span> on this device and copy the key.</li>
        <li>On your other device open Settings → Cross-Device Cloud Sync and paste the same key.</li>
        <li>Tap <span className="text-white">Connect &amp; Sync</span>, then hard-refresh (<span className="text-white">Ctrl+Shift+R</span>) on both devices.</li>
      </ol>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className={`text-[11px] font-black px-3 py-1.5 rounded-full border ${
          health?.ok
            ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
            : 'text-amber-200 bg-amber-500/10 border-amber-500/25'
        }`}>
          {healthLabel(health)}
        </span>
        {connected && (
          <span className="text-[11px] font-black text-sky-300 bg-sky-500/15 px-3 py-1.5 rounded-full border border-sky-500/30">
            Connected{lastSynced ? ` · synced ${lastSynced}` : ''}
          </span>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-pink-300 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5" /> Sync key
        </span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(formatSyncKey(e.target.value))}
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-white/5 border border-pink-500/25 rounded-2xl px-4 py-3 text-sm font-black tracking-[0.18em] text-white placeholder-pink-300/30 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
          />
          <button
            type="button"
            onClick={handleCopy}
            disabled={!keyInput}
            className="bg-white/5 hover:bg-white/10 text-white font-black px-4 py-3 rounded-2xl text-sm border border-pink-500/25 flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-pink-300" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </label>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={Boolean(busy)}
          className="bg-gradient-to-r from-sky-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
        >
          {busy === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate</span>
        </button>

        <button
          type="button"
          onClick={handleConnect}
          disabled={Boolean(busy) || !isValidSyncKey(keyInput)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
        >
          {busy === 'connect' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Connect &amp; Sync</span>
        </button>

        {connected && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="bg-white/5 hover:bg-white/10 text-pink-100 font-black px-6 py-3.5 rounded-2xl text-sm border border-pink-500/20 flex items-center justify-center space-x-2"
          >
            <Unplug className="w-4 h-4 text-rose-300" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-pink-200/60 font-medium">
        Treat this key like a password. Anyone who has it can read and update the vault.
        After connecting, hard-refresh (<span className="text-pink-100 font-black">Ctrl+Shift+R</span>) so both devices load the new bundle.
      </p>

      {status && (
        <p className="text-xs font-bold text-emerald-200 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{status}</span>
        </p>
      )}
      {error && (
        <p className="text-xs font-bold text-rose-200 bg-rose-500/10 border border-rose-500/25 rounded-2xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
