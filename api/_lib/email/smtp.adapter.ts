import nodemailer from 'nodemailer';
import type { EmailMessage, EmailPort } from '../types/booking.types';

/**
 * Gmail SMTP adapter (or any SMTP provider via env).
 * Prefer Gmail App Password when 2FA is enabled.
 *
 * Env:
 * - SMTP_USER / SMTP_PASS (required to send)
 * - SMTP_HOST (default smtp.gmail.com)
 * - SMTP_PORT (default 587)
 * - SMTP_SECURE (default false for 587)
 * - SMTP_FROM (optional display from)
 */
export class SmtpEmailAdapter implements EmailPort {
  private readonly transporter = nodemailer.createTransport({
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: Number(process.env['SMTP_PORT'] || 587),
    secure: (process.env['SMTP_SECURE'] ?? 'false') === 'true',
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });

  async send(message: EmailMessage): Promise<void> {
    if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS']) {
      console.warn('[email] SMTP credentials missing — logging email instead of sending.');
      console.info(JSON.stringify({ to: message.to, subject: message.subject }));
      return;
    }

    await this.transporter.sendMail({
      from:
        process.env['SMTP_FROM'] ||
        `"Hai Sri Lanka Tours" <${process.env['SMTP_USER']}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
