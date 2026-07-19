/**
 * Vercel Node serverless entry for Angular SSR.
 * Static assets are served from outputDirectory; unmatched routes hit this handler.
 */
export default async function handler(request: Request): Promise<Response> {
  const { reqHandler } = await import('../dist/haisrilanka/server/server.mjs');
  return reqHandler(request);
}
