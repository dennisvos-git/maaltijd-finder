# Apetito bulkvoorbereiding — Gehakt & worst

Status: voorbereid, nog niet geïmporteerd in Supabase.

## Bronnen en methode
- Actuele productnamen, artikelcodes, gewichten en prijzen: https://www.apetito-shop.nl/ons-aanbod/alle-maaltijden
- Voedingswaarden per volledige maaltijd: Apetito-catalogus 2026, pagina's 12–13: https://cld.bz/GVPoecp
- De catalogus geeft energie en macro's per volledige maaltijd. Voor de kolommen per 100 g hieronder zijn die waarden omgerekend met: totaalwaarde × 100 / portiegewicht. Afgerond op 2 decimalen. Dit is een rekenkundige normalisatie, geen afzonderlijk door Apetito opgegeven per-100-g etiketwaarde.
- Directe individuele product-URL's zijn nog niet bevestigd. Daarom zijn ze bewust niet ingevuld en zijn er nog geen SQL INSERTs gemaakt.
- Minimum bestelling Apetito: 7 maaltijden. Dit is een bezorg-/bestelvoorwaarde en geen reden om producten uit de vergelijking te weren.

## Gecontroleerde batch

| Artikel | Product | Prijs | Gewicht | kcal/100g* | Eiwit/100g* | Koolhydraten/100g* | Vet/100g* |
|---|---|---:|---:|---:|---:|---:|---:|
| 19010 | Gehaktschijf (kalfsvlees) in mosterd-uiensaus met bloemkool/romanescomix en gestampte aardappelen | €8,50 | 490 g | 87.96 | 3.67 g | 7.35 g | 4.49 g |
| 19017 | Gehaktbal (varkensvlees) in uienjus met rode kool en gestampte aardappelen | €7,87 | 510 g | 103.14 | 3.53 g | 10.20 g | 5.10 g |
| 19035 | Braadworst in jus met spruiten en aardappelen | €8,37 | 500 g | 99.00 | 3.80 g | 7.40 g | 5.40 g |
| 19025 | Gehakt (varkensvlees) in jus met bloemkool en gebakken aardappelpartjes | €8,08 | 450 g | 84.44 | 4.00 g | 8.44 g | 3.33 g |
| 19069 | Rundergehaktbal in jus met spinazie à la crème en aardappelen | €8,33 | 500 g | 111.00 | 3.80 g | 8.20 g | 6.60 g |
| 19031 | Slavink in jus met witlof en gebakken aardappelen | €8,94 | 510 g | 109.02 | 4.51 g | 9.02 g | 5.69 g |
| 19085 | Prei-gehaktschotel met prei, aardappelschijfjes en gehakt (rundvlees) in romige kerriesaus | €8,28 | 500 g | 94.80 | 3.20 g | 10.40 g | 4.20 g |
| 19095 | Rundergehaktbal in jus met rode bieten en gebakken aardappelen | €8,23 | 480 g | 101.25 | 3.54 g | 12.08 g | 3.96 g |
| 19099 | Varkenssaucijs in jus met bonen, spek en ui en gestampte aardappelen | €8,48 | 480 g | 110.21 | 4.79 g | 7.50 g | 6.46 g |

* Berekend uit cataloguswaarden per volledige portie.

## Volgende technische stap
De webshop toont artikelcodes in de cataloguslijst, maar de individuele productlinks moeten uit de producttegels worden uitgelezen of op een andere betrouwbare manier worden bevestigd. Pas daarna kan een idempotente SQL-seed worden aangemaakt die de bestaande producten niet dupliceert.
