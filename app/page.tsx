export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/">Maaltijd <span>Finder</span></a>
          <div className="nav-note">Eerlijk vergelijken. Slim kiezen.</div>
        </div>
      </header>
      <main>
        <div className="eyebrow">De maaltijdvergelijker</div>
        <h1>Vind de maaltijd die bij je past.</h1>
        <p className="intro">
          Vergelijk kant-en-klaarmaaltijden van verschillende aanbieders op prijs,
          gewicht, voedingswaarden en bezorgvoorwaarden.
        </p>
        <section className="panel">
          <h2>We bouwen aan het aanbod</h2>
          <p>
            De basis van Maaltijd Finder staat. De volgende stap is het koppelen
            van de productdatabase en het vullen van de catalogus met gecontroleerde
            productinformatie. We tonen geen verzonnen productgegevens.
          </p>
          <div className="status"><span className="dot" /> Website in opbouw</div>
        </section>
      </main>
      <footer>Maaltijd Finder · Productinformatie wordt gecontroleerd en voorzien van een controledatum.</footer>
    </>
  );
}
