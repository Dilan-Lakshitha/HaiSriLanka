const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendMail({ to, subject, html }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn('[contact] SMTP missing — logging email', { to, subject });
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Hai Sri Lanka Tours" <${user}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ' '),
  });
}

function setCors(req, res) {
  const requestOrigin = String(req.headers.origin || '');
  const allowed = new Set([
    'https://www.haisrilanka.com',
    'https://haisrilanka.com',
    'http://localhost:4200',
    'http://127.0.0.1:4200',
  ]);
  if (process.env.PUBLIC_SITE_URL) {
    allowed.add(String(process.env.PUBLIC_SITE_URL).replace(/\/$/, ''));
  }
  const allowOrigin = allowed.has(requestOrigin)
    ? requestOrigin
    : 'https://www.haisrilanka.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  try {
    setCors(req, res);

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const body = req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const message = String(body.message || '').trim();
    const locale = String(body.locale || 'en');

    if (!name || !email || !whatsapp || !message) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const adminTo =
      process.env.CONTACT_ADMIN_EMAIL ||
      process.env.BOOKING_ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      'haisrilankatour@gmail.com';

    const adminHtml = `
      <h1>New contact message — Hai Sri Lanka Tours</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
      <p><strong>Locale:</strong> ${escapeHtml(locale)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`;

    const visitorHtml = `
      <h1>We received your message</h1>
      <p>Dear ${escapeHtml(name)},</p>
      <p>Thank you for contacting Hai Sri Lanka Tours. Our team will reply shortly.</p>
      <p>— Hai Sri Lanka Tours</p>`;

    try {
      await Promise.all([
        sendMail({
          to: adminTo,
          subject: `[Hai Sri Lanka Tours] Contact — ${name}`,
          html: adminHtml,
        }),
        sendMail({
          to: email,
          subject: 'We received your message — Hai Sri Lanka Tours',
          html: visitorHtml,
        }),
      ]);
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
  } catch (error) {
    console.error('[contact] handler crashed', error);
    return res.status(500).json({ message: 'Server error. Please try WhatsApp.' });
  }
};
