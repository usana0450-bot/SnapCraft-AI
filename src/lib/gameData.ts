import { MiningCard, TaskItem } from '../types';

export interface LevelThreshold {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
}

export const USER_LEVELS: LevelThreshold[] = [
  { level: 1, title: 'Bronze Miner', minPoints: 0, maxPoints: 5000, badgeColor: 'from-amber-700 to-amber-900' },
  { level: 2, title: 'Silver Hacker', minPoints: 5000, maxPoints: 25000, badgeColor: 'from-slate-400 to-slate-600' },
  { level: 3, title: 'Gold Operator', minPoints: 25000, maxPoints: 100000, badgeColor: 'from-yellow-400 to-amber-600' },
  { level: 4, title: 'Platinum Trader', minPoints: 100000, maxPoints: 500000, badgeColor: 'from-cyan-400 to-blue-600' },
  { level: 5, title: 'Diamond Whale', minPoints: 500000, maxPoints: 2000000, badgeColor: 'from-purple-400 to-indigo-600' },
  { level: 6, title: 'Master Node', minPoints: 2000000, maxPoints: 10000000, badgeColor: 'from-rose-500 to-purple-700' },
  { level: 7, title: 'Cyber Lord', minPoints: 10000000, maxPoints: 50000000, badgeColor: 'from-yellow-300 via-amber-400 to-emerald-400' },
];

export function getLevelForPoints(points: number): LevelThreshold {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= USER_LEVELS[i].minPoints) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
}

export const INITIAL_MINING_CARDS: MiningCard[] = [
  // Tech & Hardware
  {
    id: 'tech_quantum_asic',
    title: 'Quantum ASIC Node',
    category: 'tech',
    description: 'High-density quantum hash computation blade.',
    icon: 'Cpu',
    level: 1,
    baseCost: 250,
    costMultiplier: 1.85,
    baseProfitPerHour: 120,
    profitMultiplier: 1.4,
    unlocked: true,
  },
  {
    id: 'tech_nitrogen_cooling',
    title: 'Sub-Zero Cryo Rig',
    category: 'tech',
    description: 'Liquid nitrogen overclocking for maximum gigahash throughput.',
    icon: 'Snowflake',
    level: 0,
    baseCost: 1200,
    costMultiplier: 2.0,
    baseProfitPerHour: 480,
    profitMultiplier: 1.45,
    unlocked: true,
  },
  {
    id: 'tech_neural_blade',
    title: 'Neural Matrix Core',
    category: 'tech',
    description: 'AI model predicting optimal hash routing across peer blocks.',
    icon: 'Zap',
    level: 0,
    baseCost: 5000,
    costMultiplier: 2.1,
    baseProfitPerHour: 1800,
    profitMultiplier: 1.5,
    unlocked: false,
    requiredCardId: 'tech_quantum_asic',
    requiredLevel: 3,
  },
  {
    id: 'tech_orbital_uplink',
    title: 'Orbital Starlink Node',
    category: 'tech',
    description: 'Direct low-latency microwave uplink to low-earth orbit validators.',
    icon: 'Radio',
    level: 0,
    baseCost: 25000,
    costMultiplier: 2.2,
    baseProfitPerHour: 7500,
    profitMultiplier: 1.55,
    unlocked: false,
    requiredCardId: 'tech_nitrogen_cooling',
    requiredLevel: 4,
  },

  // VIP Markets
  {
    id: 'market_dex_pool',
    title: 'TON DEX Liquidity Pool',
    category: 'markets',
    description: 'Provide automated market making depth for $CYBER/TON pairs.',
    icon: 'TrendingUp',
    level: 1,
    baseCost: 400,
    costMultiplier: 1.9,
    baseProfitPerHour: 180,
    profitMultiplier: 1.42,
    unlocked: true,
  },
  {
    id: 'market_arbitrage_bot',
    title: 'Darkpool Arbitrage Bot',
    category: 'markets',
    description: 'Microsecond cross-exchange delta neutral arbitrage solver.',
    icon: 'Bot',
    level: 0,
    baseCost: 2800,
    costMultiplier: 2.05,
    baseProfitPerHour: 950,
    profitMultiplier: 1.48,
    unlocked: true,
  },
  {
    id: 'market_flash_loan',
    title: 'Flash Loan Synthesizer',
    category: 'markets',
    description: 'Zero-capital liquidity bundle exploiting instantaneous pricing.',
    icon: 'Coins',
    level: 0,
    baseCost: 12000,
    costMultiplier: 2.15,
    baseProfitPerHour: 4200,
    profitMultiplier: 1.52,
    unlocked: false,
    requiredCardId: 'market_dex_pool',
    requiredLevel: 3,
  },
  {
    id: 'market_hedge_fund',
    title: 'Hamster Alpha Syndicate',
    category: 'markets',
    description: 'Autonomous multi-chain market maker skimming global orderflow.',
    icon: 'Briefcase',
    level: 0,
    baseCost: 65000,
    costMultiplier: 2.3,
    baseProfitPerHour: 19000,
    profitMultiplier: 1.6,
    unlocked: false,
    requiredCardId: 'market_arbitrage_bot',
    requiredLevel: 4,
  },

  // Legal & Compliance
  {
    id: 'legal_dubai_license',
    title: 'Dubai VARA License',
    category: 'legal',
    description: 'Official Tier-1 digital asset operating certification.',
    icon: 'ShieldCheck',
    level: 0,
    baseCost: 3500,
    costMultiplier: 2.0,
    baseProfitPerHour: 1250,
    profitMultiplier: 1.45,
    unlocked: true,
  },
  {
    id: 'legal_zk_audit',
    title: 'Zero-Knowledge Security Audit',
    category: 'legal',
    description: 'Formal mathematical contract verification to prevent exploits.',
    icon: 'Lock',
    level: 0,
    baseCost: 15000,
    costMultiplier: 2.1,
    baseProfitPerHour: 4900,
    profitMultiplier: 1.5,
    unlocked: false,
    requiredCardId: 'legal_dubai_license',
    requiredLevel: 2,
  },
  {
    id: 'legal_offshore_entity',
    title: 'Cayman Crypto Trust',
    category: 'legal',
    description: 'Tax-exempt corporate vault preserving 100% mining dividends.',
    icon: 'Landmark',
    level: 0,
    baseCost: 50000,
    costMultiplier: 2.25,
    baseProfitPerHour: 16500,
    profitMultiplier: 1.55,
    unlocked: false,
    requiredCardId: 'legal_zk_audit',
    requiredLevel: 3,
  },

  // Special & VIP
  {
    id: 'special_tg_influencer',
    title: 'Telegram VIP KOL Campaign',
    category: 'special',
    description: 'Viral broadcasts reaching 5,000,000 tap-to-earn degenerates.',
    icon: 'Megaphone',
    level: 0,
    baseCost: 8000,
    costMultiplier: 2.1,
    baseProfitPerHour: 2800,
    profitMultiplier: 1.48,
    unlocked: true,
  },
  {
    id: 'special_whale_club',
    title: 'Secret Whale Telegram Group',
    category: 'special',
    description: 'Insider allocations and early pre-market token access.',
    icon: 'Crown',
    level: 0,
    baseCost: 38000,
    costMultiplier: 2.25,
    baseProfitPerHour: 12000,
    profitMultiplier: 1.55,
    unlocked: false,
    requiredCardId: 'special_tg_influencer',
    requiredLevel: 3,
  },
  {
    id: 'special_lambo_fleet',
    title: 'Neon Cyber Fleet',
    category: 'special',
    description: 'Status vehicle fleet demonstrating absolute tap dominance.',
    icon: 'Flame',
    level: 0,
    baseCost: 150000,
    costMultiplier: 2.4,
    baseProfitPerHour: 45000,
    profitMultiplier: 1.65,
    unlocked: false,
    requiredCardId: 'special_whale_club',
    requiredLevel: 3,
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task_daily_checkin',
    title: 'Daily Protocol Check-in',
    description: 'Claim your consecutive daily streak reward.',
    reward: 5000,
    icon: 'Calendar',
    type: 'daily',
    completed: true,
    claimed: false,
  },
  {
    id: 'task_tg_channel',
    title: 'Join CyberTap Telegram Channel',
    description: 'Receive breaking airdrop news and daily combo announcements.',
    reward: 25000,
    icon: 'Send',
    type: 'social',
    link: 'https://t.me/telegram',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_tg_chat',
    title: 'Join VIP Telegram Chat',
    description: 'Connect with 200K+ top-tier miners and alpha traders.',
    reward: 20000,
    icon: 'MessageSquare',
    type: 'social',
    link: 'https://t.me/telegram',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_x_follow',
    title: 'Follow CyberTap on X / Twitter',
    description: 'Never miss an airdrop milestone or token listing update.',
    reward: 20000,
    icon: 'Share2',
    type: 'social',
    link: 'https://twitter.com',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_connect_wallet',
    title: 'Connect TON Wallet',
    description: 'Bind your Tonkeeper or Telegram Wallet to qualify for Airdrop Phase 1.',
    reward: 50000,
    icon: 'Wallet',
    type: 'action',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_upgrade_cards',
    title: 'Upgrade 5 Mining Cards',
    description: 'Boost your passive profit per hour engine.',
    reward: 35000,
    icon: 'TrendingUp',
    type: 'action',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_daily_cipher',
    title: 'Crack Today’s Cyber Cipher',
    description: 'Decode the secret 5-letter password to win 1,000,000 coins.',
    reward: 1000000,
    icon: 'Key',
    type: 'daily',
    completed: false,
    claimed: false,
  },
];

export const DAILY_STREAK_REWARDS = [
  500,
  1000,
  2500,
  5000,
  15000,
  25000,
  100000,
];

// Today's Daily Combo cards (Finding all 3 awards 5,000,000 coins)
export const TODAY_DAILY_COMBO_CARDS = [
  'tech_quantum_asic',
  'market_arbitrage_bot',
  'legal_dubai_license',
];
export const DAILY_COMBO_REWARD = 5000000;

// Today's Secret Cipher Code
export const TODAY_CIPHER_CODE = 'CYBER';
export const TODAY_CIPHER_HINT = 'C (— · — ·)  Y (— · — —)  B (— · · ·)  E (·)  R (· — ·)';

export function calculateCardCost(card: MiningCard): number {
  return Math.floor(card.baseCost * Math.pow(card.costMultiplier, card.level));
}

export function calculateCardProfit(card: MiningCard): number {
  if (card.level === 0) return 0;
  return Math.floor(card.baseProfitPerHour * Math.pow(card.profitMultiplier, card.level - 1));
}

export function calculateNextLevelProfit(card: MiningCard): number {
  return Math.floor(card.baseProfitPerHour * Math.pow(card.profitMultiplier, card.level));
}

export function calculateTotalProfitPerHour(cards: MiningCard[]): number {
  return cards.reduce((acc, card) => acc + calculateCardProfit(card), 0);
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return Math.floor(num).toLocaleString('en-US');
}
