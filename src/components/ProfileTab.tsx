import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  Database,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Code,
  Flame,
  Coins,
  Disc,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TelegramUser, UserProfile } from '../types';
import { triggerHaptic, openExternalUrl } from '../lib/telegram';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, syncUserToSupabase } from '../lib/supabase';

interface ProfileTabProps {
  user: TelegramUser;
  profile: UserProfile;
  isTMA: boolean;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onOpenSupabaseModal: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  profile,
  isTMA,
  onUpdateProfile,
  onOpenSupabaseModal,
}) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const referralLink = `https://t.me/SnapCraftAIBot?start=ref_${user.id}`;

  const handleCopyReferral = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(
      '🚀 Join me on SnapCraft AI! Claim 500 VIP Points and free 4K AI generation:'
    )}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      openExternalUrl(shareUrl);
    }
  };

  const handleManualSync = async () => {
    triggerHaptic('heavy');
    setIsSyncing(true);
    setSyncStatusMsg(null);

    const result = await syncUserToSupabase(profile);
    setIsSyncing(false);

    if (result.success) {
      triggerHaptic('success');
      setSyncStatusMsg('Live synced successfully to Supabase users table!');
      confetti({
        particleCount: 30,
        spread: 45,
        colors: ['#10b981', '#06b6d4'],
      });
    } else {
      triggerHaptic('warning');
      setSyncStatusMsg(result.error || 'Local cache updated');
    }

    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  return (
    <div className="flex flex-col px-4 py-3 max-w-md mx-auto pb-24 animate-fadeIn space-y-4">
      {/* VIP Identity Card */}
      <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-[#121528] via-[#161830] to-[#0d0f1e] border border-cyan-500/30 shadow-2xl glow-cyan">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                alt={user.first_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-400 glow-cyan"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg text-slate-950 shadow">
                <Crown className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {profile.first_name || user.first_name}
                </h3>
                {user.is_premium && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-mono-tech">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono-tech">
                @{profile.username || user.username || 'vip_user'}
              </p>
              <p className="text-[11px] text-cyan-400 font-mono-tech mt-0.5">
                Telegram ID: #{user.id}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 rounded-full text-xs font-mono-tech font-bold text-cyan-300">
              {profile.vip_level}
            </span>
            <div className="text-[10px] text-slate-500 font-mono-tech mt-1">
              Tier Status
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white font-mono-tech">
              {profile.points.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">VIP Points</div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white font-mono-tech">
              {profile.streak_count} Days
            </div>
            <div className="text-[10px] text-slate-400">Streak</div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-center">
            <Disc className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-white font-mono-tech">
              {profile.spins_left}
            </div>
            <div className="text-[10px] text-slate-400">Spins Left</div>
          </div>
        </div>
      </div>

      {/* Telegram Referral Engine Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
              Referral Invite Program
            </h4>
          </div>
          <span className="text-[10px] font-mono-tech text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            +500 PTS per Friend
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Share your Telegram link. You and your invited creator each get 500 VIP credits upon signup.
        </p>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5 font-mono-tech text-xs text-slate-300 mb-3">
          <span className="truncate flex-1 text-[11px] text-cyan-300">
            {referralLink}
          </span>
          <button
            onClick={handleCopyReferral}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0"
            title="Copy"
          >
            {copiedReferral ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          onClick={handleShareTelegram}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-purple"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Link on Telegram</span>
        </button>
      </div>

      {/* Supabase Live Synchronization & Backend Status */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
              Supabase Backend Sync
            </h4>
          </div>
          <span
            className={`text-[10px] font-mono-tech px-2 py-0.5 rounded border ${
              isSupabaseConfigured
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
            }`}
          >
            {isSupabaseConfigured ? '🟢 Live Connected' : '🟡 Local Cache Active'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 mb-3">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-500">Target Table:</span>
            <span className="font-mono-tech text-cyan-300">public.users</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-500">Primary Key:</span>
            <span className="font-mono-tech text-cyan-300">telegram_id ({user.id})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-500">Synced Columns:</span>
            <span className="font-mono-tech text-slate-400 text-[11px]">
              points, streak, last_claim, spins
            </span>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="p-2.5 mb-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center font-mono-tech animate-fadeIn">
            {syncStatusMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
          </button>

          <button
            onClick={onOpenSupabaseModal}
            className="py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Code className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
