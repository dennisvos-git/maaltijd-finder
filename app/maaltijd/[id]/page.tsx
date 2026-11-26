"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

type PricePoint = { price: number; checked_at: string };

type Meal = {
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
  vendors: { name: string; website_url: string | null; minimum_order_quantity: number | null; minimum_order_value: number | null; delivery_info: string | null } | { name: string; website_url: string | null; minimum_order_quantity: number | null; minimum_order_value: number | null; delivery_info: string | null }[] | null;
};

const dataFields = [
  ["price", "prijs"], ["weight_grams", "gewicht"], ["kcal_per_100g", "energie"],
  ["protein_per_100g", "eiwitten"], ["carbohydrates_per_100g", "koolhydraten"],
  ["fat_per_100g", "vetten"], ["ingredients", "ingrediënten"],
] as const;

const euro = (value: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
const number = (value: number | null, suffix: string) => value == null ? "Niet opgegeven" : `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(value)} ${suffix}`;
const perPortion = (value: number | null, weightGrams: number | null) => value == null || weightGrams == null ? null : value * weightGrams / 100;
const hasReliableCheckDate = (value: string | null) => {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now();
};

export default function MealDetailPage() {
  const params = useParams<{ id: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadMeal() {
      if (!supabase) { setLoading(false); return; }
      const { data, error: queryError } = await supabase
        .from("products")
        .select("id, name, product_url, image_url, price, weight_grams, kcal_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, ingredients, meal_type, preparation_method, category, dietary_labels, availability, last_checked_at, vendors!inner(name, website_url, minimum_order_quantity, minimum_order_value, delivery_info, verification_status, country_code, is_active)")
        .eq("id", params.id)
        .eq("is_active", true)
        .eq("vendors.verification_status", "verified")
        .eq("vendors.country_code", "NL")
        .eq("vendors.is_active", true)
        .maybeSingle();
      if (cancelled) return;
      if (queryError) setError("De maaltijdgegevens konden niet worden opgehaald.");
      else {
        setMeal(data as unknown as Meal | null);
        if (data) {
          const { data: history } = await supabase
            .from("price_history")
            .select("price, checked_at")
            .eq("product_id", params.id)
            .order("checked_at", { ascending: false })
            .limit(20);
          if (!cancelled) setPriceHistory((history ?? []) as PricePoint[]);
        }
      }
      if (!cancelled) setLoading(false);
    }
    void loadMeal();
    return () => { cancelled = true; };
  }, [params.id]);

  const vendor = meal ? (Array.isArray(meal.vendors) ? meal.vendors[0] ?? null : meal.vendors) : null;
  const missingFields = meal ? dataFields.filter(([field]) => {
    const value = meal[field];
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  }).map(([, label]) => label) : [];
  const completeness = 7 - missingFields.length;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
          <nav className="nav-note site-nav"><Link href="/">Maaltijden</Link><Link href="/aanbieders">Aanbieders</Link></nav>
        </div>
      </header>
      <main>
        <p className="breadcrumb"><Link href="/">← Terug naar alle maaltijden</Link></p>
        {!isSupabaseConfigured && <div className="empty-state"><h2>Databaseverbinding ontbreekt</h2><p>De maaltijdgegevens kunnen niet worden geladen.</p></div>}
        {isSupabaseConfigured && loading && <p className="loading-message">Maaltijd ophalen…</p>}
        {isSupabaseConfigured && !loading && error && <div className="empty-state"><h2>Even geen verbinding</h2><p>{error}</p></div>}
        {isSupabaseConfigured && !loading && !error && !meal && <div className="empty-state"><h2>Maaltijd niet gevonden</h2><p>Deze maaltijd bestaat niet meer of is niet beschikbaar.</p><Link className="product-link" href="/">Terug naar de catalogus</Link></div>}
        {meal && (
          <section className="meal-detail">
            <div className="meal-detail-main">
              <div className="meal-detail-image">{meal.image_url ? <img src={meal.image_url} alt={meal.name} loading="lazy" decoding="async" /> : <span>Maaltijd</span>}</div>
              <div className="product-tags">
                {meal.meal_type && <span className="tag">{meal.meal_type}</span>}
                {meal.preparation_method && <span className="tag muted-tag">{meal.preparation_method}</span>}
              </div>
              <h1 className="detail-title">{meal.name}</h1>
              <p className="vendor-name">{vendor?.name ?? "Aanbieder onbekend"}</p>
              <div className="detail-price">{meal.price == null ? "Prijs onbekend" : euro(meal.price)}{meal.weight_grams != null && <span>{meal.weight_grams} gram</span>}</div>
              {meal.dietary_labels?.length > 0 && <div className="detail-labels">{meal.dietary_labels.map(label => <span className="tag" key={label}>{label}</span>)}</div>}
              <a className="detail-cta" href={meal.product_url} target="_blank" rel="noreferrer">Bekijk bij aanbieder ↗</a>
              <p className="delivery-note">Beschikbaarheid: {meal.availability === "available" ? "Beschikbaar volgens de laatst bekende informatie" : meal.availability === "unavailable" ? "Momenteel niet beschikbaar volgens de laatst bekende informatie" : "Nog niet gecontroleerd"}</p>
              {vendor?.minimum_order_quantity != null && <p className="delivery-note">Minimale bestelling bij deze aanbieder: {vendor.minimum_order_quantity} maaltijden</p>}
              {vendor?.minimum_order_value != null && <p className="delivery-note">Minimale bestelwaarde bij deze aanbieder: {euro(vendor.minimum_order_value)}</p>}
              {vendor?.delivery_info && <p className="detail-delivery">{vendor.delivery_info}</p>}
              {!hasReliableCheckDate(meal.last_checked_at)
                ? <p className="checked-note">Controledatum ontbreekt of moet worden nagekeken.</p>
                : <p className="checked-note">Productinformatie gecontroleerd: {new Date(meal.last_checked_at as string).toLocaleDateString("nl-NL")}</p>}
            </div>
            <div className="meal-detail-sections">
              <section className="detail-panel completeness-panel">
                <h2>Volledigheid productinformatie</h2>
                <p><strong>{completeness} van 7 gegevens ingevuld</strong></p>
                {missingFields.length > 0 ? <p>Ontbreekt nog: {missingFields.join(", ")}.</p> : <p>Alle zeven basisgegevens zijn ingevuld.</p>}
                <p className="detail-muted">Dit geeft alleen aan hoeveel velden bekend zijn. Het is geen beoordeling van de maaltijd of de juistheid van de bron.</p>
              </section>
              <section className="detail-panel">
                <h2>Voedingswaarden</h2>
                <p className="detail-muted">Bronwaarden per 100 gram. Portiewaarden zijn berekend met het opgegeven maaltijdgewicht en zijn schattingen.</p>
                <dl className="nutrition-list">
                  <div><dt>Voedingswaarde</dt><dd><strong>Per 100 g</strong><span>Geschat per maaltijd</span></dd></div>
                  <div><dt>Energie</dt><dd>{number(meal.kcal_per_100g, "kcal")}<span>{number(perPortion(meal.kcal_per_100g, meal.weight_grams), "kcal")}</span></dd></div>
                  <div><dt>Eiwitten</dt><dd>{number(meal.protein_per_100g, "g")}<span>{number(perPortion(meal.protein_per_100g, meal.weight_grams), "g")}</span></dd></div>
                  <div><dt>Koolhydraten</dt><dd>{number(meal.carbohydrates_per_100g, "g")}<span>{number(perPortion(meal.carbohydrates_per_100g, meal.weight_grams), "g")}</span></dd></div>
                  <div><dt>Vetten</dt><dd>{number(meal.fat_per_100g, "g")}<span>{number(perPortion(meal.fat_per_100g, meal.weight_grams), "g")}</span></dd></div>
                </dl>
                {meal.weight_grams == null && <p className="detail-muted">Een schatting per maaltijd is niet mogelijk omdat het gewicht ontbreekt.</p>}
              </section>
              <section className="detail-panel">
                <h2>Prijsgeschiedenis</h2>
                {priceHistory.length > 0 ? <>
                  <p className="detail-muted">Geregistreerde meetpunten vanaf het moment dat prijsgeschiedenis is ingeschakeld. Dit is geen volledige historische prijsgarantie.</p>
                  <ul className="price-history-list">
                    {priceHistory.map((point, index) => <li key={`${point.checked_at}-${index}`}><span>{new Date(point.checked_at).toLocaleDateString("nl-NL")}</span><strong>{euro(point.price)}</strong></li>)}
                  </ul>
                </> : <p>Er is nog geen prijsgeschiedenis beschikbaar.</p>}
              </section>
              <section className="detail-panel">
                <h2>Ingrediënten</h2>
                <p>{meal.ingredients || "Ingrediënten zijn voor deze maaltijd nog niet opgegeven."}</p>
              </section>
              <p className="detail-disclaimer">Gegevens worden overgenomen uit beschikbare productinformatie van de aanbieder. Controleer bij allergieën altijd de actuele verpakking of productpagina.</p>
            </div>
          </section>
        )}
      </main>
      <footer>Maaltijd Finder · Vergelijk maaltijden en bekijk de actuele informatie bij de aanbieder.</footer>
    </>
  );
}
