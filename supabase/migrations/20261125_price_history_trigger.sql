-- Automatische prijsgeschiedenis bij nieuwe producten en prijswijzigingen.
-- Dit registreert alleen waargenomen prijzen vanaf installatie van deze migratie.
-- Het maakt geen historische prijzen met terugwerkende kracht aan.

create or replace function public.record_product_price_history()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.price is not null then
    if tg_op = 'INSERT' then
      insert into public.price_history (product_id, price, availability, checked_at, source_reference)
      values (new.id, new.price, coalesce(new.availability, 'unknown'), now(), new.source_reference);
    elsif new.price is distinct from old.price
       or new.availability is distinct from old.availability then
      insert into public.price_history (product_id, price, availability, checked_at, source_reference)
      values (new.id, new.price, coalesce(new.availability, 'unknown'), now(), new.source_reference);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_record_price_history on public.products;
create trigger products_record_price_history
after insert or update of price, availability on public.products
for each row
execute function public.record_product_price_history();

-- Neem een eerste meetpunt op voor bestaande producten. Dit is een startmeting,
-- geen bewering over de prijs op een eerdere datum.
insert into public.price_history (product_id, price, availability, checked_at, source_reference)
select p.id, p.price, p.availability, now(), p.source_reference
from public.products p
where p.price is not null
  and not exists (
    select 1 from public.price_history h where h.product_id = p.id
  );

-- Publieke rollen mogen prijshistorie alleen lezen.
revoke insert, update, delete, truncate, references, trigger
on table public.price_history from anon, authenticated;
grant select on table public.price_history to anon, authenticated;
alter table public.price_history enable row level security;
