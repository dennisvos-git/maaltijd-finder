"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

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
const old = (date: string | null) => !date || new Date(date).getTime() < Date.now() - 30 * 86400000;
const euro = (value: number | null) => value == null ? "Onbekend" : new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);

export default function AdminOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const [productResult, vendorResult] = await Promise.all([
        supabase.from("products")
          .select("id, name, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, ingredients, last_checked_at, product_url, vendors!inner(name, verification_status, country_code, is_active)")
          .eq("is_active", true)
          .eq("vendors.verification_status", "verified")
          .eq("vendors.country_code", "NL")
          .eq("vendors.is_active", true)
          .order("name"),
        supabase.from("vendors")
          .select("id, name, website_url, verification_status, country_code, is_active, last_checked_at, scan_enabled")
          .order("name"),
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

  const incomplete = products.filter(p => fields.some(([key]) => p[key] == null || p[key] === ""));
  const stale = products.filter(p => old(p.last_checked_at));
  const filtered = useMemo(() => products.filter(p => {
    const term = query.trim().toLocaleLowerCase("nl-NL");
    const matches = !term || [p.name, vendorName(p)].some(v => v.toLocaleLowerCase("nl-NL").includes(term));
    const missing = fields.some(([key]) => p[key] == null || p[key] === "");
    return matches && (view === "all" || (view === "missing" && missing) || (view === "stale" && old(p.last_checked_at)));
  }), [products, query, view]);

  return <>
    <header className="topbar"><div className="topbar-inner">
      <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
      <nav className="nav-note site-nav"><Link href="/">Maaltijden</Link><Link href="/aanbieders">Aanbieders</Link></nav>
    </div></header>
    <main>
      <section className="hero">
        <div className="eyebrow">Beheer en kwaliteitscontrole</div>
        <h1>Cataloguscontrole</h1>
        <p className="intro">Overzicht van productgegevens, aanbieders en controledatums. Dit scherm is bewust alleen-lezen; wijzigingen en imports zijn nog niet ingeschakeld.</p>
      </section>
      <section className="admin-stats">
        <article className="detail-panel"><span>Actieve maaltijden</span><strong>{loading ? "…" : products.length}</strong></article>
        <article className="detail-panel"><span>Onvolledige productinformatie</span><strong>{loading ? "…" : incomplete.length}</strong></article>
        <article className="detail-panel"><span>Ouder dan 30 dagen / onbekend</span><strong>{loading ? "…" : stale.length}</strong></article>
        <article className="detail-panel"><span>Aanbieders geregistreerd</span><strong>{loading ? "…" : vendors.length}</strong></article>
      </section>
      <section className="catalog">
        <div className="catalog-heading"><div><div className="eyebrow">Productkwaliteit</div><h2>Aandacht nodig</h2></div></div>
        <div className="admin-controls">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek maaltijd of aanbieder…" aria-label="Zoek maaltijd of aanbieder" />
          <select value={view} onChange={e => setView(e.target.value)} aria-label="Filter productgegevens">
            <option value="all">Alle maaltijden</option><option value="missing">Ontbrekende gegevens</option><option value="stale">Oude of onbekende controledatum</option>
          </select>
        </div>
        {!isSupabaseConfigured && <div className="empty-state"><h2>Database niet ingesteld</h2></div>}
        {loading && <p className="loading-message">Overzicht ophalen…</p>}
        {error && <div className="empty-state"><p>{error}</p></div>}
        {!loading && !error && filtered.length === 0 && <div className="empty-state"><p>Geen producten gevonden voor deze selectie.</p></div>}
        {!loading && !error && filtered.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Maaltijd</th><th>Aanbieder</th><th>Prijs</th><th>Ontbreekt</th><th>Laatste controle</th><th>Bron</th></tr></thead>
          <tbody>{filtered.map(p => {
            const missing = fields.filter(([key]) => p[key] == null || p[key] === "").map(([, label]) => label);
            return <tr key={p.id}>
              <td><Link href={`/maaltijd/${p.id}`}>{p.name}</Link></td>
              <td>{vendorName(p)}</td><td>{euro(p.price)}</td>
              <td>{missing.length ? missing.join(", ") : "Compleet"}</td>
              <td>{p.last_checked_at ? new Date(p.last_checked_at).toLocaleDateString("nl-NL") : "Nooit gecontroleerd"}{old(p.last_checked_at) && <span className="stale-label">Oud / onbekend</span>}</td>
              <td><a href={p.product_url} target="_blank" rel="noreferrer">Productpagina ↗</a></td>
            </tr>;
          })}</tbody>
        </table></div>}
      </section>
      <section className="catalog">
        <div className="catalog-heading"><div><div className="eyebrow">Aanbieders</div><h2>Registratie en scanstatus</h2></div></div>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Aanbieder</th><th>Land</th><th>Verificatie</th><th>Actief</th><th>Automatische scan</th><th>Website</th></tr></thead>
          <tbody>{vendors.map(v => <tr key={v.id}><td>{v.name}</td><td>{v.country_code}</td><td>{v.verification_status}</td><td>{v.is_active ? "Ja" : "Nee"}</td><td>{v.scan_enabled ? "Ingeschakeld" : "Uitgeschakeld"}</td><td>{v.website_url ? <a href={v.website_url} target="_blank" rel="noreferrer">Website ↗</a> : "—"}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="detail-panel admin-security-note">
        <h2>Veilige vervolgstap</h2>
        <p>Producten en aanbieders kunnen hier nog niet worden aangepast. Eerst moet een afgeschermde beheerlogin met een expliciete beheerdersrol worden ingericht. De publieke website behoudt alleen-lezen rechten.</p>
      </section>
    </main>
    <footer>Maaltijd Finder · Beheercontrole · Alleen-lezen</footer>
  </>;
}
