export interface UserProfile {
  id: string;
  telegramId?: number;
  username: string;
  firstName: string;
  avatarUrl: string;
  isPremium: boolean;
  level: number;
  rankTitle: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
  isCritical?: boolean;
}

export interface MiningCard {
  id: string;
  title: string;
  category: 'tech' | 'markets' | 'legal' | 'special';
  description: string;
  icon: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  baseProfitPerHour: number;
  profitMultiplier: number;
  unlocked: boolean;
  requiredCardId?: string;
  requiredLevel?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  type: 'social' | 'daily' | 'action';
  link?: string;
  completed: boolean;
  claimed: boolean;
}

export interface DailyStreakDay {
  day: number;
  reward: number;
  claimed: boolean;
  isCurrent: boolean;
}

export interface GameState {
  balance: number;
  totalMined: number;
  energy: number;
  maxEnergy: number;
  energyRegenPerSec: number;
  tapValue: number;
  profitPerHour: number;
  lastTapTimestamp: number;
  lastEnergyUpdateTimestamp: number;
  lastOfflineEarningsCheck: number;
  user: UserProfile;
  cards: MiningCard[];
  tasks: TaskItem[];
  dailyStreak: number;
  lastStreakClaimDate: string;
  dailyComboSolved: boolean;
  dailyComboSelection: string[];
  turboActiveUntil: number;
  freeEnergyRefillsLeft: number;
  lastRefillDate: string;
  walletConnected: boolean;
  walletAddress: string | null;
  supabaseSynced: boolean;
  lastSyncTimestamp: number;
}
