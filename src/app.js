import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js/mobile';
import { T, CONSENT_VERSION, keepClubName } from './strings.js';

const ENDPOINT = __ENDPOINT__;
const TIMEOUT_MS = 15000;
const PRIORITY = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];

const $ = (id) => document.getElementById(id);
const form = $('join-form');
const phone = $('phone');
const country = $('country');
const ccValue = $('cc-value');
const consent = $('consent');
const submit = $('submit');
const formError = $('form-error');

let lang = initialLang();
let busy = false;

function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'ar') return q;
  try {
    const saved = localStorage.getItem('club-lang');
    if (saved === 'en' || saved === 'ar') return saved;
  } catch (_) { /* storage unavailable */ }
  return 'ar';
}

const t = (key) => T[lang][key];

function applyLang() {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = keepClubName(t(el.dataset.i18n)); });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('.error[data-key]').forEach((el) => { el.textContent = t(el.dataset.key); });
  const toggle = $('lang-toggle');
  toggle.textContent = t('langToggle');
  toggle.lang = lang === 'ar' ? 'en' : 'ar';
  fillCountries();
}

function fillCountries() {
  const selected = country.value || 'SA';
  let names;
  try { names = new Intl.DisplayNames([lang], { type: 'region' }); } catch (_) { names = null; }
  const label = (cc) => (names && names.of(cc)) || cc;
  const collator = new Intl.Collator(lang);
  const rest = getCountries()
    .filter((cc) => !PRIORITY.includes(cc))
    .sort((a, b) => collator.compare(label(a), label(b)));
  const frag = document.createDocumentFragment();
  for (const cc of PRIORITY.concat(rest)) {
    const opt = document.createElement('option');
    opt.value = cc;
    opt.textContent = `${label(cc)} +${getCountryCallingCode(cc)}`;
    frag.appendChild(opt);
  }
  country.replaceChildren(frag);
  country.dir = lang === 'ar' ? 'rtl' : 'ltr';
  country.value = selected;
  syncCc();
}

function syncCc() {
  ccValue.textContent = `+${getCountryCallingCode(country.value)}`;
}

// Arabic-Indic and Persian digits are common on Arabic keyboards.
function asciiDigits(s) {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6F0));
}

function parsePhone(raw) {
  let v = asciiDigits(raw).replace(/[\s\-().‎‏]/g, '');
  if (v.startsWith('00')) v = `+${v.slice(2)}`;
  const p = parsePhoneNumberFromString(v, v.startsWith('+') ? undefined : country.value);
  return p && p.isValid() ? p : null;
}

function setError(el, input, key) {
  if (key) {
    el.dataset.key = key;
    el.textContent = t(key);
    el.hidden = false;
    if (input) input.setAttribute('aria-invalid', 'true');
  } else {
    delete el.dataset.key;
    el.textContent = '';
    el.hidden = true;
    if (input) input.removeAttribute('aria-invalid');
  }
}

function trackingParams() {
  const q = new URLSearchParams(location.search);
  const get = (k) => (q.get(k) || '').trim().slice(0, 100) || null;
  return {
    src: get('src'),
    utm_source: get('utm_source'),
    utm_medium: get('utm_medium'),
    utm_campaign: get('utm_campaign'),
  };
}

function showDone() {
  $('join-view').hidden = true;
  $('done-view').hidden = false;
  window.scrollTo(0, 0);
  $('done-title').focus();
}

async function post(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok === true, error: data.error };
  } finally {
    clearTimeout(timer);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy) return;

  setError(formError, null, null);
  const parsed = parsePhone(phone.value);
  setError($('phone-error'), phone, parsed ? null : 'errPhone');
  setError($('consent-error'), consent, consent.checked ? null : 'errConsent');
  if (!parsed) { phone.focus(); return; }
  if (!consent.checked) { consent.focus(); return; }

  if (parsed.country && parsed.country !== country.value && getCountries().includes(parsed.country)) {
    country.value = parsed.country;
    syncCc();
  }

  busy = true;
  submit.setAttribute('aria-busy', 'true');
  try {
    const result = await post({
      phone: parsed.number,
      name: $('name').value.trim().slice(0, 80),
      lang,
      consent: true,
      consent_version: CONSENT_VERSION,
      website: $('website').value,
      ...trackingParams(),
    });
    if (result.ok) {
      showDone();
    } else if (result.error === 'invalid_phone') {
      setError($('phone-error'), phone, 'errPhone');
      phone.focus();
    } else if (result.error === 'consent_required') {
      setError($('consent-error'), consent, 'errConsent');
      consent.focus();
    } else {
      setError(formError, null, 'errNetwork');
    }
  } catch (_) {
    setError(formError, null, 'errNetwork');
  } finally {
    busy = false;
    submit.removeAttribute('aria-busy');
  }
});

phone.addEventListener('input', () => {
  if (phone.getAttribute('aria-invalid') && parsePhone(phone.value)) setError($('phone-error'), phone, null);
});
consent.addEventListener('change', () => {
  if (consent.checked) setError($('consent-error'), consent, null);
});
country.addEventListener('change', syncCc);

$('lang-toggle').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('club-lang', lang); } catch (_) { /* storage unavailable */ }
  applyLang();
});

applyLang();
