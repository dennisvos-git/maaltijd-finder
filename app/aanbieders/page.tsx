"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

type Vendor = {
  id: string;
  name: string;
  website_url: string | null;
  delivery_info: string | null;
  minimum_order_quantity: number | null;
  minimum_order_value: number | null;
  last_checked_at: string | null;
};

const safeExternalUrl = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
};
const hasReliableCheckDate = (value: string | null) => {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now();
};

const euro = (value: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVendors() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("vendors")
        .select("id, name, website_url, delivery_info, minimum_order_quantity, minimum_order_value, last_checked_at")
        .eq("is_active", true)
        .eq("verification_status", "verified")
        .eq("country_code", "NL")
        .order("name");

      if (cancelled) return;
      if (queryError) setError("De aanbieders konden niet worden opgehaald. Probeer het later opnieuw.");
      else setVendors((data ?? []) as Vendor[]);
      setLoading(false);
    }

    void loadVendors();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
          <nav className="nav-note"><Link href="/">Maaltijden</Link></nav>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="eyebrow">Aanbieders</div>
          <h1>Vergelijk de aanbieders.</h1>
          <p className="intro">
            Bekijk aanbieders die gecontroleerd zijn op levering in Nederland.
            Bestelvoorwaarden staan apart vermeld en bepalen niet welke maaltijden worden getoond.
          </p>
        </section>
        <section className="catalog" aria-label="Aanbieders">
          <div className="catalog-heading">
            <div><div className="eyebrow">Overzicht</div><h2>Gecontroleerde aanbieders</h2></div>
            <span className="result-count">{loading ? "Laden…" : `${vendors.length} aanbieders`}</span>
          </div>
          {!isSupabaseConfigured && <div className="empty-state"><h3>Databaseverbinding ontbreekt</h3><p>De aanbieders kunnen momenteel niet worden geladen.</p></div>}
          {isSupabaseConfigured && loading && <p className="loading-message">Aanbieders ophalen…</p>}
          {isSupabaseConfigured && !loading && error && <div className="empty-state"><h3>Even geen verbinding</h3><p>{error}</p></div>}
          {isSupabaseConfigured && !loading && !error && vendors.length === 0 && <div className="empty-state"><h3>Nog geen gecontroleerde aanbieders</h3><p>Nieuwe aanbieders verschijnen hier zodra hun Nederlandse bezorging is gecontroleerd.</p></div>}
          {vendors.length > 0 && (
            <div className="product-grid">
              {vendors.map((vendor) => (
                <article className="product-card" key={vendor.id}>
                  <div className="product-content">
                    <div className="eyebrow">Nederlandse levering gecontroleerd</div>
                    <h3>{vendor.name}</h3>
                    {vendor.delivery_info && <p>{vendor.delivery_info}</p>}
                    <div className="product-facts">
                      {vendor.minimum_order_quantity != null && <span>Minimale bestelling: {vendor.minimum_order_quantity} maaltijden</span>}
                      {vendor.minimum_order_value != null && <span>Minimale orderwaarde: {euro(vendor.minimum_order_value)}</span>}
                    </div>
                    {!hasReliableCheckDate(vendor.last_checked_at) ? <p className="checked-note">Controledatum ontbreekt of moet worden nagekeken</p> : <p className="checked-note">Gecontroleerd: {new Date(vendor.last_checked_at as string).toLocaleDateString("nl-NL")}</p>}
                    <div className="vendor-actions"><Link className="product-link" href={`/?aanbieder=${encodeURIComponent(vendor.name)}`}>Bekijk maaltijden van deze aanbieder →</Link>{safeExternalUrl(vendor.website_url) && <a className="product-link" href={safeExternalUrl(vendor.website_url)!} target="_blank" rel="noopener noreferrer">Naar aanbieder ↗</a>}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer>Maaltijd Finder · Aanbieders worden alleen getoond na controle van levering in Nederland.</footer>
    </>
  );
}
