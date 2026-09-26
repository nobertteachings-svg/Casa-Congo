import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { formatCdf } from "../utils";

export default function SettingsPage() {
  const [fee, setFee] = useState(5000);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSettings().then((s) => setFee(s.unlockFeeCdf)).catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.setUnlockFee(fee);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Paramètres</h2>
          <p>Tarifs et configuration de la plateforme</p>
        </div>
      </header>

      <form className="panel settings-form" onSubmit={handleSubmit}>
        <h3>Frais de déblocage</h3>
        <p className="muted">Montant payé par le locataire pour voir le contact du propriétaire (CDF)</p>
        <label>
          Frais (CDF)
          <input type="number" min={500} step={500} value={fee} onChange={(e) => setFee(parseInt(e.target.value, 10))} />
        </label>
        <p>Aperçu : {formatCdf(fee)} par déblocage</p>
        {error && <p className="error">{error}</p>}
        {saved && <p className="success">Enregistré — s'applique aux nouveaux déblocages</p>}
        <button type="submit" className="btn-primary">Enregistrer le tarif</button>
      </form>

      <section className="panel">
        <h3>Session</h3>
        <p className="muted">Les sessions navigateur expirent après 8 heures. La clé API admin n'est jamais stockée localement.</p>
      </section>
    </div>
  );
}
