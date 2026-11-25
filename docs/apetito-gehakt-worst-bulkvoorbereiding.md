# Apetito bulkvoorbereiding — Gehakt & worst

Status: productselectie voorbereid; nog niet geïmporteerd in Supabase.

## Wat is daadwerkelijk gecontroleerd
De openbare Apetito-overzichtspagina toont de onderstaande artikelcodes, productnamen, gewichten en actuele prijzen. De pagina meldt 36 van 234 resultaten.

Bron: https://www.apetito-shop.nl/ons-aanbod/alle-maaltijden

| Artikel | Productnaam zoals getoond in het overzicht | Prijs | Gewicht |
|---|---|---:|---:|
| 19010 | Gehaktschijf (kalfsvlees) in saus | €8,50 | 490 g |
| 19017 | Gehaktbal (varkensvlees) in uienjus | €7,87 | 510 g |
| 19035 | Braadworst in jus | €8,37 | 500 g |
| 19025 | Gehakt (varkensvlees) in jus | €8,08 | 450 g |
| 19095 | Rundergehaktbal in jus | €8,23 | 480 g |
| 19031 | Slavink in jus | €8,94 | 510 g |
| 19069 | Rundergehaktbal in jus | €8,33 | 500 g |
| 19099 | Varkenssaucijs in jus | €8,48 | 480 g |
| 19085 | Prei-gehaktschotel | €8,28 | 500 g |

## Nog niet geverifieerd
- Voedingswaarden per artikel. De eerder opgenomen voedingswaardecijfers zijn verwijderd omdat ze niet voldoende herleidbaar waren tot een gecontroleerde bron. Laat deze velden leeg totdat de officiële artikelinformatie per code is opgehaald.
- Individuele product-URL's. De overzichtspagina toont artikelcodes, namen, gewichten en prijzen, maar de exacte productlinks zijn in deze controle niet vastgelegd. Niet zelf URL's construeren of raden.
- Beschikbaarheid per postcode / bezorggebied.

## Belangrijke bestelvoorwaarde
Apetito geeft aan dat minimaal 7 maaltijden nodig zijn om een bestelling af te ronden (of 1 dinerdoos). Dit is een bestelvoorwaarde en geen reden om individuele maaltijden uit de vergelijking te weren.

Bron: https://www.apetito-shop.nl/informatie-en-contact/veelgestelde-vragen

## Importbesluit
Nog geen SQL-seed maken. Eerst moeten individuele productlinks en de gegevens voor voedingswaarden betrouwbaar worden vastgelegd. Bij een latere import de bestaande product-URL-unique-index respecteren en bestaande producten niet dupliceren.
