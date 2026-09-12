import React from 'react';
import { USER_LEVELS, formatNumber } from '../lib/gameData';
import { Trophy, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface LevelDetailsModalProps {
  currentPoints: number;
  currentLevel: number;
  onClose: () => void;
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({
  currentPoints,
  currentLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm bg-[#121520] border border-amber-400/30 rounded-3xl p-5 shadow-[0_0_35px_rgba(250,204,21,0.2)] flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Miner Tier Ranks</h3>
          </div>
          <button
            id="close-level-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/[0.04]"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Rank up by accumulating total mined reserves. Higher ranks unlock exclusive mining hardware and airdrop tier multipliers!
        </p>

        <div className="flex flex-col gap-2 mt-1">
          {USER_LEVELS.map((tier) => {
            const isCurrent = tier.level === currentLevel;
            const isUnlocked = currentPoints >= tier.minPoints;

            return (
              <div
                key={tier.level}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-transparent border-amber-400/60 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                    : isUnlocked
                    ? 'bg-white/[0.03] border-white/[0.08] opacity-80'
                    : 'bg-black/40 border-white/[0.04] opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.badgeColor} flex items-center justify-center text-xs font-black text-white shadow-sm`}>
                    {tier.level}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{tier.title}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      From {formatNumber(tier.minPoints)} ₮
                    </span>
                  </div>
                </div>

                {isUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
