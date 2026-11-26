"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body>
        <main>
          <section className="hero">
            <div className="eyebrow">Er ging iets mis</div>
            <h1>De pagina kon niet goed worden geladen.</h1>
            <p className="intro">Probeer het opnieuw. Als het probleem blijft bestaan, kom later nog eens terug.</p>
            <button className="detail-cta" onClick={() => reset()}>Opnieuw proberen</button>
          </section>
        </main>
      </body>
    </html>
  );
}
