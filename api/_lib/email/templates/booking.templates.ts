import type { BookingPayload } from '../../types/booking.types';

const BRAND = {
  name: 'Hai Sri Lanka Tours',
  green: '#0b3d2e',
  gold: '#c4a35a',
  sand: '#f7f3ea',
  ink: '#1a2332',
  muted: '#5c6b7a',
  border: '#e5e7eb',
  success: '#15803d',
  siteUrl: process.env['PUBLIC_SITE_URL'] || 'https://www.haisrilanka.com',
  email: 'haisrilankatour@gmail.com',
  phone: '+94 74 313 7241',
  whatsapp: '94743137241',
  address: 'No. 12 Galle Road, Colombo, Sri Lanka',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function shell(title: string, subtitle: string, body: string): string {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${BRAND.sand};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
  <div style="max-width:680px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(11,61,46,0.08);">
    <div style="background:linear-gradient(135deg,${BRAND.green} 0%,#0f513f 100%);padding:28px 24px;text-align:center;">
      <p style="margin:0 0 6px;color:${BRAND.gold};letter-spacing:0.14em;text-transform:uppercase;font-size:11px;font-weight:700;">${escapeHtml(BRAND.name)}</p>
      <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">${title}</h1>
      <p style="margin:8px 0 0;color:#d7e5de;font-size:14px;">${subtitle}</p>
    </div>
    <div style="padding:28px 24px;">
      ${body}
    </div>
    <div style="background:#f1f5f2;padding:18px 24px;text-align:center;font-size:12px;color:${BRAND.muted};line-height:1.6;">
      <p style="margin:0 0 6px;"><strong style="color:${BRAND.green};">${escapeHtml(BRAND.name)}</strong></p>
      <p style="margin:0;">${escapeHtml(BRAND.address)}</p>
      <p style="margin:8px 0 0;">
        <a href="https://wa.me/${BRAND.whatsapp}" style="color:${BRAND.green};text-decoration:none;font-weight:700;">WhatsApp ${escapeHtml(BRAND.phone)}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${BRAND.email}" style="color:${BRAND.green};text-decoration:none;">${escapeHtml(BRAND.email)}</a>
      </p>
      <p style="margin:10px 0 0;">© ${year} ${escapeHtml(BRAND.name)}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function row(label: string, value: string, emphasize = false): string {
  return `
    <tr>
      <td style="padding:10px 12px;border:1px solid ${BRAND.border};font-weight:700;width:42%;background:#fbfaf7;color:${BRAND.ink};">${label}</td>
      <td style="padding:10px 12px;border:1px solid ${BRAND.border};color:${emphasize ? BRAND.success : BRAND.ink};font-weight:${emphasize ? '700' : '400'};">${value}</td>
    </tr>`;
}

function bookingSummaryTable(booking: BookingPayload, bookingRef: string): string {
  const guest = booking.primaryTraveler;
  const total = formatMoney(booking.totalPrice, booking.currency);
  const perPerson = formatMoney(booking.pricePerPerson, booking.currency);
  const duration = booking.tourDuration ? escapeHtml(booking.tourDuration) : '—';

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0 0;">
      ${row('Booking reference', escapeHtml(bookingRef))}
      ${row('Tour', escapeHtml(booking.tourTitle))}
      ${row('Duration', duration)}
      ${row('Travel date', formatDate(booking.travelDate))}
      ${row('Travelers', String(booking.travelersCount))}
      ${row('Price / person', perPerson)}
      ${row('Estimated total', total, true)}
      ${row('Guest name', `${escapeHtml(guest.firstName)} ${escapeHtml(guest.lastName)}`)}
      ${row('Email', escapeHtml(guest.email))}
      ${row('Phone', escapeHtml(guest.phone))}
      ${row('Country', escapeHtml(guest.nationality || '—'))}
      ${row('Notes', escapeHtml(guest.specialRequests || '—'))}
    </table>`;
}

/** Admin notification — new booking received */
export function adminBookingHtml(booking: BookingPayload, bookingRef: string): string {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      A new private tour booking request has been submitted on
      <a href="${BRAND.siteUrl}" style="color:${BRAND.green};">${escapeHtml(BRAND.name)}</a>.
      Please review the details and confirm arrangements with the guest.
    </p>
    <h2 style="margin:0;font-size:17px;color:${BRAND.green};">Booking details</h2>
    ${bookingSummaryTable(booking, bookingRef)}
    <p style="margin:22px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      No online payment has been taken. Confirm availability, then reply to the guest to finalize the itinerary.
    </p>`;

  return shell('New booking request', `Reference ${escapeHtml(bookingRef)}`, body);
}

/** Guest confirmation — thank you / we received your request */
export function travelerConfirmationHtml(booking: BookingPayload, bookingRef: string): string {
  const firstName = escapeHtml(booking.primaryTraveler.firstName);
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Dear ${firstName},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Thank you for choosing <strong>${escapeHtml(BRAND.name)}</strong>.
      Your booking request has been received successfully. Our team will contact you shortly
      to confirm details and help you prepare for your journey.
    </p>
    <h2 style="margin:0;font-size:17px;color:${BRAND.green};">Your booking summary</h2>
    ${bookingSummaryTable(booking, bookingRef)}
    <p style="margin:22px 0 0;font-size:15px;line-height:1.6;">
      No payment has been taken online. You can pay securely at destination once your tour is confirmed.
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
      Questions? Message us on WhatsApp or reply to this email — we are happy to help.
    </p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">
      Warm regards,<br />
      <strong>${escapeHtml(BRAND.name)}</strong>
    </p>`;

  return shell('Booking request received', `Reference ${escapeHtml(bookingRef)}`, body);
}
