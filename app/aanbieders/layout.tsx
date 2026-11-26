import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aanbieders van kant-en-klaarmaaltijden",
  description: "Bekijk gecontroleerde aanbieders die individuele kant-en-klaarmaaltijden in Nederland leveren en vergelijk hun bestelvoorwaarden.",
  alternates: { canonical: "/aanbieders" },
  openGraph: {
    title: "Aanbieders | Maaltijd Finder",
    description: "Bekijk gecontroleerde aanbieders van individuele maaltijden in Nederland.",
  },
};

export default function VendorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
