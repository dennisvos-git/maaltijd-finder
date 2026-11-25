# Aanvulling productinformatie Fuel Your Body

Gecontroleerd op 25 november 2026 aan de hand van de openbare individuele productpagina's van Fuel Your Body.

## Marry Me Chicken Pasta
- Ingrediënten: overgenomen uit de sectie INGREDIËNTEN op de productpagina.
- Bereiding: magnetron, pan, oven en steambox worden op de productpagina beschreven.
- Allergenen: de bron noemt apart durum tarwe, gluten, mais en melk (inclusief lactose). Dit is niet in het ingrediëntenveld samengevoegd.
- Bron: https://www.fuelyourbody.nl/marry-me-chicken-pasta

## Rijst - Kip - Broccoli
- Ingrediënten: overgenomen uit de sectie INGREDIËNTEN op de productpagina.
- Bereiding: magnetron, pan, oven en steambox worden op de productpagina beschreven.
- Allergenen: de bron noemt apart gluten, koriander, sulfiet en tarwe. Dit is niet in het ingrediëntenveld samengevoegd.
- Bron: https://www.fuelyourbody.nl/rijst-kip-broccoli

## Databasewijziging
De SQL in `supabase/migrations/20261125_fuel_your_body_ingredients.sql` vult uitsluitend de twee ontbrekende ingrediëntenvelden aan, actualiseert de bereidingswijze en zet de controledatum en bronverwijzing bij. Er worden geen allergenen verzonnen of in een verkeerd veld opgeslagen.

De wijziging is pas zichtbaar op de website nadat deze SQL in Supabase is uitgevoerd. Er is geen databaseverbinding vanuit deze wijziging gebruikt om gegevens rechtstreeks te schrijven.
