import React from 'react';
import { Sparkles, Coins, ShieldCheck, Database, Smartphone } from 'lucide-react';
import { TelegramUser, UserProfile } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  user: TelegramUser;
  profile: UserProfile;
  isTMA: boolean;
  onOpenProfile: () => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  isTMA,
  onOpenProfile,
  onOpenSupabaseModal,
}) => {
  const handleProfileClick = () => {
    triggerHaptic('light');
    onOpenProfile();
  };

  const handleDbClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onOpenSupabaseModal();
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 bg-[#0c0e18]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* User Profile Trigger */}
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2.5 text-left group transition-all"
          title="Open VIP Profile"
        >
          <div className="relative">
            <img
              src={user.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
              alt={user.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400/80 glow-cyan group-hover:scale-105 transition-transform"
            />
            {user.is_premium && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5 text-[10px] text-white shadow">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-white leading-tight truncate max-w-[110px]">
                {profile.first_name || user.first_name}
              </span>
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-[10px] font-mono-tech text-cyan-300 rounded font-medium">
                {profile.vip_level}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="truncate max-w-[85px]">
                @{profile.username || user.username || 'vip_user'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono-tech text-slate-500 text-[10px]">
                #{String(user.id).slice(-4)}
              </span>
            </div>
          </div>
        </button>

        {/* Right Action Cluster: Points & DB Status */}
        <div className="flex items-center gap-2">
          {/* Supabase status badge */}
          <button
            onClick={handleDbClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-colors ${
              isSupabaseConfigured
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
            }`}
            title="Supabase Database Live Sync Status"
          >
            <Database className="w-3 h-3" />
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Live DB' : 'Local'}
            </span>
          </button>

          {/* Points Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-950/60 to-slate-900/90 border border-purple-500/40 rounded-full shadow-inner glow-purple">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono-tech font-bold text-sm text-white tracking-wide">
              {profile.points.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* TMA / Browser Mode Banner (discreet) */}
      {!isTMA && (
        <div className="mt-1.5 max-w-md mx-auto flex items-center justify-between text-[11px] px-2.5 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-cyan-200/90">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            Browser Mode (VIP Simulator Active)
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono-tech">
            TMA Ready
          </span>
        </div>
      )}
    </header>
  );
};
