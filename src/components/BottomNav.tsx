import React from 'react';
import { Wand2, Disc, Flame, Crown } from 'lucide-react';
import { ActiveTab } from '../types';
import { triggerHaptic } from '../lib/telegram';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  spinsLeft: number;
  streakCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  spinsLeft,
  streakCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'ai-tools',
      label: 'AI Studio',
      icon: <Wand2 className="w-5 h-5" />,
    },
    {
      id: 'lucky-spin',
      label: 'Lucky Spin',
      icon: <Disc className="w-5 h-5" />,
      badge: spinsLeft > 0 ? spinsLeft : undefined,
    },
    {
      id: 'streaks',
      label: 'Daily Streak',
      icon: <Flame className="w-5 h-5" />,
      badge: streakCount > 0 ? `${streakCount}d` : undefined,
    },
    {
      id: 'profile',
      label: 'VIP Profile',
      icon: <Crown className="w-5 h-5" />,
    },
  ];

  const handleSelect = (id: ActiveTab) => {
    triggerHaptic('medium');
    onChangeTab(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b14]/95 backdrop-blur-lg border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active ambient glow pill */}
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-b from-cyan-500/15 to-purple-500/10 rounded-xl -z-10 border border-cyan-500/30 glow-cyan" />
              )}

              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono-tech font-bold leading-tight shadow-lg ${
                      tab.id === 'streaks'
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
