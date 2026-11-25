"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 10) { setMessage("Kies een wachtwoord van minimaal 10 tekens."); return; }
    if (password !== confirmation) { setMessage("De wachtwoorden zijn niet gelijk."); return; }
    if (!supabase) { setMessage("Supabase is niet ingesteld."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage("Het wachtwoord kon niet worden gewijzigd. Vraag via de beheerlogin een nieuwe herstellink aan."); return; }
    setMessage("Je wachtwoord is gewijzigd. Je kunt nu inloggen.");
    window.setTimeout(() => { window.location.href = "/beheer/import"; }, 1200);
  }

  return <>
    <header className="topbar"><div className="topbar-inner"><Link className="brand" href="/">Maaltijd <span>Finder</span></Link><nav className="nav-note site-nav"><Link href="/beheer/import">Beheerlogin</Link><Link href="/">Website</Link></nav></div></header>
    <main>
      <section className="hero"><div className="eyebrow">Beveiligd beheer</div><h1>Nieuw wachtwoord instellen</h1><p className="intro">Kies een nieuw wachtwoord voor je beheeraccount.</p></section>
      <form className="admin-login detail-panel" onSubmit={updatePassword}>
        <label>Nieuw wachtwoord<input type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Herhaal wachtwoord<input type="password" autoComplete="new-password" minLength={10} required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
        <button className="detail-cta" disabled={busy}>{busy ? "Opslaan…" : "Wachtwoord opslaan"}</button>
        {message && <p className="admin-feedback">{message}</p>}
      </form>
    </main>
    <footer>Maaltijd Finder · Beveiligd beheer</footer>
  </>;
}