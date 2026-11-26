-- Maak prijsgeschiedenis publiek leesbaar voor producten die ook in de catalogus zichtbaar zijn.
-- GRANT SELECT alleen is niet voldoende wanneer Row Level Security aanstaat.
-- Deze policy verbergt historie van gedeactiveerde of niet-geverifieerde aanbieders.

drop policy if exists "Public can read price history for visible products"
  on public.price_history;

create policy "Public can read price history for visible products"
  on public.price_history
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products as p
      join public.vendors as v on v.id = p.vendor_id
      where p.id = price_history.product_id
        and p.is_active = true
        and v.is_active = true
        and v.country_code = 'NL'
        and v.verification_status = 'verified'
    )
  );
