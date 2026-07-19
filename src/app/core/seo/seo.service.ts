import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { APP_CONFIG } from '../config/app.config';
import { LocaleService } from '../services/locale.service';

export interface SeoInput {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>> | null;
}

const DEFAULT_OG_IMAGE = '/assets/images/hero/carousel-nine-arch-ella.webp';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(LocaleService);

  private readonly jsonLdNodes = signal<HTMLScriptElement[]>([]);

  update(input: SeoInput): void {
    const lang = this.locale.activeLang();
    const path = (input.path ?? '').replace(/^\//, '');
    const canonicalPath = path ? `/${lang}/${path}` : `/${lang}`;
    const canonicalUrl = `${APP_CONFIG.siteUrl}${canonicalPath}`;
    const image = this.resolveImage(input.image);

    this.title.setTitle(input.title);
    this.meta.updateTag({ name: 'description', content: input.description });

    if (input.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: input.keywords.join(', ') });
    } else {
      this.meta.removeTag("name='keywords'");
    }

    this.meta.updateTag({
      name: 'robots',
      content: input.noIndex ? 'noindex,nofollow' : 'index,follow',
    });

    this.setLink('canonical', canonicalUrl);
    this.setHreflang(path);

    this.meta.updateTag({ property: 'og:title', content: input.title });
    this.meta.updateTag({ property: 'og:description', content: input.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: input.type ?? 'website' });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:locale', content: this.toOgLocale(lang) });
    this.meta.updateTag({ property: 'og:site_name', content: APP_CONFIG.siteName });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: input.title });
    this.meta.updateTag({ name: 'twitter:description', content: input.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Always reset JSON-LD so soft-404 / stub pages never keep previous schema.
    if (input.jsonLd) {
      this.setJsonLd(input.jsonLd);
    } else {
      this.clearJsonLd();
    }
  }

  private resolveImage(image?: string): string {
    const src = image || DEFAULT_OG_IMAGE;
    if (src.startsWith('http')) {
      return src;
    }
    return `${APP_CONFIG.siteUrl}${src.startsWith('/') ? src : `/${src}`}`;
  }

  private toOgLocale(lang: string): string {
    const map: Record<string, string> = {
      en: 'en_US',
      de: 'de_DE',
      fr: 'fr_FR',
      es: 'es_ES',
      it: 'it_IT',
      nl: 'nl_NL',
      pl: 'pl_PL',
      sv: 'sv_SE',
      ru: 'ru_RU',
      ja: 'ja_JP',
      zh: 'zh_CN',
    };
    return map[lang] || `${lang}_${lang.toUpperCase()}`;
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]:not([hreflang])`;
    let el = this.document.head.querySelector(selector) as HTMLLinkElement | null;
    if (!el) {
      el = this.document.createElement('link');
      el.setAttribute('rel', rel);
      if (hreflang) {
        el.setAttribute('hreflang', hreflang);
      }
      this.document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  private setHreflang(path: string): void {
    this.document.head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((n: Element) => n.remove());

    const enabled = this.locale.enabledLocales();
    const locales =
      enabled.length > 0
        ? enabled
        : APP_CONFIG.supportedLocales.map((code) => ({
            code,
            hreflang: code,
            enabled: true,
            name: code,
            nativeName: code,
            dir: 'ltr' as const,
          }));

    for (const loc of locales) {
      const hrefPath = path ? `/${loc.code}/${path}` : `/${loc.code}`;
      this.setLink('alternate', `${APP_CONFIG.siteUrl}${hrefPath}`, loc.hreflang);
    }
    const defaultPath = path
      ? `/${APP_CONFIG.defaultLocale}/${path}`
      : `/${APP_CONFIG.defaultLocale}`;
    this.setLink('alternate', `${APP_CONFIG.siteUrl}${defaultPath}`, 'x-default');
  }

  setJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>): void {
    this.clearJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.setAttribute('data-seo-jsonld', 'true');
    this.document.head.appendChild(script);
    this.jsonLdNodes.set([script]);
  }

  clearJsonLd(): void {
    this.document.head
      .querySelectorAll('script[data-seo-jsonld="true"]')
      .forEach((n: Element) => n.remove());
    this.jsonLdNodes.set([]);
  }
}
