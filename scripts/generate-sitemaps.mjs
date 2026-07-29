import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://www.haisrilanka.com';
const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const LOCALES_PATH = join(ROOT, 'src/assets/language/locales.json');
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * Indexable hub pages only.
 * Coming-soon foundation stubs (about, faq, etc.) are noindex and omitted.
 */
const STATIC_PATHS = [
  '',
  'sri-lanka-tours',
  'day-tours',
  'multi-day-tours',
  'destinations',
  'things-to-do',
  'blog',
  'contact',
  'reviews',
];

function readJson(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, 'utf8'));
}

function publishedSlugs(items, slugKey = 'slug') {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => !item.status || item.status === 'published')
    .map((item) => item[slugKey])
    .filter(Boolean);
}

function loadContentUrls() {
  const day = readJson('src/assets/json/tours/day-tours.json') || [];
  const multi = readJson('src/assets/json/tours/multi-day-tours.json') || [];
  const destinations = readJson('src/assets/json/destinations.json') || [];
  const experiences = readJson('src/assets/json/experiences.json') || [];
  const blogs = readJson('src/assets/json/blogs.json') || [];

  return {
    dayTours: publishedSlugs(day),
    multiDayTours: publishedSlugs(multi),
    destinations: publishedSlugs(destinations),
    experiences: publishedSlugs(experiences),
    blogs: publishedSlugs(blogs),
  };
}

function loadLocales() {
  if (!existsSync(LOCALES_PATH)) {
    return [{ code: 'en', enabled: true }];
  }
  const data = JSON.parse(readFileSync(LOCALES_PATH, 'utf8'));
  return data.locales.filter((l) => l.enabled);
}

function urlEntry(loc, lastmod = TODAY) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}

function buildLocaleSitemap(lang, content) {
  const urls = [];

  for (const path of STATIC_PATHS) {
    const href = path ? `${SITE_URL}/${lang}/${path}` : `${SITE_URL}/${lang}`;
    urls.push(urlEntry(href));
  }

  for (const slug of content.dayTours) {
    urls.push(urlEntry(`${SITE_URL}/${lang}/day-tour/${slug}`));
  }
  for (const slug of content.multiDayTours) {
    urls.push(urlEntry(`${SITE_URL}/${lang}/multi-day-tour/${slug}`));
  }
  for (const slug of content.destinations) {
    urls.push(urlEntry(`${SITE_URL}/${lang}/destinations/${slug}`));
  }
  for (const slug of content.experiences) {
    urls.push(urlEntry(`${SITE_URL}/${lang}/things-to-do/${slug}`));
  }
  for (const slug of content.blogs) {
    urls.push(urlEntry(`${SITE_URL}/${lang}/blog/${slug}`));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

const locales = loadLocales();
const content = loadContentUrls();
mkdirSync(PUBLIC, { recursive: true });

const indexEntries = [];
for (const locale of locales) {
  const fileName = `sitemap-${locale.code}.xml`;
  writeFileSync(join(PUBLIC, fileName), buildLocaleSitemap(locale.code, content));
  indexEntries.push(
    `  <sitemap>\n    <loc>${SITE_URL}/${fileName}</loc>\n  </sitemap>`,
  );
}

const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.join('\n')}\n</sitemapindex>\n`;
writeFileSync(join(PUBLIC, 'sitemap-index.xml'), index);

const count =
  STATIC_PATHS.length +
  content.dayTours.length +
  content.multiDayTours.length +
  content.destinations.length +
  content.experiences.length +
  content.blogs.length;

console.log(
  `Generated sitemaps for ${locales.length} locales (${count} URLs each).`,
);
console.log(
  `  tours: ${content.dayTours.length + content.multiDayTours.length}, destinations: ${content.destinations.length}, experiences: ${content.experiences.length}, blogs: ${content.blogs.length}`,
);
