import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  NoPreloading,
} from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { IMAGE_CONFIG } from '@angular/common';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { APP_CONFIG } from './core/config/app.config';
import { LocaleService } from './core/services/locale.service';
import { AnalyticsService } from './core/services/analytics.service';
import { ConsentService } from './core/services/consent.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
      withPreloading(NoPreloading),
    ),
    // Event replay adds main-thread work; not needed for CSR-first paint / TBT.
    provideClientHydration(),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [640, 768, 1024, 1280, 1600],
        placeholderResolution: 30,
      },
    },
    provideTransloco({
      config: {
        availableLangs: [...APP_CONFIG.supportedLocales],
        defaultLang: APP_CONFIG.defaultLocale,
        fallbackLang: APP_CONFIG.defaultLocale,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      inject(ConsentService).init();
      inject(AnalyticsService).init();
      return inject(LocaleService).init();
    }),
  ],
};
