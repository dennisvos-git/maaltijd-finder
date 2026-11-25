-- Twee aanvullende afzonderlijke Fuel Your Body-diepvriesmaaltijden.
-- Bron: officiële individuele productpagina's; voedingswaarden per 100 g overgenomen uit de brontabellen.
-- Gecontroleerd op 25 november 2026. Geen bundels of bulkvarianten.

with vendor as (
  select id from public.vendors
  where lower(name) = lower('Fuel Your Body')
  order by created_at desc
  limit 1
),
items as (
  select *
  from (values
    (
      'Cheesy Mac ''n Chicken',
      'https://www.fuelyourbody.nl/cheesy-mac-n-chicken',
      8.45::numeric, 405,
      147::numeric, 12.4::numeric, 10.3::numeric, 5.9::numeric,
      'Kipmaaltijd', 'Magnetron, pan of oven', 'Diepvriesmaaltijd',
      'Kippenvlees, durum, tarwe, gepasteuriseerde melk, courgette, paprika rood, groen, geel, ui, zout, paprikapoeder, knoflook, zwarte peper, tijm, rozemarijn, dextrose, tapiocazetmeel, aroma, microbieel stremsel, kleurstof: annatto, kleurstof: carotenen, gekarameliseerde suiker.',
      'https://www.fuelyourbody.nl/cheesy-mac-n-chicken'
    ),
    (
      'Orzo - Honey Mustard Chicken',
      'https://www.fuelyourbody.nl/orzo-honey-mustard-chicken',
      8.45::numeric, 445,
      122::numeric, 9.8::numeric, 12.7::numeric, 3.7::numeric,
      'Kipmaaltijd', 'Magnetron, pan of oven', 'Diepvriesmaaltijd',
      'Kip (kippenvlees, water, dextrose, natuurlijk aroma, zout, gemodificeerd aardappelzetmeel, kruiden en specerijen [paprikapoeder, witte peper, oregano, zwarte peper, peterselie, knoflookpoeder, dragon, cayennepeper, komijn, kurkuma, koriander, kruidnagel, nootmuskaat, foelie, tijm], suiker, zonnebloemolie, voedingszuur [citroenzuur], natuurlijk uienaroma, gist, gistextract, uiengranulaat, paprikaconcentraat, rode bietensap, uienpoeder, knoflookgranulaat, maltodextrine, bloem [TARWE, GLUTEN], zetmeel [TARWE, GLUTEN], gehydrolyseerd eiwit [SOJA], paprikagranulaat, tomatenpoeder, antioxidant [trinatriumcitraat]), orzo, zoete aardappel, broccoli, ROOM (vet), MELKeiwit, melkzuurbacteriën, zout, microbieel stremsel, zout, suiker, kruiden en specerijen (MOSTERDzaad, knoflookgranulaat, uiengranulaat, koriander, kurkuma, peper, komijnzaad, foenegriek, chillies, kardemom, paprikapoeder gerookt), dextrose, honingpoeder (maltodextrine, honing).',
      'https://www.fuelyourbody.nl/orzo-honey-mustard-chicken'
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
