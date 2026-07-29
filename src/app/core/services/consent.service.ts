import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ConsentValue = 'granted' | 'denied';

export interface ConsentState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
}

const STORAGE_KEY = 'hsl_consent_v2';

const DENIED: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

const GRANTED: ConsentState = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Consent Mode v2 — persist choice and call gtag('consent', 'update', …).
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** null = not decided yet (show banner). */
  readonly choice = signal<'all' | 'essential' | null>(null);
  readonly showBanner = signal(false);

  init(): void {
    if (!this.isBrowser) return;
    const stored = this.readStored();
    if (stored) {
      this.choice.set(stored.analytics_storage === 'granted' ? 'all' : 'essential');
      this.showBanner.set(false);
      this.pushUpdate(stored);
      return;
    }
    this.choice.set(null);
    this.showBanner.set(true);
  }

  acceptAll(): void {
    this.apply('all', GRANTED);
  }

  acceptEssential(): void {
    this.apply('essential', DENIED);
  }

  /** Re-open banner from privacy/settings if needed. */
  openPreferences(): void {
    if (!this.isBrowser) return;
    this.showBanner.set(true);
  }

  private apply(choice: 'all' | 'essential', state: ConsentState): void {
    if (!this.isBrowser) return;
    this.choice.set(choice);
    this.showBanner.set(false);
    this.writeStored(state);
    this.pushUpdate(state);
  }

  private pushUpdate(state: ConsentState): void {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', { ...state });
  }

  private readStored(): ConsentState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ConsentState;
      if (!parsed?.analytics_storage) return null;
      return {
        ad_storage: parsed.ad_storage === 'granted' ? 'granted' : 'denied',
        ad_user_data: parsed.ad_user_data === 'granted' ? 'granted' : 'denied',
        ad_personalization:
          parsed.ad_personalization === 'granted' ? 'granted' : 'denied',
        analytics_storage:
          parsed.analytics_storage === 'granted' ? 'granted' : 'denied',
      };
    } catch {
      return null;
    }
  }

  private writeStored(state: ConsentState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
}
