export type Lang = "en";

const strings = {
  en: {
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    listings: "Annonces",
    moderation: "Modération",
    verifications: "Vérifications",
    payments: "Paiements",
    insights: "Analyses",
    settings: "Paramètres",
    audit: "Journal d'audit",
    signOut: "Déconnexion",
    search: "Rechercher téléphone, référence, quartier…",
    runAiAll: "Lancer l'IA sur tous les en attente",
    approve: "Approuver",
    reject: "Rejeter",
    verify: "Vérifier le propriétaire",
    suspend: "Suspendre",
    unsuspend: "Réactiver",
    export: "Exporter CSV",
    dark: "Sombre",
    light: "Clair",
    language: "FR",
  },
} as const;

export function t(lang: Lang, key: keyof (typeof strings)["en"]): string {
  return strings[lang][key];
}
