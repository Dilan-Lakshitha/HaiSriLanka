import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Angular SSR on Vercel. Page routes rewrite here with `?__path=…`.
 * Keep includeFiles limited to server bundle + CSR fallback shell (not /assets).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    restoreOriginalUrl(req);
    ensureAllowedHost(req);

    const serverPath = path.join(
      process.cwd(),
      'dist/haisrilanka/server/server.mjs',
    );
    const mod = await import(pathToFileURL(serverPath).href);
    const reqHandler = mod.reqHandler as (
      req: VercelRequest,
      res: VercelResponse,
      next?: (err?: unknown) => void,
    ) => unknown;

    return await new Promise<void>((resolve, reject) => {
      const finish = () => resolve();
      res.once('finish', finish);
      res.once('close', finish);

      try {
        const result = reqHandler(req, res, (err?: unknown) => {
          if (err) {
            reject(err);
            return;
          }
          if (!res.headersSent) {
            serveCsrFallback(res);
            resolve();
          }
        });
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          (result as Promise<unknown>).catch(reject);
        }
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    console.error('[ssr] function failed', message);
    if (!res.headersSent) {
      if (serveCsrFallback(res)) return;
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`SSR failed:\n${message}`);
    }
  }
}

function ensureAllowedHost(req: VercelRequest): void {
  const host = String(req.headers.host || '');
  const allowed =
    host.includes('haisrilanka.com') ||
    host.includes('vercel.app') ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1');
  if (allowed) return;

  req.headers.host = 'www.haisrilanka.com';
  req.headers['x-forwarded-host'] = 'www.haisrilanka.com';
  req.headers['x-forwarded-proto'] = 'https';
}

function restoreOriginalUrl(req: VercelRequest): void {
  const fromQuery =
    typeof req.query['__path'] === 'string'
      ? req.query['__path']
      : Array.isArray(req.query['__path'])
        ? req.query['__path'][0]
        : null;

  let pathName = fromQuery || req.url || '/';
  if (pathName.startsWith('/api/ssr')) {
    pathName = pathName.slice('/api/ssr'.length) || '/';
  }

  const qIndex = pathName.indexOf('?');
  let pathname = qIndex >= 0 ? pathName.slice(0, qIndex) : pathName;
  const params = new URLSearchParams(
    qIndex >= 0 ? pathName.slice(qIndex + 1) : '',
  );
  params.delete('__path');

  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '__path' || params.has(key)) continue;
      if (typeof value === 'string') params.set(key, value);
      else if (Array.isArray(value) && typeof value[0] === 'string') {
        params.set(key, value[0]);
      }
    }
  }

  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  const qs = params.toString();
  req.url = qs ? `${pathname}?${qs}` : pathname || '/';
}

function serveCsrFallback(res: VercelResponse): boolean {
  const csrPath = path.join(
    process.cwd(),
    'dist/haisrilanka/browser/csr-shell.html',
  );
  if (!existsSync(csrPath)) return false;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-SSR-Fallback', 'csr');
  res.end(readFileSync(csrPath, 'utf8'));
  return true;
}
