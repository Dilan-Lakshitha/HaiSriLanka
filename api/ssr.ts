/**
 * Vercel Node serverless entry for Angular SSR.
 * Static assets are served from outputDirectory; unmatched routes hit this handler.
 */
export default async function handler(request: Request): Promise<Response> {
  // Angular's SSR output has no .d.ts — suppress Vercel/TS7016 for this dynamic import.
  // @ts-expect-error — runtime module from `ng build` (dist/haisrilanka/server/server.mjs)
  const { reqHandler } = await import('../dist/haisrilanka/server/server.mjs');
  return (reqHandler as (request: Request) => Promise<Response>)(request);
}
