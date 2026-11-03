-- public.club_signups: Armada Club sign-ups collected by club.armadaresidence.com.
-- Applied once by hand to the armada-residence project; the main project adopts it later.
-- Only the club-join Edge Function (service role) reads or writes it.

create table public.club_signups (
  id                   uuid primary key default gen_random_uuid(),
  phone_e164           text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  name                 text check (char_length(name) between 1 and 80),
  lang                 text not null default 'ar' check (lang in ('ar', 'en')),
  source               text check (source ~ '^[a-z0-9_-]{1,64}$'),
  utm_source           text check (char_length(utm_source) <= 100),
  utm_medium           text check (char_length(utm_medium) <= 100),
  utm_campaign         text check (char_length(utm_campaign) <= 100),
  consent_text_version text not null,
  consent_at           timestamptz not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.club_signups enable row level security;
revoke all on table public.club_signups from anon, authenticated;

comment on table public.club_signups is
  'Armada Club sign-ups from club.armadaresidence.com (repo ArmadaResidence/armada-club). Written only by the club-join Edge Function.';
