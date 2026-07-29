import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { distinctUntilChanged, startWith } from 'rxjs';
import { APP_CONFIG, type SupportedLocale } from '../config/app.config';
import type { LocaleDefinition } from '../models';
import localesFile from '../../../assets/language/locales.json';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** Bundled at build time — avoids /locales.json on the critical request chain. */
  private readonly localesSignal = signal<LocaleDefinition[]>(
    (localesFile as { locales: LocaleDefinition[] }).locales,
  );
  readonly locales = this.localesSignal.asReadonly();
  readonly enabledLocales = computed(() =>
    this.localesSignal().filter((l) => l.enabled),
  );
  readonly activeLang = signal<string>(APP_CONFIG.defaultLocale);

  /**
   * Prefer over raw toObservable(activeLang): first emit is synchronous so
   * combineLatest(home/company) can paint on the first CD (cuts footer CLS).
   */
  readonly lang$ = toObservable(this.activeLang).pipe(
    startWith(this.activeLang()),
    distinctUntilChanged(),
  );

  /** No-op kept for app initializer compatibility. */
  init(): void {
    /* locales are bundled — nothing to fetch */
  }

  isSupported(lang: string): lang is SupportedLocale {
    return (APP_CONFIG.supportedLocales as readonly string[]).includes(lang);
  }

  setActiveLang(lang: string): void {
    if (!this.isSupported(lang)) {
      lang = APP_CONFIG.defaultLocale;
    }
    this.activeLang.set(lang);
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
    const meta = this.localesSignal().find((l) => l.code === lang);
    this.document.documentElement.dir = meta?.dir ?? 'ltr';

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(APP_CONFIG.cookieLocaleKey, lang);
        document.cookie = `${APP_CONFIG.cookieLocaleKey}=${lang};path=/;max-age=31536000;SameSite=Lax`;
      } catch {
        /* ignore storage failures */
      }
    }
  }

  /**
   * Prefer stored language, then Accept-Language match, else default.
   * Used only for `/` redirect — URL remains source of truth thereafter.
   */
  resolvePreferredLang(acceptLanguageHeader?: string | null): string {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(APP_CONFIG.cookieLocaleKey);
        if (stored && this.isSupported(stored)) {
          return stored;
        }
      } catch {
        /* ignore */
      }
      const nav = typeof navigator !== 'undefined' ? navigator.language : '';
      const match = this.matchAcceptLanguage(nav);
      if (match) {
        return match;
      }
    }
    if (acceptLanguageHeader) {
      const match = this.matchAcceptLanguage(acceptLanguageHeader);
      if (match) {
        return match;
      }
    }
    return APP_CONFIG.defaultLocale;
  }

  private matchAcceptLanguage(header: string): string | null {
    const codes = header
      .split(',')
      .map((part) => part.trim().split(';')[0].toLowerCase());
    for (const code of codes) {
      const short = code.slice(0, 2);
      if (this.isSupported(short)) {
        return short;
      }
    }
    return null;
  }

  async switchLanguage(targetLang: string): Promise<void> {
    if (!this.isSupported(targetLang)) {
      return;
    }
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments ?? [];
    if (segments.length === 0) {
      await this.router.navigate(['/', targetLang]);
      return;
    }
    const rest = segments.slice(1).map((s) => s.path);
    await this.router.navigate(['/', targetLang, ...rest], {
      queryParamsHandling: 'preserve',
      fragment: urlTree.fragment ?? undefined,
    });
  }
}
