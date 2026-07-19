import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBookingRef, validateBooking } from './_lib/validation/booking.schema';
import { SmtpEmailAdapter } from './_lib/email/smtp.adapter';
import { BookingEmailService } from './_lib/email/email.service';

/**
 * Vercel Serverless Function — POST /api/bookings
 * Frontend contract is stable; swap this host for .NET/Node API later via apiBaseUrl.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const parsed = validateBooking(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.error });
  }

  const bookingRef = createBookingRef();
  const emailService = new BookingEmailService(new SmtpEmailAdapter());

  try {
    await emailService.sendBookingEmails(parsed.data, bookingRef);
  } catch (error) {
    console.error('[bookings] email failed', error);
    return res.status(502).json({
      message: 'Booking accepted locally but email delivery failed. Please contact us.',
      bookingRef,
      status: 'pending',
    });
  }

  return res.status(201).json({
    bookingRef,
    status: 'confirmed',
    message: 'Booking request received. Confirmation emails sent.',
  });
}
