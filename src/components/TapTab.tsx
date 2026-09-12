import React, { useState, useRef, useEffect } from 'react';
import { GameState, FloatingText } from '../types';
import { formatNumber } from '../lib/gameData';
import { sound } from '../lib/audio';
import { Zap, Flame, BatteryCharging, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TapTabProps {
  state: GameState;
  onTap: (x: number, y: number, value: number, isCritical?: boolean) => void;
  floatingTexts: FloatingText[];
  onRemoveFloatingText: (id: number) => void;
  onTriggerRefill: () => void;
  onTriggerTurbo: () => void;
}

export const TapTab: React.FC<TapTabProps> = ({
  state,
  onTap,
  floatingTexts,
  onRemoveFloatingText,
  onTriggerRefill,
  onTriggerTurbo,
}) => {
  const coinContainerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });
  const [isPressing, setIsPressing] = useState(false);
  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);

  // Anti-cheat tap rate monitoring
  const tapHistoryRef = useRef<number[]>([]);

  // Turbo countdown
  const isTurboActive = state.turboActiveUntil > Date.now();
  const [turboSecondsLeft, setTurboSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isTurboActive) {
      setTurboSecondsLeft(0);
      return;
    }
    const updateCountdown = () => {
      const left = Math.max(0, Math.ceil((state.turboActiveUntil - Date.now()) / 1000));
      setTurboSecondsLeft(left);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 500);
    return () => clearInterval(timer);
  }, [state.turboActiveUntil, isTurboActive]);

  // Handle tap with multi-touch support
  const processTapAtCoordinates = (clientX: number, clientY: number) => {
    // Check energy
    if (state.energy < 1) {
      sound.playError();
      return;
    }

    // Anti-cheat verification: max 18 taps per second
    const now = Date.now();
    tapHistoryRef.current = tapHistoryRef.current.filter((t) => now - t < 1000);
    if (tapHistoryRef.current.length >= 18) {
      setAntiCheatWarning('Tap velocity exceeded (Rate Limit). Relax cyber-fingers!');
      sound.playError();
      setTimeout(() => setAntiCheatWarning(null), 2500);
      return;
    }
    tapHistoryRef.current.push(now);

    // Calculate tap value with Turbo and Critical chance
    const isCritical = Math.random() < 0.08;
    const turboMultiplier = isTurboActive ? 5 : 1;
    const criticalMultiplier = isCritical ? 2 : 1;
    const finalTapValue = state.tapValue * turboMultiplier * criticalMultiplier;

    if (isCritical || isTurboActive) {
      sound.playCriticalTap();
    } else {
      sound.playTap();
    }

    // 3D Tilt calculation relative to coin center
    if (coinContainerRef.current) {
      const rect = coinContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (clientX - centerX) / (rect.width / 2);
      const deltaY = (clientY - centerY) / (rect.height / 2);

      // Invert Y delta for realistic 3D perspective rotation
      setTilt({
        x: -Math.max(-1, Math.min(1, deltaY)) * 14,
        y: Math.max(-1, Math.min(1, deltaX)) * 14,
        scale: 0.94,
      });

      setIsPressing(true);
      setTimeout(() => {
        setTilt({ x: 0, y: 0, scale: 1 });
        setIsPressing(false);
      }, 140);
    }

    onTap(clientX, clientY, finalTapValue, isCritical || isTurboActive);
  };

  // Touch start event for multi-touch (e.g. 2, 3 fingers)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent double-tap zoom
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches.item(i);
      if (touch) {
        processTapAtCoordinates(touch.clientX, touch.clientY);
      }
    }
  };

  // Mouse click fallback for desktop preview
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    processTapAtCoordinates(e.clientX, e.clientY);
  };

  const energyPercentage = Math.min(100, Math.max(0, (state.energy / state.maxEnergy) * 100));

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-145px)] py-3 px-4 max-w-md mx-auto w-full select-none">
      {/* Top Banner: Total Balance Display */}
      <div className="flex flex-col items-center justify-center my-1 w-full text-center">
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          CyberTap Reserve
        </span>
        <div className="flex items-center justify-center gap-2.5 mt-1">
          {/* Neon Token Icon */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-100 p-0.5 shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-full bg-[#0c0d12] flex items-center justify-center font-extrabold text-amber-300 text-base font-mono">
              ₮
            </div>
          </div>
          <span
            id="user-balance-display"
            className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-md"
          >
            {formatNumber(state.balance)}
          </span>
        </div>

        {/* Level Rank Indicator */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            Rank #{state.user.level} {state.user.rankTitle}
          </span>
        </div>
      </div>

      {/* Anti-cheat feedback alert if triggered */}
      {antiCheatWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-1.5 shadow-lg"
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>{antiCheatWarning}</span>
        </motion.div>
      )}

      {/* Central 3D Animated Clickable Coin */}
      <div className="relative my-auto py-4 flex items-center justify-center w-full max-w-[320px]">
        {/* Holographic Glowing Ambient Aura */}
        <div
          className={`absolute -inset-4 rounded-full blur-3xl opacity-35 transition-all duration-300 ${
            isTurboActive
              ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 opacity-60 scale-110'
              : 'bg-gradient-to-tr from-cyan-500 via-amber-400 to-indigo-600'
          }`}
        />

        {/* Orbiting Ring 1 */}
        <div className="absolute inset-0 -m-4 rounded-full border border-dashed border-cyan-400/20 animate-[spin_25s_linear_infinite] pointer-events-none" />

        {/* Orbiting Ring 2 */}
        <div className="absolute inset-0 -m-8 rounded-full border border-dotted border-amber-400/15 animate-[spin_35s_linear_infinite_reverse] pointer-events-none" />

        {/* 3D Coin Body with Interactive Click Feedback */}
        <div
          id="main-tap-coin"
          ref={coinContainerRef}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`,
            transition: isPressing ? 'transform 0.05s ease-out' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            touchAction: 'none',
          }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full cursor-pointer touch-none select-none p-3.5 bg-gradient-to-b from-[#2a2e3d] via-[#151821] to-[#0c0d12] border-4 border-amber-400/50 shadow-[0_0_40px_rgba(245,238,56,0.25)] flex items-center justify-center group"
        >
          {/* Inner Metallic Bezel Ring */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-400/20 to-amber-500/40 p-2.5 border border-amber-300/40 flex items-center justify-center shadow-inner">
            {/* Coin Face */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1b1f2e] via-[#10121a] to-[#08090d] border border-amber-400/30 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Circuit Board Shimmer Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f5d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Glossy Top Glass Highlight */}
              <div className="absolute -top-10 left-1/4 w-3/4 h-32 bg-gradient-to-b from-white/20 to-transparent rounded-full blur-sm -rotate-45 pointer-events-none" />

              {/* Turbo Flame overlay if active */}
              {isTurboActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-red-500/10 to-transparent animate-pulse pointer-events-none" />
              )}

              {/* Center Cyber Emblem (VIP Hamster / Cyber Eagle) */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-transparent border border-amber-400/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,238,56,0.3)]">
                  {/* Cyber Hamster Coin Icon */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_4px_12px_rgba(250,204,21,0.5)]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Ears */}
                    <circle cx="28" cy="28" r="16" fill="#f59e0b" />
                    <circle cx="28" cy="28" r="9" fill="#fef3c7" />
                    <circle cx="72" cy="28" r="16" fill="#f59e0b" />
                    <circle cx="72" cy="28" r="9" fill="#fef3c7" />
                    {/* Head */}
                    <path
                      d="M20 54C20 37.4315 33.4315 24 50 24C66.5685 24 80 37.4315 80 54C80 70.5685 66.5685 84 50 84C33.4315 84 20 70.5685 20 54Z"
                      fill="url(#hamsterGrad)"
                    />
                    {/* Cyber Visor */}
                    <path
                      d="M26 44C32 40 68 40 74 44C76 47 74 54 70 55C58 52 42 52 30 55C26 54 24 47 26 44Z"
                      fill="#00f5d4"
                      className="filter drop-shadow-[0_0_6px_#00f5d4]"
                    />
                    {/* Cheek Blushes */}
                    <circle cx="32" cy="62" r="5" fill="#f43f5e" opacity="0.6" />
                    <circle cx="68" cy="62" r="5" fill="#f43f5e" opacity="0.6" />
                    {/* Cute Nose & Whiskers */}
                    <polygon points="50,60 46,56 54,56" fill="#1e293b" />
                    <path d="M50 60L50 66M45 66C47 68 53 68 55 66" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    {/* Golden Cyber Coin Emblem */}
                    <circle cx="50" cy="74" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                    <defs>
                      <linearGradient id="hamsterGrad" x1="50" y1="24" x2="50" y2="84" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#fbbf24" />
                        <stop offset="1" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 uppercase drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]">
                  {isTurboActive ? 'TURBO 5X ACTIVE' : 'TAP TO MINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Numbers (+1 / +5) Spawned on Tap */}
        <AnimatePresence>
          {floatingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -90, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              onAnimationComplete={() => onRemoveFloatingText(item.id)}
              style={{
                position: 'fixed',
                left: item.x,
                top: item.y,
                pointerEvents: 'none',
                zIndex: 9999,
              }}
              className={`font-black font-mono select-none -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] ${
                item.isCritical
                  ? 'text-3xl text-orange-400 drop-shadow-[0_0_12px_#f97316]'
                  : 'text-2xl text-yellow-300 drop-shadow-[0_0_8px_#facc15]'
              }`}
            >
              +{item.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Energy Meter & Boosts */}
      <div className="w-full flex flex-col gap-2.5 mt-auto pt-2">
        {/* Real-Time Energy Bar */}
        <div className="bg-[#11131a]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>Energy</span>
            </div>
            <div className="flex items-center gap-1 text-slate-200 font-mono text-xs">
              <span className="font-bold text-white">{Math.floor(state.energy)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{state.maxEnergy}</span>
              <span className="text-[10px] text-emerald-400 ml-1">
                (+{state.energyRegenPerSec}/s)
              </span>
            </div>
          </div>

          {/* Glowing Energy Bar */}
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                energyPercentage > 30
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_10px_rgba(245,238,56,0.5)]'
                  : 'bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              }`}
              style={{ width: `${energyPercentage}%` }}
            />
          </div>
        </div>

        {/* Boosts Action Bar */}
        <div className="grid grid-cols-2 gap-2">
          {/* Daily Free Energy Refill */}
          <button
            id="boost-energy-refill-btn"
            onClick={onTriggerRefill}
            disabled={state.freeEnergyRefillsLeft <= 0 || state.energy >= state.maxEnergy}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
              state.freeEnergyRefillsLeft > 0 && state.energy < state.maxEnergy
                ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">Full Energy</span>
                <span className="text-[10px] text-slate-400">
                  {state.freeEnergyRefillsLeft}/3 left
                </span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              FREE
            </span>
          </button>

          {/* Turbo Overclock Boost */}
          <button
            id="boost-turbo-overclock-btn"
            onClick={onTriggerTurbo}
            disabled={isTurboActive}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
              isTurboActive
                ? 'bg-gradient-to-r from-orange-950/60 to-red-950/60 border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse'
                : 'bg-gradient-to-r from-orange-950/40 to-slate-900 border-orange-500/40 text-orange-300 hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">Turbo 5X</span>
                <span className="text-[10px] text-slate-400">
                  {isTurboActive ? `${turboSecondsLeft}s left` : '20s Boost'}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold font-mono">
              {isTurboActive ? 'ON' : 'GO'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
