import type { BookingPayload } from '../types/booking.types';

export function validateBooking(body: unknown): { ok: true; data: BookingPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON body' };
  }

  const data = body as Partial<BookingPayload>;
  if (!data.tourSlug || !data.tourTitle) {
    return { ok: false, error: 'Tour is required' };
  }
  if (![1, 2, 3, 4, 5].includes(Number(data.travelersCount))) {
    return { ok: false, error: 'Travelers must be 1–5' };
  }
  if (!data.travelDate) {
    return { ok: false, error: 'Travel date is required' };
  }
  const traveler = data.primaryTraveler;
  if (!traveler?.firstName || !traveler?.lastName || !traveler?.email || !traveler?.phone) {
    return { ok: false, error: 'Traveler information is incomplete' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) {
    return { ok: false, error: 'Invalid email address' };
  }

  return {
    ok: true,
    data: {
      tourSlug: String(data.tourSlug),
      tourTitle: String(data.tourTitle),
      travelersCount: Number(data.travelersCount) as 1 | 2 | 3 | 4 | 5,
      travelDate: String(data.travelDate),
      pricePerPerson: Number(data.pricePerPerson) || 0,
      totalPrice: Number(data.totalPrice) || 0,
      currency: data.currency === 'EUR' ? 'EUR' : 'USD',
      primaryTraveler: {
        firstName: traveler.firstName,
        lastName: traveler.lastName,
        email: traveler.email,
        phone: traveler.phone,
        nationality: traveler.nationality,
        specialRequests: traveler.specialRequests,
      },
      locale: String(data.locale || 'en'),
    },
  };
}

export function createBookingRef(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HSL-${stamp}-${rand}`;
}
