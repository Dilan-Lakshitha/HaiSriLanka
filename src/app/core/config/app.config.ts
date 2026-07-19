import { environment } from '../../../environments/environment';

export const APP_CONFIG = {
  siteName: environment.siteName,
  siteUrl: environment.siteUrl,
  defaultLocale: environment.defaultLocale,
  apiBaseUrl: environment.apiBaseUrl,
  bookingApiPath: environment.bookingApiPath,
  contactApiPath: environment.contactApiPath,
  cookieLocaleKey: 'hsl_lang',
  supportedLocales: [
    'en',
    'de',
    'fr',
    'es',
    'it',
    'nl',
    'pl',
    'sv',
    'ru',
    'ja',
    'zh',
  ] as const,
} as const;

export type SupportedLocale = (typeof APP_CONFIG.supportedLocales)[number];
