import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Gift,
  PlayCircle,
  Coins,
  AlertCircle,
  Trophy,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WheelSegment, UserProfile } from '../types';
import { triggerHaptic } from '../lib/telegram';

interface LuckyWheelTabProps {
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onRequestAd: (options: {
    placement: 'extra_spin' | 'bonus_points';
    title: string;
    subtitle: string;
    onRewarded: () => void;
  }) => void;
}

const SEGMENTS: WheelSegment[] = [
  { id: '1', label: '+500 PTS', rewardType: 'points', amount: 500, color: '#06b6d4', textColor: '#ffffff', probability: 0.15 },
  { id: '2', label: '+50 PTS', rewardType: 'points', amount: 50, color: '#1e1b4b', textColor: '#c7d2fe', probability: 0.3 },
  { id: '3', label: '2X BOOST', rewardType: 'points', amount: 300, color: '#9333ea', textColor: '#ffffff', probability: 0.1 },
  { id: '4', label: '1,000 VIP', rewardType: 'points', amount: 1000, color: '#f59e0b', textColor: '#0f172a', probability: 0.05 },
  { id: '5', label: '+100 PTS', rewardType: 'points', amount: 100, color: '#2563eb', textColor: '#ffffff', probability: 0.2 },
  { id: '6', label: 'MYSTERY BOX', rewardType: 'points', amount: 450, color: '#ec4899', textColor: '#ffffff', probability: 0.1 },
  { id: '7', label: '+250 PTS', rewardType: 'points', amount: 250, color: '#0d9488', textColor: '#ffffff', probability: 0.15 },
  { id: '8', label: 'FREE UPSCALE', rewardType: 'ai_credit', amount: 1, color: '#10b981', textColor: '#ffffff', probability: 0.1 },
];

export const LuckyWheelTab: React.FC<LuckyWheelTabProps> = ({
  profile,
  onUpdateProfile,
  onRequestAd,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [recentWins, setRecentWins] = useState<string[]>([
    '@alex_tg won +1,000 VIP Credits',
    '@crypto_ninja won 2X Multiplier',
    '@diana_art won Free 4K Upscale',
  ]);

  const numSegments = SEGMENTS.length;
  const degreesPerSegment = 360 / numSegments;

  const handleSpin = () => {
    if (isSpinning) return;

    if (profile.spins_left <= 0) {
      triggerHaptic('warning');
      onRequestAd({
        placement: 'extra_spin',
        title: '+1 Lucky Spin Added',
        subtitle: 'Monetag Ad Sponsor',
        onRewarded: () => {
          onUpdateProfile((prev) => ({
            ...prev,
            spins_left: prev.spins_left + 1,
          }));
        },
      });
      return;
    }

    triggerHaptic('heavy');
    setIsSpinning(true);
    setWinningSegment(null);

    // Pick random segment based on weights
    const selectedIndex = Math.floor(Math.random() * numSegments);
    const chosen = SEGMENTS[selectedIndex];

    // Pointer is at the top (270 degrees in standard polar coords or 0 with offset)
    // To land selectedIndex at the top pointer (0 deg):
    const targetSegmentCenter = selectedIndex * degreesPerSegment + degreesPerSegment / 2;
    // Extra full spins (5-8 full rotations)
    const extraSpins = 360 * 6;
    const finalRotation = rotationDegrees + extraSpins + (360 - (targetSegmentCenter % 360));

    setRotationDegrees(finalRotation);

    // After spin completion (4 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setWinningSegment(chosen);
      triggerHaptic('success');

      // Confetti burst
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#00f2fe', '#4facfe', '#9d4edd', '#f59e0b', '#10b981'],
      });

      // Update state & deduct spin
      onUpdateProfile((prev) => {
        const addedPoints = chosen.rewardType === 'points' ? chosen.amount : 150;
        return {
          ...prev,
          spins_left: Math.max(0, prev.spins_left - 1),
          points: prev.points + addedPoints,
        };
      });

      // Add to recent wins ticker
      setRecentWins((prev) => [
        `You won ${chosen.label}!`,
        ...prev.slice(0, 3),
      ]);
    }, 4200);
  };

  const handleWatchAdForSpin = () => {
    triggerHaptic('medium');
    onRequestAd({
      placement: 'extra_spin',
      title: '+1 Mystery Spin',
      subtitle: 'Instant Unlock',
      onRewarded: () => {
        onUpdateProfile((prev) => ({
          ...prev,
          spins_left: prev.spins_left + 1,
        }));
      },
    });
  };

  return (
    <div className="flex flex-col items-center px-4 py-3 max-w-md mx-auto pb-24 animate-fadeIn">
      {/* Title & Stats */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono-tech mb-1 glow-purple">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>CYBERPUNK MYSTERY WHEEL</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Lucky Spin & Drop
        </h2>
        <p className="text-xs text-slate-400">
          Spin to win VIP AI generation credits and instant multipliers
        </p>
      </div>

      {/* Wheel Stage Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-3">
        {/* Ambient Neon Backlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-600/25 to-pink-500/20 blur-xl -z-10" />

        {/* Pointer Needle at Top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-7 bg-gradient-to-b from-amber-300 to-amber-500 clip-triangle shadow-xl border-x border-t border-white/60 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow -mt-1.5" />
        </div>

        {/* Outer Wheel Rim */}
        <div className="relative w-full h-full rounded-full p-2.5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4200ms] ease-out will-change-transform"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.25, 1)',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SEGMENTS.map((seg, idx) => {
                const angle = 360 / numSegments;
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;

                // SVG Arc math
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                // Label center angle
                const midAngle = startAngle + angle / 2;
                const textRad = ((midAngle - 90) * Math.PI) / 180;
                const textX = 50 + 34 * Math.cos(textRad);
                const textY = 50 + 34 * Math.sin(textRad);

                return (
                  <g key={seg.id}>
                    <path
                      d={pathData}
                      fill={seg.color}
                      stroke="#0b0d1b"
                      strokeWidth="0.8"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={seg.textColor}
                      fontSize="4.2"
                      fontWeight="800"
                      fontFamily="Space Grotesk, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub & Action Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500 p-1 shadow-2xl flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-85 glow-purple z-10"
          >
            <div className="w-full h-full rounded-full bg-[#0d0f1e] flex flex-col items-center justify-center p-1 border border-white/20">
              <Zap className="w-4 h-4 text-cyan-300" />
              <span className="font-mono-tech font-extrabold text-[11px] tracking-wider text-white">
                {isSpinning ? 'SPINNING' : 'SPIN'}
              </span>
              <span className="text-[9px] text-cyan-300/90 font-mono-tech -mt-0.5">
                {profile.spins_left} left
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Action Bar: Spins Left & Monetag Rewarded Ad Button */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
        {/* Spin Counter */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono-tech">
                Available
              </div>
              <div className="text-sm font-bold text-white">
                {profile.spins_left} Free Spins
              </div>
            </div>
          </div>
        </div>

        {/* Watch Ad Button Hook */}
        <button
          onClick={handleWatchAdForSpin}
          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 text-left hover:brightness-110 active:scale-[0.98] transition-all glow-purple"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
              <PlayCircle className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="text-[10px] text-purple-300 font-mono-tech">
                MONETAG AD
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                +1 Free Spin
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded font-mono-tech">
            WATCH
          </span>
        </button>
      </div>

      {/* Winning Announcement Banner */}
      {winningSegment && (
        <div className="w-full mt-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/90 via-purple-950/90 to-slate-900 border border-cyan-400/50 glow-cyan flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-cyan-400/20 text-cyan-300">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] text-cyan-300 font-mono-tech uppercase">
                Congratulation Drop!
              </div>
              <div className="text-sm font-bold text-white">
                Received {winningSegment.label}
              </div>
            </div>
          </div>
          <button
            onClick={() => setWinningSegment(null)}
            className="text-xs px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-cyan-200 hover:bg-cyan-500/30"
          >
            Claimed
          </button>
        </div>
      )}

      {/* Live Recent Drops Ticker */}
      <div className="w-full mt-4 p-3 rounded-xl bg-slate-900/50 border border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-tech mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE DROP FEED</span>
        </div>
        <div className="space-y-1.5">
          {recentWins.map((win, i) => (
            <div
              key={i}
              className="text-[11px] text-slate-300 flex items-center justify-between py-0.5 border-b border-white/5 last:border-0"
            >
              <span className="truncate">{win}</span>
              <span className="text-[10px] text-slate-500 font-mono-tech">
                Just now
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
