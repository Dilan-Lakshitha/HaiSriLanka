import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { LocaleService } from '../services/locale.service';
import { APP_CONFIG } from '../config/app.config';

/**
 * Ensures `:lang` is a supported locale, activates Transloco, and redirects invalid langs to default.
 */
export const localeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const locale = inject(LocaleService);
  const router = inject(Router);
  const lang = route.paramMap.get('lang') ?? APP_CONFIG.defaultLocale;

  if (!locale.isSupported(lang)) {
    const childPath = route.url.map((s) => s.path).join('/');
    return router.createUrlTree(['/', APP_CONFIG.defaultLocale, childPath].filter(Boolean));
  }

  locale.setActiveLang(lang);
  return true;
};

/**
 * Redirect `/` to preferred locale home (`/:lang`).
 */
export const rootRedirectGuard: CanActivateFn = () => {
  const locale = inject(LocaleService);
  const router = inject(Router);
  const preferred = locale.resolvePreferredLang();
  return router.createUrlTree(['/', preferred]);
};
