import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ContactEmailService } from './_lib/email/contact-email.service';
import { SmtpEmailAdapter } from './_lib/email/smtp.adapter';
import { validateContact } from './_lib/validation/contact.schema';

/**
 * Vercel Serverless Function — POST /api/contact
 * Sends inquiry email to admin + acknowledgement to the visitor.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env['PUBLIC_SITE_URL'] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const parsed = validateContact(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.error });
  }

  const emailService = new ContactEmailService(new SmtpEmailAdapter());

  try {
    await emailService.sendContactEmails(parsed.data);
  } catch (error) {
    console.error('[contact] email failed', error);
    return res.status(502).json({
      status: 'pending',
      message: 'Message received but email delivery failed. Please try WhatsApp or call us.',
    });
  }

  return res.status(201).json({
    status: 'sent',
    message: 'Thank you your message has been sent. We will reply soon.',
  });
}
