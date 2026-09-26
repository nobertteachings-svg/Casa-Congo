import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithApiKey } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithApiKey(key.trim());
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clé API invalide. Vérifiez ADMIN_API_KEY dans votre fichier .env.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand brand--center">
          <img
            src="/casa_logo_mark_master_1024.png"
            alt="Casa Congo"
            className="brand-logo"
          />
          <div>
            <h1>Admin</h1>
            <p>Tableau de bord Casa Congo</p>
          </div>
        </div>
        <label htmlFor="api-key">Admin API Key</label>
        <input
          id="api-key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Entrez ADMIN_API_KEY"
          required
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || !key.trim()}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <p className="login-hint">
          Votre clé est échangée contre un jeton de session temporaire et n'est pas stockée dans le navigateur.
        </p>
      </form>
    </div>
  );
}
