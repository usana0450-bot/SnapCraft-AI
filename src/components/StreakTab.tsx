import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  ExternalLink,
  Users,
  Send,
  Camera,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, TaskItem } from '../types';
import { triggerHaptic, openExternalUrl } from '../lib/telegram';

interface StreakTabProps {
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onRequestAd: (options: {
    placement: 'double_streak' | 'bonus_points';
    title: string;
    subtitle: string;
    onRewarded: () => void;
  }) => void;
  onNavigateToAi: () => void;
}

const STREAK_DAYS = [
  { day: 1, points: 50, bonus: null },
  { day: 2, points: 100, bonus: null },
  { day: 3, points: 175, bonus: null },
  { day: 4, points: 250, bonus: '+1 Spin' },
  { day: 5, points: 350, bonus: null },
  { day: 6, points: 500, bonus: '2X Boost' },
  { day: 7, points: 1200, bonus: 'JACKPOT + 2 SPINS' },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'join_channel',
    title: 'Join SnapCraft Telegram Community',
    reward: 150,
    category: 'social',
    iconName: 'send',
    actionUrl: 'https://t.me/telegram',
    completed: false,
    buttonLabel: 'Join +150',
  },
  {
    id: 'follow_x',
    title: 'Follow @SnapCraftAI on X/Twitter',
    reward: 100,
    category: 'social',
    iconName: 'external',
    actionUrl: 'https://twitter.com',
    completed: false,
    buttonLabel: 'Follow +100',
  },
  {
    id: 'try_ai_remover',
    title: 'Cutout 1 AI Photo in Studio',
    reward: 200,
    category: 'creative',
    iconName: 'camera',
    completed: false,
    buttonLabel: 'Open Studio',
  },
  {
    id: 'invite_creators',
    title: 'Invite 3 Friends to Telegram Mini App',
    reward: 500,
    category: 'invite',
    iconName: 'users',
    completed: false,
    buttonLabel: 'Invite +500',
  },
];

export const StreakTab: React.FC<StreakTabProps> = ({
  profile,
  onUpdateProfile,
  onRequestAd,
  onNavigateToAi,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('snapcraft_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.last_claim_date === todayStr;

  const currentStreakDay = Math.min(profile.streak_count, 7);
  const nextReward = STREAK_DAYS[currentStreakDay - 1] || STREAK_DAYS[0];

  const handleClaimStreak = (isDouble = false) => {
    if (isClaimedToday && !isDouble) return;

    triggerHaptic('heavy');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#f59e0b', '#ec4899', '#06b6d4', '#10b981'],
    });

    const basePts = nextReward.points;
    const finalPts = isDouble ? basePts * 2 : basePts;
    const extraSpins = currentStreakDay === 7 ? 2 : currentStreakDay === 4 ? 1 : 0;

    onUpdateProfile((prev) => {
      const nextCount = prev.streak_count >= 7 ? 1 : prev.streak_count + 1;
      return {
        ...prev,
        points: prev.points + finalPts,
        streak_count: isClaimedToday ? prev.streak_count : nextCount,
        last_claim_date: todayStr,
        spins_left: prev.spins_left + extraSpins,
      };
    });
  };

  const handleDoubleWithAd = () => {
    triggerHaptic('medium');
    onRequestAd({
      placement: 'double_streak',
      title: `Double Streak Bonus (+${nextReward.points * 2} PTS)`,
      subtitle: 'Monetag Rewarded Bonus',
      onRewarded: () => {
        handleClaimStreak(true);
      },
    });
  };

  const handleSimulateNextDay = () => {
    triggerHaptic('light');
    // Set last claim date to yesterday
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    onUpdateProfile((prev) => ({
      ...prev,
      last_claim_date: yesterday,
    }));
  };

  const handleSimulateMissedDay = () => {
    triggerHaptic('warning');
    // Missed streak: reset to 1
    onUpdateProfile((prev) => ({
      ...prev,
      streak_count: 1,
      last_claim_date: null,
    }));
  };

  const handleTaskAction = (task: TaskItem) => {
    if (task.completed) return;
    triggerHaptic('medium');

    if (task.id === 'try_ai_remover') {
      onNavigateToAi();
      return;
    }

    if (task.actionUrl) {
      openExternalUrl(task.actionUrl);
    }

    // Award task reward after small delay
    setTimeout(() => {
      const updated = tasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t));
      setTasks(updated);
      localStorage.setItem('snapcraft_tasks', JSON.stringify(updated));

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#9333ea'],
      });

      onUpdateProfile((prev) => ({
        ...prev,
        points: prev.points + task.reward,
      }));
    }, 600);
  };

  return (
    <div className="flex flex-col px-4 py-3 max-w-md mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono-tech mb-1 glow-amber">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>DAILY HABIT ENGINE</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>{profile.streak_count} Day Streak</span>
          <span className="text-amber-400">🔥</span>
        </h2>
        <p className="text-xs text-slate-400">
          Check in every 24 hours to scale points & unlock VIP multipliers
        </p>
      </div>

      {/* Loss Aversion Warning Banner */}
      <div className="w-full p-3 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/60 border border-red-500/30 mb-4 flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
            Loss Aversion Alert
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
            Miss 1 day and your current <strong className="text-white">{profile.streak_count}-day streak</strong> resets to Day 1. Keep your streak multiplier alive!
          </p>
        </div>
      </div>

      {/* 7-Day Progressive Streak Ladder */}
      <div className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono-tech text-slate-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            7-Day Streak Journey
          </span>
          <span className="text-cyan-400 font-mono-tech font-bold text-[11px]">
            {isClaimedToday ? 'Day Claimed' : 'Reward Ready'}
          </span>
        </div>

        {/* 7-day grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {STREAK_DAYS.map((item) => {
            const isCompleted = item.day < currentStreakDay;
            const isCurrent = item.day === currentStreakDay;

            return (
              <div
                key={item.day}
                className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl text-center border transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-500/20 to-purple-500/20 border-amber-400/80 shadow-lg glow-amber'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/60 border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-mono-tech uppercase">
                  D{item.day}
                </span>

                <div className="my-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>

                <span
                  className={`text-[9px] font-bold font-mono-tech ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  +{item.points}
                </span>

                {item.bonus && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1 py-0 bg-purple-500 text-[8px] text-white rounded font-mono-tech whitespace-nowrap shadow">
                    VIP
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Buttons Cluster */}
        <div className="mt-4 space-y-2">
          {!isClaimedToday ? (
            <button
              onClick={() => handleClaimStreak(false)}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-amber shadow-lg"
            >
              <Flame className="w-4 h-4 text-slate-950" />
              <span>Claim Day {currentStreakDay} Reward (+{nextReward.points} PTS)</span>
            </button>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Day {currentStreakDay} Claimed! Next Reward in ~24h</span>
            </div>
          )}

          {/* Monetag Rewarded Ad Double Bonus Button */}
          <button
            onClick={handleDoubleWithAd}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 border border-purple-400/50 text-purple-200 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-purple"
          >
            <Play className="w-3.5 h-3.5 fill-purple-300 text-purple-300" />
            <span>Claim 2X Double Bonus (+{nextReward.points * 2} PTS) with Ad</span>
          </button>
        </div>

        {/* Test Simulator Controls (Allows evaluating consecutive vs reset behavior) */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono-tech text-[10px]">PREVIEW TESTING:</span>
          <div className="flex gap-2">
            <button
              onClick={handleSimulateNextDay}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-[10px]"
            >
              ⏩ Advance 1 Day
            </button>
            <button
              onClick={handleSimulateMissedDay}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/20 text-[10px]"
            >
              🔄 Reset Streak
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bounty Tasks */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Daily Reward Bounties
          </h3>
          <span className="text-[11px] text-slate-400 font-mono-tech">
            Fast Points
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {task.iconName === 'send' ? (
                    <Send className="w-4 h-4" />
                  ) : task.iconName === 'camera' ? (
                    <Camera className="w-4 h-4" />
                  ) : task.iconName === 'users' ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white leading-snug">
                    {task.title}
                  </h4>
                  <span className="text-[10px] text-amber-400 font-mono-tech">
                    +{task.reward} PTS REWARD
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleTaskAction(task)}
                disabled={task.completed}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  task.completed
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 active:scale-95'
                }`}
              >
                {task.completed ? 'Done ✓' : task.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
