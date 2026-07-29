import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Angular SSR builds emit `index.csr.html` (no `index.html`).
 * Vercel static hosting + SPA rewrites need `index.html`.
 * Also injects modulepreload hints to shorten the JS critical chain
 * (HTML → main → bootstrap → angular was fully serial).
 */
const browserDir = join(process.cwd(), 'dist/haisrilanka/browser');
const csr = join(browserDir, 'index.csr.html');
const index = join(browserDir, 'index.html');
const renamed = join(browserDir, 'csr-shell.html');

if (existsSync(renamed) && !existsSync(csr)) {
  copyFileSync(renamed, index);
  console.log('prepare-vercel: copied csr-shell.html → index.html');
} else if (existsSync(csr)) {
  copyFileSync(csr, index);
  console.log('prepare-vercel: copied index.csr.html → index.html');
} else if (existsSync(index)) {
  console.log('prepare-vercel: index.html already present');
} else {
  console.error('prepare-vercel: missing CSR shell HTML');
  process.exit(1);
}

injectModulePreloads(index);

function injectModulePreloads(indexPath) {
  if (!existsSync(indexPath)) return;
  let html = readFileSync(indexPath, 'utf8');
  if (html.includes('rel="modulepreload"')) {
    console.log('prepare-vercel: modulepreload already present');
    return;
  }

  const mainMatch = html.match(/src="(main-[^"]+\.js)"/);
  if (!mainMatch) {
    console.log('prepare-vercel: no main-*.js found for modulepreload');
    return;
  }

  const seen = new Set();
  const queue = [mainMatch[1]];
  const preloads = [];

  while (queue.length && preloads.length < 6) {
    const file = queue.shift();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    const full = join(browserDir, file);
    if (!existsSync(full)) continue;
    if (file !== mainMatch[1]) {
      preloads.push(file);
    }
    const src = readFileSync(full, 'utf8');
    for (const m of src.matchAll(/import\("\.\/([^"]+\.js)"\)/g)) {
      queue.push(m[1]);
    }
    for (const m of src.matchAll(/from"\.\/([^"]+\.js)"/g)) {
      queue.push(m[1]);
    }
  }

  if (!preloads.length) {
    console.log('prepare-vercel: no dynamic chunks to modulepreload');
    return;
  }

  const tags = preloads
    .map((f) => `<link rel="modulepreload" href="${f}">`)
    .join('');
  html = html.replace('</head>', `${tags}</head>`);
  writeFileSync(indexPath, html);
  console.log(`prepare-vercel: modulepreload → ${preloads.join(', ')}`);
}
