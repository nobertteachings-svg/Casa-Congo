import { Router, type Request, type Response } from "express";

const router = Router();

function page(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Casa Congo</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.55; max-width: 42rem; margin: 2rem auto; padding: 0 1.25rem; color: #122; }
    h1 { font-size: 1.75rem; margin-bottom: 0.35rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
    .muted { color: #456; font-size: 0.95rem; }
    a { color: #1a7a3c; }
  </style>
</head>
<body>
  <p class="muted"><a href="https://casahomesdrcongo.com">Casa Congo</a></p>
  ${bodyHtml}
</body>
</html>`;
}

router.get("/privacy", (_req: Request, res: Response) => {
  res
    .type("html")
    .send(
      page(
        "Politique de confidentialité",
        `
  <h1>Politique de confidentialité</h1>
  <p class="muted">Dernière mise à jour : 25 septembre 2026</p>
  <p>Casa Congo (« Casa », « nous ») propose une plateforme immobilière en RD Congo sur les applications iOS et Android Casa Congo, WhatsApp et casahomesdrcongo.com. Cette politique explique quelles données nous collectons et comment nous les utilisons. Nous traitons les données personnelles conformément aux <strong>lois de la République démocratique du Congo</strong>.</p>

  <h2>Données collectées</h2>
  <ul>
    <li>Numéro de téléphone et nom d'affichage lorsque vous utilisez l'app Casa Congo ou WhatsApp</li>
    <li>Messages envoyés (recherche, détails d'annonce, photos et vidéos)</li>
    <li>Position GPS que vous choisissez de partager</li>
    <li>Pièces d'identité des propriétaires (carte d'identité nationale / passeport)</li>
    <li>Journaux techniques nécessaires au fonctionnement et à la sécurité</li>
  </ul>

  <h2>Utilisation</h2>
  <ul>
    <li>Pour mettre en relation locataires et propriétaires</li>
    <li>Pour vérifier les propriétaires et améliorer la sécurité</li>
    <li>Pour exploiter, corriger et sécuriser la plateforme</li>
    <li>Pour vous contacter au sujet de votre compte ou d'une demande d'aide</li>
  </ul>

  <h2>Partage</h2>
  <p>Nous communiquons le numéro du propriétaire à un locataire uniquement après un déblocage. Nous utilisons des prestataires (Meta / WhatsApp, hébergement, IA) pour les fonctions que vous demandez. Nous ne vendons pas vos données.</p>

  <h2>Conservation</h2>
  <p>Nous conservons les données du compte et des annonces tant que le compte est actif, et autant que nécessaire pour la sécurité, la loi et l'exploitation. Vous pouvez demander la suppression (voir ci-dessous).</p>

  <h2>Suppression des données</h2>
  <p>Pour supprimer vos données Casa Congo :</p>
  <ol>
    <li>Ouvrez l'application Casa Congo → Compte → demander la suppression, ou</li>
    <li>Écrivez à <strong>Casa sur WhatsApp</strong> (+243 812 356 774), ou</li>
    <li>Email <a href="mailto:hello@casahomesdrcongo.com">hello@casahomesdrcongo.com</a> depuis le numéro ou l'e-mail lié à votre compte, objet « Supprimer mes données ».</li>
  </ol>
  <p>Nous supprimons ou anonymisons les données personnelles dans un délai raisonnable, sauf obligation légale, lutte contre la fraude ou sécurité.</p>

  <h2>Vos droits</h2>
  <p>Vous pouvez demander l'accès, la correction, la suppression ou la limitation de vos données, et saisir les autorités compétentes en RDC.</p>

  <h2>Droit applicable</h2>
  <p>Cette politique est régie par les lois de la République démocratique du Congo. Kinshasa est notre principal lieu d'activité.</p>

  <h2>Contact</h2>
  <p>Email: <a href="mailto:hello@casahomesdrcongo.com">hello@casahomesdrcongo.com</a><br/>
  Website: <a href="https://casahomesdrcongo.com">casahomesdrcongo.com</a></p>
`
      )
    );
});

router.get("/terms", (_req: Request, res: Response) => {
  res
    .type("html")
    .send(
      page(
        "Conditions d'utilisation",
        `
  <h1>Conditions d'utilisation</h1>
  <p class="muted">Dernière mise à jour : 25 septembre 2026</p>
  <p>En utilisant Casa Congo (app, WhatsApp ou casahomesdrcongo.com), vous acceptez ces conditions. Casa Congo est une plateforme immobilière en RD Congo, régie par le droit congolais.</p>

  <h2>Qu'est-ce que Casa</h2>
  <p>Casa Congo aide les propriétaires à publier et les locataires à trouver un logement. Casa est une plateforme technique. Nous ne sommes ni bailleur, ni agence, ni partie au bail.</p>

  <h2>Vos responsabilités</h2>
  <ul>
    <li>Fournir des informations exactes</li>
    <li>Utiliser le service de façon licite et respectueuse</li>
    <li>Propriétaires : ne publiez que des biens que vous êtes autorisé à louer</li>
    <li>Locataires : visitez avant de payer un loyer ou une caution</li>
  </ul>

  <h2>Pas d'intermédiaires abusifs</h2>
  <p>Casa relie propriétaires et locataires directement. N'utilisez pas Casa pour des pratiques d'agence abusives.</p>

  <h2>Paiements</h2>
  <p>Les éventuels frais de déblocage seront indiqués dans le produit, en francs congolais (CDF). Le loyer se paie entre locataire et propriétaire, sauf mention contraire claire.</p>

  <h2>Contenus</h2>
  <p>Vous accordez à Casa une licence pour stocker et afficher vos annonces afin d'exploiter le service. N'envoyez pas de contenu illégal.</p>

  <h2>Avertissement</h2>
  <p>Les annonces sont fournies par les utilisateurs. Casa ne garantit ni la disponibilité ni l'issue d'une location. Visitez avant de payer.</p>

  <h2>Droit applicable</h2>
  <p>Ces conditions sont régies par le droit de la RDC. Les litiges relèvent des juridictions de Kinshasa.</p>

  <h2>Contact</h2>
  <p><a href="mailto:hello@casahomesdrcongo.com">hello@casahomesdrcongo.com</a></p>
  <p>Voir aussi notre <a href="/privacy">politique de confidentialité</a>.</p>
`
      )
    );
});

export { router as legalRouter };
