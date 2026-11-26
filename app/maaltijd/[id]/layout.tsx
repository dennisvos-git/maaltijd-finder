import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://maaltijd-finder-hnb20kene-maaltijd-finder.vercel.app";

type ProductMetadataRow = {
  name: string;
  vendors: { name: string } | { name: string }[] | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return { title: "Maaltijddetails" };
  }

  try {
    const supabase = createClient(supabaseUrl, publishableKey);
    const { data } = await supabase
      .from("products")
      .select("name, vendors!inner(name,verification_status,country_code,is_active)")
      .eq("id", id)
      .eq("is_active", true)
      .eq("vendors.verification_status", "verified")
      .eq("vendors.country_code", "NL")
      .eq("vendors.is_active", true)
      .maybeSingle();

    if (!data) return { title: "Maaltijd niet gevonden" };

    const product = data as unknown as ProductMetadataRow;
    const vendor = Array.isArray(product.vendors)
      ? product.vendors[0]?.name
      : product.vendors?.name;
    const description = vendor
      ? `Bekijk ${product.name} van ${vendor} op Maaltijd Finder. Vergelijk productinformatie, voedingswaarden en prijs.`
      : `Bekijk ${product.name} op Maaltijd Finder en vergelijk productinformatie en voedingswaarden.`;

    return {
      title: product.name,
      description,
      alternates: { canonical: `/maaltijd/${id}` },
      openGraph: {
        type: "website",
        url: `${siteUrl}/maaltijd/${id}`,
        title: `${product.name} | Maaltijd Finder`,
        description,
      },
    };
  } catch {
    return { title: "Maaltijddetails" };
  }
}

export default function MealLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
