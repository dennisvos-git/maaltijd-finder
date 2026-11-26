# Maaltijd Finder

Vergelijkingsplatform voor individuele kant-en-klaarmaaltijden van Nederlandse aanbieders. De website verwijst bezoekers door naar de aanbieder; verkopen gebeurt niet op Maaltijd Finder.

## Technologie
- Next.js + TypeScript
- Supabase (Postgres en Auth)
- GitHub Actions voor kwaliteitscontroles
- Vercel voor hosting

## Lokaal starten
1. Installeer Node.js 20 of hoger.
2. Maak een kopie van `.env.example` met de naam `.env.local`.
3. Vul de Supabase Project URL en Publishable key in.
4. Voer uit:

```bash
npm install
npm run dev
```

Open daarna http://localhost:3000.

## Controles vóór publicatie

```bash
npm run validate:imports
npm run lint
npm run build
```

GitHub Actions voert deze controles uit bij pull requests en pushes naar `main`. De build gebruikt alleen tijdelijke placeholderwaarden voor de publieke Supabase-configuratie; er zijn geen geheime sleutels nodig.

## Database en beheer
- De basisstructuur staat in `supabase/schema.sql`.
- Aanvullende wijzigingen staan afzonderlijk in `supabase/migrations/`. Voer alleen migraties uit die nog niet op het Supabase-project zijn toegepast.
- Beheerlogin en rechten zijn beschreven in [docs/admin-login-en-import-instellen.md](docs/admin-login-en-import-instellen.md).
- Prijsgeschiedenis en gegevenscontrole zijn beschreven in [docs/beheer-prijsgeschiedenis-en-controles.md](docs/beheer-prijsgeschiedenis-en-controles.md).

De beheeromgeving is bedoeld voor geautoriseerde beheerders. Publieke bezoekers hebben alleen-lezen toegang tot zichtbare catalogusgegevens. Imports voegen nieuwe producten toe; bestaande producten worden niet automatisch overschreven. Er is bewust geen publieke schrijf- of verwijderfunctie.

## Veiligheid
- Commit nooit `.env.local`, databasewachtwoorden of geheime sleutels.
- Gebruik nooit de Supabase `service_role`-sleutel in de browser of in GitHub.
- De publieke Publishable key mag in de client worden gebruikt in combinatie met correcte Row Level Security-policies.
- Maak beheerders aan via Supabase Auth en geef alleen expliciet geautoriseerde accounts toegang via `public.admin_users`.
- Voer database-migraties handmatig en gecontroleerd uit; een Vercel-deployment voert geen Supabase SQL uit.

## Productgegevens en grenzen
- Ontbrekende voedingswaarden en prijzen blijven onbekend; ze worden niet aangevuld met aannames.
- Minimum bestelhoeveelheden zijn bezorgvoorwaarden en sluiten een aanbieder niet uit.
- Prijsgeschiedenis registreert wijzigingen aan productrecords nadat de trigger is geïnstalleerd. Er vindt geen automatische dagelijkse websitecrawl plaats.
- De controlekolom en het dashboard signaleren verouderde informatie, maar bewijzen niet dat een externe webshop automatisch is gecontroleerd.
- Er worden in deze release geen maaltijden of productrecords toegevoegd of gewijzigd.
