import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://www.haisrilanka.com';
const ROOT = process.cwd();
const PUBLIC = join(ROOT, 'public');
const LOCALES_PATH = join(ROOT, 'src/assets/language/locales.json');
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * Indexable hub + legal pages. Travel-guide remains a noindex stub.
 */
const STATIC_PATHS = [
  '',
  'about',
  'sri-lanka-tours',
  'day-tours',
  'multi-day-tours',
  'destinations',
  'things-to-do',
  'blog',
  'contact',
  'reviews',
  'faq',
  'privacy',
  'terms',
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
  const manifest = readJson('src/assets/json/tours/manifest.json');
  const manifestTours = Array.isArray(manifest?.tours) ? manifest.tours : [];
  const manifestDay = publishedSlugs(
    manifestTours.filter((t) => t.category === 'day'),
  );
  const manifestMulti = publishedSlugs(
    manifestTours.filter((t) => t.category === 'multi-day'),
  );

  return {
    dayTours: [...new Set([...publishedSlugs(day), ...manifestDay])],
    multiDayTours: [...new Set([...publishedSlugs(multi), ...manifestMulti])],
    destinations: publishedSlugs(destinations),
    experiences: publishedSlugs(experiences),
    blogs: publishedSlugs(blogs),
  };
}

function loadLocales() {
  if (!existsSync(LOCALES_PATH)) {
    return [{ code: 'en', enabled: true, hreflang: 'en' }];
  }
  const data = JSON.parse(readFileSync(LOCALES_PATH, 'utf8'));
  return data.locales.filter((l) => l.enabled);
}

function allPaths(content) {
  const paths = [...STATIC_PATHS];
  for (const slug of content.dayTours) paths.push(`day-tour/${slug}`);
  for (const slug of content.multiDayTours) paths.push(`multi-day-tour/${slug}`);
  for (const slug of content.destinations) paths.push(`destinations/${slug}`);
  for (const slug of content.experiences) paths.push(`things-to-do/${slug}`);
  for (const slug of content.blogs) paths.push(`blog/${slug}`);
  return paths;
}

function hrefFor(lang, path) {
  return path ? `${SITE_URL}/${lang}/${path}` : `${SITE_URL}/${lang}`;
}

function urlEntry(lang, path, locales) {
  const loc = hrefFor(lang, path);
  const links = locales.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l.hreflang || l.code}" href="${hrefFor(l.code, path)}"/>`,
  );
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${hrefFor('en', path)}"/>`,
  );
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n${links.join('\n')}\n  </url>`;
}

function buildLocaleSitemap(lang, paths, locales) {
  const urls = paths.map((path) => urlEntry(lang, path, locales));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

const locales = loadLocales();
const content = loadContentUrls();
const paths = allPaths(content);
mkdirSync(PUBLIC, { recursive: true });

const indexEntries = [];
for (const locale of locales) {
  const fileName = `sitemap-${locale.code}.xml`;
  writeFileSync(join(PUBLIC, fileName), buildLocaleSitemap(locale.code, paths, locales));
  indexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/${fileName}</loc>\n  </sitemap>`);
}

const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.join('\n')}\n</sitemapindex>\n`;
writeFileSync(join(PUBLIC, 'sitemap-index.xml'), index);

console.log(
  `Generated sitemaps for ${locales.length} locales (${paths.length} URLs each) with hreflang annotations.`,
);
