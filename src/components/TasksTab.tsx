import React, { useState } from 'react';
import { GameState, TaskItem } from '../types';
import {
  DAILY_STREAK_REWARDS,
  TODAY_CIPHER_CODE,
  TODAY_CIPHER_HINT,
  formatNumber,
} from '../lib/gameData';
import { sound } from '../lib/audio';
import {
  Calendar,
  Send,
  MessageSquare,
  Share2,
  Wallet,
  TrendingUp,
  Key,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Flame,
  Terminal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksTabProps {
  state: GameState;
  onClaimDailyStreak: () => void;
  onCompleteTask: (taskId: string) => void;
  onClaimTaskReward: (taskId: string) => void;
  onSolveCipher: () => void;
}

const TASK_ICON_MAP: Record<string, React.ReactNode> = {
  Calendar: <Calendar className="w-5 h-5 text-amber-400" />,
  Send: <Send className="w-5 h-5 text-sky-400" />,
  MessageSquare: <MessageSquare className="w-5 h-5 text-cyan-400" />,
  Share2: <Share2 className="w-5 h-5 text-blue-400" />,
  Wallet: <Wallet className="w-5 h-5 text-indigo-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  Key: <Key className="w-5 h-5 text-purple-400" />,
};

export const TasksTab: React.FC<TasksTabProps> = ({
  state,
  onClaimDailyStreak,
  onCompleteTask,
  onClaimTaskReward,
  onSolveCipher,
}) => {
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [cipherInput, setCipherInput] = useState('');
  const [cipherError, setCipherError] = useState(false);
  const [cipherSuccess, setCipherSuccess] = useState(false);

  // Check if daily streak can be claimed today
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const streakClaimedToday = state.lastStreakClaimDate === todayDateStr;
  const currentStreakDay = ((state.dailyStreak) % 7) + 1;

  const handleStreakClaim = () => {
    if (streakClaimedToday) return;
    sound.playClaim();
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.5 },
    });
    onClaimDailyStreak();
  };

  const handleStartTask = (task: TaskItem) => {
    if (task.completed) {
      if (!task.claimed) {
        sound.playClaim();
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        onClaimTaskReward(task.id);
      }
      return;
    }

    if (task.link) {
      window.open(task.link, '_blank');
    }

    // Set verifying state for 2 seconds to simulate Telegram bot validation
    setVerifyingTaskId(task.id);
    sound.triggerHaptic('medium');

    setTimeout(() => {
      setVerifyingTaskId(null);
      onCompleteTask(task.id);
      sound.playUpgrade();
    }, 2200);
  };

  // Secret cipher submission
  const handleVerifyCipher = (e: React.FormEvent) => {
    e.preventDefault();
    if (cipherInput.trim().toUpperCase() === TODAY_CIPHER_CODE) {
      setCipherSuccess(true);
      setCipherError(false);
      sound.playClaim();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
      onSolveCipher();
    } else {
      setCipherError(true);
      sound.playError();
      setTimeout(() => setCipherError(false), 2000);
    }
  };

  const cipherTask = state.tasks.find((t) => t.id === 'task_daily_cipher');
  const isCipherClaimed = cipherTask?.claimed || false;

  return (
    <div className="flex flex-col gap-3 py-2 px-3 max-w-md mx-auto w-full pb-20">
      {/* Header Banner */}
      <div className="text-center my-1">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          VIP Missions & Cipher
        </h2>
        <p className="text-xs text-slate-400">Complete tasks to earn huge instant coin injections</p>
      </div>

      {/* 1. Daily Streak Calendar (7 Days) */}
      <div className="bg-gradient-to-br from-[#131622] via-[#0f111a] to-[#0c0d12] border border-amber-400/25 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(245,238,56,0.1)]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Daily Protocol Streak</h3>
              <span className="text-[10px] text-slate-400">
                Current Streak: <strong className="text-amber-400">{state.dailyStreak} Days</strong>
              </span>
            </div>
          </div>

          <button
            id="tasks-claim-streak-btn"
            onClick={handleStreakClaim}
            disabled={streakClaimedToday}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold tracking-wide transition-all ${
              !streakClaimedToday
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse active:scale-95'
                : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed'
            }`}
          >
            {streakClaimedToday ? 'Claimed Today' : `Claim Day ${currentStreakDay}`}
          </button>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {DAILY_STREAK_REWARDS.map((reward, idx) => {
            const dayNum = idx + 1;
            const isCompleted = dayNum <= (state.dailyStreak % 7);
            const isToday = dayNum === currentStreakDay && !streakClaimedToday;

            return (
              <div
                key={dayNum}
                className={`flex flex-col items-center justify-center p-1 rounded-xl border text-center transition-all ${
                  isToday
                    ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-black/30 border-white/[0.06] text-slate-500'
                }`}
              >
                <span className="text-[9px] font-semibold">D{dayNum}</span>
                <span
                  className={`text-[10px] font-mono font-bold mt-0.5 ${
                    isCompleted ? 'text-emerald-400' : isToday ? 'text-amber-300' : 'text-slate-400'
                  }`}
                >
                  +{formatNumber(reward)}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-1" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Daily Secret Cyber Cipher (Hamster / Blum style) */}
      <div className="bg-gradient-to-br from-[#121829] via-[#0e1320] to-[#0c0d12] border border-cyan-500/30 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-300">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                Secret Cyber Cipher
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono">
                  +1,000,000 ₮
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">Crack today's encrypted codeword</p>
            </div>
          </div>
        </div>

        {isCipherClaimed ? (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cipher Solved: {TODAY_CIPHER_CODE} (+1,000,000 Claimed)</span>
          </div>
        ) : (
          <form onSubmit={handleVerifyCipher} className="flex flex-col gap-2">
            {/* Morse Code / Cipher Hint */}
            <div className="p-2 rounded-xl bg-black/50 border border-white/[0.06] text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Morse Signal Clue:</span>
              <span className="font-mono text-xs font-bold tracking-widest text-amber-300">
                {TODAY_CIPHER_HINT}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="cipher-input-box"
                maxLength={8}
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODEWORD"
                className={`w-full bg-black/40 border px-3 py-2 rounded-xl text-center font-mono font-bold tracking-widest text-sm text-white uppercase focus:outline-none transition-colors ${
                  cipherError
                    ? 'border-red-500 text-red-300'
                    : cipherSuccess
                    ? 'border-emerald-500 text-emerald-300'
                    : 'border-cyan-500/40 focus:border-cyan-400'
                }`}
              />
              <button
                type="submit"
                id="cipher-submit-btn"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shrink-0 active:scale-95"
              >
                DECODE
              </button>
            </div>
            {cipherError && (
              <span className="text-[10px] text-red-400 text-center">
                Invalid frequency! Check the Morse signal above.
              </span>
            )}
          </form>
        )}
      </div>

      {/* 3. Social & Task List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Special Missions ({state.tasks.filter((t) => t.id !== 'task_daily_cipher').length})
        </h3>

        {state.tasks
          .filter((t) => t.id !== 'task_daily_cipher')
          .map((task) => {
            const isVerifying = verifyingTaskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-[#11141d]/90 backdrop-blur-md border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-3 flex items-center justify-between gap-2.5 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center p-2 shrink-0">
                    {TASK_ICON_MAP[task.icon] || <Sparkles className="w-5 h-5 text-amber-400" />}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                    <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      +{formatNumber(task.reward)} ₮
                    </span>
                  </div>
                </div>

                {/* Task Action State Button */}
                {task.claimed ? (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                ) : task.completed ? (
                  <button
                    id={`claim-task-${task.id}`}
                    onClick={() => handleStartTask(task)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold shadow-[0_0_10px_rgba(250,204,21,0.4)] animate-bounce active:scale-95"
                  >
                    Claim
                  </button>
                ) : isVerifying ? (
                  <div className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-cyan-400 font-mono animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Checking...
                  </div>
                ) : (
                  <button
                    id={`start-task-${task.id}`}
                    onClick={() => handleStartTask(task)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Start</span>
                    {task.link && <ExternalLink className="w-3 h-3 text-slate-400" />}
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
