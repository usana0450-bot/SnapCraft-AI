import React, { useState, useEffect } from 'react';
import { X, Play, Award, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../lib/telegram';

interface MonetagAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
  rewardTitle: string;
  rewardSubtitle: string;
}

export const MonetagAdModal: React.FC<MonetagAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  rewardTitle,
  rewardSubtitle,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setIsCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = () => {
    triggerHaptic('heavy');
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f2fe', '#4facfe', '#9d4edd', '#f59e0b'],
    });
    onRewardClaimed();
    onClose();
  };

  const handleEarlyClose = () => {
    if (!isCompleted) {
      const confirmClose = window.confirm(
        'Warning: Leaving now will forfeit your reward! Are you sure?'
      );
      if (!confirmClose) return;
    }
    triggerHaptic('warning');
    onClose();
  };

  const progressPercent = ((5 - secondsLeft) / 5) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111322] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl overflow-hidden glow-cyan">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-mono-tech text-cyan-400">
            <Play className="w-3.5 h-3.5 fill-cyan-400 animate-pulse" />
            <span>MONETAG REWARDED AD</span>
          </div>

          <button
            onClick={handleEarlyClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full my-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Ad Video Content Simulator */}
        <div className="relative rounded-xl overflow-hidden aspect-video bg-gradient-to-tr from-purple-950 via-slate-900 to-cyan-950 border border-white/10 flex flex-col items-center justify-center p-4 text-center">
          {/* Animated sponsor graphic */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white mb-2 shadow-lg glow-purple">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide">
            SnapCraft Neural Pro™
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 max-w-[220px]">
            Instant 4K Generative Upscaling & Neural Retouching for Telegram Creators
          </p>

          {/* Countdown badge overlay */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded-full text-[10px] font-mono-tech text-cyan-300 border border-white/10">
            {isCompleted ? 'Reward Ready!' : `Ad: ${secondsLeft}s`}
          </div>
        </div>

        {/* Reward Status Section */}
        <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Guaranteed Reward:</div>
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                {rewardTitle}
              </div>
            </div>
            <div className="text-[11px] font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">
              {rewardSubtitle}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 glow-cyan"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              Claim Reward Now!
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs text-slate-400 bg-slate-900/60 border border-white/5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Watch until 0s to unlock reward...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
