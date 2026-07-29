import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Node entry for Angular SSR.
 *
 * Vercel rewrites "/en/..." → "/api/ssr?__path=/en/...", so we restore the
 * visitor path before handing the request to Express/Angular.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    restoreOriginalUrl(req);

    // @ts-expect-error — built by `ng build` (no .d.ts for server.mjs)
    const { reqHandler } = await import('../dist/haisrilanka/server/server.mjs');

    await new Promise<void>((resolve, reject) => {
      const done = () => resolve();
      res.once('finish', done);
      res.once('close', done);

      try {
        const result = (
          reqHandler as (
            req: VercelRequest,
            res: VercelResponse,
            next?: (err?: unknown) => void,
          ) => unknown
        )(req, res, (err?: unknown) => {
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
    console.error('[ssr] function failed', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('SSR failed. Check Vercel function logs for details.');
    }
  }
}

function restoreOriginalUrl(req: VercelRequest): void {
  const forwarded =
    typeof req.headers['x-forwarded-uri'] === 'string'
      ? req.headers['x-forwarded-uri']
      : null;

  const fromQuery =
    typeof req.query['__path'] === 'string'
      ? req.query['__path']
      : Array.isArray(req.query['__path'])
        ? req.query['__path'][0]
        : null;

  let path = forwarded || fromQuery || req.url || '/';

  // Strip accidental function prefix if present.
  if (path.startsWith('/api/ssr')) {
    path = path.slice('/api/ssr'.length) || '/';
  }

  // Drop our internal query param; keep any real visitor query string.
  const qIndex = path.indexOf('?');
  let pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const search = qIndex >= 0 ? path.slice(qIndex + 1) : '';

  const params = new URLSearchParams(search);
  params.delete('__path');

  // Also strip __path from req.query-derived URL when path had no query.
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '__path' || params.has(key)) continue;
      if (typeof value === 'string') params.set(key, value);
      else if (Array.isArray(value) && typeof value[0] === 'string') params.set(key, value[0]);
    }
  }

  const qs = params.toString();
  req.url = qs ? `${pathname}?${qs}` : pathname || '/';
}
