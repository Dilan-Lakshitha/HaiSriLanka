import { existsSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Angular SSR emits `index.csr.html` (+ sometimes `index.html`).
 * Vercel filesystem routing can serve those for `/` and bypass `/api/ssr`.
 * Rename the CSR shell out of the way; keep it only as an SSR failure fallback.
 */
const browserDir = join(process.cwd(), 'dist/haisrilanka/browser');
const csr = join(browserDir, 'index.csr.html');
const index = join(browserDir, 'index.html');
const shell = join(browserDir, 'csr-shell.html');

if (!existsSync(csr) && !existsSync(shell)) {
  console.error('prepare-vercel: missing CSR shell (index.csr.html)');
  process.exit(1);
}

if (existsSync(index)) {
  unlinkSync(index);
  console.log('prepare-vercel: removed index.html');
}

if (existsSync(csr)) {
  if (existsSync(shell)) unlinkSync(shell);
  renameSync(csr, shell);
  console.log('prepare-vercel: renamed index.csr.html → csr-shell.html');
} else {
  console.log('prepare-vercel: csr-shell.html already present');
}
