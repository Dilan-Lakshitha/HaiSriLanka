import type { PersonPricing } from './tour.model';

export interface TravelerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality?: string;
  specialRequests?: string;
}

export interface BookingRequest {
  tourSlug: string;
  tourTitle: string;
  tourDuration?: string;
  travelersCount: 1 | 2 | 3 | 4 | 5;
  travelDate: string;
  pricePerPerson: number;
  totalPrice: number;
  currency: 'USD' | 'EUR';
  primaryTraveler: TravelerInfo;
  locale: string;
}

export interface BookingResponse {
  bookingRef: string;
  status: 'confirmed' | 'pending';
  message: string;
}

export interface BookingState {
  tourSlug: string | null;
  travelersCount: 1 | 2 | 3 | 4 | 5;
  travelDate: string | null;
  primaryTraveler: TravelerInfo | null;
  pricePerPerson: number;
  totalPrice: number;
  currency: 'USD' | 'EUR';
}

/** Snapshot shown on the booking confirmation page after submit. */
export interface BookingConfirmationDetails {
  bookingRef: string;
  status: 'confirmed' | 'pending';
  message: string;
  tourSlug: string;
  tourTitle: string;
  tourDuration?: string;
  travelersCount: number;
  travelDate: string;
  pricePerPerson: number;
  totalPrice: number;
  currency: 'USD' | 'EUR';
  primaryTraveler: TravelerInfo;
}

export type { PersonPricing };
