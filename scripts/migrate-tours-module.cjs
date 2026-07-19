/**
 * Migrates aggregate tour JSON → per-slug files + new production schema.
 * Run: node scripts/migrate-tours-module.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toursJsonDir = path.join(root, 'src', 'assets', 'json', 'tours');
const itemsDir = path.join(toursJsonDir, 'items');
const imagesRoot = path.join(root, 'src', 'assets', 'images', 'tours');

fs.mkdirSync(itemsDir, { recursive: true });

function priceToArray(price) {
  return [1, 2, 3, 4, 5].map((travelers) => ({
    travelers,
    pricePerPerson: price[String(travelers)],
  }));
}

function badgesFromLegacy(tour) {
  const badges = [];
  if (tour.bestSeller) badges.push('best-seller');
  if (tour.featured) badges.push('featured');
  return badges;
}

function inferTravelStyle(tour) {
  const title = `${tour.title} ${tour.shortDescription}`.toLowerCase();
  if (title.includes('wildlife') || title.includes('yala') || title.includes('leopard')) return 'Wildlife';
  if (title.includes('honeymoon') || title.includes('luxury')) return 'Luxury';
  if (title.includes('family')) return 'Family';
  if (title.includes('adventure') || title.includes('trek')) return 'Adventure';
  if (title.includes('culture') || title.includes('sigiriya') || title.includes('kandy')) return 'Culture';
  return tour.category === 'day' ? 'Private Day Journey' : 'Private Multi-Day Journey';
}

function inferTags(tour, style) {
  const tags = new Set([style.toLowerCase().replace(/\s+/g, '-'), tour.category]);
  (tour.highlights || []).slice(0, 3).forEach((h) => {
    const word = String(h).split(' ')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (word.length > 3) tags.add(word);
  });
  return [...tags];
}

function ensureTourImages(slug, heroSrc, gallery) {
  const dir = path.join(imagesRoot, slug);
  fs.mkdirSync(dir, { recursive: true });

  const copyIfExists = (srcPath, destName) => {
    const abs = path.join(root, 'src', srcPath.replace(/^\//, '').replace(/^assets/, 'assets'));
    // src paths like /assets/images/...
    const from = path.join(root, 'src', srcPath.replace(/^\//, ''));
    if (fs.existsSync(from)) {
      const dest = path.join(dir, destName);
      if (!fs.existsSync(dest)) fs.copyFileSync(from, dest);
      return `/assets/images/tours/${slug}/${destName}`;
    }
    return srcPath;
  };

  const heroName = path.basename(heroSrc);
  const heroPath = copyIfExists(heroSrc, heroName.startsWith('hero') ? heroName : `hero${path.extname(heroSrc) || '.webp'}`);

  const galleryPaths = (gallery || []).map((img, i) => {
    const ext = path.extname(img.src) || '.webp';
    const name = `gallery-${String(i + 1).padStart(2, '0')}${ext}`;
    const nextSrc = copyIfExists(img.src, name);
    return { ...img, src: nextSrc };
  });

  // ensure gitkeep
  const keep = path.join(dir, '.gitkeep');
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');

  return { heroPath, galleryPaths };
}

function routeFromTour(tour) {
  if (Array.isArray(tour.route) && tour.route.length) return tour.route;
  const stops = [];
  if (tour.category === 'multi-day') {
    stops.push({ name: 'Airport' });
  }
  const names = new Set();
  (tour.itinerary || []).forEach((day) => {
    (day.locations || []).forEach((n) => names.add(n));
    if (day.location?.name) names.add(day.location.name);
  });
  if (tour.location?.name) names.add(tour.location.name);
  [...names].slice(0, 8).forEach((name) => {
    if (!stops.find((s) => s.name === name)) stops.push({ name });
  });
  if (!stops.length) stops.push({ name: tour.location?.name || 'Sri Lanka' });
  return stops;
}

function mapsUrlFromTour(tour) {
  if (tour.mapsUrl) return tour.mapsUrl;
  const center = tour.mapOverview?.center || tour.location?.geo;
  if (center) {
    return `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
  }
  return 'https://www.google.com/maps/search/?api=1&query=Sri+Lanka';
}

function convert(tour) {
  const heroSrc = tour.images?.[0]?.src || `/assets/images/tours/${tour.slug}.webp`;
  const { heroPath, galleryPaths } = ensureTourImages(
    tour.slug,
    heroSrc,
    tour.gallery?.length ? tour.gallery : tour.images || [],
  );

  const travelStyle = inferTravelStyle(tour);
  const badges = badgesFromLegacy(tour);
  // enrich badges from travel style
  const styleBadge = {
    Luxury: 'luxury',
    Family: 'family',
    Adventure: 'adventure',
    Wildlife: 'wildlife',
    Culture: 'culture',
  }[travelStyle];
  if (styleBadge && !badges.includes(styleBadge)) badges.push(styleBadge);

  const destinations =
    tour.destinations ||
    [
      ...(tour.location?.name ? [tour.location.name] : []),
      ...new Set((tour.itinerary || []).flatMap((d) => d.locations || [])),
    ].filter(Boolean);

  return {
    id: tour.id,
    slug: tour.slug,
    category: tour.category,
    title: tour.title,
    seoTitle: tour.seo?.metaTitle || `${tour.title} | Hai Sri Lanka Tours`,
    metaDescription:
      tour.seo?.metaDescription || tour.shortDescription || tour.description.slice(0, 155),
    shortDescription: tour.shortDescription,
    overview: tour.description,
    duration: tour.duration,
    destinations,
    travelStyle,
    highlights: tour.highlights || [],
    included: tour.includes || [],
    excluded: tour.excludes || [],
    itinerary: tour.itinerary || [],
    faqs: tour.faq || [],
    reviews: tour.reviews || [],
    pricing: tour.pricing || priceToArray(tour.price),
    currency: tour.currency || 'USD',
    relatedTours: tour.relatedTours || tour.relatedTourSlugs || [],
    badges,
    tags: tour.tags || inferTags(tour, travelStyle),
    route: routeFromTour(tour),
    mapsUrl: mapsUrlFromTour(tour),
    heroImage: {
      src: heroPath,
      alt: tour.images?.[0]?.alt || tour.title,
      title: tour.images?.[0]?.title || tour.title,
      width: tour.images?.[0]?.width || 1600,
      height: tour.images?.[0]?.height || 1067,
    },
    gallery: galleryPaths,
    rating: tour.rating || { average: 5, count: 0 },
    seo: {
      metaTitle: tour.seo?.metaTitle || `${tour.title} | Hai Sri Lanka Tours`,
      metaDescription:
        tour.seo?.metaDescription || tour.shortDescription || '',
      keywords: tour.seo?.keywords || destinations,
      ogImage: heroPath,
    },
    localizedSlugs: tour.localizedSlugs,
    status: tour.status || 'published',
    // Compatibility mirrors (services/templates still resolve via helpers)
    description: tour.description,
    location: tour.location || { name: destinations[0] || 'Sri Lanka' },
    price: tour.price || Object.fromEntries((tour.pricing || priceToArray(tour.price)).map((p) => [String(p.travelers), p.pricePerPerson])),
    images: [{ src: heroPath, alt: tour.title, title: tour.title, width: 1600, height: 1067 }],
    includes: tour.includes || [],
    excludes: tour.excludes || [],
    faq: tour.faq || [],
    relatedTourSlugs: tour.relatedTours || tour.relatedTourSlugs || [],
    featured: badges.includes('featured') || !!tour.featured,
    bestSeller: badges.includes('best-seller') || !!tour.bestSeller,
  };
}

const day = JSON.parse(fs.readFileSync(path.join(toursJsonDir, 'day-tours.json'), 'utf8'));
const multi = JSON.parse(fs.readFileSync(path.join(toursJsonDir, 'multi-day-tours.json'), 'utf8'));
const all = [...day, ...multi];

const manifest = { tours: [] };

for (const raw of all) {
  const tour = convert(raw);
  fs.writeFileSync(path.join(itemsDir, `${tour.slug}.json`), JSON.stringify(tour, null, 2) + '\n');
  manifest.tours.push({
    slug: tour.slug,
    category: tour.category,
    status: tour.status,
  });
  console.log('wrote', tour.slug);
}

fs.writeFileSync(path.join(toursJsonDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const lists = {
  day: {
    hero: {
      eyebrow: 'Day Tours',
      title: 'Private day journeys across Sri Lanka',
      subtitle: 'Curated single-day experiences from coast to Cultural Triangle fully private, paced for comfort.',
      image: {
        src: '/assets/images/tours/category-day.webp',
        alt: 'Sri Lanka day tours',
        width: 1600,
        height: 900,
      },
    },
    seo: {
      metaTitle: 'Day Tours in Sri Lanka | Hai Sri Lanka Tours',
      metaDescription:
        'Browse premium private day tours Galle, Sigiriya, Kandy, and more with live pricing and flexible pacing.',
      keywords: ['Sri Lanka day tours', 'private day trip Sri Lanka', 'Galle day tour'],
    },
  },
  'multi-day': {
    hero: {
      eyebrow: 'Multi-Day Tours',
      title: 'Multi-day journeys with quiet luxury',
      subtitle: 'Private itineraries across culture, tea country, wildlife, and coast flexible nights, trusted stays.',
      image: {
        src: '/assets/images/tours/category-multi.webp',
        alt: 'Sri Lanka multi-day tours',
        width: 1600,
        height: 900,
      },
    },
    seo: {
      metaTitle: 'Multi-Day Tours in Sri Lanka | Hai Sri Lanka Tours',
      metaDescription:
        'Explore private multi-day Sri Lanka tours with boutique stays, expert guiding, and transparent pricing.',
      keywords: ['Sri Lanka tour packages', 'multi-day Sri Lanka tour', 'private itinerary'],
    },
  },
};

fs.writeFileSync(path.join(toursJsonDir, 'lists.json'), JSON.stringify(lists, null, 2) + '\n');
console.log('manifest + lists ready,', manifest.tours.length, 'tours');
