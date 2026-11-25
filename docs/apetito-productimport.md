# Apetito productimport

## Huidige status
De openbare Apetito-artikelinfo-pagina vraagt om een artikelnummer. De volledige artikelinformatie (ingrediënten, voedingswaarden en allergenen) is dus niet rechtstreeks als complete openbare productfeed bevestigd.

Apetito geeft aan dat bestellen via de webshop een account vereist. Gebruik geen account van een klant, probeer geen afgeschermde endpoints te omzeilen en automatiseer geen login- of anti-robotcontroles.

## Voorgestelde route
1. Vraag Apetito schriftelijk of Maaltijd Finder hun productfeed, catalogusbestand of een toegestane API mag gebruiken voor een onafhankelijke vergelijkingssite.
2. Vraag expliciet welke velden en afbeeldingen gebruikt mogen worden en hoe vaak prijzen/voorraad bijgewerkt mogen worden.
3. Totdat toestemming en een bruikbare bron bestaan, verzamel uitsluitend handmatig controleerbare openbare gegevens.
4. Importeer alleen echte afzonderlijke producten. Geen vanafprijzen, proefpakketprijzen of kortingsprijzen als reguliere productprijs gebruiken.
5. Laat ontbrekende waarden leeg. Registreer per product de bron-URL en controledatum.

## CSV-kolommen
Gebruik deze kolomnamen voor een latere beheerde import:

`vendor_name,product_name,product_url,image_url,price,weight_grams,kcal_per_100g,protein_per_100g,carbohydrates_per_100g,fat_per_100g,ingredients,meal_type,preparation_method,category,dietary_labels,availability,last_checked_at,source_reference`

- `price`: reguliere prijs in euro, als getal met punt als decimaalteken.
- `weight_grams`: gewicht in gram als getal.
- Voedingswaarden: per 100 gram, alleen invullen als de bron dat expliciet vermeldt.
- `dietary_labels`: labels gescheiden door een puntkomma.
- `availability`: `available`, `unavailable` of `unknown`.
- `last_checked_at`: datum/tijd in ISO 8601.
- `source_reference`: openbare bronpagina waar de gegevens zijn gecontroleerd.

## Bronnen
- Productinformatie: https://www.apetito-shop.nl/artikelinfo
- Officiële webshop-FAQ: https://www.apetito-shop.nl/informatie-en-contact/veelgestelde-vragen
- Officiële catalogus: https://www.apetito-shop.nl/
