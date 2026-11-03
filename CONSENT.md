# Consent text versions

`club_signups.consent_text_version` points to one of these. When the wording on
the page changes, add a new version here and bump `CONSENT_VERSION` in
`src/strings.js` and `CONSENT_VERSIONS` in `supabase/functions/club-join/index.ts`.

## 2026-11-03

**AR:** أوافق على تلقي العروض من أرمادا ريزيدنس عبر الواتساب والبريد الإلكتروني، وعلى عرض إعلاناتها لي على منصات مثل سناب شات وتيك توك وميتا وجوجل، ويمكنني إلغاء ذلك في أي وقت.

**EN:** I agree to receive Armada Residence offers by WhatsApp and email, and to be shown its ads on platforms such as Snapchat, TikTok, Meta and Google. I can opt out at any time.

Privacy note shown with it (“How we use your data”): see `privacyText` in `src/strings.js`.
