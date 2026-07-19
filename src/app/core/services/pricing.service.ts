import { Injectable, inject } from '@angular/core';
import type { PersonCountKey, PersonPricing, Tour, TourPricingTier } from '../models/tour.model';
import { pricingToMap, tourPriceMap } from '../models/tour.model';

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
    const key = String(Math.min(Math.max(travelers, 1), 5)) as PersonCountKey;
    return table[key];
  }

  getTotal(pricing: PersonPricing | TourPricingTier[] | Tour, travelers: number): number {
    const count = Math.min(Math.max(travelers, 1), 5);
    return this.getPricePerPerson(pricing, count) * count;
  }
}
