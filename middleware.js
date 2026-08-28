/**
 * Unique first-byte HTML per URL for Googlebot (canonical / hreflang / lang).
 * Also 301 spaced/legacy aliases so junk paths are not indexed as duplicates.
 */
import de from './src/assets/i18n/de.json';
import en from './src/assets/i18n/en.json';
import es from './src/assets/i18n/es.json';
import fr from './src/assets/i18n/fr.json';
import it from './src/assets/i18n/it.json';
import ja from './src/assets/i18n/ja.json';
import nl from './src/assets/i18n/nl.json';
import pl from './src/assets/i18n/pl.json';
import ru from './src/assets/i18n/ru.json';
import sv from './src/assets/i18n/sv.json';
import zh from './src/assets/i18n/zh.json';

const SITE_URL = 'https://www.haisrilanka.com';

const I18N = { de, en, es, fr, it, ja, nl, pl, ru, sv, zh };

const LOCALES = [
  { code: 'en', hreflang: 'en' },
  { code: 'de', hreflang: 'de' },
  { code: 'fr', hreflang: 'fr' },
  { code: 'es', hreflang: 'es' },
  { code: 'it', hreflang: 'it' },
  { code: 'nl', hreflang: 'nl' },
  { code: 'pl', hreflang: 'pl' },
  { code: 'sv', hreflang: 'sv' },
  { code: 'ru', hreflang: 'ru' },
  { code: 'ja', hreflang: 'ja' },
  { code: 'zh', hreflang: 'zh-Hans' },
];

const LOCALE_CODES = new Set(LOCALES.map((l) => l.code));

const HUBS = new Set([
  '',
  'about',
  'contact',
  'destinations',
  'sri-lanka-tours',
  'day-tours',
  'multi-day-tours',
  'things-to-do',
  'blog',
  'reviews',
  'faq',
  'privacy',
  'terms',
  'travel-guide',
]);

const DETAIL_HUBS = new Set([
  'destinations',
  'things-to-do',
  'day-tour',
  'multi-day-tour',
  'blog',
]);

const SEO_KEY_BY_HUB = {
  '': 'home',
  about: 'about',
  contact: 'contact',
  destinations: 'destinations',
  'sri-lanka-tours': 'toursHub',
  'day-tours': 'dayTours',
  'day-tour': 'dayTours',
  'multi-day-tours': 'multiDayTours',
  'multi-day-tour': 'multiDayTours',
  'things-to-do': 'thingsToDo',
  blog: 'blog',
  reviews: 'reviews',
  faq: 'faq',
  privacy: 'privacy',
  terms: 'terms',
  'travel-guide': 'travelGuide',
};

const OG_LOCALE = {
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

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NOINDEX_PREFIXES = ['booking', 'travel-guide'];

const SPACE_ALIASES = {
  'multi day tours': 'multi-day-tours',
  'day tours': 'day-tours',
  'things to do': 'things-to-do',
  'sri lanka tours': 'sri-lanka-tours',
  'travel guide': 'travel-guide',
};

const LEGACY_HTML = {
  '/yalpanam.html': '/en',
  '/tour.html': '/en/sri-lanka-tours',
  '/packages.html': '/en/multi-day-tours',
  '/services.html': '/en',
  '/eightdaystours.html': '/en/multi-day-tours',
};

export const config = {
  matcher: [
    '/((?!api/|assets/)(?!.*\\.(?:js|css|mjs|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|xml|txt|json|webmanifest)$).*)',
  ],
};

const CANONICAL_HOST = 'www.haisrilanka.com';

export default async function middleware(request) {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname || '/');
  const search = url.search || '';
  const host = requestHost(request, url);
  const isApexOrWww =
    host === CANONICAL_HOST || host === 'haisrilanka.com';

  if (pathname.startsWith('/api/') || pathname.startsWith('/assets/')) {
    return;
  }

  // Internal shell fetch from this middleware — do not 308 /index.html or the SPA shell 404s.
  if (
    (pathname === '/index.html' || pathname === '/index.csr.html') &&
    request.headers.get('x-hsl-shell') === '1'
  ) {
    return;
  }

  const nextPath = resolveCanonicalPath(pathname);
  if (nextPath === null) {
    return;
  }

  if (nextPath !== pathname || (isApexOrWww && host !== CANONICAL_HOST)) {
    return redirectTo(nextPath, search);
  }

  const parsed = parsePath(pathname);
  const indexable = isIndexablePath(parsed.rest);
  const noIndex =
    !indexable ||
    NOINDEX_PREFIXES.some(
      (p) => parsed.rest === p || parsed.rest.startsWith(`${p}/`),
    );

  const indexRes = await fetch(new URL('/index.html', request.url), {
    headers: { 'x-hsl-shell': '1' },
  });
  if (!indexRes.ok) {
    return;
  }

  const { title, description } = titleFor(parsed.lang, parsed.rest);
  let html = await indexRes.text();
  html = injectHead(html, {
    lang: parsed.lang,
    rest: parsed.rest,
    title,
    description,
    noIndex,
    indexable,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'content-language': parsed.lang === 'zh' ? 'zh-CN' : parsed.lang,
      'x-robots-tag': noIndex ? 'noindex, nofollow' : 'index, follow',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
  });
}

function requestHost(request, url) {
  const raw =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    url.hostname ||
    '';
  return raw.split(',')[0].trim().split(':')[0].toLowerCase();
}

/** Always land on https://www.haisrilanka.com in a single hop. */
function redirectTo(pathname, search) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new Response(null, {
    status: 308,
    headers: { location: `${SITE_URL}${path}${search || ''}` },
  });
}

/**
 * Returns the canonical pathname, or null to pass the request through (static files).
 */
function resolveCanonicalPath(pathname) {
  if (pathname === '/index.html' || pathname === '/index.csr.html') {
    return '/en';
  }

  if (/\.html$/i.test(pathname)) {
    return LEGACY_HTML[pathname.toLowerCase()] || '/en';
  }

  if (pathname.includes('.')) {
    return null;
  }

  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '') || '/';
  }

  if (pathname === '/') {
    return '/en';
  }

  const parsed = parsePath(pathname);

  if (parsed.unknownLocale) {
    return parsed.rest ? `/en/${parsed.rest}` : '/en';
  }

  if (!parsed.hasLang) {
    return `/en${pathname}`;
  }

  const cleanedRest = normalizeRest(parsed.rest);
  if (cleanedRest !== parsed.rest) {
    return cleanedRest ? `/${parsed.lang}/${cleanedRest}` : `/${parsed.lang}`;
  }

  return pathname;
}

function parsePath(pathname) {
  const parts = pathname === '/' ? [] : pathname.slice(1).split('/').filter(Boolean);
  const maybeLang = parts[0]?.toLowerCase();
  const hasLang = Boolean(maybeLang && LOCALE_CODES.has(maybeLang));
  const unknownLocale = Boolean(
    maybeLang && /^[a-z]{2}$/.test(maybeLang) && !LOCALE_CODES.has(maybeLang),
  );
  const lang = hasLang ? maybeLang : 'en';
  const restParts = hasLang || unknownLocale ? parts.slice(1) : parts;
  return { hasLang, unknownLocale, lang, rest: restParts.join('/'), restParts };
}

function normalizeRest(rest) {
  if (!rest) {
    return rest;
  }
  const decoded = rest.replace(/\+/g, ' ').replace(/_/g, '-');
  const spaced = decoded.replace(/\s+/g, ' ').trim().toLowerCase();
  if (SPACE_ALIASES[spaced]) {
    return SPACE_ALIASES[spaced];
  }
  return decoded.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function isIndexablePath(rest) {
  if (HUBS.has(rest)) {
    return true;
  }
  const [hub, slug, extra] = rest.split('/');
  if (!hub || !slug || extra || !DETAIL_HUBS.has(hub)) {
    return false;
  }
  return SLUG_RE.test(slug);
}

function seoPack(lang, key) {
  const fromLang = I18N[lang]?.seo?.[key];
  const fromEn = I18N.en?.seo?.[key];
  return {
    title: fromLang?.title || fromEn?.title || 'Hai Sri Lanka Tours | Private Sri Lanka Travel',
    description:
      fromLang?.description ||
      fromEn?.description ||
      'Private Sri Lanka tours with Hai Sri Lanka.',
  };
}

function titleFor(lang, rest) {
  const hub = rest ? rest.split('/')[0] : '';
  const slug = rest.includes('/') ? rest.split('/')[1] : '';
  const key = SEO_KEY_BY_HUB[hub] || SEO_KEY_BY_HUB[''] || 'home';
  const pack = seoPack(lang, key);
  if (slug && (DETAIL_HUBS.has(hub) || SEO_KEY_BY_HUB[hub])) {
    const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      title: `${label} | ${pack.title}`,
      description: pack.description,
    };
  }
  return pack;
}

function injectHead(html, seo) {
  const canonicalPath = seo.rest ? `/${seo.lang}/${seo.rest}` : `/${seo.lang}`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const robots = seo.noIndex ? 'noindex,nofollow' : 'index,follow';

  const tags = [`<meta name="robots" content="${robots}">`];

  if (seo.indexable && !seo.noIndex) {
    const alternates = LOCALES.map((loc) => {
      const href = seo.rest ? `${SITE_URL}/${loc.code}/${seo.rest}` : `${SITE_URL}/${loc.code}`;
      return `<link rel="alternate" hreflang="${loc.hreflang}" href="${href}">`;
    }).join('');
    const xDefault = seo.rest ? `${SITE_URL}/en/${seo.rest}` : `${SITE_URL}/en`;
    tags.unshift(`<link rel="canonical" href="${canonical}">`);
    tags.push(`<meta property="og:url" content="${canonical}">`);
    tags.push(`<meta property="og:locale" content="${OG_LOCALE[seo.lang] || seo.lang}">`);
    tags.push(alternates);
    tags.push(`<link rel="alternate" hreflang="x-default" href="${xDefault}">`);
  }

  html = html.replace(/<html lang="[^"]*"/i, `<html lang="${seo.lang}"`);
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
  );
  html = html.replace(/href="\/en\/privacy"/g, `href="/${seo.lang}/privacy"`);

  html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, '');
  html = html.replace('</head>', `${tags.join('')}</head>`);

  return html;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
