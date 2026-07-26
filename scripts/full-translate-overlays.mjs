/**
 * Fully translates site content into all enabled locales and writes overlays.
 * Uses Google Translate public endpoint (no API key) with batching + cache.
 *
 * Run: node scripts/full-translate-overlays.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const jsonDir = path.join(root, 'src/assets/json');
const outRoot = path.join(jsonDir, 'locales');
const cacheFile = path.join(root, 'scripts/.translate-cache.json');

const LANGS = ['de', 'fr', 'es', 'it', 'nl', 'pl', 'sv', 'ru', 'ja', 'zh'];
const GOOGLE_TL = { zh: 'zh-CN' };

const TEXT_KEYS = new Set([
  'title',
  'subtitle',
  'eyebrow',
  'description',
  'shortDescription',
  'overview',
  'seoTitle',
  'metaDescription',
  'metaTitle',
  'label',
  'name',
  'content',
  'question',
  'answer',
  'summary',
  'excerpt',
  'body',
  'alt',
  'tagline',
  'viewAllLabel',
  'duration',
  'travelStyle',
]);

const SKIP_KEYS = new Set([
  'id',
  'slug',
  'path',
  'value',
  'src',
  'width',
  'height',
  'icon',
  'pageKey',
  'viewAllPath',
  'primaryCta',
  'secondaryCta',
  'status',
  'currency',
  'category',
  'mapsUrl',
  'relatedTours',
  'badges',
  'tags',
  'pricing',
  'price',
  'rating',
  'schema',
  'translations',
  'localizedSlugs',
  'featured',
  'bestSeller',
  'keywords',
]);

let cache = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch {
    cache = {};
  }
}

function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 0), 'utf8');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateText(text, lang) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  // Keep placeholders and simple codes
  if (/^\{\{.*\}\}$/.test(trimmed)) return text;
  if (/^[\d.,+\-%$€£¥\s/]+$/.test(trimmed)) return text;

  const key = `${lang}::${trimmed}`;
  if (cache[key]) return cache[key];

  const tl = GOOGLE_TL[lang] || lang;
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&q=' +
    encodeURIComponent(trimmed);

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const out = Array.isArray(data?.[0])
        ? data[0].map((part) => part?.[0] || '').join('')
        : trimmed;
      cache[key] = out || trimmed;
      return cache[key];
    } catch (err) {
      await sleep(400 * (attempt + 1));
      if (attempt === 3) {
        console.warn('translate fail', lang, trimmed.slice(0, 40), err.message);
        cache[key] = trimmed;
        return trimmed;
      }
    }
  }
  return trimmed;
}

async function translateValue(value, lang, keyHint = '') {
  if (typeof value === 'string') {
    if (SKIP_KEYS.has(keyHint)) return undefined;
    if (keyHint && !TEXT_KEYS.has(keyHint) && keyHint !== 'label') {
      // only translate known text keys, or array string items under text parents
      if (!['highlights', 'included', 'excluded', 'includes', 'excludes', 'activities'].includes(keyHint)) {
        // still translate if parent allowed via walk
      }
    }
    return translateText(value, lang);
  }
  if (Array.isArray(value)) {
    const next = [];
    for (const item of value) {
      next.push(await translateValue(item, lang, keyHint));
    }
    return next;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SKIP_KEYS.has(k)) continue;
      if (k === 'path' || k === 'src' || k === 'value') continue;
      if (typeof v === 'string') {
        if (
          TEXT_KEYS.has(k) ||
          k === 'label' ||
          ['highlights', 'included', 'excluded', 'includes', 'excludes'].includes(k)
        ) {
          out[k] = await translateText(v, lang);
        }
        continue;
      }
      if (Array.isArray(v)) {
        if (
          ['highlights', 'included', 'excluded', 'includes', 'excludes', 'activities', 'items', 'regions', 'itinerary', 'faqs', 'faq', 'destinations', 'durations', 'styles', 'images'].includes(
            k,
          )
        ) {
          out[k] = await translateValue(v, lang, k);
        } else if (k === 'keywords') {
          // skip keywords or translate
          out[k] = [];
          for (const kw of v) out[k].push(await translateText(String(kw), lang));
        }
        continue;
      }
      if (v && typeof v === 'object') {
        if (['seo', 'image', 'hero', 'primaryCta', 'secondaryCta', 'search', 'whyChoose', 'tourCategories', 'featuredMultiDay', 'featuredDay', 'destinations', 'map', 'reviews', 'stats', 'blog', 'faq', 'cta'].includes(k) || TEXT_KEYS.has(k) || k === 'image') {
          const child = await translateValue(v, lang, k);
          if (child && (typeof child !== 'object' || Object.keys(child).length)) out[k] = child;
        } else {
          // nested objects like itinerary day
          const child = await translateValue(v, lang, k);
          if (child && (typeof child !== 'object' || Object.keys(child).length)) out[k] = child;
        }
      }
    }
    // Preserve ids in item objects for merge-by-id
    if (value.id != null) out.id = value.id;
    if (value.slug != null) out.slug = value.slug;
    return out;
  }
  return undefined;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function translateHome(lang) {
  const home = JSON.parse(fs.readFileSync(path.join(jsonDir, 'home.json'), 'utf8'));
  const overlay = await translateValue(home, lang);
  // Ensure CTA paths remain from base (translateValue may skip path — good)
  if (overlay.hero?.primaryCta && home.hero.primaryCta.path) {
    overlay.hero.primaryCta.path = home.hero.primaryCta.path;
  }
  if (overlay.hero?.secondaryCta && home.hero.secondaryCta.path) {
    overlay.hero.secondaryCta.path = home.hero.secondaryCta.path;
  }
  writeJson(path.join(outRoot, lang, 'home.json'), overlay);
  console.log('home', lang);
}

async function translateCompany(lang) {
  const company = JSON.parse(fs.readFileSync(path.join(jsonDir, 'company.json'), 'utf8'));
  const overlay = {
    tagline: company.tagline ? await translateText(company.tagline, lang) : undefined,
    description: company.description ? await translateText(company.description, lang) : undefined,
    seo: company.seo
      ? {
          metaTitle: company.seo.metaTitle
            ? await translateText(company.seo.metaTitle, lang)
            : undefined,
          metaDescription: company.seo.metaDescription
            ? await translateText(company.seo.metaDescription, lang)
            : undefined,
        }
      : undefined,
  };
  writeJson(path.join(outRoot, lang, 'company.json'), overlay);
}

async function translateListFile(filename, lang) {
  const file = path.join(jsonDir, filename);
  if (!fs.existsSync(file)) return;
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(items)) return;
  const out = [];
  for (const item of items) {
    const o = {
      slug: item.slug,
      title: item.title ? await translateText(item.title, lang) : undefined,
      name: item.name ? await translateText(item.name, lang) : undefined,
      shortDescription: item.shortDescription
        ? await translateText(item.shortDescription, lang)
        : undefined,
      description: item.description ? await translateText(item.description, lang) : undefined,
      excerpt: item.excerpt ? await translateText(item.excerpt, lang) : undefined,
      content: item.content ? await translateText(item.content, lang) : undefined,
      seo: item.seo
        ? {
            metaTitle: item.seo.metaTitle
              ? await translateText(item.seo.metaTitle, lang)
              : undefined,
            metaDescription: item.seo.metaDescription
              ? await translateText(item.seo.metaDescription, lang)
              : undefined,
          }
        : undefined,
    };
    out.push(o);
    await sleep(40);
  }
  writeJson(path.join(outRoot, lang, filename), out);
  console.log(filename, lang, out.length);
}

async function translateTour(file, lang) {
  const tour = JSON.parse(fs.readFileSync(path.join(jsonDir, 'tours/items', file), 'utf8'));
  const overlay = {
    title: await translateText(tour.title, lang),
    seoTitle: tour.seoTitle ? await translateText(tour.seoTitle, lang) : undefined,
    metaDescription: tour.metaDescription
      ? await translateText(tour.metaDescription, lang)
      : undefined,
    shortDescription: tour.shortDescription
      ? await translateText(tour.shortDescription, lang)
      : undefined,
    overview: tour.overview ? await translateText(tour.overview, lang) : undefined,
    description: tour.description ? await translateText(tour.description, lang) : undefined,
    duration: tour.duration ? await translateText(tour.duration, lang) : undefined,
    travelStyle: tour.travelStyle ? await translateText(tour.travelStyle, lang) : undefined,
    highlights: [],
    included: [],
    excluded: [],
  };
  for (const h of tour.highlights || []) overlay.highlights.push(await translateText(h, lang));
  for (const h of tour.included || tour.includes || [])
    overlay.included.push(await translateText(h, lang));
  for (const h of tour.excluded || tour.excludes || [])
    overlay.excluded.push(await translateText(h, lang));

  if (tour.seo) {
    overlay.seo = {
      metaTitle: tour.seo.metaTitle
        ? await translateText(tour.seo.metaTitle, lang)
        : undefined,
      metaDescription: tour.seo.metaDescription
        ? await translateText(tour.seo.metaDescription, lang)
        : undefined,
    };
  }

  if (Array.isArray(tour.itinerary)) {
    overlay.itinerary = [];
    for (const day of tour.itinerary) {
      const d = {
        title: day.title ? await translateText(day.title, lang) : undefined,
        summary: day.summary ? await translateText(day.summary, lang) : undefined,
        description: day.description ? await translateText(day.description, lang) : undefined,
      };
      if (Array.isArray(day.activities)) {
        d.activities = [];
        for (const a of day.activities) d.activities.push(await translateText(a, lang));
      }
      overlay.itinerary.push(d);
      await sleep(30);
    }
  }

  const faqs = tour.faqs || tour.faq;
  if (Array.isArray(faqs)) {
    overlay.faqs = [];
    for (const f of faqs) {
      overlay.faqs.push({
        question: f.question ? await translateText(f.question, lang) : undefined,
        answer: f.answer ? await translateText(f.answer, lang) : undefined,
      });
      await sleep(30);
    }
  }

  writeJson(path.join(outRoot, lang, 'tours/items', file), overlay);
}

async function translateLists(lang) {
  const lists = JSON.parse(fs.readFileSync(path.join(jsonDir, 'tours/lists.json'), 'utf8'));
  const overlay = await translateValue(lists, lang);
  writeJson(path.join(outRoot, lang, 'tours/lists.json'), overlay);
}

async function main() {
  console.log('Starting full translation for', LANGS.join(', '));
  const tourFiles = fs
    .readdirSync(path.join(jsonDir, 'tours/items'))
    .filter((f) => f.endsWith('.json'));

  for (const lang of LANGS) {
    console.log('\n===', lang, '===');
    await translateHome(lang);
    saveCache();
    await translateCompany(lang);
    await translateLists(lang);
    await translateListFile('destinations.json', lang);
    await translateListFile('experiences.json', lang);
    await translateListFile('blogs.json', lang);
    saveCache();

    for (const file of tourFiles) {
      process.stdout.write(`  tour ${file} ... `);
      await translateTour(file, lang);
      console.log('ok');
      saveCache();
      await sleep(80);
    }
  }

  saveCache();
  console.log('\nAll locale overlays written.');
}

main().catch((err) => {
  console.error(err);
  saveCache();
  process.exit(1);
});
