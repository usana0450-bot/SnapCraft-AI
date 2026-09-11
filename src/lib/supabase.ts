import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TelegramUser, UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

const LOCAL_STORAGE_KEY_PREFIX = 'snapcraft_user_';

export function getLocalFallbackUser(telegramUser: TelegramUser): UserProfile {
  const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${telegramUser.id}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  const initialProfile: UserProfile = {
    telegram_id: telegramUser.id,
    first_name: telegramUser.first_name,
    username: telegramUser.username || `user_${telegramUser.id}`,
    points: 350, // Welcome VIP bonus
    streak_count: 1,
    last_claim_date: null,
    spins_left: 3,
    vip_level: 'Silver',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${telegramUser.id}`, JSON.stringify(initialProfile));
  return initialProfile;
}

export function saveLocalFallbackUser(profile: UserProfile): void {
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${profile.telegram_id}`, JSON.stringify(profile));
}

/**
 * Fetch or auto-create user in Supabase 'users' table.
 * Falls back safely to localStorage if Supabase is not yet configured or on network error.
 */
export async function fetchOrCreateUser(
  telegramUser: TelegramUser
): Promise<{ profile: UserProfile; fromRemote: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      profile: getLocalFallbackUser(telegramUser),
      fromRemote: false,
      error: 'Supabase credentials not configured yet. Operating in high-speed local mode.',
    };
  }

  try {
    // 1. Fetch user by telegram_id
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Supabase fetch error, using local fallback:', fetchError.message);
      return {
        profile: getLocalFallbackUser(telegramUser),
        fromRemote: false,
        error: fetchError.message,
      };
    }

    if (existingUser) {
      const mergedProfile: UserProfile = {
        id: existingUser.id,
        telegram_id: existingUser.telegram_id,
        first_name: existingUser.first_name || telegramUser.first_name,
        username: existingUser.username || telegramUser.username || '',
        points: Number(existingUser.points ?? 350),
        streak_count: Number(existingUser.streak_count ?? 1),
        last_claim_date: existingUser.last_claim_date ?? null,
        spins_left: Number(existingUser.spins_left ?? 3),
        vip_level: existingUser.vip_level || 'Silver',
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at,
      };
      saveLocalFallbackUser(mergedProfile);
      return { profile: mergedProfile, fromRemote: true };
    }

    // 2. Auto-create new user
    const initialRecord = {
      telegram_id: telegramUser.id,
      first_name: telegramUser.first_name,
      username: telegramUser.username || `user_${telegramUser.id}`,
      points: 500, // VIP Signup Bonus
      streak_count: 1,
      last_claim_date: null,
      spins_left: 3,
      vip_level: 'Silver',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([initialRecord])
      .select()
      .single();

    if (insertError) {
      console.warn('Supabase user auto-create error:', insertError.message);
      const fallback = getLocalFallbackUser(telegramUser);
      return {
        profile: fallback,
        fromRemote: false,
        error: insertError.message,
      };
    }

    const createdProfile: UserProfile = {
      ...newUser,
      points: Number(newUser.points),
      streak_count: Number(newUser.streak_count),
      spins_left: Number(newUser.spins_left),
    };

    saveLocalFallbackUser(createdProfile);
    return { profile: createdProfile, fromRemote: true };
  } catch (err: any) {
    console.error('Unexpected error in fetchOrCreateUser:', err);
    return {
      profile: getLocalFallbackUser(telegramUser),
      fromRemote: false,
      error: err?.message || 'Connection failed',
    };
  }
}

/**
 * Live sync user state updates to Supabase
 */
export async function syncUserToSupabase(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  // Always update local cache first
  saveLocalFallbackUser(profile);

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase offline (using local storage)' };
  }

  try {
    const payload = {
      telegram_id: profile.telegram_id,
      first_name: profile.first_name,
      username: profile.username,
      points: profile.points,
      streak_count: profile.streak_count,
      last_claim_date: profile.last_claim_date,
      spins_left: profile.spins_left,
      vip_level: profile.vip_level,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'telegram_id' });

    if (error) {
      console.warn('Supabase sync warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Failed to sync to Supabase:', err);
    return { success: false, error: err?.message };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- SnapCraft AI: Telegram Mini App Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT,
  username TEXT,
  points BIGINT DEFAULT 350,
  streak_count INT DEFAULT 1,
  last_claim_date TEXT,
  spins_left INT DEFAULT 3,
  vip_level TEXT DEFAULT 'Silver',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the Telegram Mini App (with anon key)
CREATE POLICY "Public anonymous read and write"
  ON public.users
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
`;
