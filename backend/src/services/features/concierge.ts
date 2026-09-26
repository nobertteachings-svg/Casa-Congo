import type { Language } from "../../i18n/messages.js";
import type { House } from "../houses.js";
import { sendTextMessage } from "../transport.js";

export interface ConciergeContent {
  checklist: string;
  negotiation: string;
  documents: string;
}

export function buildConciergeContent(house: House, lang: Language): ConciergeContent {
  const checklist = buildVisitChecklist(house);
  const negotiation =
    `Conseils de négociation :\n` +
        `• Demandez si le loyer inclut l'eau et l'électricité\n` +
        `• Proposez un bail plus long pour un meilleur tarif\n` +
        `• Vérifiez si le propriétaire accepte un paiement mensuel\n` +
        `• En RDC, convenez par écrit des frais d'agence avant de payer`;
  const documents =
    `Documents souvent demandés en RDC :\n` +
        `• Carte d'identité nationale, passeport ou permis de conduire\n` +
        `• Contrat de bail signé\n` +
        `• Reçu du loyer payé d'avance\n` +
        `• Dernière facture SNEL ou solde du compteur prépayé\n` +
        `• État des lieux (recommandé)`;
  return { checklist, negotiation, documents };
}

export async function sendPostUnlockConcierge(
  phone: string,
  house: House,
  lang: Language
): Promise<void> {
  const content = buildConciergeContent(house, lang);
  await sendTextMessage(phone, content.checklist);
  await sendTextMessage(
    phone,
    `🤝 *Conseils de négociation :*\n${content.negotiation}`);
  await sendTextMessage(
    phone,
    `📄 *Documents à emporter :*\n${content.documents}\n\nRépondez *BAIL* pour un modèle de contrat.`);
}

function meterChecklistItem(house: House): string {
  const meter = house.electricity_meter ?? (house.electricity ? "postpaid" : "none");
  if (meter === "prepaid") {
    return "✅ Vérifiez le compteur prépayé (SNEL) et le crédit restant";
  }
  if (meter === "postpaid") {
    return "✅ Vérifiez le compteur postpayé et les dernières factures SNEL";
  }
  return "⚠️ Pas d'électricité — confirmez avec le propriétaire";
}

function buildVisitChecklist(house: House): string {
  const items = [
    "✅ Vérifiez la pression d'eau à tous les robinets",
    meterChecklistItem(house),
    house.fenced ? "✅ Vérifiez le portail et la clôture" : "⚠️ Pas de clôture — renseignez-vous sur la sécurité du quartier",
    house.parking ? "✅ Confirmez la taille de la place de parking" : null,
    "✅ Cherchez moisissures, fuites et nuisibles",
    "✅ Visitez à différents moments de la journée (bruit)",
    "✅ Demandez aux voisins des nouvelles du quartier",
  ].filter(Boolean);
  return `📋 *Liste de visite pour ${house.house_id} :*\n${items.join("\n")}`;
}

