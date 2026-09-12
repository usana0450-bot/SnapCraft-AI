import React from 'react';
import { GameState } from '../types';
import { sound } from '../lib/audio';
import { Flame, Pickaxe, CheckSquare, Wallet } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'tap' | 'mining' | 'tasks' | 'wallet';
  onChangeTab: (tab: 'tap' | 'mining' | 'tasks' | 'wallet') => void;
  state: GameState;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, state }) => {
  // Compute badges
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const hasDailyStreakToClaim = state.lastStreakClaimDate !== todayDateStr;
  const hasTasksToClaim = state.tasks.some((t) => t.completed && !t.claimed);
  const tasksBadge = hasDailyStreakToClaim || hasTasksToClaim;

  const hasComboToClaim = !state.dailyComboSolved && state.dailyComboSelection.length >= 3;

  const navItems = [
    {
      id: 'tap' as const,
      label: 'Tap',
      icon: Flame,
      badge: false,
    },
    {
      id: 'mining' as const,
      label: 'Mining',
      icon: Pickaxe,
      badge: hasComboToClaim,
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: CheckSquare,
      badge: tasksBadge,
    },
    {
      id: 'wallet' as const,
      label: 'Airdrop',
      icon: Wallet,
      badge: !state.walletConnected,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f16]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => {
                sound.triggerHaptic('selection');
                onChangeTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-yellow-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Tab Glow Pill Indicator */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-yellow-400/15 via-amber-500/5 to-transparent border border-yellow-400/30 shadow-[0_0_12px_rgba(250,204,21,0.2)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_#facc15]' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0d0f16] shadow-[0_0_6px_#ef4444] animate-pulse" />
                )}
              </div>

              <span className="text-[10px] tracking-wide mt-1 font-medium truncate w-full text-center relative z-10">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
