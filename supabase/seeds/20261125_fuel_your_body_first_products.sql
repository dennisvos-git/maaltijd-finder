-- Eerste 2 afzonderlijke Fuel Your Body-maaltijden
-- Gegevens gecontroleerd op de individuele productpagina's.
-- kcal/macros zijn omgerekend naar waarden per 100 gram op basis van de tabel op de productpagina.
-- Afbeeldingen blijven leeg totdat een betrouwbare afbeeldings-URL rechtstreeks uit de bron is vastgesteld.

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
      'Marry Me Chicken Pasta',
      'https://www.fuelyourbody.nl/marry-me-chicken-pasta',
      8.45::numeric,
      450,
      122::numeric,
      10.4::numeric,
      13.3::numeric,
      3.1::numeric,
      'Kipmaaltijd',
      'Magnetron',
      'Diepvries',
      '550 kcal en 46,6 g eiwit per portie van 450 g; per 100 g: 122 kcal en 10,4 g eiwit. Prijs €8,45. Ingrediënten en allergenen staan op de productpagina.',
      'https://www.fuelyourbody.nl/marry-me-chicken-pasta'
    ),
    (
      'Rijst - Kip - Broccoli',
      'https://www.fuelyourbody.nl/rijst-kip-broccoli',
      7.49::numeric,
      405,
      101::numeric,
      10.2::numeric,
      12.5::numeric,
      1.1::numeric,
      'Kipmaaltijd',
      'Magnetron',
      'Diepvries',
      '408 kcal en 41,5 g eiwit per portie van 405 g; per 100 g: 101 kcal en 10,2 g eiwit. Prijs €7,49. Ingrediënten en allergenen staan op de productpagina.',
      'https://www.fuelyourbody.nl/rijst-kip-broccoli'
    )
  ) as t(name, product_url, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, category, preparation_method, meal_type, ingredients, source_reference)
)
insert into public.products (
  vendor_id, name, product_url, price, weight_grams,
  kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g,
  category, preparation_method, meal_type, ingredients,
  availability, last_checked_at, source_reference, is_active
)
select
  vendor.id, items.name, items.product_url, items.price, items.weight_grams,
  items.kcal_per_100g, items.protein_per_100g, items.carbohydrates_per_100g, items.fat_per_100g,
  items.category, items.preparation_method, items.meal_type, items.ingredients,
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
  category = excluded.category,
  preparation_method = excluded.preparation_method,
  meal_type = excluded.meal_type,
  ingredients = excluded.ingredients,
  availability = excluded.availability,
  last_checked_at = excluded.last_checked_at,
  source_reference = excluded.source_reference,
  updated_at = now();
