import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ConsentValue = 'granted' | 'denied';

export interface ConsentState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
}

export const CONSENT_STORAGE_KEY = 'hsl_consent_v2';

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
 * Works with index.html pre-paint shell to avoid CLS from the banner appearing late.
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
      this.setHtmlFlags({ pending: false, hydrated: false });
      this.pushUpdate(stored);
      return;
    }
    this.choice.set(null);
    this.showBanner.set(true);
    // Keep reserved space; swap static shell → Angular banner without layout jump.
    this.setHtmlFlags({ pending: true, hydrated: true });
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
    this.setHtmlFlags({ pending: true, hydrated: true });
  }

  private apply(choice: 'all' | 'essential', state: ConsentState): void {
    if (!this.isBrowser) return;
    this.choice.set(choice);
    this.showBanner.set(false);
    this.writeStored(state);
    this.pushUpdate(state);
    // User gesture — removing reserved space is excluded from CLS.
    this.setHtmlFlags({ pending: false, hydrated: false });
  }

  private setHtmlFlags(flags: { pending: boolean; hydrated: boolean }): void {
    const root = document.documentElement;
    root.classList.toggle('consent-pending', flags.pending);
    root.classList.toggle('consent-hydrated', flags.hydrated);
  }

  private pushUpdate(state: ConsentState): void {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', { ...state });
  }

  private readStored(): ConsentState | null {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
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
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
}
