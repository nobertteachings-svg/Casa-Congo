export type Language = "en";
export type UserRole = "landlord" | "tenant";

export interface Messages {
  welcome: string;
  chooseRole: string;
  roleSet: (role: UserRole) => string;
  mainMenuLandlord: string;
  mainMenuTenant: string;
  invalidChoice: string;
  help: string;
  registered: string;
}

export const en: Messages = {
  welcome:
    "🏠 *Bienvenue sur Casa Congo !*\n\nTrouvez un logement en RDC sur l'application Casa Congo (iPhone et Android) ou ici sur WhatsApp.\n\nLa plateforme immobilière de la RD Congo.",
  chooseRole:
    "Êtes-vous propriétaire ou vous cherchez un logement ?\n\n*1.* 🏡 Je suis propriétaire\n*2.* 🔍 Je cherche un logement\n*3.* 🌍 J'ai un code de parrainage (numéro du parrain)",
  roleSet: (role) =>
    role === "landlord"
      ? "✅ Vous êtes enregistré comme *propriétaire*."
      : "✅ Vous êtes enregistré comme *locataire*.",
  mainMenuLandlord:
    "🏡 *Menu Propriétaire*\n\n*1.* Publier un bien\n*2.* Mes annonces\n*3.* Plus d'options (stats, vérif. ID, bail…)\n*4.* Aide\n\n🪪 Envoyez une pièce d'identité avec votre *nom* avant de publier\n🎥 Vidéo de visite obligatoire pour chaque annonce\n💡 Envoyez une *note vocale* à tout moment",
  mainMenuTenant:
    "🔍 *Menu Locataire*\n\n*1.* Chercher un logement\n*2.* Mes contacts débloqués\n*3.* Plus d'options (alertes, comparer, diaspora…)\n*4.* Aide\n\n💡 Envoyez une *note vocale* à tout moment",
  invalidChoice: "Appuyez sur une option ci-dessus, ou répondez avec un numéro valide.",
  help:
    "Casa Congo aide propriétaires et locataires en RD Congo — sur l'application et sur WhatsApp.\n\n*Locataires :* Recherche, alertes, comparaison, mode diaspora, carte des loyers.\n*Propriétaires :* Annonce IA, stats, gestion groupée, contrats de bail.\n*Confiance :* Badges vérifiés, signalements.\n*Croissance :* Parrainez des amis pour des crédits gratuits.\n\nSupport : répondez AIDE.",
  registered: "Votre compte Casa Congo est prêt. Voici ce que vous pouvez faire :",
};
