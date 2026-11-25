# Beheer, prijsregistratie en gegevenscontrole

## Wat werkt er nu
- `/beheer`: kwaliteitsdashboard met aantallen, ontbrekende productvelden, oude controledatums en aanbiederstatus.
- `/beheer/import`: beveiligde Supabase Auth-login en JSON-import voor accounts die in `public.admin_users` staan.
- Catalogusfilters: zoeken, maaltijdsoort, bereiding, dieetkenmerk, beschikbaarheid, volledigheid, prijs, gewicht, controledatum en sortering.
- Productdetail: geregistreerde prijsmeetpunten.
- `supabase/migrations/20261125_price_history_trigger.sql`: registreert prijs- en beschikbaarheidswijzigingen.
- `supabase/migrations/20261125_admin_roles_and_import_policies.sql`: beheerderslijst en beperkte databasepolicies.
- `scripts/validate-product-import.mjs`: zelfstandige importvalidator met zelftest via `npm run validate:imports`.

## Beheerlogin en rechten
1. Maak de beheerder aan via Supabase Dashboard → Authentication → Users.
2. Voeg de UUID van die Auth-gebruiker toe aan `public.admin_users` via SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH-USER-UUID')
   on conflict (user_id) do nothing;
   ```
3. Open `/beheer/import` en log in met dat Auth-account.

De importpagina accepteert alleen aanbieders die actief, geverifieerd en Nederlands zijn. De import controleert verplichte velden, links, numerieke grenzen, beschikbaarheidsstatus en dubbele productlinks. Een bestaand product wordt niet overschreven: de import wordt dan afgekeurd. Onbekende waarden mogen leeg/null blijven.

De huidige importpagina voegt producten toe; zij biedt geen productbewerking of verwijdering. De database kent voor beheerders beperkte insert/update-policies op producten en aanbieders, maar kent bewust geen DELETE-recht toe. De publieke website blijft alleen-lezen. Deel nooit een Supabase service-role key met de browser en vraag nooit om wachtwoorden of tokens in chat.

## Wachtwoord herstellen
De beheerlogin bevat een functie 'Wachtwoord vergeten?'. De Supabase Auth URL Configuration moet de productie-URL als Site URL hebben en de redirect naar `/beheer/wachtwoord-reset` toestaan. De app gebruikt `NEXT_PUBLIC_SITE_URL` als die is ingesteld; anders de huidige domeinnaam.

## Prijsgeschiedenis
Voer `supabase/migrations/20261125_price_history_trigger.sql` uit in Supabase SQL Editor. De migratie:
- maakt een trigger op products;
- schrijft een meetpunt bij een nieuw product en bij een gewijzigde prijs of beschikbaarheid;
- maakt voor bestaande producten één startmeetpunt met de huidige prijs;
- geeft publieke rollen alleen SELECT op prijsgeschiedenis.

De startmeetpunten zijn geen terugwerkende prijsgeschiedenis. Alleen wijzigingen vanaf installatie van de trigger worden automatisch vastgelegd.

## Verouderde productinformatie
Het dashboard markeert een product als oud als `last_checked_at` ontbreekt of ouder is dan 30 dagen. Dit is een signaal voor handmatige controle, geen automatische controle van de webshop.

## Automatische scans
Er draait op dit moment geen betrouwbare automatische dagelijkse scan van aanbieders. De `scan_enabled`-kolom is alleen een statusveld; die start op zichzelf geen scan. Zet scans pas aan wanneer een gecontroleerde scanworkflow, logging en foutafhandeling daadwerkelijk zijn ingericht.

## Veilige importwerkwijze
- Gebruik alleen gecontroleerde brongegevens van actieve, geverifieerde Nederlandse aanbieders.
- Vul geen ontbrekende voedingswaarden of prijzen op basis van aannames in; laat ze leeg.
- Controleer de JSON eerst lokaal met `npm run validate:imports` of met het script en een importbestand.
- Controleer bronlinks en duplicaten vóór import.
- Importeer kleine batches; controleer daarna het dashboard en de productdetailpagina.
