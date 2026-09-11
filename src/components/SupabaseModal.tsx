import React, { useState } from 'react';
import { X, Database, Check, Copy, Terminal, Shield, RefreshCw } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured, supabase } from '../lib/supabase';
import { triggerHaptic } from '../lib/telegram';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramId: number;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  telegramId,
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    triggerHaptic('medium');
    setIsTesting(true);
    setTestResult(null);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult('Supabase env credentials (VITE_SUPABASE_URL) are not set. App is running in zero-latency local cache mode.');
      }, 500);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setIsTesting(false);
      if (error) {
        setTestResult(`Connection response: ${error.message}`);
      } else {
        setTestResult(`🟢 Connected successfully! Total users table rows: ${count ?? 0}`);
      }
    } catch (err: any) {
      setIsTesting(false);
      setTestResult(`Error: ${err?.message || 'Failed to ping Supabase'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0f1120] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl glow-cyan max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Supabase SQL & Integration
              </h3>
              <span className="text-[10px] text-slate-400 font-mono-tech">
                {isSupabaseConfigured ? '🟢 Live Connected' : '🟡 Local Storage Active'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-3 space-y-3 text-xs flex-1">
          {/* Status info */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-1 text-slate-300">
            <div className="flex justify-between font-mono-tech text-[11px]">
              <span className="text-slate-500">VITE_SUPABASE_URL:</span>
              <span className="text-cyan-300 truncate max-w-[190px]">
                {import.meta.env.VITE_SUPABASE_URL || '(Not set - demo mode)'}
              </span>
            </div>
            <div className="flex justify-between font-mono-tech text-[11px]">
              <span className="text-slate-500">Active User ID:</span>
              <span className="text-purple-300">{telegramId}</span>
            </div>
          </div>

          {/* Test connection */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono-tech text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging Supabase...' : 'Test Connection Status'}</span>
            </button>
            {testResult && (
              <p className="mt-1.5 p-2 rounded bg-black/40 border border-white/5 text-[11px] font-mono-tech text-slate-300">
                {testResult}
              </p>
            )}
          </div>

          {/* Schema Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 font-mono-tech flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                PostgreSQL Table Setup SQL:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-300 hover:text-cyan-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono-tech text-slate-300 overflow-x-auto leading-relaxed max-h-48">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
