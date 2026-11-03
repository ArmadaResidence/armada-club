// club-join: stores an Armada Club sign-up in public.club_signups.
// Validates the request, rate-limits by a hashed IP, and upserts by phone.
// Logs carry error codes only, never personal data.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { parsePhoneNumberFromString } from 'npm:libphonenumber-js@1.13.15/mobile';

const ALLOWED_ORIGIN = 'https://club.armadaresidence.com';
const CONSENT_VERSIONS = new Set(['2026-11-03']);
const MAX_BODY_BYTES = 4096;

// Guests at one breakfast often share the hotel Wi-Fi IP, so the limit is generous.
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// Per-isolate salt: IP hashes never leave memory and cannot be reversed later.
const SALT = crypto.getRandomValues(new Uint8Array(16));
const hits = new Map<string, number[]>();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function ipHash(req: Request): Promise<string> {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const data = new Uint8Array([...SALT, ...new TextEncoder().encode(ip)]);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return Array.from(digest.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, ts] of hits) if (now - ts[ts.length - 1] >= RATE_WINDOW_MS) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

// Trims, drops control characters, and caps length; empty becomes null.
function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, max);
  return s || null;
}

function cleanSource(v: unknown): string | null {
  const s = clean(v, 64)?.toLowerCase() ?? null;
  return s && /^[a-z0-9_-]+$/.test(s) ? s : null;
}

Deno.serve(async (req) => {
  if (req.headers.get('origin') !== ALLOWED_ORIGIN) return json(403, { error: 'forbidden' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  if (rateLimited(await ipHash(req))) return json(429, { error: 'rate_limited' });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'bad_request' });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return json(400, { error: 'bad_request' });
  }

  // Honeypot: answer like a success so bots learn nothing, but store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json(200, { ok: true });

  const phoneIn = typeof body.phone === 'string' ? body.phone : '';
  const phone = parsePhoneNumberFromString(phoneIn);
  if (!phone || !phone.isValid() || phone.number !== phoneIn) return json(400, { error: 'invalid_phone' });

  if (body.consent !== true) return json(400, { error: 'consent_required' });
  const consentVersion = typeof body.consent_version === 'string' ? body.consent_version : '';
  if (!CONSENT_VERSIONS.has(consentVersion)) return json(400, { error: 'bad_request' });

  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    phone_e164: phone.number,
    lang: body.lang === 'en' ? 'en' : 'ar',
    source: cleanSource(body.src),
    utm_source: clean(body.utm_source, 100),
    utm_medium: clean(body.utm_medium, 100),
    utm_campaign: clean(body.utm_campaign, 100),
    consent_text_version: consentVersion,
    consent_at: now,
    updated_at: now,
  };
  // Omitted when blank so a repeat sign-up without a name keeps the earlier one.
  const name = clean(body.name, 80);
  if (name) row.name = name;

  const { error } = await supabase
    .from('club_signups')
    .upsert(row, { onConflict: 'phone_e164', ignoreDuplicates: false });
  if (error) {
    console.error('club-join: upsert failed', error.code);
    return json(500, { error: 'server_error' });
  }
  return json(200, { ok: true });
});
