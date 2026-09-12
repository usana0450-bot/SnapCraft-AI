import React, { useState } from 'react';
import { GameState, MiningCard } from '../types';
import {
  calculateCardCost,
  calculateCardProfit,
  calculateNextLevelProfit,
  formatNumber,
  TODAY_DAILY_COMBO_CARDS,
  DAILY_COMBO_REWARD,
} from '../lib/gameData';
import { sound } from '../lib/audio';
import {
  Cpu,
  Snowflake,
  Zap,
  Radio,
  TrendingUp,
  Bot,
  Coins,
  Briefcase,
  ShieldCheck,
  Lock,
  Landmark,
  Megaphone,
  Crown,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MiningTabProps {
  state: GameState;
  onUpgradeCard: (cardId: string) => void;
  onClaimDailyCombo: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5 text-cyan-400" />,
  Snowflake: <Snowflake className="w-5 h-5 text-sky-400" />,
  Zap: <Zap className="w-5 h-5 text-amber-400" />,
  Radio: <Radio className="w-5 h-5 text-purple-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  Bot: <Bot className="w-5 h-5 text-indigo-400" />,
  Coins: <Coins className="w-5 h-5 text-yellow-400" />,
  Briefcase: <Briefcase className="w-5 h-5 text-blue-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  Lock: <Lock className="w-5 h-5 text-rose-400" />,
  Landmark: <Landmark className="w-5 h-5 text-teal-400" />,
  Megaphone: <Megaphone className="w-5 h-5 text-pink-400" />,
  Crown: <Crown className="w-5 h-5 text-amber-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
};

export const MiningTab: React.FC<MiningTabProps> = ({
  state,
  onUpgradeCard,
  onClaimDailyCombo,
}) => {
  const [activeCategory, setActiveCategory] = useState<'tech' | 'markets' | 'legal' | 'special'>('tech');

  const categories = [
    { id: 'tech', label: 'Tech Rig', icon: '⚡' },
    { id: 'markets', label: 'Markets', icon: '📈' },
    { id: 'legal', label: 'Legal & ZK', icon: '🛡️' },
    { id: 'special', label: 'VIP Special', icon: '👑' },
  ] as const;

  const filteredCards = state.cards.filter((c) => c.category === activeCategory);

  // Daily Combo status calculation
  const comboCardsUnlockedCount = TODAY_DAILY_COMBO_CARDS.filter((id) =>
    state.dailyComboSelection.includes(id)
  ).length;

  const handleClaimCombo = () => {
    if (state.dailyComboSolved || comboCardsUnlockedCount < 3) return;
    sound.playClaim();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClaimDailyCombo();
  };

  return (
    <div className="flex flex-col gap-3 py-2 px-3 max-w-md mx-auto w-full pb-20">
      {/* Daily Combo 5,000,000 Bonus Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#16132b] to-indigo-950/60 border border-purple-500/30 rounded-2xl p-3 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Daily Mining Combo
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
            <span>+{formatNumber(DAILY_COMBO_REWARD)}</span>
            <span className="text-xs">₮</span>
          </div>
        </div>

        {/* 3 Mystery Card Slots */}
        <div className="grid grid-cols-3 gap-2 my-2">
          {TODAY_DAILY_COMBO_CARDS.map((cardId, index) => {
            const card = state.cards.find((c) => c.id === cardId);
            const isFound = state.dailyComboSelection.includes(cardId);

            return (
              <div
                key={cardId}
                className={`h-20 rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all text-center relative overflow-hidden ${
                  isFound
                    ? 'bg-gradient-to-b from-purple-900/40 to-slate-900 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-black/40 border-white/[0.08]'
                }`}
              >
                {isFound && card ? (
                  <>
                    <div className="p-1.5 rounded-lg bg-purple-500/20 mb-1">
                      {ICON_MAP[card.icon] || <Cpu className="w-4 h-4 text-purple-400" />}
                    </div>
                    <span className="text-[10px] font-bold text-white truncate w-full px-1">
                      {card.title}
                    </span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Found
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 mb-1">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Slot #{index + 1}</span>
                    <span className="text-[9px] text-purple-400/70">Upgrade to find</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Combo Progress & Claim Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Progress: <strong className="text-white">{comboCardsUnlockedCount}/3 cards</strong>
          </span>

          {state.dailyComboSolved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Claimed Today
            </span>
          ) : (
            <button
              id="mining-claim-combo-btn"
              onClick={handleClaimCombo}
              disabled={comboCardsUnlockedCount < 3}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold tracking-wide transition-all ${
                comboCardsUnlockedCount >= 3
                  ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-bounce cursor-pointer'
                  : 'bg-white/[0.05] border border-white/[0.08] text-slate-500 cursor-not-allowed'
              }`}
            >
              Claim +5M Bonus
            </button>
          )}
        </div>
      </div>

      {/* Categories Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#11131a] rounded-2xl border border-white/[0.08]">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`mining-tab-${cat.id}`}
            onClick={() => {
              sound.triggerHaptic('selection');
              setActiveCategory(cat.id);
            }}
            className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-b from-cyan-500/20 to-slate-800 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            <span className="truncate w-full text-center text-[10px]">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredCards.map((card) => {
          const cost = calculateCardCost(card);
          const currentProfit = calculateCardProfit(card);
          const nextProfit = calculateNextLevelProfit(card);
          const profitGain = nextProfit - currentProfit;
          const canAfford = state.balance >= cost;

          // Check lock requirement
          let isLocked = !card.unlocked;
          let lockReason = '';
          if (card.requiredCardId) {
            const reqCard = state.cards.find((c) => c.id === card.requiredCardId);
            if (reqCard && reqCard.level < (card.requiredLevel || 1)) {
              isLocked = true;
              lockReason = `Requires ${reqCard.title} Lv.${card.requiredLevel}`;
            } else {
              isLocked = false;
            }
          }

          return (
            <div
              key={card.id}
              className={`rounded-2xl border p-3 flex flex-col gap-2.5 transition-all relative overflow-hidden ${
                isLocked
                  ? 'bg-black/30 border-white/[0.05] opacity-75'
                  : 'bg-[#12151e]/90 backdrop-blur-md border-white/[0.08] hover:border-cyan-400/30 shadow-md'
              }`}
            >
              {/* Card Header: Icon, Title, Description, Level */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center p-2.5 shrink-0 border ${
                      isLocked
                        ? 'bg-white/[0.02] border-white/[0.06]'
                        : 'bg-gradient-to-br from-cyan-900/30 to-slate-900 border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-slate-500" />
                    ) : (
                      ICON_MAP[card.icon] || <Cpu className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{card.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-cyan-300 font-semibold">
                        Lv.{card.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Metrics & Upgrade Button */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Profit/Hour
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-cyan-300">
                    <span>+{formatNumber(currentProfit)}</span>
                    <span className="text-[10px] text-emerald-400">
                      (+{formatNumber(profitGain)})
                    </span>
                  </div>
                </div>

                {isLocked ? (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[150px]">{lockReason || 'Locked'}</span>
                  </div>
                ) : (
                  <button
                    id={`upgrade-card-${card.id}`}
                    onClick={() => {
                      if (canAfford) {
                        sound.playUpgrade();
                        onUpgradeCard(card.id);
                      } else {
                        sound.playError();
                      }
                    }}
                    disabled={!canAfford}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(250,204,21,0.3)] active:scale-95'
                        : 'bg-white/[0.04] text-slate-500 border border-white/[0.08] cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="font-mono">{formatNumber(cost)} ₮</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
