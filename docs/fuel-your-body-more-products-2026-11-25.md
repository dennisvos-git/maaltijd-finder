# Fuel Your Body – productcontrole

Gecontroleerd op 25 november 2026 aan de hand van de officiële individuele productpagina's.

| Maaltijd | Prijs | Gewicht | kcal/100 g | Eiwit/100 g | Koolhydraten/100 g | Vet/100 g |
|---|---:|---:|---:|---:|---:|---:|
| Risotto Spinazie - Chicken | € 8,45 | 455 g | 119 | 10,1 g | 10,8 g | 4,0 g |
| Tagliatelle - Beef Stroganoff | € 9,49 | 430 g | 110 | 8,7 g | 12,0 g | 2,8 g |

## Risotto Spinazie - Chicken
- Productpagina: https://www.fuelyourbody.nl/risotto-spinazie
- Ingrediënten overgenomen van de sectie INGREDIËNTEN.
- Allergenen apart genoemd door de aanbieder: melk (incl. lactose) en selderij.
- Bereiding: magnetron, pan, oven en steambox.
- Voedingswaarden per 100 g overgenomen uit de voedingstabel op de productpagina.

## Tagliatelle - Beef Stroganoff
- Productpagina: https://www.fuelyourbody.nl/tagliatelle-beef-stroganoff
- Ingrediëntenveld bewust leeg gelaten: de openbare tekst van de ingrediëntenlijst op de productpagina is zichtbaar onvolledig en eindigt zonder afsluiting. Geen ingrediëntenlijst reconstrueren of aanvullen.
- Allergenen apart genoemd door de aanbieder: durumtarwe, gluten, melk (incl. lactose) en mosterd.
- Bereiding: magnetron, pan, oven en steambox.
- Voedingswaarden per 100 g overgenomen uit de voedingstabel op de productpagina.

## Import
De bijbehorende SQL is `supabase/seeds/20261125_fuel_your_body_more_products.sql`. Deze voegt de twee losse maaltijden toe of werkt dezelfde product-URL bij. Er worden geen bulkvarianten toegevoegd. De allergenen worden niet in het ingrediëntenveld vermengd; er is in het huidige productschema geen afzonderlijk allergenenveld. De ingrediënten van de Stroganoff blijven daarom leeg totdat een volledige officiële lijst beschikbaar is.
