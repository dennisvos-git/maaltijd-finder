-- Fuel Your Body: gecontroleerde Nederlandse diepvriesmaaltijd-aanbieder
-- Veilig opnieuw uit te voeren: voegt geen dubbele aanbieder toe.
-- Productscans blijven uitgeschakeld; eerst productpagina's/bronvelden goed vastleggen.

insert into public.vendors (
  name, website_url, delivery_info, country_code, delivery_verified_at,
  verification_status, source_type, scan_enabled, scan_frequency,
  minimum_order_value, minimum_order_quantity, is_active, last_checked_at, admin_notes
)
select
  'Fuel Your Body',
  'https://www.fuelyourbody.nl/diepvriesmaaltijden',
  'Diepvriesmaaltijden worden in Nederland bezorgd met vriestransport en droogijs. Besteldag en bezorgdag zijn afhankelijk van de weekdag. Verzendkosten: €6,95; gratis verzending vanaf €125.',
  'NL',
  now(),
  'verified',
  'website',
  false,
  'daily',
  null,
  null,
  true,
  now(),
  'Officiële verzendpagina bevestigt verzending binnen Nederland. Assortimentpagina toont per maaltijd prijs, portiegewicht en voedingswaarden. €125 is de grens voor gratis verzending, geen minimum bestelbedrag.'
where not exists (
  select 1 from public.vendors where lower(name) = lower('Fuel Your Body')
);
