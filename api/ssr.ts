import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Node serverless entry for Angular SSR.
 * Static assets are served from outputDirectory; unmatched routes hit this handler.
 *
 * Important: Angular's `reqHandler` is a Node/Express (req, res) listener —
 * not a Web Fetch Request→Response handler.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Angular's SSR output has no .d.ts — suppress Vercel/TS7016 for this dynamic import.
    // @ts-expect-error — runtime module from `ng build` (dist/haisrilanka/server/server.mjs)
    const { reqHandler } = await import('../dist/haisrilanka/server/server.mjs');
    return (reqHandler as (req: VercelRequest, res: VercelResponse) => unknown)(req, res);
  } catch (error) {
    console.error('[ssr] function failed', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('SSR failed. Check Vercel function logs for details.');
  }
}
