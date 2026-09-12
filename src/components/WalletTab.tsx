import React, { useState } from 'react';
import { GameState } from '../types';
import { formatNumber } from '../lib/gameData';
import { sound } from '../lib/audio';
import {
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletTabProps {
  state: GameState;
  onConnectWallet: (address: string) => void;
  onDisconnectWallet: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  state,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!state.walletAddress) return;
    navigator.clipboard.writeText(state.walletAddress);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateConnect = (providerName: string) => {
    sound.playUpgrade();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    // Generate simulated TON address
    const randomHex = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 6)
    ).join('');
    const sampleAddress = `EQB${randomHex.toUpperCase()}9xK2`;
    onConnectWallet(sampleAddress);
    setShowConnectModal(false);
  };

  // Estimated $CYBER token allocation based on gameplay metrics
  const estimatedAirdropTokens = Math.floor(
    state.profitPerHour * 0.45 + state.totalMined * 0.05 + (state.walletConnected ? 5000 : 0)
  );

  return (
    <div className="flex flex-col gap-3 py-2 px-3 max-w-md mx-auto w-full pb-20">
      {/* Header Banner */}
      <div className="text-center my-1">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
          <Wallet className="w-4 h-4 text-cyan-400" />
          TON Wallet & Airdrop
        </h2>
        <p className="text-xs text-slate-400">
          Connect your TON ecosystem wallet to guarantee $CYBER distribution
        </p>
      </div>

      {/* TON Wallet Card */}
      <div className="bg-gradient-to-br from-[#12192c] via-[#0f1422] to-[#0c0d12] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full rounded-[10px] bg-[#0c0d12] flex items-center justify-center">
                {/* TON Diamond Logo */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400 fill-current">
                  <path d="M12 2L2 9.5L12 22L22 9.5L12 2ZM12 4.6L18.8 9.5L12 13.5L5.2 9.5L12 4.6Z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">TON Connect</h3>
              <span className="text-[10px] text-cyan-300 font-mono">The Open Network</span>
            </div>
          </div>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
              state.walletConnected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                state.walletConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            {state.walletConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {state.walletConnected && state.walletAddress ? (
          <div className="flex flex-col gap-2.5">
            <div className="bg-black/50 border border-white/[0.08] rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Bound Address
                </span>
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {state.walletAddress.slice(0, 6)}...{state.walletAddress.slice(-6)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="wallet-copy-address-btn"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
                  title="Copy TON Address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  id="wallet-disconnect-btn"
                  onClick={() => {
                    sound.triggerHaptic('medium');
                    onDisconnectWallet();
                  }}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 text-center font-semibold">
                Address copied to clipboard!
              </span>
            )}
          </div>
        ) : (
          <button
            id="wallet-connect-trigger-btn"
            onClick={() => {
              sound.triggerHaptic('light');
              setShowConnectModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect TON Wallet</span>
          </button>
        )}
      </div>

      {/* Airdrop Allocation Estimator Card */}
      <div className="bg-gradient-to-br from-[#1b172a] via-[#12111d] to-[#0c0d12] border border-amber-400/25 rounded-2xl p-4 shadow-[0_0_20px_rgba(245,238,56,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Projected $CYBER Allocation</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
            Phase 1
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-3xl font-black font-mono text-white tracking-tight">
            {formatNumber(estimatedAirdropTokens)}
          </span>
          <span className="text-sm font-bold text-amber-400 font-mono">$CYBER</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Calculated dynamically from Profit/Hour, tasks completed, and wallet binding.
        </p>

        {/* Allocation Factors Breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Profit / Hr</span>
              <span className="text-xs font-bold text-white font-mono">
                +{formatNumber(state.profitPerHour)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Tasks Done</span>
              <span className="text-xs font-bold text-white font-mono">
                {state.tasks.filter((t) => t.claimed).length}/{state.tasks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap & Phases */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Airdrop Protocol Roadmap
        </h3>

        <div className="flex flex-col gap-3 relative pl-3 border-l border-white/10 ml-2">
          <div className="relative">
            <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
            <span className="text-xs font-bold text-emerald-300">Phase 1: Tap & Mining Rig</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Accumulate points, upgrade cards, and build continuous passive income.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300">Phase 2: On-Chain Snapshot</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Wallet eligibility snapshot and dynamic anti-sybil validation.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span className="text-xs font-bold text-slate-400">Phase 3: TGE & CEX Listings</span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Official listing on Binance, OKX, and Bybit. Direct claim to Telegram Wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121520] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Select TON Wallet
              </h3>
              <button
                id="close-wallet-modal-btn"
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/[0.04]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose your preferred TON wallet provider to connect with CyberTap.
            </p>

            <div className="flex flex-col gap-2 mt-1">
              {[
                { name: 'Telegram Wallet (@wallet)', icon: '✈️', color: 'from-sky-500/20 to-blue-600/20' },
                { name: 'Tonkeeper', icon: '💎', color: 'from-cyan-500/20 to-sky-600/20' },
                { name: 'MyTonWallet', icon: '⚡', color: 'from-indigo-500/20 to-purple-600/20' },
                { name: 'OpenMask TON', icon: '🦊', color: 'from-amber-500/20 to-orange-600/20' },
              ].map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => simulateConnect(provider.name)}
                  className={`flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r ${provider.color} border border-white/[0.08] hover:border-cyan-400/40 transition-all text-left group`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{provider.icon}</span>
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {provider.name}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
