"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { fetchAllRows } from "../../lib/fetch-all-rows";

type Product = {
  id: string;
  name: string;
  price: number | null;
  weight_grams: number | null;
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbohydrates_per_100g: number | null;
  fat_per_100g: number | null;
  ingredients: string | null;
  last_checked_at: string | null;
  product_url: string;
  image_url: string | null;
  vendors: { name: string } | { name: string }[] | null;
};
type Vendor = {
  id: string;
  name: string;
  website_url: string | null;
  verification_status: string;
  country_code: string;
  is_active: boolean;
  last_checked_at: string | null;
  scan_enabled: boolean;
};

const fields: [keyof Product, string][] = [
  ["price", "prijs"], ["weight_grams", "gewicht"], ["kcal_per_100g", "energie"],
  ["protein_per_100g", "eiwitten"], ["carbohydrates_per_100g", "koolhydraten"],
  ["fat_per_100g", "vetten"], ["ingredients", "ingrediënten"],
];
const vendorName = (p: Product) => Array.isArray(p.vendors) ? p.vendors[0]?.name ?? "Onbekend" : p.vendors?.name ?? "Onbekend";
const isMissing = (value: unknown) => value == null || (typeof value === "string" && value.trim() === "");
const validDate = (date: string | null) => Boolean(date) && Number.isFinite(new Date(date as string).getTime()) && new Date(date as string).getTime() <= Date.now();
const old = (date: string | null) => validDate(date) && new Date(date as string).getTime() < Date.now() - 30 * 86400000;
const safeExternalUrl = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
};
const euro = (value: number | null) => value == null ? "Onbekend" : new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  const safe = /^[\uFEFF\s]*[=+@-]/.test(text) ? "'" + text : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

type CheckPriority = { rank: number; label: string; reason: string };
const checkPriority = (p: Product): CheckPriority => {
  const reasons: string[] = [];
  if (!safeExternalUrl(p.product_url)) reasons.push("productlink ontbreekt of is ongeldig");
  if (isMissing(p.price)) reasons.push("prijs ontbreekt");
  if (reasons.length) return { rank: 0, label: "Hoog", reason: reasons.join("; ") };
  if (p.price === 0) reasons.push("prijs is € 0; controleer of dit klopt");
  if (!validDate(p.last_checked_at)) reasons.push("controledatum ontbreekt of is ongeldig");
  else if (old(p.last_checked_at)) reasons.push("langer dan 30 dagen niet gecontroleerd");
  if (isMissing(p.image_url)) reasons.push("afbeelding ontbreekt");
  if (fields.some(([key]) => isMissing(p[key]))) reasons.push("productgegevens ontbreken");
  if (reasons.length) return { rank: 1, label: "Midden", reason: reasons.join("; ") };
  return { rank: 2, label: "Laag", reason: "basisgegevens en controledatum aanwezig" };
};

export default function AdminOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const db = supabase;
      if (!db) { setLoading(false); return; }
      const [productResult, vendorResult] = await Promise.all([
        fetchAllRows(
          (from, to) => db.from("products")
            .select("id, name, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, ingredients, last_checked_at, product_url, image_url, vendors!inner(name, verification_status, country_code, is_active)")
            .eq("is_active", true)
            .eq("vendors.verification_status", "verified")
            .eq("vendors.country_code", "NL")
            .eq("vendors.is_active", true)
            .order("name")
            .order("id")
            .range(from, to)
        ),
        fetchAllRows(
          (from, to) => db.from("vendors")
            .select("id, name, website_url, verification_status, country_code, is_active, last_checked_at, scan_enabled")
            .order("name")
            .order("id")
            .range(from, to)
        ),
      ]);
      if (cancelled) return;
      if (productResult.error || vendorResult.error) setError("De gegevens konden niet volledig worden opgehaald.");
      else {
        setProducts((productResult.data ?? []) as unknown as Product[]);
        setVendors((vendorResult.data ?? []) as Vendor[]);
      }
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const incomplete = products.filter(p => fields.some(([key]) => isMissing(p[key])));
  const stale = products.filter(p => old(p.last_checked_at));
  const neverChecked = products.filter(p => !p.last_checked_at);
  const invalidDate = products.filter(p => Boolean(p.last_checked_at) && !validDate(p.last_checked_at));
  const highPriority = products.filter(p => checkPriority(p).rank === 0);
  const filtered = useMemo(() => products.filter(p => {
    const term = query.trim().toLocaleLowerCase("nl-NL");
    const matches = !term || [p.name, vendorName(p)].some(v => v.toLocaleLowerCase("nl-NL").includes(term));
    const missing = fields.some(([key]) => isMissing(p[key]));
    const productVendor = Array.isArray(p.vendors) ? p.vendors[0]?.name : p.vendors?.name;
    const matchesVendor = vendorFilter === "all" || productVendor === vendorFilter;
    return matches && matchesVendor && (view === "all" || (view === "missing" && missing) || (view === "stale" && !!p.last_checked_at && old(p.last_checked_at)) || (view === "never" && !p.last_checked_at) || (view === "invalid" && Boolean(p.last_checked_at) && !validDate(p.last_checked_at)) || (view === "no-image" && isMissing(p.image_url)) || (view === "bad-link" && !safeExternalUrl(p.product_url)) || (view === "priority" && checkPriority(p).rank === 0));
  }).sort((a, b) => {
    if (sort === "priority") {
      const priorityDifference = checkPriority(a).rank - checkPriority(b).rank;
      if (priorityDifference) return priorityDifference;
      return (validDate(a.last_checked_at) ? new Date(a.last_checked_at as string).getTime() : 0) - (validDate(b.last_checked_at) ? new Date(b.last_checked_at as string).getTime() : 0);
    }
    if (sort === "oldest") return (validDate(a.last_checked_at) ? new Date(a.last_checked_at as string).getTime() : 0) - (validDate(b.last_checked_at) ? new Date(b.last_checked_at as string).getTime() : 0);
    if (sort === "price-low") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
    if (sort === "price-high") return (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY);
    return a.name.localeCompare(b.name, "nl-NL");
  }), [products, query, view, vendorFilter, sort]);

  function exportFilteredCsv() {
    const headers = ["Product-ID", "Maaltijd", "Aanbieder", "Prijs (EUR)", "Gewicht (gram)", "Energie (kcal/100g)", "Eiwitten (g/100g)", "Koolhydraten (g/100g)", "Vetten (g/100g)", "Ingrediënten", "Laatste controle", "Productlink", "Afbeelding"];
    const rows = filtered.map(p => [p.id, p.name, vendorName(p), p.price, p.weight_grams, p.kcal_per_100g, p.protein_per_100g, p.carbohydrates_per_100g, p.fat_per_100g, p.ingredients, p.last_checked_at, p.product_url, p.image_url]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `maaltijd-finder-controle-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <header className="topbar"><div className="topbar-inner">
      <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
      <nav className="nav-note site-nav"><Link href="/">Maaltijden</Link><Link href="/aanbieders">Aanbieders</Link><Link href="/beheer/import">Import / inloggen</Link><Link href="/beheer/afbeeldingen">Afbeeldingen</Link></nav>
    </div></header>
    <main>
      <section className="hero">
        <div className="eyebrow">Beheer en kwaliteitscontrole</div>
        <h1>Cataloguscontrole</h1>
        <p className="intro">Overzicht van productgegevens, aanbieders en controledatums. Dit overzicht is alleen-lezen. Voor beveiligde imports is een aparte beheerlogin beschikbaar.</p>
      </section>
      <section className="admin-stats">
        <article className="detail-panel"><span>Actieve maaltijden</span><strong>{loading ? "…" : products.length}</strong></article>
        <article className="detail-panel"><span>Onvolledige productinformatie</span><strong>{loading ? "…" : incomplete.length}</strong></article>
        <article className="detail-panel"><span>Ouder dan 30 dagen</span><strong>{loading ? "…" : stale.length}</strong></article>
        <article className="detail-panel"><span>Nooit gecontroleerd</span><strong>{loading ? "…" : neverChecked.length}</strong></article>
        <article className="detail-panel"><span>Ongeldige controledatum</span><strong>{loading ? "…" : invalidDate.length}</strong></article>
        <article className="detail-panel"><span>Aanbieders geregistreerd</span><strong>{loading ? "…" : vendors.length}</strong></article>
        <article className="detail-panel"><span>Maaltijden zonder foto</span><strong>{loading ? "…" : products.filter(p => !p.image_url || !p.image_url.trim()).length}</strong></article>
        <article className="detail-panel"><span>Ongeldige of ontbrekende productlink</span><strong>{loading ? "…" : products.filter(p => !safeExternalUrl(p.product_url)).length}</strong></article>
        <article className="detail-panel"><span>Hoge controleprioriteit</span><strong>{loading ? "…" : highPriority.length}</strong></article>
      </section>
      <section className="catalog">
        <div className="catalog-heading"><div><div className="eyebrow">Productkwaliteit</div><h2>Aandacht nodig</h2></div></div>
        <div className="admin-controls">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek maaltijd of aanbieder…" aria-label="Zoek maaltijd of aanbieder" />
          <select value={view} onChange={e => setView(e.target.value)} aria-label="Filter productgegevens">
            <option value="all">Alle maaltijden</option><option value="priority">Hoge controleprioriteit</option><option value="missing">Ontbrekende gegevens</option><option value="stale">Ouder dan 30 dagen</option><option value="never">Nooit gecontroleerd</option><option value="invalid">Ongeldige controledatum</option><option value="no-image">Geen afbeelding</option><option value="bad-link">Ongeldige of ontbrekende productlink</option>
          </select>
          <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} aria-label="Filter op aanbieder">
            <option value="all">Alle aanbieders</option>
            {[...new Set(products.map(vendorName))].sort((a, b) => a.localeCompare(b, "nl-NL")).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sorteer producten">
            <option value="priority">Sorteer: hoogste controleprioriteit</option><option value="name">Sorteer: naam</option><option value="oldest">Sorteer: oudste controle eerst</option><option value="price-low">Sorteer: laagste prijs</option><option value="price-high">Sorteer: hoogste prijs</option>
          </select>
        </div>
        <div className="catalog-heading"><p className="detail-muted" aria-live="polite">{loading ? "Resultaten laden…" : `${filtered.length} producten in deze selectie`}</p><button className="admin-secondary" type="button" onClick={exportFilteredCsv} disabled={loading || filtered.length === 0}>Exporteer selectie als CSV</button></div>
        {!isSupabaseConfigured && <div className="empty-state"><h2>Database niet ingesteld</h2></div>}
        {loading && <p className="loading-message">Overzicht ophalen…</p>}
        {error && <div className="empty-state"><p>{error}</p></div>}
        {!loading && !error && filtered.length === 0 && <div className="empty-state"><p>Geen producten gevonden voor deze selectie.</p></div>}
        {!loading && !error && filtered.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Prioriteit</th><th>Maaltijd</th><th>Aanbieder</th><th>Prijs</th><th>Ontbreekt</th><th>Laatste controle</th><th>Bron</th></tr></thead>
          <tbody>{filtered.map(p => {
            const missing = fields.filter(([key]) => isMissing(p[key])).map(([, label]) => label);
            const priority = checkPriority(p);
            return <tr key={p.id}>
              <td><span className="stale-label" title={priority.reason}>{priority.label}</span><small className="detail-muted">{priority.reason}</small></td>
              <td><Link href={`/maaltijd/${p.id}`}>{p.name}</Link></td>
              <td>{vendorName(p)}</td><td>{euro(p.price)}</td>
              <td>{missing.length ? missing.join(", ") : "Compleet"}</td>
              <td>{!p.last_checked_at ? "Nooit gecontroleerd" : validDate(p.last_checked_at) ? new Date(p.last_checked_at).toLocaleDateString("nl-NL") : "Ongeldige datum"}{old(p.last_checked_at) && <span className="stale-label">Ouder dan 30 dagen</span>}{!p.last_checked_at && <span className="stale-label">Controle ontbreekt</span>}{Boolean(p.last_checked_at) && !validDate(p.last_checked_at) && <span className="stale-label">Datum nakijken</span>}</td>
              <td>{safeExternalUrl(p.product_url) ? <a href={safeExternalUrl(p.product_url)!} target="_blank" rel="noopener noreferrer">Productpagina ↗</a> : "Ongeldige of ontbrekende link"}</td>
            </tr>;
          })}</tbody>
        </table></div>}
      </section>
      <section className="catalog">
        <div className="catalog-heading"><div><div className="eyebrow">Aanbieders</div><h2>Aanbieders en scanconfiguratie</h2><p className="detail-muted">De scanstatus is alleen een configuratieveld. Er draait momenteel geen automatische dagelijkse scan.</p></div></div>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Aanbieder</th><th>Land</th><th>Verificatie</th><th>Actief</th><th>Scanconfiguratie</th><th>Website</th></tr></thead>
          <tbody>{vendors.map(v => <tr key={v.id}><td>{v.name}</td><td>{v.country_code}</td><td>{v.verification_status}</td><td>{v.is_active ? "Ja" : "Nee"}</td><td>{v.scan_enabled ? "Aan (workflow niet actief)" : "Uit"}</td><td>{safeExternalUrl(v.website_url) ? <a href={safeExternalUrl(v.website_url)!} target="_blank" rel="noopener noreferrer">Website ↗</a> : "—"}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="detail-panel admin-security-note">
        <h2>Beveiligd beheer</h2><p><Link href="/beheer/import">Open beheerlogin en productimport →</Link></p><p><Link href="/beheer/afbeeldingen">Ontbrekende maaltijdafbeeldingen aanvullen →</Link></p>
        <p>Dit overzicht is alleen-lezen. Via de beheerlogin kun je als geregistreerde beheerder nieuwe producten importeren. Bestaande producten worden niet overschreven en verwijderen is uitgeschakeld. De publieke website behoudt alleen-lezen rechten.</p>
      </section>
    </main>
    <footer>Maaltijd Finder · Beheercontrole · Alleen-lezen</footer>
  </>;
}
