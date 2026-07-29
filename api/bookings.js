const nodemailer = require('nodemailer');

const DEFAULT_ADMINS = [
  'haisrilankatour@gmail.com',
  'dilanlakshitha194@gmail.com',
  'sithumihishani20@gmail.com',
];

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency || 'USD'} ${amount}`;
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(String(value || ''));
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function createBookingRef() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HSL-${stamp}-${rand}`;
}

function resolveAdmins() {
  const fromEnv = String(process.env.BOOKING_ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ADMINS, ...fromEnv])];
}

function validateBooking(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid JSON body' };
  if (!body.tourSlug || !body.tourTitle) return { ok: false, error: 'Tour is required' };
  if (![1, 2, 3, 4, 5].includes(Number(body.travelersCount))) {
    return { ok: false, error: 'Travelers must be 1–5' };
  }
  if (!body.travelDate) return { ok: false, error: 'Travel date is required' };
  const traveler = body.primaryTraveler;
  if (!traveler?.firstName || !traveler?.lastName || !traveler?.email || !traveler?.phone) {
    return { ok: false, error: 'Traveler information is incomplete' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) {
    return { ok: false, error: 'Invalid email address' };
  }
  return {
    ok: true,
    data: {
      tourSlug: String(body.tourSlug),
      tourTitle: String(body.tourTitle),
      tourDuration: body.tourDuration ? String(body.tourDuration) : '',
      travelersCount: Number(body.travelersCount),
      travelDate: String(body.travelDate),
      pricePerPerson: Number(body.pricePerPerson) || 0,
      totalPrice: Number(body.totalPrice) || 0,
      currency: body.currency === 'EUR' ? 'EUR' : 'USD',
      primaryTraveler: {
        firstName: String(traveler.firstName),
        lastName: String(traveler.lastName),
        email: String(traveler.email),
        phone: String(traveler.phone),
        nationality: traveler.nationality ? String(traveler.nationality) : '',
        specialRequests: traveler.specialRequests ? String(traveler.specialRequests) : '',
      },
      locale: String(body.locale || 'en'),
    },
  };
}

function emailShell(title, subtitle, bodyHtml) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#1a2332;">
  <div style="max-width:680px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(11,61,46,.08);">
    <div style="background:linear-gradient(135deg,#0b3d2e 0%,#0f513f 100%);padding:28px 24px;text-align:center;">
      <p style="margin:0 0 6px;color:#c4a35a;letter-spacing:.14em;text-transform:uppercase;font-size:11px;font-weight:700;">Hai Sri Lanka Tours</p>
      <h1 style="margin:0;color:#fff;font-size:22px;">${title}</h1>
      <p style="margin:8px 0 0;color:#d7e5de;font-size:14px;">${subtitle}</p>
    </div>
    <div style="padding:28px 24px;">${bodyHtml}</div>
    <div style="background:#f1f5f2;padding:18px 24px;text-align:center;font-size:12px;color:#5c6b7a;line-height:1.6;">
      <p style="margin:0 0 6px;"><strong style="color:#0b3d2e;">Hai Sri Lanka Tours</strong></p>
      <p style="margin:0;">No. 12 Galle Road, Colombo, Sri Lanka</p>
      <p style="margin:8px 0 0;">
        <a href="https://wa.me/94743137241" style="color:#0b3d2e;text-decoration:none;font-weight:700;">WhatsApp +94 74 313 7241</a>
        · <a href="mailto:haisrilankatour@gmail.com" style="color:#0b3d2e;text-decoration:none;">haisrilankatour@gmail.com</a>
      </p>
      <p style="margin:10px 0 0;">© ${year} Hai Sri Lanka Tours. All rights reserved.</p>
    </div>
  </div></body></html>`;
}

function row(label, value, emphasize) {
  return `<tr>
    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:700;width:42%;background:#fbfaf7;">${label}</td>
    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:${emphasize ? '#15803d' : '#1a2332'};font-weight:${emphasize ? '700' : '400'};">${value}</td>
  </tr>`;
}

function bookingTable(booking, bookingRef) {
  const t = booking.primaryTraveler;
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0 0;">
    ${row('Booking reference', escapeHtml(bookingRef))}
    ${row('Tour', escapeHtml(booking.tourTitle))}
    ${row('Duration', escapeHtml(booking.tourDuration || '—'))}
    ${row('Travel date', formatDate(booking.travelDate))}
    ${row('Travelers', String(booking.travelersCount))}
    ${row('Price / person', formatMoney(booking.pricePerPerson, booking.currency))}
    ${row('Estimated total', formatMoney(booking.totalPrice, booking.currency), true)}
    ${row('Guest name', `${escapeHtml(t.firstName)} ${escapeHtml(t.lastName)}`)}
    ${row('Email', escapeHtml(t.email))}
    ${row('Phone', escapeHtml(t.phone))}
    ${row('Country', escapeHtml(t.nationality || '—'))}
  </table>`;
}

function adminHtml(booking, bookingRef) {
  return emailShell(
    'New booking request',
    `Reference ${escapeHtml(bookingRef)}`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">A new private tour booking request was submitted. Please review and confirm with the guest.</p>
     <h2 style="margin:0;font-size:17px;color:#0b3d2e;">Booking details</h2>
     ${bookingTable(booking, bookingRef)}
     <p style="margin:22px 0 0;font-size:13px;color:#5c6b7a;">No online payment was taken.</p>`,
  );
}

function guestHtml(booking, bookingRef) {
  return emailShell(
    'Booking request received',
    `Reference ${escapeHtml(bookingRef)}`,
    `<p style="margin:0 0 14px;font-size:15px;">Dear ${escapeHtml(booking.primaryTraveler.firstName)},</p>
     <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Thank you for choosing <strong>Hai Sri Lanka Tours</strong>. Your booking request has been received. Our team will contact you shortly.</p>
     <h2 style="margin:0;font-size:17px;color:#0b3d2e;">Your booking summary</h2>
     ${bookingTable(booking, bookingRef)}
     <p style="margin:22px 0 0;font-size:15px;line-height:1.6;">No payment was taken online. You can pay at destination once confirmed.</p>
     <p style="margin:24px 0 0;font-size:15px;">Warm regards,<br/><strong>Hai Sri Lanka Tours</strong></p>`,
  );
}

async function sendMail({ to, subject, html }) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn('[bookings] SMTP missing — logging email', { to, subject });
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

module.exports = async function handler(req, res) {
  try {
    const origin = process.env.PUBLIC_SITE_URL || 'https://www.haisrilanka.com';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const parsed = validateBooking(req.body);
    if (!parsed.ok) return res.status(400).json({ message: parsed.error });

    const bookingRef = createBookingRef();
    const admins = resolveAdmins();

    try {
      await Promise.all([
        sendMail({
          to: admins.join(', '),
          subject: `[Hai Sri Lanka Tours] New booking ${bookingRef} — ${parsed.data.tourTitle}`,
          html: adminHtml(parsed.data, bookingRef),
        }),
        sendMail({
          to: parsed.data.primaryTraveler.email,
          subject: `Booking request received — ${parsed.data.tourTitle} (${bookingRef})`,
          html: guestHtml(parsed.data, bookingRef),
        }),
      ]);
    } catch (error) {
      console.error('[bookings] email failed', error);
      return res.status(502).json({
        message: 'Booking accepted but email delivery failed. Please contact us on WhatsApp.',
        bookingRef,
        status: 'pending',
      });
    }

    return res.status(201).json({
      bookingRef,
      status: 'confirmed',
      message: 'Booking request received. Confirmation emails sent to you and our team.',
    });
  } catch (error) {
    console.error('[bookings] handler crashed', error);
    return res.status(500).json({
      message: 'Server error while processing booking. Please try WhatsApp.',
    });
  }
};
