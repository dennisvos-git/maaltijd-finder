-- Maaltijd Finder: eerste gecontroleerde Nederlandse aanbieders.
-- Run after 20261125_vendor_registry.sql in Supabase SQL Editor.
-- Alleen aanbieders met gecontroleerde Nederlandse bezorginformatie staan op verified.
-- Automatische scans blijven uit totdat een toegestane productbron is ingericht.

insert into public.vendors (
  name, website_url, delivery_info, country_code, delivery_verified_at,
  verification_status, source_type, scan_enabled, scan_frequency,
  minimum_order_quantity, admin_notes, is_active
)
select
  'Vers aan Tafel',
  'https://www.versaantafel.nl',
  'Gratis thuisbezorgd in Nederland, met uitzondering van de Waddeneilanden. Minimale bestelling: 6 maaltijden. Bezorgdag verschilt per postcodegebied.',
  'NL',
  now(),
  'verified',
  'website',
  false,
  'daily',
  6,
  'Bezorginformatie gecontroleerd op 25-11-2026. Bron: https://www.versaantafel.nl/diepvriesmaaltijden-aan-huis',
  true
where not exists (
  select 1 from public.vendors where lower(name) = lower('Vers aan Tafel')
);

insert into public.vendors (
  name, website_url, delivery_info, country_code, delivery_verified_at,
  verification_status, source_type, scan_enabled, scan_frequency,
  minimum_order_quantity, admin_notes, is_active
)
select
  'apetito',
  'https://www.apetito.nl',
  'Vriesverse maaltijden worden gratis aan huis bezorgd. Minimale bestelling: 7 maaltijden. Wekelijkse bezorging door servicechauffeurs.',
  'NL',
  now(),
  'verified',
  'website',
  false,
  'daily',
  7,
  'Bezorginformatie gecontroleerd op 25-11-2026. Bron: https://www.apetito.nl/tafeltje-dekje-vriesvers/vriesverse-maaltijden/',
  true
where not exists (
  select 1 from public.vendors where lower(name) = lower('apetito')
);
