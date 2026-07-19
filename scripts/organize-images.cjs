/**
 * Organize images from src/assets/images/New folder into architecture folders,
 * keep highest-quality duplicates, emit WebP beside originals for large raster photos.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src/assets/images/New folder');
const OUT = path.join(ROOT, 'src/assets/images');
const PUBLIC = path.join(ROOT, 'public');

const dirs = [
  'hero',
  'tours',
  'destinations',
  'gallery',
  'blog',
  'reviews',
  'partners',
  'team',
  'icons',
  'logos',
];

for (const d of dirs) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true });
}

async function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  await fs.promises.copyFile(from, to);
}

async function toWebp(from, toWebpPath, quality = 82, maxWidth = 1920) {
  await sharp(from)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(toWebpPath);
}

function pickLarger(a, b) {
  return fs.statSync(a).size >= fs.statSync(b).size ? a : b;
}

async function main() {
  // --- Logos from superNew (latest) ---
  const logoBase = path.join(SRC, 'superNew');
  const logos = {
    'logo-color.png': 'haisrilanka-high-resolution-logo.png',
    'logo-white-transparent.png': 'haisrilanka-high-resolution-logo-white-transparent.png',
    'logo-black-transparent.png': 'haisrilanka-high-resolution-logo-black-transparent.png',
    'logo-transparent.png': 'haisrilanka-high-resolution-logo-transparent.png',
    'logo-white.png': 'haisrilanka-high-resolution-logo-white.png',
    'logo-black.png': 'haisrilanka-high-resolution-logo-black.png',
    'favicon-color.png': 'haisrilanka-favicon-color.png',
    'favicon-white.png': 'haisrilanka-favicon-white.png',
    'favicon-black.png': 'haisrilanka-favicon-black.png',
  };

  // Also SVG variants from zip extract (highest quality vectors)
  const svgDir = path.join(logoBase, 'haisrilanka-logo-zip-file', 'svg');
  const svgs = {
    'logo-color.svg': 'logo-color.svg',
    'logo-white.svg': 'logo-white.svg',
    'logo-black.svg': 'logo-black.svg',
    'logo-no-background.svg': 'logo-no-background.svg',
  };

  for (const [dest, srcName] of Object.entries(logos)) {
    const from = path.join(logoBase, srcName);
    if (fs.existsSync(from)) {
      await copyFile(from, path.join(OUT, 'logos', dest));
    }
  }
  for (const [dest, srcName] of Object.entries(svgs)) {
    const from = path.join(svgDir, srcName);
    if (fs.existsSync(from)) {
      await copyFile(from, path.join(OUT, 'logos', dest));
    }
  }

  // Favicon to public
  const fav = path.join(OUT, 'logos', 'favicon-color.png');
  if (fs.existsSync(fav)) {
    await copyFile(fav, path.join(PUBLIC, 'favicon.png'));
    // keep ico as fallback - also copy png named favicon.ico isn't ideal; write reference png
  }

  // Mapping: meaningful slug -> source relative to SRC
  const map = {
    // Hero best large scenic assets
    'hero/hero-main.jpg': 'destination-1.jpg', // largest scenic (3.2MB)
    'hero/hero-tea-country.jpg': 'pexels-srkportraits-10710560.jpg',
    'hero/hero-ella-bridge.jpg': 'sri-lanka-nine-arch-bridge-ella-header-2.jpg',
    'hero/hero-ravana-falls.jpg': 'LS_RavanaFalls_Desktop_1920x700.jpg',
    'hero/hero-coast.jpg': 'pexels-malindabandaralk-16508230.jpg',
    'hero/hero-carousel-1.jpg': 'carousel-1.jpg',
    'hero/hero-carousel-2.jpg': 'carousel-2.jpg',
    'hero/hero-carousel-3.jpg': 'carousel-3.jpg',

    // Destinations (prefer higher quality where duplicates exist)
    'destinations/galle.jpg': 'destination-8.jpg',
    'destinations/sigiriya.jpg': 'sigiriyaNew.jpg',
    'destinations/kandy.jpg': 'temple-sacred-tooth-relic-kandy-sri-lanka.jpg',
    'destinations/yala.jpg': (() => {
      const a = path.join(SRC, 'yalaSafariTiger.jpg');
      const b = path.join(SRC, 'yalaSafari.jpg');
      return path.basename(pickLarger(a, b));
    })(),
    'destinations/anuradhapura.jpg': 'anuradhapura.jpg', // larger than anuradhapura-1
    'destinations/colombo.jpg': 'colombo.jpg',
    'destinations/polonnaruwa.webp': 'polonnaruwa.webp',
    'destinations/ella-bridge.jpg': 'sri-lanka-nine-arch-bridge-ella-header-2.jpg',
    'destinations/marble-beach.jpg': 'Marble-Beach.jpg',
    'destinations/arugam-bay.jpg': 'arugam-bay-surfing-1024x683.jpg',
    'destinations/yapahuwa.webp': 'Yapahuwa-Kingdom.webp',
    'destinations/tea-country.jpg': 'destination-7.jpg',
    'destinations/south-coast.jpg': 'destination-9.jpg',

    // Tours
    'tours/galle-day-tour.jpg': 'explore-tour-1.jpg',
    'tours/sigiriya-day-tour.jpg': 'sigiriyaNew.jpg',
    'tours/kandy-day-tour.jpg': 'explore-tour-3.jpg',
    'tours/7-days-highlights.jpg': 'explore-tour-2.jpg',
    'tours/10-days-classic.jpg': 'carousel-3.jpg',
    'tours/14-days-grand.jpg': 'explore-tour-4.jpg',
    'tours/yala-safari.jpg': '1894272Yala_Jeep_Safari.jpg',
    'tours/wildlife.jpg': 'yalaSafariTiger.jpg',
    'tours/beach-escape.jpg': 'Marble-Beach.jpg',
    'tours/honeymoon.jpg': 'destination-9.jpg',
    'tours/about-journey.jpg': 'about-img.jpg', // larger than png

    // Blog
    'blog/best-time-to-visit.jpg': '116-1024x683.jpg',
    'blog/packing.jpg': 'pexels-pixabay-46254.jpg',
    'blog/private-tours.jpg': 'carousel-1.jpg',

    // Team / about
    'team/about.jpg': 'about-img.jpg',

    // Categories (home)
    'tours/category-day.jpg': 'explore-tour-1.jpg',
    'tours/category-multi.jpg': 'explore-tour-2.jpg',
    'tours/category-wildlife.jpg': '1894272Yala_Jeep_Safari.jpg',
    'tours/category-honeymoon.jpg': 'destination-9.jpg',
    'tours/cta-journey.jpg': '20240328_184153.jpg',
  };

  const copied = [];
  for (const [relDest, srcName] of Object.entries(map)) {
    const from = path.isAbsolute(srcName) ? srcName : path.join(SRC, srcName);
    if (!fs.existsSync(from)) {
      console.warn('SKIP missing', srcName);
      continue;
    }
    const to = path.join(OUT, relDest);
    await copyFile(from, to);
    copied.push(to);

    const ext = path.extname(to).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const webpPath = to.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const maxW = relDest.startsWith('hero/') ? 1920 : 1400;
      const q = relDest.startsWith('hero/') ? 80 : 82;
      await toWebp(from, webpPath, q, maxW);
      console.log('WEBP', path.relative(OUT, webpPath));
    }
  }

  // Gallery WhatsApp + IMG photos with clean names; skip smaller duplicates (*)
  const gallerySources = fs
    .readdirSync(SRC)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .filter((n) => /^(WhatsApp Image|IMG-)/i.test(n))
    .filter((n) => !n.includes('(1)')); // prefer non-duplicate filenames; if both exist pick larger below

  let gi = 1;
  for (const name of gallerySources.sort()) {
    const from = path.join(SRC, name);
    const altDup = name.replace(/\.jpeg$/i, ' (1).jpeg').replace(/\.jpg$/i, ' (1).jpg');
    const dupPath = path.join(SRC, altDup);
    const best = fs.existsSync(dupPath) ? pickLarger(from, dupPath) : from;
    const slug = `gallery-${String(gi).padStart(2, '0')}.jpg`;
    const to = path.join(OUT, 'gallery', slug);
    await copyFile(best, to);
    await toWebp(best, to.replace(/\.jpg$/i, '.webp'), 80, 1600);
    gi += 1;
  }

  // Also keep turtles and leftover named assets in gallery
  for (const extra of ['turtles.jpg', 'pexels-malindabandaralk-16508230.jpg']) {
    const from = path.join(SRC, extra);
    if (fs.existsSync(from)) {
      const slug = `gallery-${extra.replace(/\s+/g, '-').toLowerCase()}`;
      const to = path.join(OUT, 'gallery', slug);
      await copyFile(from, to);
      if (/\.(jpe?g|png)$/i.test(to)) {
        await toWebp(from, to.replace(/\.(jpe?g|png)$/i, '.webp'), 80, 1600);
      }
    }
  }

  // Create assets manifesto for JSON updates
  const manifest = {
    logos: {
      color: '/assets/images/logos/logo-color.svg',
      colorPng: '/assets/images/logos/logo-color.png',
      whiteTransparent: '/assets/images/logos/logo-white-transparent.png',
      whiteSvg: '/assets/images/logos/logo-white.svg',
      blackTransparent: '/assets/images/logos/logo-black-transparent.png',
      blackSvg: '/assets/images/logos/logo-black.svg',
      transparent: '/assets/images/logos/logo-transparent.png',
      favicon: '/favicon.png',
    },
    hero: {
      main: '/assets/images/hero/hero-main.webp',
      teaCountry: '/assets/images/hero/hero-tea-country.webp',
      ella: '/assets/images/hero/hero-ella-bridge.webp',
      coast: '/assets/images/hero/hero-coast.webp',
      cta: '/assets/images/tours/cta-journey.webp',
    },
  };
  fs.writeFileSync(
    path.join(OUT, 'image-manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log('Organized images. Gallery count ~', gi - 1);
  console.log('Manifest written to assets/images/image-manifest.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
