/**
 * SnapCraft AI - VIP Telegram Mini App
 * Complete production-ready TMA with Supabase live synchronization,
 * Telegram WebApp SDK integration, Monetag Rewarded Ads,
 * Daily Streak gamification with loss aversion, and AI Photo Utility Hub.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, TelegramUser, UserProfile } from './types';
import { initTelegramSDK, triggerHaptic } from './lib/telegram';
import { fetchOrCreateUser, syncUserToSupabase } from './lib/supabase';
import { MonetagService } from './lib/monetag';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AiToolsTab } from './components/AiToolsTab';
import { LuckyWheelTab } from './components/LuckyWheelTab';
import { StreakTab } from './components/StreakTab';
import { ProfileTab } from './components/ProfileTab';
import { MonetagAdModal } from './components/MonetagAdModal';
import { SupabaseModal } from './components/SupabaseModal';

export default function App() {
  const [telegramData, setTelegramData] = useState<{
    isTMA: boolean;
    user: TelegramUser;
  } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('lucky-spin');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [adModalConfig, setAdModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    onRewarded: () => void;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    onRewarded: () => {},
  });

  // 1. Initialize Telegram SDK and fetch/auto-create Supabase user
  useEffect(() => {
    const tg = initTelegramSDK();
    setTelegramData({
      isTMA: tg.isTMA,
      user: tg.user,
    });

    // Initialize Monetag listener hook
    MonetagService.init();

    // Fetch or auto-create user in Supabase
    fetchOrCreateUser(tg.user).then(({ profile: loadedProfile }) => {
      setProfile(loadedProfile);
      setIsLoading(false);
    });
  }, []);

  // 2. Centralized Profile Updater with live Supabase Sync
  const handleUpdateProfile = useCallback(
    (updater: (prev: UserProfile) => UserProfile) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        // Live sync state update to Supabase
        syncUserToSupabase(updated);
        return updated;
      });
    },
    []
  );

  // 3. Monetag Rewarded Ads Handler
  const handleRequestAd = useCallback(
    (options: {
      placement: string;
      title: string;
      subtitle: string;
      onRewarded: () => void;
    }) => {
      // First try native SDK hook if script exists
      const handled = MonetagService.triggerNativeAd(options.onRewarded);
      if (handled) return;

      // Otherwise launch high-retention VIP Rewarded player modal
      setAdModalConfig({
        isOpen: true,
        title: options.title,
        subtitle: options.subtitle,
        onRewarded: options.onRewarded,
      });
    },
    []
  );

  if (isLoading || !telegramData || !profile) {
    return (
      <div className="min-h-screen bg-[#080910] flex flex-col items-center justify-center p-4 text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500 p-0.5 animate-pulse glow-cyan">
            <div className="w-full h-full bg-[#0d0f1e] rounded-2xl flex items-center justify-center">
              <span className="text-xl font-black text-cyan-400 font-mono-tech">
                SC
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs font-mono-tech text-cyan-300 tracking-wider animate-pulse">
          INITIALIZING TELEGRAM MINI APP...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080910] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Sticky VIP Header */}
      <Header
        user={telegramData.user}
        profile={profile}
        isTMA={telegramData.isTMA}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'ai-tools' && (
          <AiToolsTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onRequestAd={handleRequestAd}
          />
        )}

        {activeTab === 'lucky-spin' && (
          <LuckyWheelTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onRequestAd={handleRequestAd}
          />
        )}

        {activeTab === 'streaks' && (
          <StreakTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onRequestAd={handleRequestAd}
            onNavigateToAi={() => setActiveTab('ai-tools')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={telegramData.user}
            profile={profile}
            isTMA={telegramData.isTMA}
            onUpdateProfile={handleUpdateProfile}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile-Friendly Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        spinsLeft={profile.spins_left}
        streakCount={profile.streak_count}
      />

      {/* Monetag Rewarded Ad Modal */}
      <MonetagAdModal
        isOpen={adModalConfig.isOpen}
        onClose={() => setAdModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onRewardClaimed={adModalConfig.onRewarded}
        rewardTitle={adModalConfig.title}
        rewardSubtitle={adModalConfig.subtitle}
      />

      {/* Supabase Live Status & Schema Inspector Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        telegramId={telegramData.user.id}
      />
    </div>
  );
}
