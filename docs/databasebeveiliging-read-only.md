# Databasebeveiliging: alleen-lezen publieke catalogus

De website gebruikt de Supabase publishable key in de browser. Daarom mogen de rollen `anon` en `authenticated` alleen openbare catalogusgegevens lezen.

## Migratie
Voer `supabase/migrations/20261125_public_catalog_read_only.sql` één keer uit in Supabase SQL Editor.

De migratie:
- zet RLS aan op `vendors`, `products` en `price_history`;
- trekt alle bestaande tabelrechten van `anon` en `authenticated` in;
- geeft alleen `SELECT` terug;
- beperkt zichtbare aanbieders en maaltijden tot actieve records;
- laat prijshistorie alleen zien voor actieve maaltijden;
- maakt geen browserwrites mogelijk.

De migratie verwijdert geen gegevens en verandert geen product- of aanbiedersrecords.

## Controle na uitvoeren

Voer dit uit om te controleren dat de browserrollen alleen SELECT hebben:

```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('vendors', 'products', 'price_history')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
```

Verwacht per tabel en per rol uitsluitend `SELECT`.

Controleer de RLS-policies:

```sql
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('vendors', 'products', 'price_history')
order by tablename, policyname;
```

De drie tabellen moeten RLS ingeschakeld hebben. De policies zijn uitsluitend voor SELECT. Schrijfacties horen later via een beveiligde server-side beheerfunctie te lopen, nooit via de publieke browserclient.

## Achtergrond
Supabase maakt onderscheid tussen tabelrechten (GRANT) en rijbeveiliging (RLS). Beide zijn nodig: RLS beperkt welke rijen zichtbaar zijn, terwijl GRANT bepaalt welke bewerkingen een rol überhaupt mag uitvoeren. Zie de officiële documentatie: https://supabase.com/docs/guides/database/postgres/row-level-security
