-- Vul de eerder bewust leeg gelaten ingrediëntenvelden aan met tekst van de officiële productpagina's.
-- Gecontroleerd op 25 november 2026. Allergenen worden op de bron apart vermeld en
-- worden niet in het ingrediëntenveld samengevoegd; daarvoor is nog geen aparte kolom.
-- De bronpagina's vermelden ook magnetron, pan, oven en steambox als bereidingsopties.

update public.products
set
  ingredients = 'pasta (28.9%) (water, volkoren TARWEbloem), kip (28.9%) (kippenvlees, dextrose, tapioca zetmeel, water, zout, aroma, kruiden en specerijen, antioxidant), spinazie (15.6%), saus (13.3%) (tomaat, tomatenpuree, olijfolie, suiker, aroma, ui, zout, verdikkingsmiddel), zongedroogde tomaat (8.9%), ui (2.2%), cheddar (2.2%) (MELK), room (MELK), MELKeiwit, kruiden en specerijen.',
  preparation_method = 'Magnetron, pan, oven of steambox',
  last_checked_at = now(),
  source_reference = 'https://www.fuelyourbody.nl/marry-me-chicken-pasta',
  updated_at = now()
where product_url = 'https://www.fuelyourbody.nl/marry-me-chicken-pasta'
  and vendor_id in (select id from public.vendors where lower(name) = lower('Fuel Your Body'));

update public.products
set
  ingredients = 'kippenvlees, rijst, broccoli, koriander, kurkuma, peper, komijnzaad, foenegriek, dextrose, tapioc zetmeel, aminozuur, gekarameliseerde suiker, chilllies, kardemon, knoflookgranulaat, peterselie, kaneel, venkel, sereh, gember, zeezout, aroma, (zout, natuurlijke aroma) uigranulaat, paprikagranulaat, kokosgranulaat (sulfiet).',
  preparation_method = 'Magnetron, pan, oven of steambox',
  last_checked_at = now(),
  source_reference = 'https://www.fuelyourbody.nl/rijst-kip-broccoli',
  updated_at = now()
where product_url = 'https://www.fuelyourbody.nl/rijst-kip-broccoli'
  and vendor_id in (select id from public.vendors where lower(name) = lower('Fuel Your Body'));
