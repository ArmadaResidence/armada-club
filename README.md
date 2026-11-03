# نادي أرمادا · Armada Club

Sign-up page for Armada Residence breakfast guests, live at
<https://club.armadaresidence.com>. Guests scan a QR code, leave their mobile
number (and optionally a name), and give consent to receive offers.

- **Page:** static, served by GitHub Pages from this repo's `main` branch root.
  Arabic (RTL) by default, English switch, light and dark. No third-party scripts.
- **Backend:** Supabase project `armada-residence`, Edge Function `club-join`,
  table `public.club_signups` (RLS on, no policies; only the function writes).
- **QR codes:** `qr/` (SVG + 2000 px PNG, error correction M).

## Layout

| Path | What |
| --- | --- |
| `src/strings.js` | All page copy, AR and EN, plus the consent version |
| `src/index.template.html`, `src/style.css`, `src/app.js` | Page sources |
| `index.html`, `assets/` | Built output that Pages serves (committed) |
| `supabase/functions/club-join/` | Edge Function |
| `sql/club_signups.sql` | Table definition (applied once by hand) |
| `CONSENT.md` | Consent wording per version |
| `scripts/` | Build and QR generators |

## Build

```bash
npm install
npm run build   # writes index.html, assets/app.js, assets/style.css
npm run qr      # writes qr/*.svg and qr/*.png
```

Commit the built files; Pages serves them as they are.

## Deploy the function

```bash
npx supabase functions deploy club-join --project-ref wwzxwettsuwtakwwbfly --no-verify-jwt --use-api
```

The function accepts requests only from `https://club.armadaresidence.com`,
re-validates the number (libphonenumber-js, mobile metadata, E.164), requires
consent, drops honeypot submissions silently, rate-limits per hashed IP
(in memory, 20 per 10 minutes), and upserts by `phone_e164`. A repeat sign-up
refreshes `consent_at`, `consent_text_version`, `source` and the UTM fields, and
the name if one is given. Logs hold error codes only.

## Getting the numbers

Supabase → Table Editor → `club_signups` → Export to CSV.
