import React, { useState } from 'react';
import { GameState } from '../types';
import {
  getSupabaseConfig,
  resetSupabaseClient,
  saveUserStateToSupabase,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import { sound } from '../lib/audio';
import {
  Cloud,
  CloudCheck,
  Check,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Database,
  Code2,
} from 'lucide-react';

interface SupabaseModalProps {
  state: GameState;
  onClose: () => void;
  onSyncSuccess: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  state,
  onClose,
  onSyncSuccess,
}) => {
  const config = getSupabaseConfig();
  const [urlInput, setUrlInput] = useState(config.url);
  const [keyInput, setKeyInput] = useState(config.anonKey);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleManualSync = async () => {
    setIsSaving(true);
    setSyncStatus('Syncing player telemetry to Supabase table app_users...');
    sound.triggerHaptic('medium');

    const result = await saveUserStateToSupabase(state);
    setIsSaving(false);

    if (result.success) {
      setSyncStatus('Synced successfully to table `app_users`!');
      sound.playUpgrade();
      onSyncSuccess();
    } else {
      setSyncStatus(`Sync failed: ${result.error}`);
      sound.playError();
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    resetSupabaseClient(urlInput.trim(), keyInput.trim());
    sound.playUpgrade();
    setSyncStatus('Supabase credentials saved. Ready to sync!');
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    sound.playTap();
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#121520] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col gap-3.5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Supabase Sync Engine
              </h3>
              <span className="text-[10px] text-slate-400">Table: `app_users`</span>
            </div>
          </div>
          <button
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/[0.04]"
          >
            ✕
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {state.supabaseSynced ? (
              <CloudCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Cloud className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">
                {config.isConfigured ? 'Supabase Connected' : 'Local Fallback Mode'}
              </span>
              <span className="text-[10px] text-slate-400">
                {state.lastSyncTimestamp
                  ? `Last synced: ${new Date(state.lastSyncTimestamp).toLocaleTimeString()}`
                  : 'Changes stored locally in browser'}
              </span>
            </div>
          </div>

          <button
            id="supabase-manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Sync Now'}</span>
          </button>
        </div>

        {syncStatus && (
          <div
            className={`p-2.5 rounded-xl text-xs ${
              syncStatus.includes('successfully')
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : syncStatus.includes('failed')
                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
            }`}
          >
            {syncStatus}
          </div>
        )}

        {/* Supabase Credentials Configuration */}
        <form onSubmit={handleSaveCredentials} className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cloud Credentials
          </span>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">VITE_SUPABASE_URL</label>
            <input
              type="text"
              id="supabase-url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">VITE_SUPABASE_ANON_KEY</label>
            <input
              type="password"
              id="supabase-key-input"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            id="save-supabase-creds-btn"
            className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white rounded-xl text-xs font-semibold transition-all mt-1"
          >
            Save Supabase Settings
          </button>
        </form>

        {/* Database SQL Schema Section */}
        <div className="bg-black/50 border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Supabase SQL Schema
            </span>
            <button
              onClick={copySql}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20"
            >
              {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="text-[10px] font-mono text-slate-400 bg-[#090b10] p-2 rounded-xl overflow-x-auto max-h-28 border border-white/[0.05]">
            {SUPABASE_SQL_SCHEMA}
          </pre>
          <span className="text-[9px] text-slate-500">
            Paste in Supabase Dashboard → SQL Editor → Run. Stores balance, energy, profit, last tap & cards.
          </span>
        </div>
      </div>
    </div>
  );
};
