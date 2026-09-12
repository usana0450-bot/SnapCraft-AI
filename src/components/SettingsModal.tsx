import React, { useState } from 'react';
import { GameState } from '../types';
import { sound } from '../lib/audio';
import { Settings, User, RotateCcw, Volume2, VolumeX, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  state: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateUsername: (name: string) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  soundEnabled,
  onToggleSound,
  onUpdateUsername,
  onResetGame,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(state.user.firstName || state.user.username);
  const [savedName, setSavedName] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onUpdateUsername(nameInput.trim());
    sound.playUpgrade();
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    sound.playError();
    onResetGame();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm bg-[#121520] border border-white/[0.1] rounded-3xl p-5 shadow-[0_0_35px_rgba(0,0,0,0.5)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Mini App Settings</h3>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/[0.04]"
          >
            ✕
          </button>
        </div>

        {/* Telegram Profile Info */}
        <form onSubmit={handleSaveName} className="flex flex-col gap-2 bg-black/40 p-3 rounded-2xl border border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-cyan-400" /> Telegram Handle
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="settings-username-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-full"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              {savedName ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
          </div>
        </form>

        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-xs font-semibold text-white">Audio & Haptic Feedback</span>
          </div>
          <button
            id="settings-toggle-sound-btn"
            onClick={onToggleSound}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/[0.05] text-slate-500'
            }`}
          >
            {soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* Anti-cheat & Security Status */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-300">Anti-Cheat Engine Active</span>
            <span className="text-[10px] text-emerald-400/80">
              Encrypted rate-limit, offline delta capping & telemetry verification enabled.
            </span>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-1.5">
          <button
            id="settings-reset-game-btn"
            onClick={handleReset}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              confirmReset
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-white/[0.04] text-red-400 hover:bg-red-500/10 border border-white/[0.06]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? 'Confirm Full Reset? (Irreversible)' : 'Reset Game Progress'}</span>
          </button>
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="text-[10px] text-slate-400 hover:text-white text-center py-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
