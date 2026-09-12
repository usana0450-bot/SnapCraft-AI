import React from 'react';
import { formatNumber } from '../lib/gameData';
import { sound } from '../lib/audio';
import { Sparkles, Coins, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OfflineEarningsModalProps {
  amount: number;
  offlineHours: number;
  onClaim: () => void;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  amount,
  offlineHours,
  onClaim,
}) => {
  const handleClaim = () => {
    sound.playClaim();
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.5 },
    });
    onClaim();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#121520] border-2 border-amber-400/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(250,204,21,0.25)] flex flex-col items-center text-center relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Holographic Chest / Token Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-[0_0_25px_rgba(250,204,21,0.5)] mb-3">
          <div className="w-full h-full rounded-[14px] bg-[#0c0d12] flex items-center justify-center">
            <Coins className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        <h3 className="text-xl font-black text-white flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Offline Profits Ready!
        </h3>

        <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
          While you were away for {offlineHours.toFixed(1)}h, your mining rigs operated at peak capacity!
        </p>

        {/* Claim Amount Pill */}
        <div className="my-5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center gap-2 shadow-inner">
          <span className="text-3xl font-black font-mono text-amber-300 tracking-tight">
            +{formatNumber(amount)}
          </span>
          <span className="text-base font-bold text-amber-400 font-mono">₮</span>
        </div>

        <button
          id="claim-offline-earnings-btn"
          onClick={handleClaim}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:brightness-110 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(250,204,21,0.4)] active:scale-98 transition-all"
        >
          Collect & Continue
        </button>

        <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" /> Max offline accumulation capped at 3 hours
        </span>
      </div>
    </div>
  );
};
