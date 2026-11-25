"use client";

import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

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
  meal_type: string | null;
  preparation_method: string | null;
  category: string | null;
  dietary_labels: string[];
  availability: "available" | "unavailable" | "unknown";
  last_checked_at: string | null;
  vendors: Vendor | Vendor[] | null;
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
  const [sort, setSort] = useState("name");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("products")
        .select("id, name, product_url, image_url, price, weight_grams, kcal_per_100g, protein_per_100g, meal_type, preparation_method, category, dietary_labels, availability, last_checked_at, vendors(name, website_url, minimum_order_quantity, minimum_order_value)")
        .eq("is_active", true);

      if (cancelled) return;
      if (queryError) setError("De maaltijden konden niet worden opgehaald. Probeer het later opnieuw.");
      else setProducts((data ?? []) as unknown as Product[]);
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

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("nl-NL");
    const filtered = products.filter((product) => {
      const vendor = vendorFor(product);
      const matchesSearch = !term || [product.name, product.category, vendor?.name, ...(product.dietary_labels ?? [])]
        .some((value) => value?.toLocaleLowerCase("nl-NL").includes(term));
      return matchesSearch
        && (mealType === "all" || product.meal_type === mealType)
        && (preparation === "all" || product.preparation_method === preparation);
    });

    return filtered.sort((a, b) => {
      if (sort === "price") return (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE);
      if (sort === "price-per-kg") {
        const aValue = a.price != null && a.weight_grams ? a.price / a.weight_grams : Number.MAX_VALUE;
        const bValue = b.price != null && b.weight_grams ? b.price / b.weight_grams : Number.MAX_VALUE;
        return aValue - bValue;
      }
      return a.name.localeCompare(b.name, "nl");
    });
  }, [products, search, mealType, preparation, sort]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/">Maaltijd <span>Finder</span></a>
          <div className="nav-note">Eerlijk vergelijken. Slim kiezen.</div>
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

        <section className="catalog" aria-label="Maaltijdencatalogus">
          <div className="catalog-heading">
            <div>
              <div className="eyebrow">Het aanbod</div>
              <h2>Maaltijden vergelijken</h2>
            </div>
            <span className="result-count">{loading ? "Laden…" : `${visibleProducts.length} maaltijden`}</span>
          </div>

          <div className="filters">
            <label className="search-field">
              <span>Zoeken</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek op maaltijd of aanbieder…" />
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
              <span>Sorteren op</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="name">Naam</option>
                <option value="price">Laagste prijs</option>
                <option value="price-per-kg">Laagste prijs per kilo</option>
              </select>
            </label>
          </div>

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
                const pricePerKg = product.price != null && product.weight_grams
                  ? product.price / (product.weight_grams / 1000)
                  : null;
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} />
                        : <span>Maaltijd</span>}
                    </div>
                    <div className="product-content">
                      <div className="product-tags">
                        {product.meal_type && <span className="tag">{product.meal_type}</span>}
                        {product.preparation_method && <span className="tag muted-tag">{product.preparation_method}</span>}
                      </div>
                      <h3>{product.name}</h3>
                      <p className="vendor-name">{vendor?.name ?? "Aanbieder onbekend"}</p>
                      <div className="product-facts">
                        {product.weight_grams && <span>{product.weight_grams} g</span>}
                        {product.kcal_per_100g != null && <span>{product.kcal_per_100g} kcal / 100 g</span>}
                        {product.protein_per_100g != null && <span>{product.protein_per_100g} g eiwit / 100 g</span>}
                      </div>
                      <div className="product-bottom">
                        <div>
                          <strong>{product.price != null ? euro(product.price) : "Prijs onbekend"}</strong>
                          {pricePerKg != null && <small>{euro(pricePerKg)} / kg</small>}
                        </div>
                        <a className="product-link" href={product.product_url} target="_blank" rel="noreferrer">Bekijk aanbieder ↗</a>
                      </div>
                      {vendor?.minimum_order_quantity != null && (
                        <p className="delivery-note">Minimale bestelling: {vendor.minimum_order_quantity} maaltijden</p>
                      )}
                      {product.last_checked_at && (
                        <p className="checked-note">Gecontroleerd: {new Date(product.last_checked_at).toLocaleDateString("nl-NL")}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer>Maaltijd Finder · Productinformatie wordt gecontroleerd en voorzien van een controledatum.</footer>
    </>
  );
}
