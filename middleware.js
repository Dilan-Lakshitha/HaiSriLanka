/**
 * Unique first-byte HTML per URL for Googlebot (canonical / hreflang / lang).
 * Also 301 spaced/legacy aliases so junk paths are not indexed as duplicates.
 */
const SITE_URL = 'https://www.haisrilanka.com';

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

const HUB_TITLES = {
  '': 'Hai Sri Lanka Tours | Private Sri Lanka Travel',
  about: 'About Hai Sri Lanka Tours | Private Inbound Travel',
  contact: 'Contact Hai Sri Lanka Tours | Plan a Private Journey',
  destinations: 'Sri Lanka Destinations | Hai Sri Lanka Tours',
  'sri-lanka-tours': 'Sri Lanka Tours | Hai Sri Lanka',
  'day-tours': 'Day Tours in Sri Lanka | Hai Sri Lanka',
  'multi-day-tours': 'Multi-Day Sri Lanka Tours | Hai Sri Lanka',
  'things-to-do': 'Things To Do in Sri Lanka | Hai Sri Lanka',
  blog: 'Sri Lanka Travel Journal | Hai Sri Lanka',
  reviews: 'Guest Reviews | Hai Sri Lanka Tours',
  faq: 'FAQ | Hai Sri Lanka Tours',
  privacy: 'Privacy Policy | Hai Sri Lanka',
  terms: 'Terms of Service | Hai Sri Lanka',
  'travel-guide': 'Sri Lanka Travel Guide | Hai Sri Lanka',
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

export const config = {
  matcher: ['/((?!api/|assets/|.*\\..*).*)'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname || '/');

  if (pathname.includes('.') || pathname.startsWith('/api/')) {
    return;
  }

  if (pathname !== '/' && pathname.endsWith('/')) {
    return redirect(`${pathname.replace(/\/+$/, '') || '/'}${url.search}`);
  }

  if (pathname === '/') {
    return redirect(`/en${url.search}`);
  }

  const parsed = parsePath(pathname);
  if (!parsed.hasLang) {
    return redirect(`/en${pathname === '/' ? '' : pathname}${url.search}`);
  }

  const cleanedRest = normalizeRest(parsed.rest);
  if (cleanedRest !== parsed.rest) {
    const dest = cleanedRest ? `/${parsed.lang}/${cleanedRest}` : `/${parsed.lang}`;
    return redirect(`${dest}${url.search}`);
  }

  const indexable = isIndexablePath(parsed.rest);
  const noIndex =
    !indexable ||
    NOINDEX_PREFIXES.some(
      (p) => parsed.rest === p || parsed.rest.startsWith(`${p}/`),
    );

  const indexRes = await fetch(new URL('/index.html', request.url));
  if (!indexRes.ok) {
    return;
  }

  let html = await indexRes.text();
  html = injectHead(html, {
    lang: parsed.lang,
    rest: parsed.rest,
    title: titleFor(parsed.rest),
    noIndex,
    indexable,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    },
  });
}

function redirect(location) {
  return new Response(null, {
    status: 308,
    headers: { location },
  });
}

function parsePath(pathname) {
  const parts = pathname === '/' ? [] : pathname.slice(1).split('/').filter(Boolean);
  const maybeLang = parts[0]?.toLowerCase();
  const hasLang = Boolean(maybeLang && LOCALE_CODES.has(maybeLang));
  const lang = hasLang ? maybeLang : 'en';
  const restParts = hasLang ? parts.slice(1) : parts;
  return { hasLang, lang, rest: restParts.join('/'), restParts };
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

function titleFor(rest) {
  if (HUB_TITLES[rest]) {
    return HUB_TITLES[rest];
  }
  const [hub, slug] = rest.split('/');
  if (slug && (HUB_TITLES[hub] || DETAIL_HUBS.has(hub))) {
    const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const hubTitle =
      HUB_TITLES[hub] ||
      (hub === 'day-tour'
        ? HUB_TITLES['day-tours']
        : hub === 'multi-day-tour'
          ? HUB_TITLES['multi-day-tours']
          : 'Hai Sri Lanka Tours');
    return `${label} | ${hubTitle}`;
  }
  return 'Hai Sri Lanka Tours | Private Sri Lanka Travel';
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
    tags.push(`<meta property="og:locale" content="${seo.lang}">`);
    tags.push(alternates);
    tags.push(`<link rel="alternate" hreflang="x-default" href="${xDefault}">`);
  }

  html = html.replace(/<html lang="[^"]*"/i, `<html lang="${seo.lang}"`);
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(seo.title)}">`,
  );

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
