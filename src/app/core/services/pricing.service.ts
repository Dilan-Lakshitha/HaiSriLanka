import { Injectable } from '@angular/core';
import type { PersonCountKey, PersonPricing, Tour, TourPricingTier } from '../models/tour.model';
import { pricingToMap, tourPriceMap } from '../models/tour.model';

const MAX_PRICED_TRAVELERS = 6;

@Injectable({ providedIn: 'root' })
export class PricingService {
  resolveTable(source: PersonPricing | TourPricingTier[] | Tour): PersonPricing {
    if (Array.isArray(source)) {
      return pricingToMap(source);
    }
    if (typeof source === 'object' && source && 'pricing' in source) {
      return tourPriceMap(source as Tour);
    }
    return source as PersonPricing;
  }

  getPricePerPerson(
    pricing: PersonPricing | TourPricingTier[] | Tour,
    travelers: number,
  ): number {
    const table = this.resolveTable(pricing);
    const count = this.clampPricedCount(travelers);
    for (let n = count; n >= 1; n--) {
      const value = table[String(n) as PersonCountKey];
      if (typeof value === 'number' && value > 0) {
        return value;
      }
    }
    return 0;
  }

  getTotal(pricing: PersonPricing | TourPricingTier[] | Tour, travelers: number): number {
    const count = this.clampPricedCount(travelers);
    return this.getPricePerPerson(pricing, count) * count;
  }

  private clampPricedCount(travelers: number): number {
    const n = Number.isFinite(travelers) ? Math.trunc(travelers) : 1;
    return Math.min(Math.max(n, 1), MAX_PRICED_TRAVELERS);
  }
}
