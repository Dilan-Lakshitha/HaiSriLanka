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
    const rest = childSegments(route);
    // Unknown 2-letter locale (/lt/faq) → /en/faq. Junk files (/yalpanam.html) → /en.
    if (/^[a-z]{2}$/i.test(lang)) {
      return router.createUrlTree(['/', APP_CONFIG.defaultLocale, ...rest]);
    }
    return router.createUrlTree(['/', APP_CONFIG.defaultLocale]);
  }

  locale.setActiveLang(lang);
  return true;
};

function childSegments(route: ActivatedRouteSnapshot): string[] {
  const parts: string[] = [];
  let child = route.firstChild;
  while (child) {
    parts.push(...child.url.map((s) => s.path));
    child = child.firstChild;
  }
  return parts.filter(Boolean);
}

/**
 * Redirect `/` to preferred locale home (`/:lang`).
 */
export const rootRedirectGuard: CanActivateFn = () => {
  const locale = inject(LocaleService);
  const router = inject(Router);
  const preferred = locale.resolvePreferredLang();
  return router.createUrlTree(['/', preferred]);
};
