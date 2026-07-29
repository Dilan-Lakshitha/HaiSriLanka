/**
 * Recompress homepage LCP/CLS image offenders flagged by PageSpeed.
 * Overwrites source assets in-place with smaller display-sized files.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'src/assets/images');

const jobs = [
  {
    file: path.join(IMG, 'logos/logo-white-transparent.png'),
    width: 400,
    format: 'png',
  },
  {
    file: path.join(IMG, 'logos/logo-black-transparent.png'),
    width: 400,
    format: 'png',
  },
  {
    file: path.join(IMG, 'logos/logo-white-transparent.webp'),
    width: 400,
    quality: 82,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'logos/logo-black-transparent.webp'),
    width: 400,
    quality: 82,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'tours/category-honeymoon.webp'),
    width: 720,
    quality: 68,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'tours/category-multi.webp'),
    width: 720,
    quality: 68,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'tours/category-day.webp'),
    width: 720,
    quality: 68,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'tours/category-wildlife.webp'),
    width: 720,
    quality: 68,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments-800.webp'),
    width: 800,
    quality: 42,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments-960.webp'),
    width: 960,
    quality: 42,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments.webp'),
    width: 960,
    quality: 42,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments-800.avif'),
    width: 800,
    quality: 36,
    format: 'avif',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments-960.avif'),
    width: 960,
    quality: 34,
    format: 'avif',
  },
  {
    file: path.join(IMG, 'hero/carousel-guest-moments.avif'),
    width: 960,
    quality: 34,
    format: 'avif',
  },
  {
    file: path.join(IMG, 'hero/carousel-safari-guests.webp'),
    width: 600,
    quality: 50,
    format: 'webp',
  },
  {
    file: path.join(IMG, 'hero/carousel-king-coconut.webp'),
    width: 1920,
    quality: 88,
    format: 'webp',
  },
];

async function optimize(job) {
  const inputBuf = fs.readFileSync(job.file);
  const oldSize = inputBuf.length;
  const pipeline = sharp(inputBuf).rotate().resize({
    width: job.width,
    withoutEnlargement: true,
  });
  const outBuf =
    job.format === 'png'
      ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
      : job.format === 'avif'
        ? await pipeline.avif({ quality: job.quality || 45, effort: 6 }).toBuffer()
        : await pipeline.webp({ quality: job.quality || 75 }).toBuffer();

  const tmp = `${job.file}.tmp`;
  fs.writeFileSync(tmp, outBuf);
  fs.renameSync(tmp, job.file);
  console.log(
    `${path.relative(ROOT, job.file)}: ${(oldSize / 1024).toFixed(1)} KiB → ${(outBuf.length / 1024).toFixed(1)} KiB`,
  );
}

async function run() {
  for (const job of jobs) {
    await optimize(job);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
