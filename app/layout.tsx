import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maaltijd Finder — Vergelijk kant-en-klaarmaaltijden",
  description: "Vergelijk individuele maaltijden op prijs, gewicht, voedingswaarden en aanbieder."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
