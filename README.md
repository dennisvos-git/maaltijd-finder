# Maaltijd Finder

Vergelijkingsplatform voor individuele kant-en-klaarmaaltijden van Nederlandse aanbieders.

## Technologie
- Next.js + TypeScript
- Supabase (Postgres)
- GitHub voor versiebeheer

## Lokaal starten
1. Installeer Node.js (LTS).
2. Maak lokaal een kopie van `.env.example` met de naam `.env.local`.
3. Vul in `.env.local` de Supabase Project URL en Publishable key in.
4. Voer uit:

```bash
npm install
npm run dev
```

Open daarna http://localhost:3000.

## Database instellen
1. Open het Supabase-project.
2. Ga naar SQL Editor en maak een nieuwe query.
3. Kopieer de volledige inhoud van `supabase/schema.sql`.
4. Voer de query uit.

De database wordt leeg aangemaakt. Er worden geen fictieve producten of aanbieders toegevoegd.

## Veiligheid
- Commit nooit `.env.local`, databasewachtwoorden of geheime sleutels.
- De Publishable key is bedoeld voor gebruik in de client, in combinatie met Row Level Security.
- Gebruik nooit de Supabase `service_role`-sleutel in de browser of in GitHub.
- Publieke bezoekers krijgen alleen leesrechten op actieve catalogusgegevens. Schrijfrechten voor beheer en imports worden later apart ingericht.

## Productgegevens
Ontbrekende voedingswaarden blijven leeg. Prijs- en beschikbaarheidsinformatie hoort een controledatum te hebben. Minimum bestelhoeveelheden worden als bezorgvoorwaarde vastgelegd en sluiten een aanbieder niet uit.
