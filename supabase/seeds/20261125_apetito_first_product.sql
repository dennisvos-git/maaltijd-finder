-- Eerste individuele Apetito-maaltijd: artikel 19001.
-- Productgegevens overgenomen uit de door de gebruiker aangeleverde productpagina.
-- Ontbrekende gegevens (zoals productafbeelding) blijven leeg.
-- Beschikbaarheid blijft 'unknown' omdat actuele voorraad niet is bevestigd.

with vendor as (
  select id
  from public.vendors
  where lower(name) = lower('Apetito')
  order by created_at desc
  limit 1
),
item as (
  select
    'Kipgehaktballetjes in zigeunersaus met doperwten, wortelen en aardappelkroketten'::text as name,
    'https://www.apetito-shop.nl/product-details/19001-kipgehaktballetjes-in-zigeunersaus?selectedArticleDetailId=19001&selectedArticleDetailPageNumber=1'::text as product_url,
    8.45::numeric as price,
    440::integer as weight_grams,
    124::numeric as kcal_per_100g,
    4.4::numeric as protein_per_100g,
    12.0::numeric as carbohydrates_per_100g,
    5.9::numeric as fat_per_100g,
    'Kipmaaltijd'::text as meal_type,
    'Magnetron of oven'::text as preparation_method,
    'Diepvriesmaaltijd'::text as category,
    array['Zonder varken', 'Groenterijk', 'Arm aan verzadigd vet', 'Rijk aan onverzadigd vet']::text[] as dietary_labels,
    'Aardappelen, wortelen [16.5%], doperwten [15.5%], water, kippenvlees [8.5%], uien, paprika [3.7%], kalkoenvlees [3.7%], koolzaadolie, tomatenpuree, augurken, TARWEBLOEM, tomaten, champignons, KIPPENEIEREN, suiker, gemodificeerd maïszetmeel, kippenvet, gejodeerd zout (zout, kaliumjodaat), rode pepers, zout, azijn, WEIPRODUCT, specerijen (knoflook, paprika, nootmuskaat, lavas, peper, gember, chillies), MELKEIWIT, kruiden (peterselie, kruiden), emulgator (mono- en diglyceriden van vetzuren), dextrose, rook, voedingszuur (citroenzuur). Kan bevatten: SOJA, SELDERIJ, SESAM. Ondanks de grootste zorg kan het product soms botten bevatten. Allergenen: GLUTEN, EIEREN, MELKEIWIT, LACTOSE.'::text as ingredients,
    'https://www.apetito-shop.nl/product-details/19001-kipgehaktballetjes-in-zigeunersaus?selectedArticleDetailId=19001&selectedArticleDetailPageNumber=1'::text as source_reference
)
insert into public.products (
  vendor_id, name, product_url, price, weight_grams,
  kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g,
  meal_type, preparation_method, category, dietary_labels, ingredients,
  availability, last_checked_at, source_reference, is_active
)
select
  vendor.id, item.name, item.product_url, item.price, item.weight_grams,
  item.kcal_per_100g, item.protein_per_100g, item.carbohydrates_per_100g, item.fat_per_100g,
  item.meal_type, item.preparation_method, item.category, item.dietary_labels, item.ingredients,
  'unknown', now(), item.source_reference, true
from vendor cross join item
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
  dietary_labels = excluded.dietary_labels,
  ingredients = excluded.ingredients,
  availability = excluded.availability,
  last_checked_at = excluded.last_checked_at,
  source_reference = excluded.source_reference,
  updated_at = now();
