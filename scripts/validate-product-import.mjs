#!/usr/bin/env node
/**
 * Validate product-import JSON before it is converted into a database seed.
 * Usage: node scripts/validate-product-import.mjs path/to/products.json [--against existing-products.json]
 * Self-test: node scripts/validate-product-import.mjs --self-test
 */
import { readFile } from "node:fs/promises";

const allowedAvailability = new Set(["available", "unavailable", "unknown"]);
const numericFields = [
  ["price", 0, 10000],
  ["weight_grams", 1, 10000],
  ["kcal_per_100g", 0, 900],
  ["protein_per_100g", 0, 100],
  ["carbohydrates_per_100g", 0, 100],
  ["fat_per_100g", 0, 100],
];

function validate(rows, existingRows = []) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(rows)) return { errors: ["Het JSON-bestand moet een lijst van producten bevatten."], warnings };
  const seen = new Set();
  const existing = new Set();
  if (!Array.isArray(existingRows)) {
    errors.push("Het bestaande catalogusbestand moet een JSON-lijst zijn.");
    return { errors, warnings };
  }
  for (const row of existingRows) {
    if (row && typeof row.vendor_id === "string" && typeof row.product_url === "string") {
      existing.add(`${row.vendor_id.trim()}|${row.product_url.trim()}`.toLowerCase());
    }
  }

  rows.forEach((row, index) => {
    const prefix = `Product ${index + 1}`;
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${prefix}: verwacht een object.`);
      return;
    }
    for (const field of ["vendor_id", "name", "product_url", "source_reference"]) {
      if (typeof row[field] !== "string" || row[field].trim() === "") {
        errors.push(`${prefix}: '${field}' is verplicht.`);
      }
    }
    if (row.vendor_country_code !== "NL") {
      errors.push(`${prefix}: aanbieder moet aantoonbaar landcode NL hebben.`);
    }
    if (row.vendor_verification_status !== "verified") {
      errors.push(`${prefix}: aanbieder moet de status 'verified' hebben.`);
    }
    if (row.vendor_is_active !== true) {
      errors.push(`${prefix}: aanbieder moet actief zijn.`);
    }
    for (const field of ["product_url", "source_reference", "image_url"]) {
      if (typeof row[field] === "string" && row[field].trim()) {
        try {
          const url = new URL(row[field]);
          if ((url.protocol !== "https:" && url.protocol !== "http:") || !url.hostname) throw new Error();
        } catch {
          errors.push(`${prefix}: '${field}' moet een geldige http(s)-link zijn.`);
        }
      }
    }
    if (typeof row.vendor_id === "string" && typeof row.product_url === "string") {
      const key = `${row.vendor_id.trim()}|${row.product_url.trim()}`.toLowerCase();
      if (seen.has(key)) errors.push(`${prefix}: dubbele combinatie van aanbieder en productlink in dit bestand.`);
      if (existing.has(key)) errors.push(`${prefix}: dit product staat met dezelfde aanbieder en link al in de bestaande catalogus.`);
      seen.add(key);
    }
    if (row.last_checked_at !== undefined && row.last_checked_at !== null && row.last_checked_at !== "" && (typeof row.last_checked_at !== "string" || !Number.isFinite(Date.parse(row.last_checked_at)))) errors.push(`${prefix}: last_checked_at moet leeg zijn of een geldige datum bevatten.`);
    if (typeof row.last_checked_at === "string" && Number.isFinite(Date.parse(row.last_checked_at)) && Date.parse(row.last_checked_at) > Date.now() + 5 * 60 * 1000) warnings.push(`${prefix}: last_checked_at ligt in de toekomst; controleer de datum en tijdzone.`);
    for (const [field, min, max] of numericFields) {
      const value = row[field];
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
          errors.push(`${prefix}: '${field}' moet leeg zijn of een getal tussen ${min} en ${max} zijn.`);
        }
      }
    }
    if (row.price === 0) warnings.push(`${prefix}: prijs is € 0; controleer of dit geen ontbrekende of verkeerd overgenomen prijs is.`);
    if (typeof row.weight_grams === "number" && row.weight_grams > 3000) warnings.push(`${prefix}: gewicht is hoger dan 3 kg; controleer de verpakkingseenheid.`);
    const macros = [row.protein_per_100g, row.carbohydrates_per_100g, row.fat_per_100g];
    if (macros.every((value) => typeof value === "number" && Number.isFinite(value))) {
      const macroTotal = macros.reduce((sum, value) => sum + value, 0);
      if (macroTotal > 100.5) {
        errors.push(`${prefix}: eiwit, koolhydraten en vet samen zijn meer dan 100 gram per 100 gram.`);
      }
      if (typeof row.kcal_per_100g === "number") {
        const estimatedKcal = 4 * macros[0] + 4 * macros[1] + 9 * macros[2];
        const tolerance = Math.max(50, row.kcal_per_100g * 0.35);
        if (Math.abs(estimatedKcal - row.kcal_per_100g) > tolerance) {
          warnings.push(`${prefix}: kcal wijkt opvallend af van de globale berekening uit eiwit, koolhydraten en vet; controleer de bron (dit is geen automatische afkeuring).`);
        }
      }
    } else if (macros.some((value) => value !== null && value !== undefined && value !== "")) {
      warnings.push(`${prefix}: voedingsprofiel is gedeeltelijk ingevuld; onbekende waarden mogen leeg blijven.`);
    }
    if (row.availability !== undefined && !allowedAvailability.has(row.availability)) {
      errors.push(`${prefix}: availability moet available, unavailable of unknown zijn.`);
    }
    if (row.dietary_labels !== undefined &&
        (!Array.isArray(row.dietary_labels) || row.dietary_labels.some((v) => typeof v !== "string"))) {
      errors.push(`${prefix}: dietary_labels moet een lijst met tekstwaarden zijn.`);
    }
    if (row.is_active !== undefined && typeof row.is_active !== "boolean") {
      errors.push(`${prefix}: is_active moet true of false zijn.`);
    }
    for (const field of ["image_url", "ingredients", "meal_type", "preparation_method", "category"]) {
      const value = row[field];
      if (value !== undefined && value !== null && typeof value !== "string") {
        errors.push(`${prefix}: '${field}' moet tekst of leeg zijn.`);
      }
    }
  });
  return { errors, warnings };
}

function selfTest() {
  const valid = {
    vendor_id: "00000000-0000-4000-8000-000000000001",
    vendor_country_code: "NL",
    vendor_verification_status: "verified",
    vendor_is_active: true,
    name: "Testmaaltijd (synthetische testdata)",
    product_url: "https://example.com/product",
    source_reference: "https://example.com/bron",
    price: 8.5,
    weight_grams: 400,
    kcal_per_100g: null,
    protein_per_100g: null,
    carbohydrates_per_100g: null,
    fat_per_100g: null,
    availability: "unknown",
  };
  const invalid = { ...valid, vendor_country_code: "BE", price: -2, product_url: "geen-link", vendor_is_active: false };
  const validResult = validate([valid]);
  const invalidResult = validate([invalid]);
  const duplicateResult = validate([valid], [{ vendor_id: valid.vendor_id, product_url: valid.product_url }]);
  const impossibleNutrition = validate([{ ...valid, protein_per_100g: 60, carbohydrates_per_100g: 30, fat_per_100g: 20 }]);
  const suspiciousEnergy = validate([{ ...valid, kcal_per_100g: 50, protein_per_100g: 20, carbohydrates_per_100g: 20, fat_per_100g: 20 }]);
  const duplicateInFile = validate([valid, { ...valid, name: "Dubbele testmaaltijd" }]);
  const invalidAvailability = validate([{ ...valid, availability: "maybe" }]);
  const invalidDietaryLabels = validate([{ ...valid, dietary_labels: ["vegan", 42] }]);
  const partialNutrition = validate([{ ...valid, protein_per_100g: 20 }]);
  const suspiciousPrice = validate([{ ...valid, price: 0 }]);
  const suspiciousWeight = validate([{ ...valid, weight_grams: 4000 }]);
  const invalidImageUrl = validate([{ ...valid, image_url: "javascript:alert(1)" }]);
  const invalidCheckDate = validate([{ ...valid, last_checked_at: "geen-datum" }]);
  const futureCheckDate = validate([{ ...valid, last_checked_at: "2099-01-01T12:00:00Z" }]);
  const nonObjectRow = validate([null]);
  const invalidActiveFlag = validate([{ ...valid, is_active: "false" }]);
  const invalidTextField = validate([{ ...valid, ingredients: ["rijst", "groente"] }]);
  if (validResult.errors.length || invalidResult.errors.length < 4 ||
      !duplicateResult.errors.some((e) => e.includes("bestaande catalogus")) ||
      !duplicateInFile.errors.some((e) => e.includes("dubbele combinatie")) ||
      !impossibleNutrition.errors.some((e) => e.includes("meer dan 100 gram")) ||
      !suspiciousEnergy.warnings.length ||
      !invalidAvailability.errors.some((e) => e.includes("availability")) ||
      !invalidDietaryLabels.errors.some((e) => e.includes("dietary_labels")) ||
      !partialNutrition.warnings.length ||
      !suspiciousPrice.warnings.some((w) => w.includes("prijs is € 0")) ||
      !suspiciousWeight.warnings.some((w) => w.includes("gewicht is hoger")) ||
      !invalidImageUrl.errors.some((e) => e.includes("image_url")) ||
      !invalidCheckDate.errors.some((e) => e.includes("last_checked_at")) ||
      !futureCheckDate.warnings.some((w) => w.includes("in de toekomst")) ||
      !nonObjectRow.errors.some((e) => e.includes("verwacht een object")) ||
      !invalidActiveFlag.errors.some((e) => e.includes("is_active")) ||
      !invalidTextField.errors.some((e) => e.includes("ingredients"))) {
    console.error("Zelftest mislukt.", { validResult, invalidResult, duplicateResult, duplicateInFile, impossibleNutrition, suspiciousEnergy, invalidAvailability, invalidDietaryLabels, partialNutrition, suspiciousPrice, suspiciousWeight, invalidImageUrl, invalidCheckDate, futureCheckDate, nonObjectRow, invalidActiveFlag, invalidTextField });
    process.exitCode = 1;
    return;
  }
  console.log("Zelftest geslaagd: lege en gedeeltelijke voedingswaarden, aanbiederstatus, dubbele producten, ongeldige en toekomstige controledatums, ongeldige invoer en voedingswaardelogica gecontroleerd.");
}

async function main() {
  const args = process.argv.slice(2);
  const file = args[0];
  if (file === "--self-test") return selfTest();
  if (!file || file.startsWith("--")) {
    console.error("Gebruik: node scripts/validate-product-import.mjs <bestand.json> [--against bestaand.json] of --self-test");
    process.exitCode = 2;
    return;
  }
  try {
    const rows = JSON.parse(await readFile(file, "utf8"));
    const againstIndex = args.indexOf("--against");
    if (againstIndex >= 0 && !args[againstIndex + 1]) {
      throw new Error("Geef na --against de naam van het bestaande catalogusbestand op.");
    }
    const existingRows = againstIndex >= 0
      ? JSON.parse(await readFile(args[againstIndex + 1], "utf8"))
      : [];
    const { errors, warnings } = validate(rows, existingRows);
    if (warnings.length) {
      console.warn("Aandachtspunten:");
      for (const warning of warnings) console.warn(`- ${warning}`);
    }
    if (errors.length) {
      console.error("Productimport afgekeurd:");
      for (const error of errors) console.error(`- ${error}`);
      process.exitCode = 1;
    } else {
      console.log(`Controle geslaagd: ${rows.length} product(en) voldoen aan de basiscontroles${againstIndex >= 0 ? " en zijn vergeleken met de bestaande catalogus" : ""}.`);
    }
  } catch (error) {
    console.error(`Bestand kon niet worden gelezen als JSON: ${error.message}`);
    process.exitCode = 2;
  }
}
main();
