import type { EmailPort } from '../types/booking.types';
import type { ContactPayload } from '../types/contact.types';
import { adminContactHtml, visitorContactHtml } from './templates/contact.templates';

export class ContactEmailService {
  constructor(private readonly mailer: EmailPort) {}

  async sendContactEmails(contact: ContactPayload): Promise<void> {
    const adminTo =
      process.env['CONTACT_ADMIN_EMAIL'] ||
      process.env['BOOKING_ADMIN_EMAIL'] ||
      process.env['SMTP_USER'];

    if (!adminTo) {
      throw new Error('CONTACT_ADMIN_EMAIL is not configured');
    }

    const adminHtml = adminContactHtml(contact);
    const visitorHtml = visitorContactHtml(contact);

    await Promise.all([
      this.mailer.send({
        to: adminTo,
        subject: `[Hai Sri Lanka] Contact ${contact.name}`,
        html: adminHtml,
        text: adminHtml.replace(/<[^>]+>/g, ' '),
      }),
      this.mailer.send({
        to: contact.email,
        subject: 'We received your message Hai Sri Lanka Tours',
        html: visitorHtml,
        text: visitorHtml.replace(/<[^>]+>/g, ' '),
      }),
    ]);
  }
}
