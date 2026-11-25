-- Eerste drie afzonderlijke Vers aan Tafel-maaltijden.
-- Productnamen, prijzen, gewichten, voedingswaarden en ingrediënten zijn overgenomen
-- van de openbare individuele productpagina's. Waarden per 100 gram.
-- Ontbrekende gegevens blijven NULL; er worden geen afbeeldingen verzonnen.

with vendor as (
  select id
  from public.vendors
  where lower(name) = lower('Vers aan Tafel')
  order by created_at desc
  limit 1
),
items as (
  select *
  from (values
    (
      'Hamburger in uiensaus met appelmoes en gebakken aardappelblokjes',
      'https://www.versaantafel.nl/hamburger-in-uiensaus-met-appelmoes-en-gebakken-aardappelen',
      8.91::numeric,
      500,
      124::numeric,
      2.9::numeric,
      13.9::numeric,
      6.0::numeric,
      'Vleesmaaltijd',
      'Magnetron of oven',
      'Diepvriesmaaltijd',
      array['Lactosevrij bereid', 'Zoutbewust', 'Groenterijk']::text[],
      'Aardappelkubus gebakken 30% (aardappel, zonnebloemolie, dextrose), appelmoes 28% (appelen, zuurteregelaar: citroenzuur, antioxidant: ascorbinezuur), water, hamburger 16% (varkensvlees, rundvlees, water, zetmeel, zeezout, gedroogde groenten (ui), varkenseiwit, zout, specerijen, groentepoeder (ui, knoflook), natuurlijk aroma, groenten (geroosterde ui, kool, prei, ui, paprika, knoflook, knolselderij), plantaardige olie (zonnebloemolie), selderijblad, gekaramelliseerde suiker), suiker, gegrilde uien 2%, plantaardige oliën (zonnebloem, koolzaad), fond, tarwebloem, gemodificeerd zetmeel, tomatenconcentraat, alcoholazijn, kleurstof: karamel, zout, specerijen.',
      'https://www.versaantafel.nl/hamburger-in-uiensaus-met-appelmoes-en-gebakken-aardappelen'
    ),
    (
      'Indonesische rijsttafel met babi ketjap, kipstukjes in kruidige saus en sambalboontjes',
      'https://www.versaantafel.nl/indonesische-rijsttafel-met-babi-ketjap-kipstukjes-in-kruidige-saus-en-sambalboontjes',
      9.20::numeric,
      500,
      109::numeric,
      5.8::numeric,
      12.0::numeric,
      3.9::numeric,
      'Vleesmaaltijd',
      'Magnetron of oven',
      'Diepvriesmaaltijd',
      array['Lactosevrij bereid', 'Eiwitrijk', 'Groenterijk']::text[],
      'Gekookte rijst 17%, prinsessenbonen 17%, water, kip 10% (kip, zout), varkensreepjes 10% (varken, zetmeel, water, zout, gemodificeerd zetmeel, tarwevezel, stabilisator: trifosfaten, varkenseiwit, gekaramelliseerde suiker, zuurteregelaar: natriumcarbonaten), uien, ketjap manis 3% (suiker, water, sojasaus (water, sojabonen, tarwe, zout, alcohol), zeezout, alcoholazijn, rode wijn extract), kokosmelk (kokosnootextract, water), prei, plantaardige oliën (zonnebloem, koolzaad), rode paprika, tomaten, witte wijn, wortelen, gele wortelen, gemodificeerd zetmeel, casonade, tomatenketchup, bouillon, tomatenconcentraat, sambal 0,5% (rode chili, zout), suiker, rijstzemelenolie, sesamolie, gember, rode chili, citroensap, citroengras, knoflook, limoensap, koriander, zout, limoenblad, specerijen.',
      'https://www.versaantafel.nl/indonesische-rijsttafel-met-babi-ketjap-kipstukjes-in-kruidige-saus-en-sambalboontjes'
    ),
    (
      'Tagliatelle met zalm en groene aspergepuntjes',
      'https://www.versaantafel.nl/romige-tagliatelle-met-zalmstukjes-en-groene-aspergepuntjes',
      8.91::numeric,
      500,
      173::numeric,
      6.9::numeric,
      15.8::numeric,
      9.0::numeric,
      'Vismaaltijd',
      'Magnetron',
      'Diepvriesmaaltijd',
      array['Zoutbewust']::text[],
      'Gekookte tagliatelle 42% (water, harde tarwegriesmeel, eieren), water, zalm 14%, room, uien, groene asperges 3%, plantaardige oliën (zonnebloem, koolzaad), gerookte zalm 1% (zalm, zout, rook), volle melkpoeder, boter, witte wijn, tarwebloem, zetmeel, dijonmosterd (water, mosterdzaad, azijn, zout, voedingszuur: citroenzuur), bouillon (maltodextrine, zetmeel, tarwebloem, vispoeder, zout, natuurlijk aroma, zonnebloemolie, glucosestroop, melkeiwitten, witte wijnextract, uien, sacharose, gistextract, groente-extracten (selderij, uien, tomaten, wortelen), uienpoeder, knoflook, specerijen), zout, peper.',
      'https://www.versaantafel.nl/romige-tagliatelle-met-zalmstukjes-en-groene-aspergepuntjes'
    )
  ) as t(name, product_url, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, meal_type, preparation_method, category, dietary_labels, ingredients, source_reference)
)
insert into public.products (
  vendor_id, name, product_url, price, weight_grams,
  kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g,
  meal_type, preparation_method, category, dietary_labels, ingredients,
  availability, last_checked_at, source_reference, is_active
)
select
  vendor.id, items.name, items.product_url, items.price, items.weight_grams,
  items.kcal_per_100g, items.protein_per_100g, items.carbohydrates_per_100g, items.fat_per_100g,
  items.meal_type, items.preparation_method, items.category, items.dietary_labels, items.ingredients,
  'unknown', now(), items.source_reference, true
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
  dietary_labels = excluded.dietary_labels,
  ingredients = excluded.ingredients,
  availability = excluded.availability,
  last_checked_at = excluded.last_checked_at,
  source_reference = excluded.source_reference,
  updated_at = now();
