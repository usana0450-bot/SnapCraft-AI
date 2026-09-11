export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface UserProfile {
  id?: string;
  telegram_id: number;
  first_name: string;
  username: string;
  points: number;
  streak_count: number;
  last_claim_date: string | null;
  spins_left: number;
  vip_level: 'Bronze' | 'Silver' | 'Gold' | 'VIP Diamond';
  created_at?: string;
  updated_at?: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  rewardType: 'points' | 'spins' | 'vip' | 'ai_credit';
  amount: number;
  color: string;
  textColor: string;
  probability: number; // weight
}

export interface TaskItem {
  id: string;
  title: string;
  reward: number;
  category: 'social' | 'creative' | 'invite' | 'ads';
  iconName: string;
  actionUrl?: string;
  completed: boolean;
  buttonLabel: string;
}

export type ActiveTab = 'ai-tools' | 'lucky-spin' | 'streaks' | 'profile';

export interface AdWatchReward {
  type: 'spin' | 'points' | 'double_streak';
  amount: number;
}
