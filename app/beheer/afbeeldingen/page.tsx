"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: string;
  name: string;
  product_url: string;
  image_url: string | null;
  vendors: { name: string } | { name: string }[] | null;
};

const vendorName = (product: Product) =>
  Array.isArray(product.vendors) ? product.vendors[0]?.name ?? "Onbekende aanbieder" : product.vendors?.name ?? "Onbekende aanbieder";

const safeImageUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && Boolean(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
};

export default function AdminImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        if (active) { setError("De databaseverbinding is niet ingesteld."); setLoading(false); }
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) {
        if (active) { setError("Log eerst in via Beheerlogin / import."); setLoading(false); }
        return;
      }
      const { data: membership, error: membershipError } = await supabase
        .from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
      if (membershipError || !membership) {
        if (active) { setError("Dit account heeft geen beheerrechten."); setLoading(false); }
        return;
      }
      const { data, error: queryError } = await supabase
        .from("products")
        .select("id,name,product_url,image_url,vendors!inner(name,verification_status,country_code,is_active)")
        .eq("is_active", true)
        .eq("vendors.verification_status", "verified")
        .eq("vendors.country_code", "NL")
        .eq("vendors.is_active", true)
        .order("name");
      if (!active) return;
      if (queryError) setError("De maaltijden konden niet worden opgehaald.");
      else {
        const rows = (data ?? []) as unknown as Product[];
        setProducts(rows.filter(p => !p.image_url || !p.image_url.trim()));
        setAuthorized(true);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("nl-NL");
    return products.filter(p => !term || p.name.toLocaleLowerCase("nl-NL").includes(term) || vendorName(p).toLocaleLowerCase("nl-NL").includes(term));
  }, [products, query]);

  async function saveImage(product: Product) {
    if (!supabase) return;
    const url = safeImageUrl(drafts[product.id] ?? "");
    if (!url) { setError("Vul een volledige HTTPS-afbeeldingslink in."); setMessage(""); return; }
    setBusyId(product.id); setError(""); setMessage("");
    const { error: updateError } = await supabase.from("products").update({ image_url: url }).eq("id", product.id).select("id").single();
    if (updateError) {
      setError("Opslaan is niet gelukt. Controleer je beheerrechten en de afbeeldingslink.");
    } else {
      setProducts(current => current.filter(p => p.id !== product.id));
      setDrafts(current => { const next = { ...current }; delete next[product.id]; return next; });
      setMessage(`Afbeeldingslink opgeslagen voor “${product.name}”.`);
    }
    setBusyId(null);
  }

  return <>
    <header className="topbar"><div className="topbar-inner">
      <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
      <nav className="nav-note site-nav"><Link href="/beheer">Controle</Link><Link href="/beheer/import">Import / inloggen</Link><Link href="/">Website</Link></nav>
    </div></header>
    <main>
      <section className="hero">
        <div className="eyebrow">Beveiligd beheer</div>
        <h1>Maaltijdfoto’s aanvullen</h1>
        <p className="intro">Voeg een HTTPS-link naar de officiële afbeelding van het exacte gerecht toe. Alleen bestaande, actieve maaltijden van geverifieerde Nederlandse aanbieders worden getoond.</p>
      </section>
      {!authorized && !loading && <section className="detail-panel"><p>{error}</p><p><Link href="/beheer/import">Ga naar beheerlogin →</Link></p></section>}
      {authorized && <section className="catalog">
        <div className="catalog-heading"><div><div className="eyebrow">Afbeeldingscontrole</div><h2>Maaltijden zonder afbeelding</h2></div><span className="result-count">{products.length} ontbrekend</span></div>
        <p className="detail-muted">Gebruik bij voorkeur een afbeelding van de productpagina van de aanbieder. Controleer dat de foto bij precies deze maaltijd hoort. Er wordt niets automatisch ingevuld.</p>
        <label className="search-field"><span>Zoek maaltijd of aanbieder</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek op naam of aanbieder…" /></label>
        {loading && <p className="loading-message">Maaltijden ophalen…</p>}
        {!loading && filtered.length === 0 && <div className="empty-state"><p>Geen maaltijden zonder afbeelding gevonden voor deze selectie.</p></div>}
        <div className="admin-image-list">
          {filtered.map(product => {
            const draft = drafts[product.id] ?? "";
            const preview = safeImageUrl(draft);
            return <article className="detail-panel" key={product.id}>
              <h3>{product.name}</h3>
              <p className="detail-muted">{vendorName(product)}</p>
              {product.product_url && <p><a href={product.product_url} target="_blank" rel="noopener noreferrer">Bekijk product bij aanbieder ↗</a></p>}
              <label>HTTPS-link naar de juiste maaltijdafbeelding
                <input type="url" inputMode="url" placeholder="https://…" value={draft} onChange={e => setDrafts(current => ({ ...current, [product.id]: e.target.value }))} />
              </label>
              {preview && <div className="admin-image-preview"><img src={preview} alt={`Voorbeeldafbeelding voor ${product.name}`} loading="lazy" decoding="async" /><span>Controleer of dit exact het juiste gerecht is.</span></div>}
              <button className="detail-cta" disabled={busyId === product.id || !preview} onClick={() => void saveImage(product)}>{busyId === product.id ? "Opslaan…" : "Afbeelding koppelen"}</button>
            </article>;
          })}
        </div>
      </section>}
      {message && <p className="admin-feedback" role="status">{message}</p>}
      {error && authorized && <p className="admin-feedback" role="alert">{error}</p>}
    </main>
    <footer>Maaltijd Finder · Afbeeldingsbeheer</footer>
  </>;
}
