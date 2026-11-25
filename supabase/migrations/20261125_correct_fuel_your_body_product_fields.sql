-- Corrigeer de veldindeling van de eerste Fuel Your Body-producten.
-- Ingrediënten zijn niet betrouwbaar uit de bron overgenomen en blijven daarom leeg.

update public.products
set
  meal_type = 'Kipmaaltijd',
  category = 'Diepvriesmaaltijd',
  ingredients = null,
  updated_at = now()
where product_url in (
  'https://www.fuelyourbody.nl/marry-me-chicken-pasta',
  'https://www.fuelyourbody.nl/rijst-kip-broccoli'
)
and vendor_id in (
  select id
  from public.vendors
  where lower(name) = lower('Fuel Your Body')
);
