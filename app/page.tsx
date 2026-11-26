"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { fetchAllRows } from "../lib/fetch-all-rows";

type Vendor = {
  name: string;
  website_url: string | null;
  minimum_order_quantity: number | null;
  minimum_order_value: number | null;
};

type Product = {
  id: string;
  name: string;
  product_url: string;
  image_url: string | null;
  price: number | null;
  weight_grams: number | null;
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbohydrates_per_100g: number | null;
  fat_per_100g: number | null;
  ingredients: string | null;
  meal_type: string | null;
  preparation_method: string | null;
  category: string | null;
  dietary_labels: string[];
  availability: "available" | "unavailable" | "unknown";
  last_checked_at: string | null;
  vendors: Vendor | Vendor[] | null;
};

const dataFields = [
  ["price", "prijs"], ["weight_grams", "gewicht"], ["kcal_per_100g", "energie"],
  ["protein_per_100g", "eiwitten"], ["carbohydrates_per_100g", "koolhydraten"],
  ["fat_per_100g", "vetten"], ["ingredients", "ingrediënten"],
] as const;

const missingData = (product: Product) => dataFields.filter(([field]) => {
  const value = product[field];
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}).map(([, label]) => label);

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

function vendorFor(product: Product): Vendor | null {
  return Array.isArray(product.vendors) ? product.vendors[0] ?? null : product.vendors;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("all");
  const [preparation, setPreparation] = useState("all");
  const [dietaryLabel, setDietaryLabel] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [dataStatus, setDataStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [freshness, setFreshness] = useState("all");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    const vendorFilter = new URLSearchParams(window.location.search).get("aanbieder");
    if (vendorFilter) setSearch(vendorFilter);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const db = supabase;
      if (!db) {
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await fetchAllRows(
        (from, to) => db
          .from("products")
          .select("id, name, product_url, image_url, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, ingredients, meal_type, preparation_method, category, dietary_labels, availability, last_checked_at, vendors!inner(name, website_url, minimum_order_quantity, minimum_order_value, verification_status, country_code, is_active)")
          .eq("is_active", true)
          .eq("vendors.verification_status", "verified")
          .eq("vendors.country_code", "NL")
          .eq("vendors.is_active", true)
          .order("id")
          .range(from, to)
      );

      if (cancelled) return;
      if (queryError) setError("De maaltijden konden niet worden opgehaald. Probeer het later opnieuw.");
      else setProducts(data as unknown as Product[]);
      setLoading(false);
    }

    void loadProducts();
    return () => { cancelled = true; };
  }, []);

  const mealTypes = useMemo(
    () => [...new Set(products.map((p) => p.meal_type).filter((v): v is string => Boolean(v)))].sort(),
    [products]
  );
  const preparations = useMemo(
    () => [...new Set(products.map((p) => p.preparation_method).filter((v): v is string => Boolean(v)))].sort(),
    [products]
  );
  const dietaryLabels = useMemo(
    () => [...new Set(products.flatMap((p) => p.dietary_labels ?? []))].sort((a, b) => a.localeCompare(b, "nl")),
    [products]
  );

  const incompleteCount = useMemo(() => products.filter((product) => missingData(product).length > 0).length, [products]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("nl-NL");
    const filtered = products.filter((product) => {
      const vendor = vendorFor(product);
      const matchesSearch = !term || [product.name, product.category, vendor?.name, ...(product.dietary_labels ?? [])]
        .some((value) => value?.toLocaleLowerCase("nl-NL").includes(term));
      return matchesSearch
        && (mealType === "all" || product.meal_type === mealType)
        && (preparation === "all" || product.preparation_method === preparation)
        && (dietaryLabel === "all" || (product.dietary_labels ?? []).includes(dietaryLabel))
        && (availability === "all" || product.availability === availability)
        && (dataStatus === "all" || (dataStatus === "incomplete" ? missingData(product).length > 0 : missingData(product).length === 0))
        && (minPrice === "" || (product.price != null && product.price >= Number(minPrice)))
        && (maxPrice === "" || (product.price != null && product.price <= Number(maxPrice)))
        && (minWeight === "" || (product.weight_grams != null && product.weight_grams >= Number(minWeight)))
        && (maxWeight === "" || (product.weight_grams != null && product.weight_grams <= Number(maxWeight)))
        && (freshness === "all" || (freshness === "stale"
          ? !hasReliableCheckDate(product.last_checked_at) || new Date(product.last_checked_at as string).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
          : hasReliableCheckDate(product.last_checked_at) && new Date(product.last_checked_at as string).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000));
    });

    return filtered.sort((a, b) => {
      if (sort === "price") return (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE);
      if (sort === "price-per-kg") {
        const aValue = a.price != null && a.weight_grams ? a.price / a.weight_grams : Number.MAX_VALUE;
        const bValue = b.price != null && b.weight_grams ? b.price / b.weight_grams : Number.MAX_VALUE;
        return aValue - bValue;
      }
      if (sort === "kcal") {
        return (a.kcal_per_100g ?? Number.MAX_VALUE) - (b.kcal_per_100g ?? Number.MAX_VALUE);
      }
      if (sort === "protein") {
        return (b.protein_per_100g ?? -1) - (a.protein_per_100g ?? -1);
      }
      if (sort === "protein-per-euro") {
        // Compare total protein in the complete package, not only the value per 100 g.
        const aValue = a.price != null && a.price > 0 && a.weight_grams != null && a.protein_per_100g != null
          ? (a.protein_per_100g * a.weight_grams / 100) / a.price
          : -1;
        const bValue = b.price != null && b.price > 0 && b.weight_grams != null && b.protein_per_100g != null
          ? (b.protein_per_100g * b.weight_grams / 100) / b.price
          : -1;
        return bValue - aValue;
      }
      return a.name.localeCompare(b.name, "nl");
    });
  }, [products, search, mealType, preparation, dietaryLabel, availability, dataStatus, minPrice, maxPrice, minWeight, maxWeight, freshness, sort]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
          <nav className="nav-note site-nav"><Link href="/aanbieders">Aanbieders</Link><Link href="/uitleg">Zo werkt het</Link><Link href="/beheer">Controle-overzicht</Link><span>Eerlijk vergelijken. Slim kiezen.</span></nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">De maaltijdvergelijker</div>
          <h1>Vind de maaltijd die bij je past.</h1>
          <p className="intro">
            Vergelijk kant-en-klaarmaaltijden op prijs, gewicht, voedingswaarden en aanbieder.
            Alle maaltijden overzichtelijk op één plek.
          </p>
        </section>

        <section className="catalog" id="catalog" aria-label="Maaltijdencatalogus">
          <div className="catalog-heading">
            <div>
              <div className="eyebrow">Het aanbod</div>
              <h2>Maaltijden vergelijken</h2>
            </div>
            <span className="result-count" aria-live="polite" aria-atomic="true">{loading ? "Laden…" : `${visibleProducts.length} maaltijden`}</span>
          </div>

          {!loading && products.length > 0 && <div className="catalog-data-summary"><p>{incompleteCount} van {products.length} maaltijden missen nog één of meer gegevens. Ontbrekende velden staan per maaltijd vermeld.</p><p>De volledigheidsscore telt 7 velden: prijs, gewicht, energie, eiwitten, koolhydraten, vetten en ingrediënten. Het is geen beoordeling van voedingskwaliteit.</p></div>}

          <div className="catalog-layout">
            <aside className="filters" aria-label="Filters en sortering">
            <label>
              <span>Zoeken</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Maaltijd of aanbieder…" />
            </label>
            <label>
              <span>Soort maaltijd</span>
              <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
                <option value="all">Alle soorten</option>
                {mealTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>Bereiding</span>
              <select value={preparation} onChange={(event) => setPreparation(event.target.value)}>
                <option value="all">Alle bereidingswijzen</option>
                {preparations.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </label>
            <label>
              <span>Dieetkenmerk</span>
              <select value={dietaryLabel} onChange={(event) => setDietaryLabel(event.target.value)}>
                <option value="all">Alle kenmerken</option>
                {dietaryLabels.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Beschikbaarheid</span>
              <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                <option value="all">Alle statussen</option>
                <option value="available">Beschikbaar</option>
                <option value="unavailable">Niet beschikbaar</option>
                <option value="unknown">Onbekend</option>
              </select>
            </label>
            <label>
              <span>Productinformatie</span>
              <select value={dataStatus} onChange={(event) => setDataStatus(event.target.value)}>
                <option value="all">Alle maaltijden</option>
                <option value="incomplete">Alleen onvolledig</option>
                <option value="complete">Volledig (7/7)</option>
              </select>
            </label>
            <label>
              <span>Minimumprijs (€)</span>
              <input type="number" min="0" step="0.01" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Geen minimum" />
            </label>
            <label>
              <span>Maximumprijs (€)</span>
              <input type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Geen maximum" />
            </label>
            <label>
              <span>Minimumgewicht (gram)</span>
              <input type="number" min="1" step="1" value={minWeight} onChange={(event) => setMinWeight(event.target.value)} placeholder="Geen minimum" />
            </label>
            <label>
              <span>Maximumgewicht (gram)</span>
              <input type="number" min="1" step="1" value={maxWeight} onChange={(event) => setMaxWeight(event.target.value)} placeholder="Geen maximum" />
            </label>
            <label>
              <span>Controledatum</span>
              <select value={freshness} onChange={(event) => setFreshness(event.target.value)}>
                <option value="all">Alle controledatums</option>
                <option value="fresh">Gecontroleerd in 30 dagen</option>
                <option value="stale">Ouder dan 30 dagen / onbekend</option>
              </select>
            </label>
            <label>
              <span>Sorteren op</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="name">Naam</option>
                <option value="price">Laagste prijs</option>
                <option value="price-per-kg">Laagste prijs per kilo</option>
                <option value="kcal">Laagste kcal per 100 g</option>
                <option value="protein">Meeste eiwit per 100 g</option>
                <option value="protein-per-euro">Meeste eiwit per euro (hele maaltijd)</option>
              </select>
            </label>
            <button
              type="button"
              className="filters-reset"
              onClick={() => {
                setSearch("");
                setMealType("all");
                setPreparation("all");
                setDietaryLabel("all");
                setAvailability("all");
                setDataStatus("all");
                setMinPrice("");
                setMaxPrice("");
                setMinWeight("");
                setMaxWeight("");
                setFreshness("all");
                setSort("name");
              }}
            >
              Wis filters en sortering
            </button>
            </aside>
            <div className="catalog-results">

          {!isSupabaseConfigured && (
            <div className="empty-state">
              <div className="empty-icon">⌁</div>
              <h3>Databaseverbinding ontbreekt</h3>
              <p>De catalogus kan de productgegevens nog niet ophalen. De beheerder kan de Supabase-instellingen controleren.</p>
            </div>
          )}

          {isSupabaseConfigured && loading && <p className="loading-message">Maaltijden ophalen…</p>}

          {isSupabaseConfigured && !loading && error && (
            <div className="empty-state"><h3>Even geen verbinding</h3><p>{error}</p></div>
          )}

          {isSupabaseConfigured && !loading && !error && products.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">＋</div>
              <h3>De catalogus wordt gevuld</h3>
              <p>Er zijn nog geen gecontroleerde maaltijden toegevoegd. Zodra echte productgegevens beschikbaar zijn, verschijnen ze hier.</p>
            </div>
          )}

          {isSupabaseConfigured && !loading && !error && products.length > 0 && visibleProducts.length === 0 && (
            <div className="empty-state"><h3>Geen maaltijden gevonden</h3><p>Pas je zoekopdracht of filters aan.</p></div>
          )}

          {visibleProducts.length > 0 && (
            <div className="product-grid">
              {visibleProducts.map((product) => {
                const vendor = vendorFor(product);
                const missingFields = missingData(product);
                const completeness = 7 - missingFields.length;
                const pricePerKg = product.price != null && product.weight_grams
                  ? product.price / (product.weight_grams / 1000)
                  : null;
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {safeExternalUrl(product.image_url)
                        ? <img src={safeExternalUrl(product.image_url)!} alt={product.name} loading="lazy" decoding="async" />
                        : <span>Afbeelding niet beschikbaar</span>}
                    </div>
                    <div className="product-content">
                      <div className="product-tags">
                        {product.meal_type && <span className="tag">{product.meal_type}</span>}
                        {product.preparation_method && <span className="tag muted-tag">{product.preparation_method}</span>}
                        <span className="tag muted-tag">{product.availability === "available" ? "Beschikbaar volgens aanbieder" : product.availability === "unavailable" ? "Niet beschikbaar volgens aanbieder" : "Beschikbaarheid onbekend"}</span>
                      </div>
                      <h3><Link href={`/maaltijd/${product.id}`}>{product.name}</Link></h3>
                      <p className="vendor-name">{vendor?.name ?? "Aanbieder onbekend"}</p>
                      <p className="completeness-note">Productinformatie: {completeness}/7 gegevens ingevuld</p>
                      {missingFields.length > 0 && <p className="missing-data-note">Ontbreekt nog: {missingFields.join(", ")}</p>}
                      <div className="product-facts">
                        {product.weight_grams && <span>{product.weight_grams} g</span>}
                        {product.kcal_per_100g != null && <span>{product.kcal_per_100g} kcal / 100 g</span>}
                        {product.protein_per_100g != null && <span>{product.protein_per_100g} g eiwit / 100 g</span>}
                        {product.carbohydrates_per_100g != null && <span>{product.carbohydrates_per_100g} g koolhydraten / 100 g</span>}
                        {product.fat_per_100g != null && <span>{product.fat_per_100g} g vet / 100 g</span>}
                      </div>
                      <div className="product-bottom">
                        <div>
                          <strong>{product.price != null ? euro(product.price) : "Prijs onbekend"}</strong>
                          {pricePerKg != null && <small>{euro(pricePerKg)} / kg</small>}
                        </div>
                        <div className="product-card-links"><Link className="product-link" href={`/maaltijd/${product.id}`}>Details bekijken →</Link>{safeExternalUrl(product.product_url) ? <a className="product-link" href={safeExternalUrl(product.product_url)!} target="_blank" rel="noopener noreferrer">Aanbieder ↗</a> : <span className="detail-muted">Aanbiederslink niet beschikbaar</span>}</div>
                      </div>
                      {vendor?.minimum_order_quantity != null && (
                        <p className="delivery-note">Minimale bestelling bij aanbieder: {vendor.minimum_order_quantity} maaltijden</p>
                      )}
                      {vendor?.minimum_order_value != null && (
                        <p className="delivery-note">Minimale bestelwaarde bij aanbieder: {euro(vendor.minimum_order_value)}</p>
                      )}
                      {!hasReliableCheckDate(product.last_checked_at)
                        ? <p className="checked-note">Controledatum ontbreekt of moet worden nagekeken</p>
                        : <p className="checked-note">Gecontroleerd: {new Date(product.last_checked_at as string).toLocaleDateString("nl-NL")}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
            </div>
          </div>
        </section>
      </main>

      <footer>Maaltijd Finder · Productinformatie wordt gecontroleerd en voorzien van een controledatum. <Link href="/uitleg">Zo werkt vergelijken</Link></footer>
    </>
  );
}
