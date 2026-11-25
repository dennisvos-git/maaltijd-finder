"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

type ImportRow = Record<string, unknown> & {
  vendor_id: string; name: string; product_url: string; source_reference: string;
  vendor_country_code: string; vendor_verification_status: string; vendor_is_active: boolean;
};
type Vendor = { id: string; name: string; country_code: string; verification_status: string; is_active: boolean };

const numericRules: Record<string, [number, number]> = {
  price: [0, 10000], weight_grams: [1, 10000], kcal_per_100g: [0, 900],
  protein_per_100g: [0, 100], carbohydrates_per_100g: [0, 100], fat_per_100g: [0, 100],
};
const productColumns = [
  "vendor_id", "name", "product_url", "image_url", "price", "weight_grams",
  "kcal_per_100g", "protein_per_100g", "carbohydrates_per_100g", "fat_per_100g",
  "ingredients", "meal_type", "preparation_method", "category", "dietary_labels",
  "availability", "last_checked_at", "source_reference", "is_active",
];

function validateRows(rows: unknown[], vendors: Vendor[]) {
  const errors: string[] = [];
  const seen = new Set<string>();
  rows.forEach((value, index) => {
    const n = index + 1;
    if (!value || typeof value !== "object" || Array.isArray(value)) { errors.push(`Regel ${n}: verwacht een object.`); return; }
    const row = value as Record<string, unknown>;
    for (const key of ["vendor_id", "name", "product_url", "source_reference"]) {
      if (typeof row[key] !== "string" || !String(row[key]).trim()) errors.push(`Regel ${n}: ${key} ontbreekt.`);
    }
    const vendor = vendors.find(v => v.id === row.vendor_id);
    if (!vendor || vendor.country_code !== "NL" || vendor.verification_status !== "verified" || !vendor.is_active) {
      errors.push(`Regel ${n}: aanbieder bestaat niet of is niet actief, geverifieerd en Nederlands.`);
    }
    for (const key of ["product_url", "source_reference"]) {
      try { const u = new URL(String(row[key])); if (!["http:", "https:"].includes(u.protocol)) throw new Error(); }
      catch { errors.push(`Regel ${n}: ${key} is geen geldige http(s)-link.`); }
    }
    for (const [key, [min, max]] of Object.entries(numericRules)) {
      const v = row[key];
      if (v !== undefined && v !== null && v !== "" && (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max)) {
        errors.push(`Regel ${n}: ${key} moet leeg zijn of tussen ${min} en ${max} liggen.`);
      }
    }
    if (row.availability !== undefined && !["available", "unavailable", "unknown"].includes(String(row.availability))) errors.push(`Regel ${n}: availability is ongeldig.`);
    if (row.dietary_labels !== undefined && (!Array.isArray(row.dietary_labels) || row.dietary_labels.some(v => typeof v !== "string"))) errors.push(`Regel ${n}: dietary_labels moet een lijst met tekst zijn.`);
    const key = `${String(row.vendor_id)}|${String(row.product_url)}`.toLowerCase();
    if (seen.has(key)) errors.push(`Regel ${n}: dubbele aanbieder/productlink in dit bestand.`);
    seen.add(key);
  });
  return errors;
}

export default function AdminImportPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [json, setJson] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    const check = async (userId: string | null) => {
      if (!userId) { if (active) { setSessionUser(null); setIsAdmin(false); } return; }
      const { data } = await client.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
      if (!active) return;
      setSessionUser(userId);
      setIsAdmin(Boolean(data));
      if (data) {
        const { data: vendorRows } = await client.from("vendors").select("id,name,country_code,verification_status,is_active").eq("is_active", true).eq("country_code", "NL").eq("verification_status", "verified").order("name");
        if (active) setVendors((vendorRows ?? []) as Vendor[]);
      }
    };
    void client.auth.getSession().then(({ data }) => check(data.session?.user.id ?? null));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { void check(session?.user.id ?? null); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setErrors([]);
    if (!supabase) { setMessage("Supabase is niet ingesteld."); setBusy(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage("Inloggen is niet gelukt. Controleer het e-mailadres en wachtwoord.");
    else setMessage("Inloggen gelukt. Beheerrechten worden gecontroleerd.");
  }

  async function requestPasswordReset() {
    setBusy(true); setMessage(""); setErrors([]);
    if (!supabase) { setMessage("Supabase is niet ingesteld."); setBusy(false); return; }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/beheer/wachtwoord-reset`,
    });
    setBusy(false);
    if (error) setMessage("De resetmail kon niet worden verstuurd. Controleer de Supabase URL-instellingen.");
    else setMessage("Als dit e-mailadres bekend is, ontvang je een e-mail met een link om je wachtwoord opnieuw in te stellen.");
  }

  async function logout() { await supabase?.auth.signOut(); setMessage("Je bent uitgelogd."); }

  async function importProducts() {
    setBusy(true); setErrors([]); setMessage("");
    if (!supabase) { setBusy(false); return; }
    try {
      const parsed: unknown = JSON.parse(json);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Plak een JSON-lijst met minimaal één product.");
      const validation = validateRows(parsed, vendors);
      if (validation.length) { setErrors(validation); setBusy(false); return; }
      const rows = parsed as ImportRow[];
      const keys = rows.map(r => [r.vendor_id, r.product_url] as const);
      const vendorIds = [...new Set(rows.map(r => r.vendor_id))];
      const { data: existing, error: existingError } = await supabase.from("products").select("vendor_id,product_url").in("vendor_id", vendorIds);
      if (existingError) throw new Error("Bestaande producten konden niet worden gecontroleerd.");
      const existingSet = new Set((existing ?? []).map(r => `${r.vendor_id}|${r.product_url}`.toLowerCase()));
      const duplicates = keys.flatMap(([vendorId, url], i) => existingSet.has(`${vendorId}|${url}`.toLowerCase()) ? [`Regel ${i + 1}: deze productlink staat al in de catalogus; bestaande gegevens worden niet overschreven.`] : []);
      if (duplicates.length) { setErrors(duplicates); setBusy(false); return; }
      const payload = rows.map(row => Object.fromEntries(productColumns.filter(k => row[k] !== undefined).map(k => [k, row[k]])));
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw new Error(error.message.includes("row-level security") ? "Database heeft de schrijfactie geblokkeerd. Controleer de beheerrol en SQL-migratie." : "Opslaan is niet gelukt. Controleer de importgegevens en database-instellingen.");
      setMessage(`${payload.length} product(en) succesvol geïmporteerd.`);
      setJson("");
    } catch (e) { setMessage(e instanceof Error ? e.message : "De JSON kon niet worden verwerkt."); }
    setBusy(false);
  }

  return <>
    <header className="topbar"><div className="topbar-inner"><Link className="brand" href="/">Maaltijd <span>Finder</span></Link><nav className="nav-note site-nav"><Link href="/beheer">Controle</Link><Link href="/">Website</Link></nav></div></header>
    <main>
      <section className="hero"><div className="eyebrow">Beveiligd beheer</div><h1>Beheerlogin en import</h1><p className="intro">Alleen accounts die expliciet als beheerder zijn geregistreerd, kunnen producten importeren.</p></section>
      {!sessionUser && <form className="admin-login detail-panel" onSubmit={event => { event.preventDefault(); if (resetMode) void requestPasswordReset(); else void login(event); }}><h2>{resetMode ? "Wachtwoord herstellen" : "Inloggen"}</h2><label>E-mailadres<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>{!resetMode && <label>Wachtwoord<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>}<button className="detail-cta" disabled={busy}>{busy ? "Bezig…" : resetMode ? "Stuur herstellink" : "Inloggen"}</button><button type="button" className="admin-secondary" onClick={() => { setResetMode(!resetMode); setMessage(""); }}>{resetMode ? "Terug naar inloggen" : "Wachtwoord vergeten?"}</button></form>}
      {sessionUser && !isAdmin && <section className="detail-panel"><h2>Geen beheerrechten</h2><p>Je bent ingelogd, maar dit account staat niet in de beheerderslijst. Vraag de eigenaar om de juiste Auth-gebruikers-ID via Supabase SQL Editor toe te voegen.</p><button className="detail-cta" onClick={logout}>Uitloggen</button></section>}
      {sessionUser && isAdmin && <section className="detail-panel admin-import-panel"><div className="admin-import-heading"><div><h2>Productimport (JSON)</h2><p>Controleer eerst de aanbieder, bronlinks, verplichte velden, numerieke waarden en dubbele producten. Bestaande producten worden niet overschreven.</p></div><button type="button" className="admin-secondary" onClick={logout}>Uitloggen</button></div><label>Plak een JSON-lijst<textarea rows={16} spellCheck={false} value={json} onChange={e => setJson(e.target.value)} placeholder={'[\n  {\n    "vendor_id": "UUID",\n    "vendor_country_code": "NL",\n    "vendor_verification_status": "verified",\n    "vendor_is_active": true,\n    "name": "Productnaam",\n    "product_url": "https://voorbeeld.nl/product",\n    "source_reference": "https://voorbeeld.nl/product",\n    "price": null,\n    "weight_grams": null,\n    "kcal_per_100g": null,\n    "protein_per_100g": null,\n    "carbohydrates_per_100g": null,\n    "fat_per_100g": null,\n    "availability": "unknown"\n  }\n]'} /></label><button className="detail-cta" disabled={busy || !json.trim()} onClick={importProducts}>{busy ? "Controleren en opslaan…" : "Controleren en importeren"}</button><p className="detail-muted">Aanbieders worden niet automatisch aangemaakt of goedgekeurd. Onbekende waarden mogen null zijn.</p></section>}
      {message && <p className="admin-feedback">{message}</p>}
      {errors.length > 0 && <section className="detail-panel admin-errors"><h2>Import afgekeurd</h2><ul>{errors.map((e,i)=><li key={i}>{e}</li>)}</ul></section>}
    </main><footer>Maaltijd Finder · Beveiligd beheer</footer>
  </>;
}
