import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideClientHydration } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Hydration only when SSR HTML is actually served (not on CSR Vercel path).
    provideClientHydration(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
