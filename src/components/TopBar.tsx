import React from 'react';
import { GameState } from '../types';
import { formatNumber, getLevelForPoints, USER_LEVELS } from '../lib/gameData';
import { Volume2, VolumeX, Cloud, CloudCheck, Sparkles, Settings, ChevronRight } from 'lucide-react';
import { sound } from '../lib/audio';

interface TopBarProps {
  state: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSupabase: () => void;
  onOpenSettings: () => void;
  onOpenLevelDetails: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  soundEnabled,
  onToggleSound,
  onOpenSupabase,
  onOpenSettings,
  onOpenLevelDetails,
}) => {
  const currentLevel = getLevelForPoints(state.totalMined);
  const nextLevel = USER_LEVELS.find((l) => l.level === currentLevel.level + 1);

  const levelProgress = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          ((state.totalMined - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
        )
      )
    : 100;

  return (
    <header className="w-full bg-[#11131a]/95 backdrop-blur-md border-b border-white/[0.08] px-3 py-2.5 z-40 sticky top-0">
      <div className="max-w-md mx-auto flex flex-col gap-2">
        {/* Top row: Profile, Level, Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Telegram User Profile */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-900/40 to-slate-900 flex items-center justify-center">
                {state.user.avatarUrl ? (
                  <img
                    src={state.user.avatarUrl}
                    alt={state.user.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-cyan-300 text-sm">
                    {state.user.firstName.charAt(0) || 'TG'}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0d12] shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate max-w-[110px]">
                  {state.user.firstName || state.user.username}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  VIP
                </span>
              </div>

              {/* Level & Rank click to view */}
              <button
                id="topbar-level-trigger"
                onClick={onOpenLevelDetails}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors text-left group"
              >
                <span className="text-amber-400 font-semibold">{currentLevel.title}</span>
                <span className="text-slate-500">Lv.{currentLevel.level}</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Supabase Status Pill */}
            <button
              id="topbar-supabase-btn"
              onClick={onOpenSupabase}
              title={state.supabaseSynced ? 'Supabase Synced' : 'Supabase Setup / Sync'}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-cyan-400/40 transition-all text-[11px]"
            >
              {state.supabaseSynced ? (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
              <span className="text-[10px] hidden sm:inline text-slate-300">
                {state.supabaseSynced ? 'Cloud' : 'Sync'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              id="topbar-sound-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Settings Modal */}
            <button
              id="topbar-settings-btn"
              onClick={onOpenSettings}
              title="Settings & Profile"
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Second Row: Level Progress Bar & Profit Per Hour */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Level Progress */}
          <div
            id="level-progress-container"
            onClick={onOpenLevelDetails}
            className="cursor-pointer bg-white/[0.02] border border-white/[0.06] rounded-xl px-2.5 py-1.5 flex flex-col justify-center hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Next Rank
              </span>
              <span className="text-slate-300 font-mono text-[10px]">
                {Math.round(levelProgress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Profit Per Hour Badge */}
          <div className="bg-gradient-to-br from-cyan-950/40 via-[#131722] to-slate-900 border border-cyan-500/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="flex flex-col">
              <span className="text-[9px] text-cyan-300/80 uppercase tracking-wider font-medium">
                Profit per hour
              </span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span className="text-xs font-bold font-mono text-cyan-300 tracking-tight">
                  +{formatNumber(state.profitPerHour)}/hr
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
              ⚡
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
