# Beheer, prijsregistratie en gegevenscontrole

## Wat werkt er nu
- `/beheer`: kwaliteitsdashboard met aantallen, ontbrekende productvelden, controledatums en aanbiederstatus.
- Dashboardfilters: zoeken op maaltijd/aanbieder, filteren op aanbieder, ontbrekende gegevens, ouder dan 30 dagen of nooit gecontroleerd.
- Dashboardsortering: naam, oudste controledatum, laagste prijs en hoogste prijs.
- `/beheer/import`: beveiligde Supabase Auth-login, wachtwoordherstel en JSON-import voor accounts die in `public.admin_users` staan.
- Catalogusfilters: maaltijdsoort, bereiding, dieetkenmerk, beschikbaarheid, volledigheid, prijs, gewicht, controledatum en sortering.
- Productdetail: geregistreerde prijsmeetpunten.
- `supabase/migrations/20261125_price_history_trigger.sql`: registreert prijs- en beschikbaarheidswijzigingen in de database.
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

De importpagina accepteert alleen aanbieders die actief, geverifieerd en Nederlands zijn. De import controleert verplichte velden, bronlinks, numerieke grenzen, beschikbaarheidsstatus en dubbele productlinks. Voor het opslaan wordt een preview getoond; de beheerder moet apart bevestigen. Vlak voor het opslaan worden duplicaten opnieuw gecontroleerd. Een bestaand product wordt niet overschreven. Opvallend afwijkende kcal-waarden geven een waarschuwing die handmatige broncontrole vraagt; de import wordt daardoor niet automatisch afgekeurd. Onbekende waarden mogen leeg/null blijven.

De huidige importpagina voegt uitsluitend nieuwe producten toe; zij biedt geen productbewerking of verwijdering. Aanbieders kunnen niet via de import worden aangemaakt of goedgekeurd. De database kent voor beheerders beperkte insert/update-policies op producten en aanbieders, maar kent bewust geen DELETE-recht toe. De publieke website blijft alleen-lezen. Deel nooit een Supabase service-role key met de browser en vraag nooit om wachtwoorden of tokens in chat.

## Wachtwoord herstellen
De beheerlogin bevat een functie 'Wachtwoord vergeten?'. De Supabase Auth URL Configuration moet de productie-URL als Site URL hebben en de redirect naar `/beheer/wachtwoord-reset` toestaan. De app gebruikt `NEXT_PUBLIC_SITE_URL` als die is ingesteld; anders de huidige domeinnaam.

## Prijsgeschiedenis
Voer `supabase/migrations/20261125_price_history_trigger.sql` uit in Supabase SQL Editor. De migratie:
- maakt een trigger op products;
- schrijft een meetpunt bij een nieuw product en bij een gewijzigde prijs of beschikbaarheid;
- maakt voor bestaande producten één startmeetpunt met de huidige prijs;
- geeft publieke rollen alleen SELECT op prijsgeschiedenis.

De startmeetpunten zijn geen terugwerkende prijsgeschiedenis. Alleen wijzigingen aan productrecords vanaf installatie van de trigger worden automatisch vastgelegd. De trigger bezoekt geen aanbiederswebsites en haalt zelf geen actuele prijzen op.

## Verouderde productinformatie
Het dashboard markeert een product als ouder dan 30 dagen als `last_checked_at` ouder is dan 30 dagen. Een ontbrekende datum wordt apart getoond als nooit gecontroleerd. Dit zijn signalen voor handmatige controle, geen automatische controle van de webshop.

## Automatische scans
Er draait op dit moment geen betrouwbare automatische dagelijkse scan van aanbieders. De `scan_enabled`-kolom is alleen een statusveld; die start op zichzelf geen scan. Zet scans pas aan wanneer een gecontroleerde scanworkflow, logging en foutafhandeling daadwerkelijk zijn ingericht.

## Veilige importwerkwijze
- Gebruik alleen gecontroleerde brongegevens van actieve, geverifieerde Nederlandse aanbieders.
- Vul geen ontbrekende voedingswaarden of prijzen op basis van aannames in; laat ze leeg.
- Controleer JSON lokaal met `npm run validate:imports` of met het script en een importbestand.
- Controleer bronlinks en duplicaten vóór import.
- Bekijk de preview zorgvuldig en bevestig alleen als de gegevens kloppen.
- Importeer kleine batches; controleer daarna het dashboard en de productdetailpagina.


## Vindbaarheid en uitleg voor bezoekers
- De globale metadata bevat Nederlandstalige titels, beschrijvingen, canonical URL en social-share metadata.
- Productdetailpagina's krijgen per product een eigen titel en beschrijving op basis van de gecontroleerde catalogusgegevens.
- `/sitemap.xml` bevat de homepage, aanbiederspagina en actieve producten van geverifieerde Nederlandse aanbieders.
- `/robots.txt` verwijst naar de sitemap en sluit `/beheer/` uit voor zoekmachinecrawlers.
- `/uitleg` licht de vergelijkingsmethode toe, waaronder ontbrekende waarden, prijs per kilo, geschatte portiewaarden en bestellen bij de aanbieder.
- Er is een eigen 404-pagina en een herstelbare globale foutpagina.
- De workflow `.github/workflows/quality-checks.yml` voert importzelftests, lint en build uit. De dubbele oudere buildworkflow is verwijderd om checks niet dubbel te draaien.

Deze technische vindbaarheidsverbeteringen zijn geen garantie op hogere posities in zoekmachines. De sitemap kan alleen productpagina's opnemen als de Supabase publieke leesverbinding tijdens het genereren beschikbaar is.

## Cataloguskwaliteit en toegankelijkheid
- De volledigheidsscore telt zeven velden: prijs, gewicht, energie, eiwitten, koolhydraten, vetten en ingrediënten. De score meet alleen de aanwezigheid van gegevens, niet de voedingskwaliteit of bronjuistheid.
- Tekstvelden met uitsluitend witruimte gelden als ontbrekend; dit is gelijkgetrokken op catalogus- en detailpagina.
- De resultaatmelding van de catalogus wordt als live status aan hulptechnologie doorgegeven.
- Productafbeeldingen in de catalogus en op detailpagina's worden waar mogelijk uitgesteld geladen.
- De filterreset zet zoekterm, filters en sortering terug naar de standaardinstellingen.

## Onderscheid in controledatums
Het beheerdashboard telt producten zonder controledatum apart van producten waarvan de laatste controledatum ouder is dan 30 dagen. De tegel 'Ouder dan 30 dagen' telt dus geen ontbrekende datums mee; 'Nooit gecontroleerd' doet dat afzonderlijk. Dezelfde whitespace-controle voor ontbrekende tekstvelden wordt gebruikt bij de volledigheidscontrole in het dashboard. Een datumstatus is uitsluitend een administratief signaal en bewijst niet dat de aanbiederwebsite is gecontroleerd.

Ook ongeldige, niet-parseerbare controledatums worden apart geteld en zijn via een eigen dashboardfilter terug te vinden. Zo vallen corrupte datumwaarden niet stilzwijgend buiten zowel 'nooit gecontroleerd' als 'ouder dan 30 dagen'. De datum wordt als ongeldig getoond en vraagt om handmatige correctie; dit is geen automatische broncontrole.


## Extra importcontroles

De JSON-import controleert verplichte tekstvelden op lege waarden, product-, bron- en optionele afbeeldingslinks op geldige HTTP(S)-URL's, en optionele controledatums op parseerbaarheid. Een ongeldige link of datum blokkeert de import. Een prijs van € 0 of een gewicht boven 3 kg geeft een waarschuwing om eenheden en bronovername te controleren; dit wordt niet automatisch afgekeurd. Gedeeltelijke voedingswaarden blijven toegestaan en onbekende waarden mogen leeg zijn. Zowel het beheerscherm als de zelfstandige validatietest melden afwijkende kcal ten opzichte van eiwit, koolhydraten en vet.


## Extra datumcontrole bij import

Een geldige `last_checked_at`-datum die meer dan vijf minuten in de toekomst ligt, geeft nu een waarschuwing in zowel de beheerpreview als de zelfstandige importvalidator. De import blijft mogelijk na handmatige controle; kleine tijdsverschillen door klok- of tijdzone-instellingen worden hiermee niet direct als harde fout behandeld. De zelftest bevat ook een scenario voor een toekomstige controledatum.


De importpagina toont waarschuwingen en afkeurpunten nu als afzonderlijke, getelde overzichten. De waarschuwingen zijn via een live status toegankelijk; fouten krijgen een dringender schermlezermelding. Bij afkeuring wordt expliciet vermeld dat er niets is opgeslagen.


## Controledatums op bezoekerspagina's

De openbare catalogus en productdetailpagina tonen geen misleidende datum wanneer `last_checked_at` ontbreekt, ongeldig is of in de toekomst ligt. Zulke producten vallen bij de actualiteitsfilter onder 'Ouder dan 30 dagen / onbekend' en krijgen een melding dat de controledatum moet worden nagekeken. Alleen een geldige datum die niet in de toekomst ligt, telt als gecontroleerd; dit blijft een administratieve datum en geen bewijs van een automatische websitecontrole.


Bij een import met waarschuwingen moet de beheerder in de preview expliciet aanvinken dat alle waarschuwingen aan de hand van de brongegevens zijn gecontroleerd. Zonder die bevestiging blijft de importknop uitgeschakeld. Het aanpassen van de JSON of annuleren van de preview wist deze bevestiging.


## Veilige externe links en toekomstige controledatums

Publieke product-, afbeelding- en aanbiederslinks worden alleen als externe link of afbeelding gebruikt wanneer de URL een absolute `http`- of `https`-URL is. Bij een ongeldige productlink blijft de productdetailpagina beschikbaar, maar wordt geen uitgaande knop getoond. Het beheer-overzicht behandelt ook toekomstige controledatums als ongeldig; zo sluiten de tellingen en filters aan op de openbare catalogus. Dit controleert de URL-vorm, niet of de externe website bereikbaar is of de inhoud klopt.
