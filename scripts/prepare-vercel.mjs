import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Angular SSR builds emit `index.csr.html` (no `index.html`).
 * Vercel static hosting + SPA rewrites need `index.html`.
 */
const browserDir = join(process.cwd(), 'dist/haisrilanka/browser');
const csr = join(browserDir, 'index.csr.html');
const index = join(browserDir, 'index.html');

if (!existsSync(csr)) {
  console.error('prepare-vercel: missing dist/haisrilanka/browser/index.csr.html');
  process.exit(1);
}

copyFileSync(csr, index);
console.log('prepare-vercel: copied index.csr.html → index.html');
