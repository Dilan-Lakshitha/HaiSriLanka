import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Angular SSR builds emit `index.csr.html` (no `index.html`).
 * Vercel static hosting + SPA rewrites need `index.html`.
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
