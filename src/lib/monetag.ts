/**
 * Monetag Rewarded Ads Integration Layer for Telegram Mini Apps
 * Integrates directly with Monetag's In-App Rewarded / Interstitial script or provides
 * a high-fidelity interactive fallback player with VIP sponsor branding.
 */

declare global {
  interface Window {
    show_11780014?: () => Promise<void>;
    monetag?: {
      rewarded?: {
        show: () => Promise<boolean>;
      };
    };
  }
}

export interface AdWatchOptions {
  placement: 'extra_spin' | 'double_streak' | 'bonus_points' | 'instant_upscale';
  rewardDescription: string;
  onRewardEarned: (rewardAmount: number) => void;
  onAdClosed?: () => void;
}

export class MonetagService {
  private static isInitialized = false;

  public static init(zoneId?: string) {
    if (this.isInitialized || typeof window === 'undefined') return;

    // In production, Mini App authors insert Monetag script tag
    if (zoneId) {
      const script = document.createElement('script');
      script.src = `https://alwingulla.com/${zoneId}.js`;
      script.async = true;
      document.head.appendChild(script);
    }
    this.isInitialized = true;
  }

  /**
   * Executes rewarded ad flow. Returns true if native SDK handled it, or false to trigger modal player.
   */
  public static triggerNativeAd(onSuccess: () => void): boolean {
    try {
      if (typeof (window as any).show_11780014 === 'function') {
        (window as any).show_11780014().then(() => onSuccess());
        return true;
      }
      if (window.monetag?.rewarded?.show) {
        window.monetag.rewarded.show().then((watched) => {
          if (watched) onSuccess();
        });
        return true;
      }
    } catch (err) {
      console.warn('Monetag native dispatch note:', err);
    }
    return false;
  }
}
