import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-T3GGHR933Z';

/**
 * Sends GA4 page_view on every Angular route change (SPA).
 * Initial gtag config uses send_page_view: false to avoid double-counting.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

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
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}
