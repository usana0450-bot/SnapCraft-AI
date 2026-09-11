import { TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: TelegramUser;
          query_id?: string;
          auth_date?: number;
          hash?: string;
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        enableClosingConfirmation?: () => void;
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams?: Record<string, string>;
        colorScheme?: 'light' | 'dark';
        isExpanded?: boolean;
        viewportHeight?: number;
        platform?: string;
      };
    };
  }
}

export const FALLBACK_VIP_USER: TelegramUser = {
  id: 88492015,
  first_name: 'Alexandre',
  last_name: 'Vance',
  username: 'vip_creator',
  language_code: 'en',
  is_premium: true,
  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

export function initTelegramSDK(): { isTMA: boolean; user: TelegramUser; webApp?: any } {
  try {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      if (webApp.setHeaderColor) {
        webApp.setHeaderColor('#0b0c14');
      }
      if (webApp.setBackgroundColor) {
        webApp.setBackgroundColor('#0b0c14');
      }
      if (webApp.enableClosingConfirmation) {
        webApp.enableClosingConfirmation();
      }

      const tgUser = webApp.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        return {
          isTMA: true,
          user: {
            id: tgUser.id,
            first_name: tgUser.first_name || 'Telegram User',
            last_name: tgUser.last_name || '',
            username: tgUser.username || `tg_${tgUser.id}`,
            language_code: tgUser.language_code || 'en',
            is_premium: Boolean(tgUser.is_premium),
            photo_url: tgUser.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${tgUser.id}`,
          },
          webApp,
        };
      }
    }
  } catch (e) {
    console.warn('Telegram WebApp SDK init error:', e);
  }

  // Outside Telegram browser fallback
  return {
    isTMA: false,
    user: FALLBACK_VIP_USER,
  };
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  try {
    const haptic = window.Telegram?.WebApp?.HapticFeedback;
    if (!haptic) return;

    if (type === 'success' || type === 'warning' || type === 'error') {
      haptic.notificationOccurred(type);
    } else {
      haptic.impactOccurred(type);
    }
  } catch {
    // Graceful fallback
  }
}

export function openExternalUrl(url: string) {
  try {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
