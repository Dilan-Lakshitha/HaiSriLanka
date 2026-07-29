import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ConsentService } from './consent.service';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-T3GGHR933Z';

/**
 * GA4 page views on Angular route changes.
 * gtag.js is deferred until idle / first input so it does not inflate TBT (~300ms+).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly consent = inject(ConsentService);
  private scriptRequested = false;
  private scriptReady = false;
  private pendingPath: string | null = null;

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ensureGtagStub();
    this.scheduleGtagLoad();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.pageView(e.urlAfterRedirects));
  }

  pageView(path: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.scriptReady || typeof window.gtag !== 'function') {
      this.pendingPath = path;
      return;
    }
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
      consent_state: this.consent.choice() ?? 'pending',
    });
  }

  /** Consent defaults stay in index.html; the heavy gtag.js bundle loads later. */
  private scheduleGtagLoad(): void {
    const kickoff = () => this.loadGtag();

    const onInteract = () => {
      kickoff();
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('touchstart', onInteract, { once: true, passive: true });

    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === 'function') {
      ric(() => kickoff(), { timeout: 4500 });
    } else {
      window.setTimeout(kickoff, 3500);
    }
  }

  private ensureGtagStub(): void {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === 'function') return;
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  private loadGtag(): void {
    if (this.scriptRequested) return;
    this.scriptRequested = true;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src*="googletagmanager.com/gtag/js"]`,
    );
    if (existing) {
      this.onGtagAvailable();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => this.onGtagAvailable();
    script.onerror = () => {
      /* analytics optional — never block UX */
    };
    document.head.appendChild(script);
  }

  private onGtagAvailable(): void {
    this.ensureGtagStub();
    window.gtag?.('js', new Date());
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
    this.scriptReady = true;
    const path = this.pendingPath ?? `${window.location.pathname}${window.location.search}`;
    this.pendingPath = null;
    this.pageView(path);
  }
}
