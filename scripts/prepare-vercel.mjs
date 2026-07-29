import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Angular SSR emits `index.csr.html`. Copying it to `index.html` makes Vercel
 * serve the CSR shell for `/` before rewrites — which defeats SSR.
 * Keep only `index.csr.html` so page traffic goes to `/api/ssr`.
 */
const browserDir = join(process.cwd(), 'dist/haisrilanka/browser');
const csr = join(browserDir, 'index.csr.html');
const index = join(browserDir, 'index.html');

if (!existsSync(csr)) {
  console.error('prepare-vercel: missing dist/haisrilanka/browser/index.csr.html');
  process.exit(1);
}

if (existsSync(index)) {
  unlinkSync(index);
  console.log('prepare-vercel: removed index.html (SSR via /api/ssr)');
} else {
  console.log('prepare-vercel: no index.html present (good for SSR)');
}
