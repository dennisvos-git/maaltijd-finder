-- Beveiligde beheerrollen en beperkte schrijfpolicies.
-- Voeg pas na het aanmaken van een Auth-gebruiker diens UUID toe aan admin_users
-- via Supabase SQL Editor. De publieke browserrol krijgt geen schrijfrechten.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists "Admins can read own admin membership" on public.admin_users;
create policy "Admins can read own admin membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

grant insert, update on table public.products to authenticated;
grant insert, update on table public.vendors to authenticated;

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can insert vendors" on public.vendors;
create policy "Admins can insert vendors"
  on public.vendors for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update vendors" on public.vendors;
create policy "Admins can update vendors"
  on public.vendors for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Authenticated niet-beheerders behouden alleen publieke SELECT-toegang via bestaande policies.
-- DELETE wordt bewust niet toegekend; records worden gedeactiveerd via is_active.
