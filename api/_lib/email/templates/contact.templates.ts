import type { ContactPayload } from '../types/contact.types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function adminContactHtml(contact: ContactPayload): string {
  const name = escapeHtml(contact.name);
  const email = escapeHtml(contact.email);
  const whatsapp = escapeHtml(contact.whatsapp);
  const message = escapeHtml(contact.message).replace(/\n/g, '<br />');
  const locale = escapeHtml(contact.locale);

  return `
    <h1>New contact message Hai Sri Lanka</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
    <p><strong>Locale:</strong> ${locale}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
}

export function visitorContactHtml(contact: ContactPayload): string {
  const name = escapeHtml(contact.name);
  return `
    <h1>We received your message</h1>
    <p>Dear ${name},</p>
    <p>Thank you for contacting Hai Sri Lanka Tours. Our team will reply shortly.</p>
    <p>— Hai Sri Lanka Tours</p>
  `;
}
