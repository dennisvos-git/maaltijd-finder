# Productimport voorbereiden en controleren

Deze controle voorkomt een deel van de invoerfouten voordat productgegevens naar SQL worden omgezet. De controle publiceert of importeert zelf niets.

## Importbestand

Maak een JSON-bestand met een lijst van producten. Gebruik per product deze velden:

```json
[
  {
    "vendor_id": "UUID-VAN-DE-AANBIEDER",
    "vendor_country_code": "NL",
    "vendor_verification_status": "verified",
    "name": "Exacte productnaam",
    "product_url": "https://voorbeeld.nl/pad-naar-dit-product",
    "source_reference": "https://voorbeeld.nl/bron-met-productgegevens",
    "price": 8.5,
    "weight_grams": 400,
    "kcal_per_100g": null,
    "protein_per_100g": null,
    "carbohydrates_per_100g": null,
    "fat_per_100g": null,
    "ingredients": null,
    "meal_type": null,
    "preparation_method": null,
    "category": null,
    "dietary_labels": [],
    "availability": "unknown"
  }
]
```

Vervang de voorbeeldwaarden door gecontroleerde gegevens. Bovenstaande productnaam, UUID en URL zijn placeholders; dit is geen echt product.

## Controleregels

- Aanbieder moet landcode `NL` en verificatiestatus `verified` hebben.
- Productlink en bronverwijzing zijn verplichte, geldige http(s)-links.
- Productnaam en aanbieder-ID zijn verplicht.
- Prijs, gewicht en voedingswaarden moeten binnen redelijke grenzen vallen als ze zijn ingevuld.
- Voedingswaarden zijn per 100 gram. Reken waarden per portie alleen om als portiegewicht én bronwaarden bekend zijn.
- Onbekende waarden blijven `null`; vul ze niet op basis van aannames in.
- Beschikbaarheid is `available`, `unavailable` of `unknown`.
- Dubbele productlinks voor dezelfde aanbieder in één bestand worden gemeld.
- Deze controle vervangt geen controle op bestaande records in Supabase en bewijst niet dat de bron actueel is.

## Uitvoeren

Voer lokaal vanuit de projectmap uit:

```bash
node scripts/validate-product-import.mjs --self-test
node scripts/validate-product-import.mjs producten.json
node scripts/validate-product-import.mjs producten.json --against bestaande-producten.json
```

Voor controle tegen bestaande producten kun je in Supabase SQL Editor dit uitvoeren en de JSON-uitvoer opslaan als `bestaande-producten.json`:

```sql
select coalesce(json_agg(json_build_object(
  'vendor_id', vendor_id,
  'product_url', product_url
)), '[]'::json) as products
from public.products;
```

Sla de waarde van `products` op als een JSON-lijst (dus alleen de array) en gebruik daarna de opdracht met `--against`. Zo worden ook combinaties gecontroleerd die al in Supabase staan. De database heeft daarnaast zelf al een unieke index op aanbieder plus productlink.

De GitHub-controle voert de zelftest automatisch uit bij wijzigingen. Een geslaagde controle betekent alleen dat de gegevens de technische basiscontroles doorstaan; de bron en productdetails moeten nog steeds inhoudelijk worden nagekeken.
