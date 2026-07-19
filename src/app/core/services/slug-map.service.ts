import { Injectable, inject } from '@angular/core';
import type { Tour } from '../models';
import type { LocaleCode } from '../models/tour.model';

/**
 * Maps localized URL slugs to canonical English slugs (and reverse)
 * so language switching preserves SEO entity identity.
 */
@Injectable({ providedIn: 'root' })
export class SlugMapService {
  toCanonical(tour: Tour, localeSlug: string): string {
    if (tour.slug === localeSlug) {
      return tour.slug;
    }
    const localized = tour.localizedSlugs;
    if (!localized) {
      return localeSlug;
    }
    for (const value of Object.values(localized)) {
      if (value === localeSlug) {
        return tour.slug;
      }
    }
    return localeSlug;
  }

  toLocalized(tour: Tour, locale: LocaleCode | string): string {
    return tour.localizedSlugs?.[locale as LocaleCode] ?? tour.slug;
  }

  resolveTourFromSlug(tours: Tour[], slug: string, locale: string): Tour | undefined {
    return tours.find(
      (t) => t.slug === slug || t.localizedSlugs?.[locale as LocaleCode] === slug,
    );
  }
}
