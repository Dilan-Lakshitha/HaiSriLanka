import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LocaleService } from './locale.service';

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
 * Banner lives in index.html from first paint so Lighthouse does not score late CLS.
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(LocaleService);
  private bound = false;

  /** null = not decided yet (show banner). */
  readonly choice = signal<'all' | 'essential' | null>(null);
  readonly showBanner = signal(false);

  init(): void {
    if (!this.isBrowser) return;
    const stored = this.readStored();
    if (stored) {
      this.choice.set(stored.analytics_storage === 'granted' ? 'all' : 'essential');
      this.showBanner.set(false);
      this.setPending(false);
      this.pushUpdate(stored);
      this.bindBanner();
      return;
    }
    this.choice.set(null);
    this.showBanner.set(true);
    this.setPending(true);
    this.bindBanner();
    // Keep English first-paint copy until Transloco loads — avoid key flash / height jump.
    this.transloco.events$.subscribe((event) => {
      if (event.type === 'translationLoadSuccess' && this.showBanner()) {
        this.syncBannerCopy();
      }
    });
    this.transloco.langChanges$.subscribe(() => {
      if (this.showBanner()) this.syncBannerCopy();
    });
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
    this.setPending(true);
    this.syncBannerCopy();
  }

  private apply(choice: 'all' | 'essential', state: ConsentState): void {
    if (!this.isBrowser) return;
    this.choice.set(choice);
    this.showBanner.set(false);
    this.writeStored(state);
    this.pushUpdate(state);
    // User gesture — removing reserved space is excluded from CLS.
    this.setPending(false);
  }

  private setPending(pending: boolean): void {
    document.documentElement.classList.toggle('consent-pending', pending);
  }

  private bindBanner(): void {
    if (this.bound) return;
    const root = document.getElementById('hsl-consent-banner');
    if (!root) return;
    this.bound = true;
    root.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      const btn = target?.closest?.('[data-consent]') as HTMLElement | null;
      if (!btn) return;
      const action = btn.getAttribute('data-consent');
      if (action === 'all') this.acceptAll();
      if (action === 'essential') this.acceptEssential();
    });
  }

  private syncBannerCopy(): void {
    const root = document.getElementById('hsl-consent-banner');
    if (!root) return;
    const title = this.transloco.translate('consent.title');
    if (!title || title === 'consent.title') return;
    const setText = (sel: string, value: string) => {
      const el = root.querySelector(sel);
      if (el) el.textContent = value;
    };
    setText('[data-i18n="title"]', title);
    setText('[data-i18n="body"]', this.transloco.translate('consent.body'));
    setText('[data-i18n="essential"]', this.transloco.translate('consent.essential'));
    setText('[data-i18n="acceptAll"]', this.transloco.translate('consent.acceptAll'));
    const privacy = root.querySelector('[data-i18n="privacy"]') as HTMLAnchorElement | null;
    if (privacy) {
      privacy.textContent = this.transloco.translate('nav.privacy');
      privacy.href = `/${this.locale.activeLang()}/privacy`;
    }
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
