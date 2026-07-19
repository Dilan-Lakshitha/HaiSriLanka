import type { BookingPayload, EmailPort } from '../types/booking.types';
import { adminBookingHtml, travelerConfirmationHtml } from './templates/booking.templates';

/**
 * Email application service adapter-agnostic.
 * Swap SmtpEmailAdapter for another EmailPort without changing callers.
 */
export class BookingEmailService {
  constructor(private readonly mailer: EmailPort) {}

  async sendBookingEmails(booking: BookingPayload, bookingRef: string): Promise<void> {
    const adminTo = process.env.BOOKING_ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminTo) {
      throw new Error('BOOKING_ADMIN_EMAIL is not configured');
    }

    const adminHtml = adminBookingHtml(booking, bookingRef);
    const guestHtml = travelerConfirmationHtml(booking, bookingRef);

    await Promise.all([
      this.mailer.send({
        to: adminTo,
        subject: `[Hai Sri Lanka] Booking ${bookingRef} ${booking.tourTitle}`,
        html: adminHtml,
        text: adminHtml.replace(/<[^>]+>/g, ' '),
      }),
      this.mailer.send({
        to: booking.primaryTraveler.email,
        subject: `Booking request received ${bookingRef}`,
        html: guestHtml,
        text: guestHtml.replace(/<[^>]+>/g, ' '),
      }),
    ]);
  }
}
