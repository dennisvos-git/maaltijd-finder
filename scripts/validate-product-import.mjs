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
  if (!Array.isArray(rows)) return ["Het JSON-bestand moet een lijst van producten bevatten."];
  const seen = new Set();
  const existing = new Set();
  if (!Array.isArray(existingRows)) {
    errors.push("Het bestaande catalogusbestand moet een JSON-lijst zijn.");
    return errors;
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
    for (const field of ["product_url", "source_reference"]) {
      if (typeof row[field] === "string" && row[field].trim()) {
        try {
          const url = new URL(row[field]);
          if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
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
    for (const [field, min, max] of numericFields) {
      const value = row[field];
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
          errors.push(`${prefix}: '${field}' moet leeg zijn of een getal tussen ${min} en ${max} zijn.`);
        }
      }
    }
    if (row.availability !== undefined && !allowedAvailability.has(row.availability)) {
      errors.push(`${prefix}: availability moet available, unavailable of unknown zijn.`);
    }
    if (row.dietary_labels !== undefined &&
        (!Array.isArray(row.dietary_labels) || row.dietary_labels.some((v) => typeof v !== "string"))) {
      errors.push(`${prefix}: dietary_labels moet een lijst met tekstwaarden zijn.`);
    }
  });
  return errors;
}

function selfTest() {
  const valid = {
    vendor_id: "00000000-0000-4000-8000-000000000001",
    vendor_country_code: "NL",
    vendor_verification_status: "verified",
    name: "Testmaaltijd (synthetische testdata)",
    product_url: "https://example.com/product",
    source_reference: "https://example.com/bron",
    price: 8.5,
    weight_grams: 400,
    kcal_per_100g: null,
    protein_per_100g: null,
    availability: "unknown",
  };
  const invalid = { ...valid, vendor_country_code: "BE", price: -2, product_url: "geen-link" };
  const validErrors = validate([valid]);
  const invalidErrors = validate([invalid]);
  const duplicateErrors = validate([valid], [{ vendor_id: valid.vendor_id, product_url: valid.product_url }]);
  if (validErrors.length || invalidErrors.length < 3 || !duplicateErrors.some((e) => e.includes("bestaande catalogus"))) {
    console.error("Zelftest mislukt.", { validErrors, invalidErrors, duplicateErrors });
    process.exitCode = 1;
    return;
  }
  console.log("Zelftest geslaagd: geldige lege waarden worden geaccepteerd en ongeldige invoer wordt afgewezen.");
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
    const existingRows = againstIndex >= 0
      ? JSON.parse(await readFile(args[againstIndex + 1], "utf8"))
      : [];
    const errors = validate(rows, existingRows);
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
