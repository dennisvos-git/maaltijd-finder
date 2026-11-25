-- Eerste gecontroleerde aanbieders voor Maaltijd Finder
-- Idempotent: bestaande aanbieders met dezelfde naam worden niet dubbel toegevoegd.
-- Productscans blijven uitgeschakeld totdat een toegestane gegevensbron is ingericht.

insert into public.vendors (
  name, website_url, delivery_info, country_code, delivery_verified_at,
  verification_status, source_type, scan_enabled, scan_frequency,
  minimum_order_quantity, is_active, last_checked_at, admin_notes
)
select
  v.name, v.website_url, v.delivery_info, 'NL', now(),
  'verified', 'website', false, 'daily',
  v.minimum_order_quantity, true, now(), v.admin_notes
from (values
  (
    'Apetito',
    'https://www.apetito.nl/tafeltje-dekje-vriesvers/vriesverse-maaltijden/',
    'Vriesverse maaltijden aan huis in heel Nederland. Wekelijkse bezorging; geen bezorgkosten. De bestelling bestaat normaal uit minimaal 7 maaltijden.',
    7,
    'Bezorggebied en minimumaantal gecontroleerd op de officiële website. Een tijdelijk proefpakket kan afwijkende voorwaarden hebben.'
  ),
  (
    'Vers aan Tafel',
    'https://www.versaantafel.nl/diepvriesmaaltijden-aan-huis',
    'Vriesverse maaltijden gratis thuisbezorgd in Nederland, met uitzondering van de Waddeneilanden. Vaste bezorgdag per postcodegebied; minimaal 6 maaltijden per bestelling.',
    6,
    'Bezorggebied en minimumaantal gecontroleerd op de officiële FAQ en productpagina.'
  ),
  (
    'Kant en Klaar Maaltijden',
    'https://www.kantenklaarmaaltijden.nl/diepvriesmaaltijden-overzicht/',
    'Diepvriesmaaltijden thuisbezorgd in Nederland, met uitzondering van de Waddeneilanden. Bezorgkosten en gratis-bezorgdrempels zijn afhankelijk van het bestelbedrag. Er wordt een proefpakket van 4 maaltijden aangeboden.',
    null,
    'Landelijke bezorging en assortiment diepvriesmaaltijden gecontroleerd op de officiële website. Geen algemeen minimumaantal bevestigd.'
  )
) as v(name, website_url, delivery_info, minimum_order_quantity, admin_notes)
where not exists (
  select 1 from public.vendors existing where lower(existing.name) = lower(v.name)
);
