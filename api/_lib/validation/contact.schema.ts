import type { ContactPayload } from '../types/contact.types';

export function validateContact(
  body: unknown,
): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid JSON body' };
  }

  const data = body as Partial<ContactPayload>;
  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const whatsapp = String(data.whatsapp || '').trim();
  const message = String(data.message || '').trim();
  const locale = String(data.locale || 'en').trim() || 'en';

  if (name.length < 2) {
    return { ok: false, error: 'Name is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Valid email is required' };
  }
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length < 8) {
    return { ok: false, error: 'Valid WhatsApp number is required' };
  }
  if (message.length < 10) {
    return { ok: false, error: 'Please write a short message (at least 10 characters)' };
  }
  if (message.length > 4000) {
    return { ok: false, error: 'Message is too long' };
  }

  return {
    ok: true,
    data: {
      name: name.slice(0, 120),
      email: email.slice(0, 180),
      whatsapp: whatsapp.slice(0, 40),
      message: message.slice(0, 4000),
      locale: locale.slice(0, 8),
    },
  };
}
