import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { LocaleService } from './locale.service';
import { APP_CONFIG } from '../config/app.config';

@Injectable({ providedIn: 'root' })
export class ContentLocalizeService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);

  /** Cache overlay JSON per lang+path */
  private readonly overlayCache = new Map<string, Observable<unknown>>();

  constructor() {
    toObservable(this.locale.activeLang).subscribe(() => this.clearCache());
  }

  currentLang(): string {
    return this.locale.activeLang() || APP_CONFIG.defaultLocale;
  }

  /**
   * Deep-merge `overlay` onto `base`. Arrays of objects with `slug` merge by slug;
   * other arrays are replaced when overlay provides a non-empty array.
   */
  merge<T>(base: T, overlay: unknown): T {
    if (overlay == null) {
      return base;
    }
    return this.deepMerge(base, overlay) as T;
  }

  /** Drop cached overlays (call when language changes so fresh locale files load). */
  clearCache(): void {
    this.overlayCache.clear();
  }

  loadOverlay<T>(relativePath: string, lang = this.currentLang()): Observable<T | null> {
    if (!lang || lang === APP_CONFIG.defaultLocale) {
      return of(null);
    }
    const key = `${lang}:${relativePath}`;
    let cached = this.overlayCache.get(key) as Observable<T | null> | undefined;
    if (!cached) {
      // Cache-bust so updated locale JSON is picked up during local development.
      const url = `/assets/json/locales/${lang}/${relativePath}?v=5`;
      cached = this.http.get<T>(url).pipe(
        catchError(() => of(null)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
      this.overlayCache.set(key, cached);
    }
    return cached;
  }

  localizeEntity<T>(base: T, relativePath: string, lang = this.currentLang()): Observable<T> {
    return this.loadOverlay<Partial<T>>(relativePath, lang).pipe(
      map((overlay) => this.merge(base, overlay)),
    );
  }

  localizeListBySlug<T extends { slug: string }>(
    base: T[],
    relativePath: string,
    lang = this.currentLang(),
  ): Observable<T[]> {
    return this.loadOverlay<Array<Partial<T> & { slug: string }>>(relativePath, lang).pipe(
      map((overlayList) => {
        if (!overlayList?.length) {
          return base;
        }
        const bySlug = new Map(overlayList.map((o) => [o.slug, o]));
        return base.map((item) => {
          const o = bySlug.get(item.slug);
          return o ? this.merge(item, o) : item;
        });
      }),
    );
  }

  private deepMerge(base: unknown, overlay: unknown): unknown {
    if (overlay == null) {
      return base;
    }
    if (Array.isArray(overlay)) {
      if (!Array.isArray(base)) {
        return overlay;
      }
      if (
        overlay.length &&
        typeof overlay[0] === 'object' &&
        overlay[0] !== null &&
        'slug' in (overlay[0] as object)
      ) {
        const baseArr = base as Array<Record<string, unknown>>;
        const bySlug = new Map(
          (overlay as Array<Record<string, unknown>>).map((o) => [String(o['slug']), o]),
        );
        return baseArr.map((item) => {
          const o = bySlug.get(String(item['slug']));
          return o ? this.deepMerge(item, o) : item;
        });
      }
      if (
        overlay.length &&
        typeof overlay[0] === 'object' &&
        overlay[0] !== null &&
        'id' in (overlay[0] as object)
      ) {
        const baseArr = base as Array<Record<string, unknown>>;
        const byId = new Map(
          (overlay as Array<Record<string, unknown>>)
            .filter((o) => o['id'] != null)
            .map((o) => [String(o['id']), o]),
        );
        return baseArr.map((item) => {
          const o = byId.get(String(item['id']));
          return o ? this.deepMerge(item, o) : item;
        });
      }
      if (
        overlay.length &&
        typeof overlay[0] === 'object' &&
        overlay[0] !== null &&
        'pageKey' in (overlay[0] as object)
      ) {
        const baseArr = base as Array<Record<string, unknown>>;
        const byKey = new Map(
          (overlay as Array<Record<string, unknown>>)
            .filter((o) => o['pageKey'] != null)
            .map((o) => [String(o['pageKey']), o]),
        );
        return baseArr.map((item) => {
          const o = byKey.get(String(item['pageKey']));
          return o ? this.deepMerge(item, o) : item;
        });
      }
      // Parallel array merge (e.g. itinerary days)
      if (overlay.length === base.length) {
        return overlay.map((item, i) => this.deepMerge(base[i], item));
      }
      return overlay.length ? overlay : base;
    }
    if (typeof overlay === 'object') {
      if (typeof base !== 'object' || base == null || Array.isArray(base)) {
        return overlay;
      }
      const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
      for (const [k, v] of Object.entries(overlay as Record<string, unknown>)) {
        if (v === undefined) continue;
        out[k] = k in out ? this.deepMerge(out[k], v) : v;
      }
      return out;
    }
    return overlay;
  }
}
