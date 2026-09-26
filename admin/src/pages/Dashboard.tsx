import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import ErrorBanner from "../components/ErrorBanner";
import { BarChart } from "../components/BarChart";
import type { DashboardStats } from "../types";
import { formatDate, formatCdf } from "../utils";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError("");
    api
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="page-loading">Chargement du tableau de bord…</p>;
  if (error) {
    return (
      <div className="page">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }
  if (!stats) return null;

  const ops = stats.ops;
  const charts = stats.charts;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>Tableau de bord</h2>
          <p>Vue d'ensemble de la plateforme et des revenus</p>
        </div>
        <div className="header-pills">
          {stats.badges && stats.badges.moderation > 0 && (
            <Link to="/moderation" className="alert-pill">{stats.badges.moderation} modération</Link>
          )}
          {stats.badges && stats.badges.verifications > 0 && (
            <Link to="/verifications" className="alert-pill">{stats.badges.verifications} vérifications</Link>
          )}
        </div>
      </header>

      <section className="ops-panel panel">
        <h3>WhatsApp et santé du système</h3>
        <div className="ops-grid">
          <span>WhatsApp : {stats.health?.whatsapp ? "✅ Connecté" : "❌ Non configuré"}</span>
          <span>Dernier webhook : {ops?.lastWebhookAt ? formatDate(ops.lastWebhookAt) : "—"}</span>
          <span>Messages (24 h) : {ops?.messagesLast24h ?? 0}</span>
          <span>Échecs IA (24 h) : {ops?.aiFailuresLast24h ?? 0}</span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Utilisateurs" value={stats.users.total} sub={`+${stats.users.newToday} aujourd'hui`} accent="blue" />
        <StatCard label="Propriétaires" value={stats.users.landlords} accent="green" />
        <StatCard label="Annonces actives" value={stats.listings.active} sub={`${stats.listings.flagged} signalées`} accent="gold" />
        <StatCard label="Revenus (mois)" value={formatCdf(stats.revenue.earningsThisMonthCdf)} accent="gold" />
        <StatCard label="Déblocages aujourd'hui" value={stats.revenue.unlocksToday} sub={formatCdf(stats.revenue.earningsTodayCdf)} accent="green" />
        <StatCard label="Avis en attente" value={stats.moderation.pendingReviews} accent="red" />
      </section>

      {charts && (
        <div className="two-col">
          <section className="panel">
            <h3>Déblocages (30 jours)</h3>
            <BarChart data={charts.unlocksByDay} labelKey="date" valueKey="count" />
          </section>
          <section className="panel">
            <h3>Inscriptions (30 jours)</h3>
            <BarChart
              data={charts.signupsByDay.map((d) => ({
                date: d.date,
                count: d.landlords + d.tenants,
              }))}
              labelKey="date"
              valueKey="count"
            />
          </section>
        </div>
      )}

      {charts && (
        <section className="panel">
          <h3>Entonnoir de conversion</h3>
          <div className="funnel">
            <div><strong>{charts.funnel.searches}</strong> recherches</div>
            <div>→</div>
            <div><strong>{charts.funnel.listingViews}</strong> vues d'annonces</div>
            <div>→</div>
            <div><strong>{charts.funnel.unlocks}</strong> déblocages</div>
          </div>
        </section>
      )}

      <div className="two-col">
        <section className="panel">
          <h3>Quartiers les plus actifs</h3>
          <ul className="bar-list">
            {stats.topNeighbourhoods.map((n) => (
              <li key={n.neighbourhood}>
                <span>{n.neighbourhood}</span>
                <strong>{n.count}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3>Déblocages récents</h3>
          <table className="data-table compact">
            <thead><tr><th>Annonce</th><th>Locataire</th><th>Montant</th></tr></thead>
            <tbody>
              {stats.recentUnlocks.map((u) => (
                <tr key={u.id}>
                  <td><code>{u.house_id}</code></td>
                  <td>{u.tenant_phone}</td>
                  <td>{formatCdf(u.amount_paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
