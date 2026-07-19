import type { BookingPayload } from '../../types/booking.types';

export function adminBookingHtml(booking: BookingPayload, bookingRef: string): string {
  return `
    <h1>New booking request ${bookingRef}</h1>
    <p><strong>Tour:</strong> ${booking.tourTitle} (${booking.tourSlug})</p>
    <p><strong>Travelers:</strong> ${booking.travelersCount}</p>
    <p><strong>Date:</strong> ${booking.travelDate}</p>
    <p><strong>Total:</strong> ${booking.currency} ${booking.totalPrice} (${booking.currency} ${booking.pricePerPerson}/person)</p>
    <p><strong>Guest:</strong> ${booking.primaryTraveler.firstName} ${booking.primaryTraveler.lastName}</p>
    <p><strong>Email:</strong> ${booking.primaryTraveler.email}</p>
    <p><strong>Phone:</strong> ${booking.primaryTraveler.phone}</p>
    <p><strong>Locale:</strong> ${booking.locale}</p>
    <p><strong>Notes:</strong> ${booking.primaryTraveler.specialRequests || '—'}</p>
  `;
}

export function travelerConfirmationHtml(booking: BookingPayload, bookingRef: string): string {
  return `
    <h1>Booking request received</h1>
    <p>Dear ${booking.primaryTraveler.firstName},</p>
    <p>Thank you for choosing Hai Sri Lanka Tours. We have received your booking request.</p>
    <p><strong>Reference:</strong> ${bookingRef}</p>
    <p><strong>Tour:</strong> ${booking.tourTitle}</p>
    <p><strong>Travelers:</strong> ${booking.travelersCount}</p>
    <p><strong>Date:</strong> ${booking.travelDate}</p>
    <p><strong>Estimated total:</strong> ${booking.currency} ${booking.totalPrice}</p>
    <p>Our team will contact you shortly to confirm details. No payment has been taken online.</p>
    <p>— Hai Sri Lanka Tours</p>
  `;
}
