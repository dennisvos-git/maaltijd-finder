# Beheer, prijsregistratie en gegevenscontrole

## Wat is toegevoegd
- `/beheer`: alleen-lezen controlepaneel met aantallen, ontbrekende productvelden, oude controledatums en aanbiederstatus.
- Catalogusfilters: minimum- en maximumprijs, minimum- en maximumgewicht, en controle in de afgelopen 30 dagen.
- Productdetail: geregistreerde prijsmeetpunten.
- `supabase/migrations/20261125_price_history_trigger.sql`: legt een meetpunt vast bij een nieuw product en bij een gewijzigde prijs of beschikbaarheid.

## Eenmalige Supabase-stap voor prijsgeschiedenis
Voer `supabase/migrations/20261125_price_history_trigger.sql` uit in Supabase SQL Editor. De migratie:
- maakt een trigger op products;
- schrijft een meetpunt als een product wordt ingevoegd of prijs/beschikbaarheid verandert;
- maakt voor bestaande producten één startmeetpunt met de huidige prijs;
- geeft de publieke rollen alleen SELECT op prijsgeschiedenis.

Let op: de startmeetpunten zijn geen terugwerkende prijsgeschiedenis. Alleen wijzigingen vanaf installatie van de trigger worden automatisch vastgelegd. Er is nog geen automatische dagelijkse broncontrole of scraper actief.

## Beheeromgeving en beveiliging
De beheerroute is voorlopig een kwaliteitsdashboard met alleen openbare catalogusgegevens. Er staan bewust geen bewerk- of importknoppen in. De publieke Supabase-rollen zijn read-only. De volgende stap voor echt beheer is Supabase Auth met een beheerdersrol en een server-side importfunctie. Maak geen browser-side schrijfrechten aan en deel nooit een service-role key met de browser.

Voor ingebruikname van echte beheerschrijfacties moeten minimaal geregeld zijn:
1. Supabase Auth-login voor de beheerder.
2. Een beheerdersrol die alleen via een vertrouwde SQL/server-side procedure wordt toegekend.
3. Server-side validatie met `scripts/validate-product-import.mjs`-regels als basis.
4. Een importpreview met aantallen toevoegingen, updates, duplicaten, waarschuwingen en afkeuringen.
5. Een expliciete bevestiging vóór een transactie wordt opgeslagen.
6. Een auditlog van wie wat heeft gewijzigd en wanneer.

## Importcontrole
De bestaande Node-validator controleert onder meer aanbiederstatus, Nederlandse levering, productlinks, dubbele producten, numerieke grenzen en onwaarschijnlijke voedingswaarden. De validator voert zelf geen databasewrites uit. Onbekende waarden blijven leeg.

## Handmatige controle op verouderde gegevens
Het dashboard markeert een product als oud als `last_checked_at` ontbreekt of ouder is dan 30 dagen. Dit is een signaal voor handmatige controle, geen automatische controle van de webshop.
