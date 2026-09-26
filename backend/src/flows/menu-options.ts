import { subtypeLabel } from "../constants/property-taxonomy.js";
import type { Language, UserRole } from "../i18n/messages.js";
import type { MenuOption } from "../services/whatsapp.js";

export function roleMenuOptions(_lang: Language = "en"): MenuOption[] {
  return [
    { id: "1", title: "Propriétaire", description: "Publier un bien" },
    { id: "2", title: "Locataire", description: "Trouver un logement" },
    { id: "3", title: "Parrainage", description: "Numéro du parrain" },
  ];
}

export function mainMenuOptions(role: UserRole, _lang: Language = "en"): MenuOption[] {
  if (role === "landlord") {
    return [
      { id: "1", title: "Publier un bien" },
      { id: "2", title: "Mes annonces" },
      { id: "3", title: "Plus d'options" },
      { id: "4", title: "Aide" },
    ];
  }

  return [
    { id: "1", title: "Chercher" },
    { id: "2", title: "Contacts débloqués" },
    { id: "3", title: "Plus d'options" },
    { id: "4", title: "Aide" },
  ];
}

export function categoryMenuOptions(_lang: Language): MenuOption[] {
  return [
    { id: "1", title: "Résidentiel", description: "Logement" },
    { id: "2", title: "Commercial", description: "Boutique, bureau…" },
    { id: "3", title: "Les deux" },
  ];
}

export function listingModeMenuOptions(_lang: Language): MenuOption[] {
  return [
    { id: "1", title: "Décrire (IA)" },
    { id: "2", title: "Étape par étape" },
    { id: "3", title: "Retour au menu" },
  ];
}

export function propertyCategoryMenuOptions(_lang: Language): MenuOption[] {
  return [
    { id: "1", title: "Résidentiel", description: "Logement" },
    { id: "2", title: "Commercial", description: "Boutique, bureau…" },
  ];
}

export function tenantSubmenuOptions(_lang: Language): MenuOption[] {
  return [
    { id: "1", title: "Alerte recherche" },
    { id: "2", title: "Comparer" },
    { id: "3", title: "Mode diaspora" },
    { id: "4", title: "Badge vérifié" },
    { id: "5", title: "Parrainer" },
    { id: "6", title: "Carte des loyers" },
  ];
}

export function landlordSubmenuOptions(_lang: Language = "en"): MenuOption[] {
  return [
    { id: "1", title: "Statistiques" },
    { id: "2", title: "Modèle de bail" },
    { id: "3", title: "Gestion groupée" },
    { id: "4", title: "Parrainer" },
    { id: "5", title: "Tendances" },
    { id: "6", title: "Vérifier l'identité" },
  ];
}

export function verificationMethodOptions(_lang: Language = "en"): MenuOption[] {
  return [
    { id: "1", title: "Pièce d'identité" },
    { id: "2", title: "Compte bancaire" },
  ];
}

export function houseSelectOptions(
  houses: Array<{ house_id: string; type: string; rent: number; property_subtype?: string | null }>
): MenuOption[] {
  return houses.map((h, i) => {
    const kind = h.property_subtype ? subtypeLabel(h.property_subtype) : h.type;
    return {
      id: String(i + 1),
      title: `${h.house_id}`.slice(0, 24),
      description: `${kind}, ${h.rent.toLocaleString("fr-CD")} CDF`.slice(0, 72),
    };
  });
}

export function houseActionOptions(_lang: Language, withPayment: boolean): MenuOption[] {
  if (withPayment) {
    return [
      { id: "paid", title: "J'ai payé" },
      { id: "save", title: "Sauver" },
      { id: "flag", title: "Signaler" },
    ];
  }
  return [
    { id: "save", title: "Sauver" },
    { id: "flag", title: "Signaler" },
    { id: "menu", title: "Retour au menu" },
  ];
}

export function menuButtonLabel(_lang: Language): string {
  return "Voir les options";
}

export function landlordListingPickerOptions(
  houses: Array<{ house_id: string; type: string; rent: number; status: string; property_subtype?: string | null }>,
  _lang: Language
): MenuOption[] {
  return houses.slice(0, 10).map((h) => {
    const status = h.status === "active" ? "en ligne" : "loué";
    const kind = h.property_subtype ? subtypeLabel(h.property_subtype) : h.type;
    return {
      id: h.house_id,
      title: h.house_id.slice(0, 24),
      description: `${kind}, ${h.rent.toLocaleString("fr-CD")} CDF · ${status}`.slice(0, 72),
    };
  });
}

export function landlordListingActionOptions(_lang: Language, status: string): MenuOption[] {
  if (status === "inactive") {
    return [
      { id: "reactivate", title: "Remettre en ligne" },
      { id: "menu", title: "Retour à la liste" },
    ];
  }

  return [
    { id: "rented", title: "Marquer comme loué" },
    { id: "menu", title: "Retour à la liste" },
  ];
}

export function flagReasonOptions(_lang: Language): MenuOption[] {
  return [
    { id: "rented", title: "Déjà loué" },
    { id: "other", title: "Autre problème" },
  ];
}
