import Link from "next/link";

export const metadata = {
  title: "Zo werkt Maaltijd Finder",
  description: "Lees hoe Maaltijd Finder maaltijden en aanbieders vergelijkt, welke gegevens worden getoond en hoe ontbrekende informatie wordt behandeld.",
  alternates: { canonical: "/uitleg" },
};

const principles = [
  {
    title: "Aanbieders in Nederland",
    body: "De openbare catalogus toont alleen actieve aanbieders die als geverifieerd zijn geregistreerd en waarvan levering in Nederland is gecontroleerd.",
  },
  {
    title: "Individuele maaltijden vergelijken",
    body: "Je kunt maaltijden vergelijken op prijs, gewicht, voedingswaarden, bereidingswijze en dieetkenmerken. Filters helpen je het aanbod te verfijnen.",
  },
  {
    title: "Ontbrekende gegevens blijven zichtbaar",
    body: "Als een prijs, gewicht, voedingswaarde of ingrediëntenlijst niet bekend is, tonen we dat als onbekend of ontbrekend. We vullen geen waarden zelf in.",
  },
  {
    title: "Prijs per kilo",
    body: "Als zowel prijs als gewicht bekend zijn, berekenen we een prijs per kilo. Dit maakt verpakkingen van verschillende gewichten beter vergelijkbaar.",
  },
  {
    title: "Voedingswaarden per maaltijd zijn schattingen",
    body: "De bronwaarden worden per 100 gram getoond. Als het maaltijdgewicht bekend is, tonen we daarnaast een berekende schatting voor de hele maaltijd.",
  },
  {
    title: "Bestellen doe je bij de aanbieder",
    body: "Maaltijd Finder is een vergelijkingssite en verwerkt zelf geen bestellingen of betalingen. Via de productlink ga je naar de website van de aanbieder.",
  },
];

export default function ExplanationPage() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">Maaltijd <span>Finder</span></Link>
          <nav className="nav-note site-nav">
            <Link href="/">Maaltijden</Link>
            <Link href="/aanbieders">Aanbieders</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="eyebrow">Duidelijk vergelijken</div>
          <h1>Zo werkt Maaltijd Finder.</h1>
          <p className="intro">
            We brengen productinformatie van aanbieders bij elkaar, zodat je maaltijden
            overzichtelijk kunt vergelijken. Dit is hoe je de informatie op de site leest.
          </p>
        </section>
        <section className="catalog" aria-label="Uitleg over vergelijken">
          <div className="catalog-heading">
            <div><div className="eyebrow">Onze uitgangspunten</div><h2>Vergelijken met duidelijke gegevens</h2></div>
          </div>
          <div className="product-grid">
            {principles.map((principle, index) => (
              <article className="product-card" key={principle.title}>
                <div className="product-content">
                  <div className="eyebrow">0{index + 1}</div>
                  <h3>{principle.title}</h3>
                  <p>{principle.body}</p>
                </div>
              </article>
            ))}
          </div>
          <section className="detail-panel">
            <h2>Let op bij bestellen</h2>
            <p>Prijzen, beschikbaarheid en productinformatie kunnen bij de aanbieder veranderen. Controleer daarom altijd de actuele informatie op de productpagina en de verpakking, zeker bij allergieën of dieetwensen.</p>
            <p>Een minimale bestelhoeveelheid of minimale bestelwaarde is een bestelvoorwaarde van de aanbieder. Die informatie staat los van de vergelijking van individuele maaltijden.</p>
            <Link className="product-link" href="/">Bekijk de maaltijden →</Link>
          </section>
        </section>
      </main>
      <footer>Maaltijd Finder · Onafhankelijk overzicht van productinformatie</footer>
    </>
  );
}
