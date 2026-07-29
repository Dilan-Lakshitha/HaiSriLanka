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
 * Consent Mode v2 controls cookies; cookieless pings still fire when denied (advanced mode).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly consent = inject(ConsentService);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.pageView(e.urlAfterRedirects));
  }

  pageView(path: string): void {
    if (!isPlatformBrowser(this.platformId) || typeof window.gtag !== 'function') {
      return;
    }
    // Still send page_view under Consent Mode — Google redacts/cookieless when denied.
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
      consent_state: this.consent.choice() ?? 'pending',
    });
  }
}
