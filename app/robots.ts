import type { MetadataRoute } from "next";

const siteUrl = "https://maaltijd-finder-hnb20kene-maaltijd-finder.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/beheer/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
