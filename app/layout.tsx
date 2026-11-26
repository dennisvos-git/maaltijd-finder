import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://maaltijd-finder-hnb20kene-maaltijd-finder.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maaltijd Finder — Vergelijk kant-en-klaarmaaltijden",
    template: "%s | Maaltijd Finder",
  },
  description: "Vergelijk individuele kant-en-klaarmaaltijden in Nederland op prijs, gewicht, voedingswaarden en aanbieder. Bekijk productinformatie en bestelvoorwaarden.",
  applicationName: "Maaltijd Finder",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName: "Maaltijd Finder",
    title: "Maaltijd Finder — Vergelijk kant-en-klaarmaaltijden",
    description: "Vergelijk individuele maaltijden op prijs, gewicht, voedingswaarden en aanbieder.",
  },
  twitter: {
    card: "summary",
    title: "Maaltijd Finder — Vergelijk kant-en-klaarmaaltijden",
    description: "Vergelijk individuele maaltijden op prijs, gewicht, voedingswaarden en aanbieder.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
