# club.armadaresidence.com → the Armada Residence website's club page

Since 3 Nov 2026 the membership — renamed «إياب — عضوية أرمادا ريزيدنس» / Eyab — Armada Residence membership on 6 Nov 2026 — lives on the Armada Residence website (`/club/`), with
the sign-ups stored in the website's guest profiles. This repository only keeps the old address working: GitHub Pages
serves `index.html` (and `404.html` for any other path) on `club.armadaresidence.com`, which redirects to the club page
keeping the whole query string — the printed breakfast QR codes carry `?src=breakfast-airport` / `?src=breakfast-shafa`;
`?lang=en` opens the English page. Without JavaScript a meta refresh and a plain link go to the club page.

- Target today: `https://armadaresidence.github.io/armadaresidence-website/club/` (the website's review address).
- **At launch** (domain switch, CLAUDE.md §13 of the website repo): change the target in `redirect.js`, `index.html` and
  `404.html` to `https://armadaresidence.com/club/`.
- The QR files moved to the website repository (`reports/club-qr/`, unchanged); the `club-join` function and the
  `club_signups` table were retired after the import.

Keep `CNAME` and the custom domain with HTTPS enforced.
