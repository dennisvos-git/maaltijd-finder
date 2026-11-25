-- Maaltijd Finder: extend existing vendor records.
-- Safe to run once in Supabase SQL Editor on an existing installation.

alter table public.vendors
  add column if not exists country_code text not null default 'NL',
  add column if not exists delivery_verified_at timestamptz,
  add column if not exists verification_status text not null default 'pending',
  add column if not exists source_type text not null default 'website',
  add column if not exists product_feed_url text,
  add column if not exists scan_enabled boolean not null default false,
  add column if not exists scan_frequency text not null default 'daily',
  add column if not exists last_scan_at timestamptz,
  add column if not exists last_scan_status text,
  add column if not exists admin_notes text;

alter table public.vendors
  drop constraint if exists vendors_verification_status_check,
  add constraint vendors_verification_status_check
    check (verification_status in ('pending', 'verified', 'rejected')),
  drop constraint if exists vendors_source_type_check,
  add constraint vendors_source_type_check
    check (source_type in ('website', 'csv', 'xml', 'api', 'manual')),
  drop constraint if exists vendors_scan_frequency_check,
  add constraint vendors_scan_frequency_check
    check (scan_frequency in ('daily', 'weekly', 'manual'));

create index if not exists vendors_country_verification_idx
  on public.vendors(country_code, verification_status, is_active);

-- Existing vendors remain pending until Dutch delivery is checked.
-- Scanning stays disabled until a permitted, reliable source is configured.
