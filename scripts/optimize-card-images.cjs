/**
 * Recompress homepage card/map images to ~1.15× display width (PSI image-delivery).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'src/assets/images');

const webpJobs = [
  // Tour cards ~365 CSS px
  { file: 'tours/3-nights-4-days/hero.webp', width: 420, quality: 55 },
  { file: 'tours/4-nights-5-days/hero.webp', width: 420, quality: 55 },
  { file: 'tours/kandy-day-tour/hero.webp', width: 420, quality: 55 },
  { file: 'tours/7-days-sri-lanka-highlights/hero.webp', width: 420, quality: 55 },
  { file: 'tours/galle-day-tour/hero.webp', width: 420, quality: 55 },
  { file: 'tours/sigiriya-dambulla-day-tour/hero.webp', width: 420, quality: 55 },
  // Map image ~532 CSS px
  { file: 'destinations/ella-bridge.webp', width: 560, quality: 55 },
  // Destination cards ~309–367 CSS px
  { file: 'destinations/galle.webp', width: 360, quality: 55 },
  { file: 'destinations/sigiriya.webp', width: 360, quality: 55 },
  { file: 'destinations/kandy.webp', width: 420, quality: 55 },
  { file: 'destinations/yala.webp', width: 420, quality: 55 },
  // Category tiles ~274 CSS px
  { file: 'tours/category-honeymoon.webp', width: 340, quality: 55 },
  { file: 'tours/category-day.webp', width: 340, quality: 55 },
  { file: 'tours/category-wildlife.webp', width: 340, quality: 55 },
  { file: 'tours/category-multi.webp', width: 340, quality: 55 },
];

async function optimizeWebp(job) {
  const file = path.join(IMG, job.file);
  if (!fs.existsSync(file)) {
    console.warn('skip missing', job.file);
    return null;
  }
  const inputBuf = fs.readFileSync(file);
  const oldSize = inputBuf.length;
  const outBuf = await sharp(inputBuf)
    .rotate()
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toBuffer();
  const meta = await sharp(outBuf).metadata();
  if (outBuf.length < oldSize) {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, outBuf);
    fs.renameSync(tmp, file);
    console.log(
      `${job.file}: ${(oldSize / 1024).toFixed(1)} → ${(outBuf.length / 1024).toFixed(1)} KiB (${meta.width}x${meta.height})`,
    );
  } else {
    console.log(`${job.file}: kept ${(oldSize / 1024).toFixed(1)} KiB (no win)`);
  }
  return { file: job.file, width: meta.width, height: meta.height };
}

async function run() {
  const dims = {};
  for (const job of webpJobs) {
    const result = await optimizeWebp(job);
    if (result) dims[result.file] = result;
  }
  console.log(JSON.stringify(dims, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
