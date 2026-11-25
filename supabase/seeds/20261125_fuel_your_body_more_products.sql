-- Twee aanvullende afzonderlijke Fuel Your Body-diepvriesmaaltijden.
-- Gegevens overgenomen van de officiële individuele productpagina's.
-- Voedingswaarden zijn per 100 gram; geen bulk- of bundelvarianten.
-- Gecontroleerd op 25 november 2026.

with vendor as (
  select id from public.vendors
  where lower(name) = lower('Fuel Your Body')
    and country_code = 'NL'
    and verification_status = 'verified'
    and is_active = true
  order by created_at desc
  limit 1
),
items as (
  select *
  from (values
    (
      'Risotto Spinazie - Chicken',
      'https://www.fuelyourbody.nl/risotto-spinazie',
      8.45::numeric, 455,
      119::numeric, 10.1::numeric, 10.8::numeric, 4.0::numeric,
      'Kipmaaltijd', 'Magnetron, pan, oven of steambox', 'Diepvriesmaaltijd',
      'Risotto rijst, water, Cheddarkaas, spinazie, room, uien, knoflook, zetmeel, zout, gistextract (bevat selderij), extra vierge olijfolie, specerijen (ui, tomaat, knoflook), peper, kipfiletblokjes (kipfilet, water, zout, tapioca, dextrose), bladspinazie.',
      'https://www.fuelyourbody.nl/risotto-spinazie'
    ),
    (
      'Tagliatelle - Beef Stroganoff',
      'https://www.fuelyourbody.nl/tagliatelle-beef-stroganoff',
      9.49::numeric, 430,
      110::numeric, 8.7::numeric, 12.0::numeric, 2.8::numeric,
      'Vleesmaaltijd', 'Magnetron, pan, oven of steambox', 'Diepvriesmaaltijd',
      'Runderreepjes (rundvlees, water, tapiocazetmeel, dextrose, zout, aroma (aminozuur), kruiden en specerijen (paprika, peper, witte peper), zuurteregelaar: natriumbicarbonaat, antioxidant: natriumcitraat), tagliatelle (water, durumtarwegriesmeel, zout), groenten (rode, groene en gele paprikablokjes, champignons), saus (room, melkeiwit, melkzuurbacteriën, zout, microbieel stremsel, tomaten, tomatenpuree, ui, water, wortelen, suiker, olijfolie, tarwebloem (gluten), zout, basilicum, kruiden, mosterdzaden, natuurazijn, gekaramelliseerde ui, gekaramelliseerde knoflook, zetmeel, zonnebloemolie, kruiden en specerijen, knoflookpoeder).',
      'https://www.fuelyourbody.nl/tagliatelle-beef-stroganoff'
    )
  ) as t(name, product_url, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, meal_type, preparation_method, category, ingredients, source_reference)
)
insert into public.products (
  vendor_id, name, product_url, price, weight_grams,
  kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g,
  meal_type, preparation_method, category, ingredients,
  availability, last_checked_at, source_reference, is_active
)
select
  vendor.id, items.name, items.product_url, items.price, items.weight_grams,
  items.kcal_per_100g, items.protein_per_100g, items.carbohydrates_per_100g, items.fat_per_100g,
  items.meal_type, items.preparation_method, items.category, items.ingredients,
  'available', now(), items.source_reference, true
from vendor cross join items
on conflict (vendor_id, product_url) do update set
  name = excluded.name,
  price = excluded.price,
  weight_grams = excluded.weight_grams,
  kcal_per_100g = excluded.kcal_per_100g,
  protein_per_100g = excluded.protein_per_100g,
  carbohydrates_per_100g = excluded.carbohydrates_per_100g,
  fat_per_100g = excluded.fat_per_100g,
  meal_type = excluded.meal_type,
  preparation_method = excluded.preparation_method,
  category = excluded.category,
  ingredients = excluded.ingredients,
  availability = excluded.availability,
  last_checked_at = excluded.last_checked_at,
  source_reference = excluded.source_reference,
  updated_at = now();
