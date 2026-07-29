import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Optional Angular SSR entry. Page traffic currently uses CSR fallback
 * (`index.csr.html`) until this function is confirmed stable on Vercel.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    restoreOriginalUrl(req);

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

    await new Promise<void>((resolve, reject) => {
      const finish = () => resolve();
      res.once('finish', finish);
      res.once('close', finish);

      try {
        const result = reqHandler(req, res, (err?: unknown) => {
          if (err) reject(err);
          else if (!res.headersSent) {
            res.statusCode = 404;
            res.end('Not Found');
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
    const message = error instanceof Error ? error.stack || error.message : String(error);
    console.error('[ssr] function failed', message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`SSR failed:\n${message}`);
    }
  }
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
  const params = new URLSearchParams(qIndex >= 0 ? pathName.slice(qIndex + 1) : '');
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

  const qs = params.toString();
  req.url = qs ? `${pathname}?${qs}` : pathname || '/';
}
