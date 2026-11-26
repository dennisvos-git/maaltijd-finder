import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">Pagina niet gevonden</div>
        <h1>Deze pagina bestaat niet (meer).</h1>
        <p className="intro">Misschien is de link verouderd of is de pagina verplaatst.</p>
        <Link className="detail-cta" href="/">Terug naar alle maaltijden</Link>
      </section>
    </main>
  );
}
