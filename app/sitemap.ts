import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://maaltijd-finder-hnb20kene-maaltijd-finder.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/aanbieders`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return routes;

  try {
    const supabase = createClient(supabaseUrl, publishableKey);
    const { data, error } = await supabase
      .from("products")
      .select("id, vendors!inner(verification_status,country_code,is_active)")
      .eq("is_active", true)
      .eq("vendors.verification_status", "verified")
      .eq("vendors.country_code", "NL")
      .eq("vendors.is_active", true);

    if (error || !data) return routes;
    return [
      ...routes,
      ...data.map((product) => ({
        url: `${siteUrl}/maaltijd/${product.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return routes;
  }
}
