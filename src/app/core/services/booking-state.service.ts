import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { BookingConfirmationDetails, BookingState, TravelerInfo } from '../models';
import type { PersonPricing } from '../models/tour.model';
import { PricingService } from './pricing.service';

const CONFIRMATION_STORAGE_KEY = 'hsl.booking.confirmation';

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly state = signal<BookingState>(initialState);
  private readonly confirmationState = signal<BookingConfirmationDetails | null>(
    this.readStoredConfirmation(),
  );
  private pricingTable: PersonPricing | null = null;

  readonly snapshot = this.state.asReadonly();
  readonly confirmation = this.confirmationState.asReadonly();
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

  setConfirmation(details: BookingConfirmationDetails): void {
    this.confirmationState.set(details);
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(details));
    } catch {
      /* ignore quota / private mode */
    }
  }

  clearConfirmation(): void {
    this.confirmationState.set(null);
    if (!this.isBrowser) return;
    try {
      sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  reset(): void {
    this.pricingTable = null;
    this.state.set(initialState);
  }

  private readStoredConfirmation(): BookingConfirmationDetails | null {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as BookingConfirmationDetails;
    } catch {
      return null;
    }
  }
}
