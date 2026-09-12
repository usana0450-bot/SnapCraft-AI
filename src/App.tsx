/**
 * CyberTap: Telegram Tap-to-Earn Mini App
 * Production-ready Mini App engine with Supabase synchronization,
 * Telegram WebApp SDK bindings, and Web Audio synthesis.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, FloatingText, MiningCard } from './types';
import {
  INITIAL_MINING_CARDS,
  INITIAL_TASKS,
  DAILY_STREAK_REWARDS,
  TODAY_DAILY_COMBO_CARDS,
  DAILY_COMBO_REWARD,
  TODAY_CIPHER_CODE,
  calculateCardCost,
  calculateTotalProfitPerHour,
  getLevelForPoints,
} from './lib/gameData';
import { sound } from './lib/audio';
import {
  getSupabaseConfig,
  saveUserStateToSupabase,
  loadUserStateFromSupabase,
} from './lib/supabase';

import { TopBar } from './components/TopBar';
import { TapTab } from './components/TapTab';
import { MiningTab } from './components/MiningTab';
import { TasksTab } from './components/TasksTab';
import { WalletTab } from './components/WalletTab';
import { BottomNav } from './components/BottomNav';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';
import { SupabaseModal } from './components/SupabaseModal';
import { LevelDetailsModal } from './components/LevelDetailsModal';
import { SettingsModal } from './components/SettingsModal';

const LOCAL_STORAGE_KEY = 'cybertap_game_state_v1';
const MAX_OFFLINE_HOURS = 3;

// Initial state generator
function getInitialGameState(): GameState {
  // Check if Telegram WebApp injected user data
  const tgUser = (window as unknown as {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            is_premium?: boolean;
          };
        };
      };
    };
  })?.Telegram?.WebApp?.initDataUnsafe?.user;

  const userProfile = {
    id: tgUser?.id ? String(tgUser.id) : 'user_' + Math.random().toString(36).substring(2, 9),
    telegramId: tgUser?.id || 77892301,
    username: tgUser?.username || 'CyberWhale_VIP',
    firstName: tgUser?.first_name || 'CyberWhale',
    avatarUrl:
      tgUser?.photo_url ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isPremium: tgUser?.is_premium || true,
    level: 1,
    rankTitle: 'Bronze Miner',
  };

  return {
    balance: 2500,
    totalMined: 2500,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenPerSec: 3,
    tapValue: 1,
    profitPerHour: 300,
    lastTapTimestamp: Date.now(),
    lastEnergyUpdateTimestamp: Date.now(),
    lastOfflineEarningsCheck: Date.now(),
    user: userProfile,
    cards: INITIAL_MINING_CARDS,
    tasks: INITIAL_TASKS,
    dailyStreak: 1,
    lastStreakClaimDate: '',
    dailyComboSolved: false,
    dailyComboSelection: [],
    turboActiveUntil: 0,
    freeEnergyRefillsLeft: 3,
    lastRefillDate: new Date().toISOString().slice(0, 10),
    walletConnected: false,
    walletAddress: null,
    supabaseSynced: false,
    lastSyncTimestamp: 0,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'tap' | 'mining' | 'tasks' | 'wallet'>('tap');
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingIdCounter = useRef(0);

  // Modals state
  const [offlineEarnings, setOfflineEarnings] = useState<{ amount: number; hours: number } | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Core Game State with anti-cheat & localStorage recovery
  const [state, setState] = useState<GameState>(() => {
    if (typeof window === 'undefined') return getInitialGameState();

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GameState;
        const now = Date.now();

        // 1. Anti-Cheat: Validate Energy Regeneration strictly based on real elapsed time
        const elapsedEnergySec = Math.max(0, (now - (parsed.lastEnergyUpdateTimestamp || now)) / 1000);
        const regeneratedEnergy = Math.min(
          parsed.maxEnergy,
          parsed.energy + elapsedEnergySec * parsed.energyRegenPerSec
        );

        // 2. Anti-Cheat: Validate and reset daily refill if date changed
        const todayStr = new Date().toISOString().slice(0, 10);
        let refills = parsed.freeEnergyRefillsLeft ?? 3;
        if (parsed.lastRefillDate !== todayStr) {
          refills = 3;
        }

        return {
          ...parsed,
          energy: Math.floor(regeneratedEnergy),
          lastEnergyUpdateTimestamp: now,
          freeEnergyRefillsLeft: refills,
          lastRefillDate: todayStr,
        };
      } catch (e) {
        console.warn('Failed to parse cached game state, initializing fresh state', e);
      }
    }
    return getInitialGameState();
  });

  // Expand Telegram WebApp and set background if running inside Telegram
  useEffect(() => {
    try {
      const tg = (window as unknown as {
        Telegram?: {
          WebApp?: {
            ready: () => void;
            expand: () => void;
            setHeaderColor: (color: string) => void;
            setBackgroundColor: (color: string) => void;
          };
        };
      })?.Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#11131a');
        tg.setBackgroundColor('#0c0d12');
      }
    } catch {
      // Not in Telegram WebApp environment
    }
  }, []);

  // Check and award Offline Earnings on initial mount
  useEffect(() => {
    const now = Date.now();
    const lastSession = state.lastOfflineEarningsCheck || now;
    const elapsedSeconds = Math.max(0, (now - lastSession) / 1000);

    // If more than 60 seconds passed while away, calculate offline earnings
    if (elapsedSeconds > 60 && state.profitPerHour > 0) {
      const hoursAway = Math.min(MAX_OFFLINE_HOURS, elapsedSeconds / 3600);
      const earned = Math.floor(hoursAway * state.profitPerHour);

      if (earned > 10) {
        setOfflineEarnings({
          amount: earned,
          hours: hoursAway,
        });
      }
    }

    setState((prev) => ({
      ...prev,
      lastOfflineEarningsCheck: now,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }, [state]);

  // Background Loop: Energy Regeneration (every 1 second)
  useEffect(() => {
    const energyTimer = setInterval(() => {
      setState((prev) => {
        if (prev.energy >= prev.maxEnergy) {
          return { ...prev, lastEnergyUpdateTimestamp: Date.now() };
        }
        const nextEnergy = Math.min(
          prev.maxEnergy,
          prev.energy + prev.energyRegenPerSec
        );
        return {
          ...prev,
          energy: nextEnergy,
          lastEnergyUpdateTimestamp: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(energyTimer);
  }, []);

  // Background Loop: Real-time Passive Mining profit accretion (every 3 seconds)
  useEffect(() => {
    const passiveTimer = setInterval(() => {
      setState((prev) => {
        if (prev.profitPerHour <= 0) return prev;
        // 3 seconds fraction of an hour
        const gain = (prev.profitPerHour / 3600) * 3;
        const newBalance = prev.balance + gain;
        const newTotalMined = prev.totalMined + gain;
        const currentLevelObj = getLevelForPoints(newTotalMined);

        return {
          ...prev,
          balance: newBalance,
          totalMined: newTotalMined,
          user: {
            ...prev.user,
            level: currentLevelObj.level,
            rankTitle: currentLevelObj.title,
          },
        };
      });
    }, 3000);

    return () => clearInterval(passiveTimer);
  }, []);

  // Debounced auto-sync to Supabase
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerAutoSync = useCallback((currentState: GameState) => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      const res = await saveUserStateToSupabase(currentState);
      if (res.success) {
        setState((prev) => ({
          ...prev,
          supabaseSynced: true,
          lastSyncTimestamp: Date.now(),
        }));
      }
    }, 4000);
  }, []);

  // Initial Supabase Remote State Fetch
  useEffect(() => {
    const fetchRemote = async () => {
      const config = getSupabaseConfig();
      if (!config.isConfigured) return;

      const remoteData = await loadUserStateFromSupabase(state.user.id);
      if (remoteData) {
        setState((prev) => ({
          ...prev,
          balance: Number(remoteData.balance) || prev.balance,
          totalMined: Number(remoteData.total_mined) || prev.totalMined,
          profitPerHour: Number(remoteData.profit_per_hour) || prev.profitPerHour,
          supabaseSynced: true,
          lastSyncTimestamp: Date.now(),
        }));
      }
    };
    fetchRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TAP HANDLER
  const handleTap = (x: number, y: number, value: number, isCritical = false) => {
    setState((prev) => {
      if (prev.energy < 1) return prev;

      const nextEnergy = Math.max(0, prev.energy - 1);
      const nextBalance = prev.balance + value;
      const nextTotalMined = prev.totalMined + value;
      const currentLevelObj = getLevelForPoints(nextTotalMined);

      const updatedState = {
        ...prev,
        energy: nextEnergy,
        balance: nextBalance,
        totalMined: nextTotalMined,
        lastTapTimestamp: Date.now(),
        user: {
          ...prev.user,
          level: currentLevelObj.level,
          rankTitle: currentLevelObj.title,
        },
      };

      triggerAutoSync(updatedState);
      return updatedState;
    });

    // Add floating coin text at tap position
    floatingIdCounter.current += 1;
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: floatingIdCounter.current,
        x,
        y,
        value,
        isCritical,
      },
    ]);
  };

  const handleRemoveFloatingText = (id: number) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  };

  // BOOST: Full Energy Refill
  const handleTriggerRefill = () => {
    if (state.freeEnergyRefillsLeft <= 0 || state.energy >= state.maxEnergy) return;

    sound.playUpgrade();
    setState((prev) => {
      const updated = {
        ...prev,
        energy: prev.maxEnergy,
        freeEnergyRefillsLeft: prev.freeEnergyRefillsLeft - 1,
        lastEnergyUpdateTimestamp: Date.now(),
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // BOOST: Turbo 5X Overclock
  const handleTriggerTurbo = () => {
    if (state.turboActiveUntil > Date.now()) return;

    sound.playCriticalTap();
    setState((prev) => ({
      ...prev,
      turboActiveUntil: Date.now() + 20000, // 20 seconds
    }));
  };

  // MINING CARD UPGRADE
  const handleUpgradeCard = (cardId: string) => {
    setState((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      const cost = calculateCardCost(card);
      if (prev.balance < cost) return prev;

      // Update card level
      const updatedCards = prev.cards.map((c) => {
        if (c.id === cardId) {
          return { ...c, level: c.level + 1 };
        }
        return c;
      });

      // Check daily combo collection: if this card is part of today's combo
      let updatedCombo = [...prev.dailyComboSelection];
      if (TODAY_DAILY_COMBO_CARDS.includes(cardId) && !updatedCombo.includes(cardId)) {
        updatedCombo.push(cardId);
      }

      const newProfit = calculateTotalProfitPerHour(updatedCards);

      const updated = {
        ...prev,
        balance: prev.balance - cost,
        cards: updatedCards,
        profitPerHour: newProfit,
        dailyComboSelection: updatedCombo,
      };

      triggerAutoSync(updated);
      return updated;
    });
  };

  // DAILY COMBO CLAIM (+5,000,000)
  const handleClaimDailyCombo = () => {
    setState((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + DAILY_COMBO_REWARD,
        totalMined: prev.totalMined + DAILY_COMBO_REWARD,
        dailyComboSolved: true,
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // TASKS: Daily Streak Claim
  const handleClaimDailyStreak = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dayReward = DAILY_STREAK_REWARDS[state.dailyStreak % DAILY_STREAK_REWARDS.length];

    setState((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + dayReward,
        totalMined: prev.totalMined + dayReward,
        dailyStreak: prev.dailyStreak + 1,
        lastStreakClaimDate: todayStr,
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // TASKS: Complete Task
  const handleCompleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
    }));
  };

  // TASKS: Claim Task Reward
  const handleClaimTaskReward = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task || task.claimed) return prev;

      const updated = {
        ...prev,
        balance: prev.balance + task.reward,
        totalMined: prev.totalMined + task.reward,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)),
      };

      triggerAutoSync(updated);
      return updated;
    });
  };

  // TASKS: Solve Cipher Code (+1,000,000)
  const handleSolveCipher = () => {
    setState((prev) => {
      const cipherTask = prev.tasks.find((t) => t.id === 'task_daily_cipher');
      const reward = cipherTask ? cipherTask.reward : 1000000;

      const updated = {
        ...prev,
        balance: prev.balance + reward,
        totalMined: prev.totalMined + reward,
        tasks: prev.tasks.map((t) =>
          t.id === 'task_daily_cipher' ? { ...t, completed: true, claimed: true } : t
        ),
      };

      triggerAutoSync(updated);
      return updated;
    });
  };

  // WALLET: Connect TON
  const handleConnectWallet = (address: string) => {
    setState((prev) => {
      const updated = {
        ...prev,
        walletConnected: true,
        walletAddress: address,
        tasks: prev.tasks.map((t) =>
          t.id === 'task_connect_wallet' ? { ...t, completed: true, claimed: true } : t
        ),
        balance: prev.balance + 50000,
        totalMined: prev.totalMined + 50000,
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // WALLET: Disconnect TON
  const handleDisconnectWallet = () => {
    setState((prev) => {
      const updated = {
        ...prev,
        walletConnected: false,
        walletAddress: null,
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // SOUND TOGGLE
  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  // USERNAME UPDATE
  const handleUpdateUsername = (name: string) => {
    setState((prev) => {
      const updated = {
        ...prev,
        user: {
          ...prev.user,
          username: name,
          firstName: name,
        },
      };
      triggerAutoSync(updated);
      return updated;
    });
  };

  // RESET GAME
  const handleResetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const fresh = getInitialGameState();
    setState(fresh);
    triggerAutoSync(fresh);
  };

  // CLAIM OFFLINE EARNINGS
  const handleClaimOffline = () => {
    if (!offlineEarnings) return;
    setState((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + offlineEarnings.amount,
        totalMined: prev.totalMined + offlineEarnings.amount,
        lastOfflineEarningsCheck: Date.now(),
      };
      triggerAutoSync(updated);
      return updated;
    });
    setOfflineEarnings(null);
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Background Ambient Glow FX */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar Header */}
      <TopBar
        state={state}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSupabase={() => setShowSupabaseModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLevelDetails={() => setShowLevelModal(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-md mx-auto relative z-10">
        {activeTab === 'tap' && (
          <TapTab
            state={state}
            onTap={handleTap}
            floatingTexts={floatingTexts}
            onRemoveFloatingText={handleRemoveFloatingText}
            onTriggerRefill={handleTriggerRefill}
            onTriggerTurbo={handleTriggerTurbo}
          />
        )}

        {activeTab === 'mining' && (
          <MiningTab
            state={state}
            onUpgradeCard={handleUpgradeCard}
            onClaimDailyCombo={handleClaimDailyCombo}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            state={state}
            onClaimDailyStreak={handleClaimDailyStreak}
            onCompleteTask={handleCompleteTask}
            onClaimTaskReward={handleClaimTaskReward}
            onSolveCipher={handleSolveCipher}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletTab
            state={state}
            onConnectWallet={handleConnectWallet}
            onDisconnectWallet={handleDisconnectWallet}
          />
        )}
      </main>

      {/* Fixed Cyber Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} state={state} />

      {/* Offline Earnings Modal */}
      {offlineEarnings && (
        <OfflineEarningsModal
          amount={offlineEarnings.amount}
          offlineHours={offlineEarnings.hours}
          onClaim={handleClaimOffline}
        />
      )}

      {/* Supabase Integration Modal */}
      {showSupabaseModal && (
        <SupabaseModal
          state={state}
          onClose={() => setShowSupabaseModal(false)}
          onSyncSuccess={() => {
            setState((prev) => ({
              ...prev,
              supabaseSynced: true,
              lastSyncTimestamp: Date.now(),
            }));
          }}
        />
      )}

      {/* Level Progression Modal */}
      {showLevelModal && (
        <LevelDetailsModal
          currentPoints={state.totalMined}
          currentLevel={state.user.level}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          state={state}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onUpdateUsername={handleUpdateUsername}
          onResetGame={handleResetGame}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
