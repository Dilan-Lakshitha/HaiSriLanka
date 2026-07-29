import type { BookingPayload, EmailPort } from '../types/booking.types';
import { adminBookingHtml, travelerConfirmationHtml } from './templates/booking.templates';

/** Always notified of new bookings (merged with BOOKING_ADMIN_EMAIL env). */
const DEFAULT_BOOKING_ADMINS = [
  'haisrilankatour@gmail.com',
  'dilanlakshitha194@gmail.com',
  'sithumihishani20@gmail.com',
];

function resolveAdminRecipients(): string[] {
  const fromEnv = (process.env['BOOKING_ADMIN_EMAIL'] || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const recipients = [...new Set([...DEFAULT_BOOKING_ADMINS, ...fromEnv])];
  if (recipients.length) return recipients;

  const smtpUser = process.env['SMTP_USER']?.trim();
  return smtpUser ? [smtpUser] : [];
}

/**
 * Sends booking emails to admin inbox(es) and the guest.
 * Swap SmtpEmailAdapter for another EmailPort without changing callers.
 */
export class BookingEmailService {
  constructor(private readonly mailer: EmailPort) {}

  async sendBookingEmails(booking: BookingPayload, bookingRef: string): Promise<void> {
    const adminRecipients = resolveAdminRecipients();
    if (!adminRecipients.length) {
      throw new Error('BOOKING_ADMIN_EMAIL is not configured');
    }

    const adminHtml = adminBookingHtml(booking, bookingRef);
    const guestHtml = travelerConfirmationHtml(booking, bookingRef);

    // Both parties: ops team (all admins) + traveler confirmation
    await Promise.all([
      this.mailer.send({
        to: adminRecipients.join(', '),
        subject: `[Hai Sri Lanka Tours] New booking ${bookingRef} — ${booking.tourTitle}`,
        html: adminHtml,
        text: adminHtml.replace(/<[^>]+>/g, ' '),
      }),
      this.mailer.send({
        to: booking.primaryTraveler.email,
        subject: `Booking request received — ${booking.tourTitle} (${bookingRef})`,
        html: guestHtml,
        text: guestHtml.replace(/<[^>]+>/g, ' '),
      }),
    ]);
  }
}
