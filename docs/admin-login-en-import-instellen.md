# Beveiligde beheerlogin en importrechten

## Eenmalige configuratie
1. Voer `supabase/migrations/20261125_admin_roles_and_import_policies.sql` uit in Supabase SQL Editor.
2. Maak in Supabase Dashboard onder Authentication → Users een gebruiker aan voor de beheerder. Gebruik een sterk wachtwoord en deel dit nooit in GitHub of met ChatGPT.
3. Kopieer de UUID van die gebruiker.
4. Voeg alleen die UUID toe via SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('VUL-HIER-DE-AUTH-USER-UUID-IN');
```

Vervang de voorbeeldtekst door de echte UUID. Voeg geen publiek account toe.

## Beveiliging
- De browser kan alleen inloggen met Supabase Auth.
- De database controleert bij elke insert/update of de ingelogde UUID in `admin_users` staat.
- De anon-rol krijgt geen schrijfrechten.
- Er is geen DELETE-recht; producten en aanbieders worden gedeactiveerd met `is_active`.
- De service-role key hoort uitsluitend op een beveiligde server en mag nooit in een browseromgeving of GitHub worden geplaatst.

## Import
De beheerinterface accepteert JSON en controleert verplichte velden, Nederlandse/geverifieerde/actieve aanbieder, URL's, numerieke waarden, voedingswaarden en dubbele links vóór opslaan. Een import kan alleen producten koppelen aan bestaande aanbieders. Nieuwe aanbieders worden niet automatisch goedgekeurd of aangemaakt.
