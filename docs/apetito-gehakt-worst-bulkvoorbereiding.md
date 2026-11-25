# Apetito bulkvoorbereiding — Gehakt & worst

Status: 9 producten met productgegevens gecontroleerd; nog niet geïmporteerd in Supabase.

## Bronnen en methode
- Actuele webshopmomentopname: https://www.apetito-shop.nl/ons-aanbod/alle-maaltijden
- Officiële Apetito-catalogus, te bestellen vanaf 12 januari 2026, pagina's 11–13: https://cld.bz/GVPoecp
- De catalogus geeft voedingswaarden per volledige portie. De database verwacht waarden per 100 g. Daarom zijn de waarden omgerekend met: portiewaarde × 100 / portiegewicht. Afronding op 2 decimalen. Dit is een transparante berekening uit officiële bronwaarden.
- De actuele artikelinfo op de webshop is leidend als die afwijkt van de catalogus: https://www.apetito-shop.nl/artikelinfo
- De individuele product-URL's zijn nog niet bevestigd. Daarom staat er nog geen SQL-import klaar.

## Gecontroleerde batch

| Artikel | Product | Prijs | Gewicht | kcal/100g | Eiwit/100g | Koolhydraten/100g | Vet/100g |
|---|---|---:|---:|---:|---:|---:|---:|
| 19010 | Gehaktschijf (kalfsvlees) in mosterd-uiensaus | €8,50 | 490 g | 87,96 | 3,67 g | 7,35 g | 4,49 g |
| 19017 | Gehaktbal (varkensvlees) in uienjus | €7,87 | 510 g | 103,14 | 3,53 g | 10,20 g | 5,10 g |
| 19035 | Braadworst in jus | €8,37 | 500 g | 99,00 | 3,80 g | 7,40 g | 5,40 g |
| 19025 | Gehakt (varkensvlees) in jus | €8,08 | 450 g | 84,44 | 4,00 g | 8,44 g | 3,33 g |
| 19069 | Rundergehaktbal in jus | €8,33 | 500 g | 111,00 | 3,80 g | 8,20 g | 6,60 g |
| 19031 | Slavink in jus | €8,94 | 510 g | 109,02 | 4,51 g | 9,02 g | 5,69 g |
| 19085 | Prei-gehaktschotel | €8,28 | 500 g | 94,80 | 3,20 g | 10,40 g | 4,20 g |
| 19095 | Rundergehaktbal in jus | €8,23 | 480 g | 101,25 | 3,54 g | 12,08 g | 3,96 g |
| 19099 | Varkenssaucijs in jus | €8,48 | 480 g | 110,21 | 4,79 g | 7,50 g | 6,46 g |

## Bronwaarden ter controle
De officiële catalogus geeft voor deze producten de volgende waarden per volledige portie:
- 19010, 490 g: 431 kcal; 22 g vet; 36 g koolhydraten; 18 g eiwit.
- 19017, 510 g: 526 kcal; 26 g vet; 52 g koolhydraten; 18 g eiwit.
- 19035, 500 g: 495 kcal; 27 g vet; 37 g koolhydraten; 19 g eiwit.
- 19025, 450 g: 380 kcal; 15 g vet; 38 g koolhydraten; 18 g eiwit.
- 19069, 500 g: 555 kcal; 33 g vet; 41 g koolhydraten; 19 g eiwit.
- 19031, 510 g: 556 kcal; 29 g vet; 46 g koolhydraten; 23 g eiwit.
- 19085, 500 g: 474 kcal; 21 g vet; 52 g koolhydraten; 16 g eiwit.
- 19095, 480 g: 486 kcal; 19 g vet; 58 g koolhydraten; 17 g eiwit.
- 19099, 480 g: 529 kcal; 31 g vet; 36 g koolhydraten; 23 g eiwit.

## Nog nodig voor import
- Exacte product-URL per artikel (niet zelf construeren op basis van artikelnummer).
- Actuele beschikbaarheidsstatus.
- Actuele artikelinfo controleren als de cataloguswaarden verouderd zijn.

Apetito hanteert minimaal 7 maaltijden per bestelling (of één dinerdoos). Dit is een bestelvoorwaarde en geen reden om individuele maaltijden uit de vergelijking te weren.

## Importbesluit
Nog geen SQL-seed maken zolang de individuele productlinks niet betrouwbaar zijn bevestigd. Bij latere import de unieke combinatie van aanbieder en product-URL respecteren, zodat bestaande producten niet worden gedupliceerd.
