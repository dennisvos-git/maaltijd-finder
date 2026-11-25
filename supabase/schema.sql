-- Maaltijd Finder initial database schema
-- Run this script in Supabase -> SQL Editor.
-- No demo products are inserted; the catalog starts empty.

create extension if not exists pgcrypto;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  logo_url text,
  delivery_info text,
  -- Registry fields: only vendors verified to deliver in the Netherlands are published.
  country_code text not null default 'NL',
  delivery_verified_at timestamptz,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  source_type text not null default 'website'
    check (source_type in ('website', 'csv', 'xml', 'api', 'manual')),
  product_feed_url text,
  scan_enabled boolean not null default false,
  scan_frequency text not null default 'daily'
    check (scan_frequency in ('daily', 'weekly', 'manual')),
  last_scan_at timestamptz,
  last_scan_status text,
  admin_notes text,
  minimum_order_value numeric(10,2),
  minimum_order_quantity integer,
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_minimum_order_quantity_nonnegative
    check (minimum_order_quantity is null or minimum_order_quantity >= 0),
  constraint vendors_minimum_order_value_nonnegative
    check (minimum_order_value is null or minimum_order_value >= 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  name text not null,
  product_url text not null,
  image_url text,
  price numeric(10,2),
  weight_grams integer,
  kcal_per_100g numeric(8,2),
  protein_per_100g numeric(8,2),
  carbohydrates_per_100g numeric(8,2),
  fat_per_100g numeric(8,2),
  ingredients text,
  meal_type text,
  preparation_method text,
  category text,
  dietary_labels text[] not null default '{}',
  availability text not null default 'unknown',
  last_checked_at timestamptz,
  source_reference text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_nonnegative check (price is null or price >= 0),
  constraint products_weight_positive check (weight_grams is null or weight_grams > 0),
  constraint products_availability_valid
    check (availability in ('available', 'unavailable', 'unknown'))
);

create unique index if not exists products_vendor_product_url_unique
  on public.products(vendor_id, product_url);

create index if not exists products_vendor_id_idx on public.products(vendor_id);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_name_idx on public.products using gin (to_tsvector('dutch', name));

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  availability text not null default 'unknown',
  checked_at timestamptz not null default now(),
  source_reference text
);

create index if not exists price_history_product_checked_idx
  on public.price_history(product_id, checked_at desc);

-- Public visitors can read active vendors and products.
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.price_history enable row level security;

drop policy if exists "Public can read active vendors" on public.vendors;
create policy "Public can read active vendors"
  on public.vendors for select
  using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "Public can read price history for active products" on public.price_history;
create policy "Public can read price history for active products"
  on public.price_history for select
  using (
    exists (
      select 1 from public.products
      where products.id = price_history.product_id
        and products.is_active = true
    )
  );

-- Writes are intentionally not granted to anonymous visitors.
-- Admin/import permissions will be added through authenticated server-side workflows.
