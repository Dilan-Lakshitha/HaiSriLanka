import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * SSR render mode: server-render all routes for SEO crawlability.
 * Prerender can be introduced later for stable marketing URLs.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
