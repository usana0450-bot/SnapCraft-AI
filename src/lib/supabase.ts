import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameState } from '../types';

// Retrieve environment credentials or user-configured runtime values
export const getSupabaseConfig = () => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  const envUrl = env?.VITE_SUPABASE_URL || '';
  const envKey = env?.VITE_SUPABASE_ANON_KEY || '';

  // Check if saved in localStorage
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('cybertap_supabase_url') : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('cybertap_supabase_key') : '';

  const url = (envUrl && envUrl.trim() !== '') ? envUrl : (localUrl || '');
  const anonKey = (envKey && envKey.trim() !== '') ? envKey : (localKey || '');

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const resetSupabaseClient = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cybertap_supabase_url', url);
    localStorage.setItem('cybertap_supabase_key', key);
  }
  supabaseInstance = null;
  return getSupabaseClient();
};

/**
 * SQL Schema for 'app_users' table in Supabase:
 * 
 * create table public.app_users (
 *   id text primary key,
 *   telegram_id bigint,
 *   username text,
 *   balance numeric default 0,
 *   total_mined numeric default 0,
 *   energy integer default 1000,
 *   max_energy integer default 1000,
 *   profit_per_hour numeric default 0,
 *   level integer default 1,
 *   last_tap_timestamp bigint,
 *   wallet_address text,
 *   cards jsonb default '[]'::jsonb,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable row level security or open access for client demo:
 * alter table public.app_users enable row level security;
 * create policy "Public upsert" on public.app_users for all using (true) with check (true);
 */
export const SUPABASE_SQL_SCHEMA = `-- Run this in Supabase SQL Editor:
create table if not exists public.app_users (
  id text primary key,
  telegram_id bigint,
  username text,
  balance numeric default 0,
  total_mined numeric default 0,
  energy integer default 1000,
  max_energy integer default 1000,
  profit_per_hour numeric default 0,
  level integer default 1,
  last_tap_timestamp bigint,
  wallet_address text,
  cards jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable public read/write for app_users
alter table public.app_users enable row level security;
create policy "Allow all operations for demo" on public.app_users for all using (true) with check (true);
`;

/**
 * Save user balance, energy, and last tap state to Supabase table 'app_users'
 */
export async function saveUserStateToSupabase(state: GameState): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured (missing URL/Anon Key).' };
  }

  try {
    const payload = {
      id: state.user.id,
      telegram_id: state.user.telegramId || null,
      username: state.user.username,
      balance: state.balance,
      total_mined: state.totalMined,
      energy: Math.floor(state.energy),
      max_energy: state.maxEnergy,
      profit_per_hour: state.profitPerHour,
      level: state.user.level,
      last_tap_timestamp: state.lastTapTimestamp,
      wallet_address: state.walletAddress,
      cards: state.cards.map(c => ({ id: c.id, level: c.level })),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('app_users')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: message };
  }
}

/**
 * Load remote user state from Supabase table 'app_users'
 */
export async function loadUserStateFromSupabase(userId: string): Promise<Record<string, unknown> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Failed to fetch from Supabase:', err);
    return null;
  }
}
