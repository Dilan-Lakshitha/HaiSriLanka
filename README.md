# Hai Sri Lanka Tours

Production foundation (Phase 0) for [HaiSriLanka.com](https://haisrilanka.com) — Angular SSR, Transloco multilingual routing, SEO core, and Vercel booking email API.

## Stack

- Angular 22 (standalone) + SSR + hydration
- Transloco (`/:lang/...` URL prefixes)
- SCSS design tokens
- Mock JSON content under `src/assets/json`
- Vercel Serverless `POST /api/bookings` + Gmail SMTP (`nodemailer`)

## Local development

```bash
cd D:\Website\HaiSriLanka
npm install
npm start
```

Open `http://localhost:4200` — you will be redirected to `/en/`.

```bash
npm run build
npm run serve:ssr:haisrilanka
```

```bash
npm run sitemap
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/app/core` | SEO, i18n, guards, layout, domain services |
| `src/app/shared` | Reusable UI, cards, forms |
| `src/app/features` | Lazy feature areas (content pages next phases) |
| `src/assets/i18n` | Translation JSON (add a language = add a file) |
| `src/assets/json` | Tour/content contracts (future CMS/API) |
| `api/` | Vercel serverless booking + email adapters |

## Adding a language

1. Copy `src/assets/i18n/en.json` → `src/assets/i18n/{code}.json` and translate values.
2. Ensure `{code}` exists in `src/assets/language/locales.json` with `"enabled": true`.
3. Ensure `{code}` is listed in `APP_CONFIG.supportedLocales` (`src/app/core/config/app.config.ts`).
4. Run `npm run sitemap`.

No feature components need changes for a new language.

## Booking email (Vercel)

Set these environment variables in the Vercel project:

| Variable | Example |
|----------|---------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your@gmail.com` |
| `SMTP_PASS` | Gmail App Password |
| `SMTP_FROM` | `Hai Sri Lanka Tours <your@gmail.com>` |
| `BOOKING_ADMIN_EMAIL` | `haisrilankatour@gmail.com` (comma-separated for multiple) |
| `CONTACT_ADMIN_EMAIL` | `haisrilankatour@gmail.com` |
| `PUBLIC_SITE_URL` | `https://www.haisrilanka.com` |

Without SMTP credentials, the API still validates bookings and **logs** emails (local-safe).

**Complete booking** on tour details calls `POST /api/bookings` and sends professional emails to **both** the guest and `BOOKING_ADMIN_EMAIL`.

## Deploy

```bash
vercel
```

`vercel.json` builds Angular SSR assets, generates localized sitemaps, and routes `/api/bookings` + SSR through serverless functions.

## Phase order after foundation

Home → Tours → Tour details → Booking flow → Destinations → Blog → Gallery → Reviews → Contact → Final SEO.
