-- Beperk de publieke Data API tot alleen-lezen toegang.
-- RLS bepaalt welke rijen zichtbaar zijn; GRANT bepaalt welke acties mogelijk zijn.
-- Browserclients mogen catalogusgegevens lezen, maar nooit rechtstreeks schrijven.

alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.price_history enable row level security;

revoke all privileges on table public.vendors from anon, authenticated;
revoke all privileges on table public.products from anon, authenticated;
revoke all privileges on table public.price_history from anon, authenticated;

grant select on table public.vendors to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.price_history to anon, authenticated;

drop policy if exists "Public can read active vendors" on public.vendors;
create policy "Public can read active vendors"
  on public.vendors
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read price history for active products" on public.price_history;
create policy "Public can read price history for active products"
  on public.price_history
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = price_history.product_id
        and products.is_active = true
    )
  );

-- Er worden bewust geen INSERT-, UPDATE- of DELETE-grants aan browserrollen gegeven.
