import { Injectable, computed, inject, signal } from '@angular/core';
import type { BookingState, TravelerInfo } from '../models';
import type { PersonPricing } from '../models/tour.model';
import { PricingService } from './pricing.service';

const initialState: BookingState = {
  tourSlug: null,
  travelersCount: 2,
  travelDate: null,
  primaryTraveler: null,
  pricePerPerson: 0,
  totalPrice: 0,
  currency: 'USD',
};

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private readonly pricing = inject(PricingService);
  private readonly state = signal<BookingState>(initialState);
  private pricingTable: PersonPricing | null = null;

  readonly snapshot = this.state.asReadonly();
  readonly travelersCount = computed(() => this.state().travelersCount);
  readonly totalPrice = computed(() => this.state().totalPrice);
  readonly pricePerPerson = computed(() => this.state().pricePerPerson);

  selectTour(tourSlug: string, pricing: PersonPricing, currency: 'USD' | 'EUR'): void {
    this.pricingTable = pricing;
    const travelers = this.state().travelersCount;
    this.state.update((s) => ({
      ...s,
      tourSlug,
      currency,
      pricePerPerson: this.pricing.getPricePerPerson(pricing, travelers),
      totalPrice: this.pricing.getTotal(pricing, travelers),
    }));
  }

  setTravelersCount(count: 1 | 2 | 3 | 4 | 5): void {
    if (!this.pricingTable) {
      this.state.update((s) => ({ ...s, travelersCount: count }));
      return;
    }
    this.state.update((s) => ({
      ...s,
      travelersCount: count,
      pricePerPerson: this.pricing.getPricePerPerson(this.pricingTable!, count),
      totalPrice: this.pricing.getTotal(this.pricingTable!, count),
    }));
  }

  setTravelDate(date: string): void {
    this.state.update((s) => ({ ...s, travelDate: date }));
  }

  setPrimaryTraveler(traveler: TravelerInfo): void {
    this.state.update((s) => ({ ...s, primaryTraveler: traveler }));
  }

  reset(): void {
    this.pricingTable = null;
    this.state.set(initialState);
  }
}
