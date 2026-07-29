/**
 * Recompress homepage image-delivery offenders from PageSpeed.
 * Card images display ~300–530px; keep ~800px (2×) WebP sources.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'src/assets/images');

/** In-place WebP recompress (resize + quality). */
const webpJobs = [
  // Tour card heroes (~365px display)
  { file: 'tours/3-nights-4-days/hero.webp', width: 800, quality: 68 },
  { file: 'tours/kandy-day-tour/hero.webp', width: 800, quality: 68 },
  { file: 'tours/7-days-sri-lanka-highlights/hero.webp', width: 800, quality: 68 },
  { file: 'tours/galle-day-tour/hero.webp', width: 800, quality: 68 },
  { file: 'tours/sigiriya-dambulla-day-tour/hero.webp', width: 800, quality: 68 },
  // Destination / map cards
  { file: 'destinations/ella-bridge.webp', width: 900, quality: 68 },
  { file: 'destinations/galle.webp', width: 720, quality: 68 },
  { file: 'destinations/kandy.webp', width: 800, quality: 68 },
  { file: 'destinations/yala.webp', width: 800, quality: 68 },
  { file: 'destinations/sigiriya.webp', width: 720, quality: 68 },
  // Categories (already OK-ish; tighten a bit for 274px display)
  { file: 'tours/category-honeymoon.webp', width: 560, quality: 68 },
  { file: 'tours/category-day.webp', width: 560, quality: 68 },
  { file: 'tours/category-wildlife.webp', width: 560, quality: 68 },
  { file: 'tours/category-multi.webp', width: 560, quality: 68 },
];

async function optimizeWebp(job) {
  const file = path.join(IMG, job.file);
  if (!fs.existsSync(file)) {
    console.warn('skip missing', job.file);
    return;
  }
  const inputBuf = fs.readFileSync(file);
  const oldSize = inputBuf.length;
  const outBuf = await sharp(inputBuf)
    .rotate()
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toBuffer();
  if (outBuf.length >= oldSize * 0.98) {
    console.log(`${job.file}: kept ${(oldSize / 1024).toFixed(1)} KiB (no win)`);
    return;
  }
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, outBuf);
  fs.renameSync(tmp, file);
  console.log(
    `${job.file}: ${(oldSize / 1024).toFixed(1)} → ${(outBuf.length / 1024).toFixed(1)} KiB`,
  );
}

async function convertPngToWebp() {
  const pngRel = 'tours/guest-experiences/elephant-sigiriya.png';
  const png = path.join(IMG, pngRel);
  const webp = path.join(IMG, 'tours/guest-experiences/elephant-sigiriya.webp');
  if (!fs.existsSync(png)) {
    console.warn('skip missing', pngRel);
    return;
  }
  const inputBuf = fs.readFileSync(png);
  const outBuf = await sharp(inputBuf)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();
  fs.writeFileSync(webp, outBuf);
  console.log(
    `elephant-sigiriya: ${(inputBuf.length / 1024).toFixed(1)} KiB PNG → ${(outBuf.length / 1024).toFixed(1)} KiB WebP`,
  );
}

async function run() {
  for (const job of webpJobs) {
    await optimizeWebp(job);
  }
  await convertPngToWebp();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
