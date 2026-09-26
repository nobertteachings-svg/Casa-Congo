import type { Language } from "../api/client";

/** DRC residential types — keys stay aligned with backend property-taxonomy. */
export const RESIDENTIAL_SUBTYPES = [
  { id: "1", key: "single_room", en: "Chambre", sw: "Chambre" },
  { id: "2", key: "studio", en: "Studio", sw: "Studio" },
  { id: "3", key: "one_bedroom", en: "2 pièces", sw: "2 pièces" },
  { id: "4", key: "two_bedroom", en: "3 pièces", sw: "3 pièces" },
  { id: "5", key: "three_bedroom_plus", en: "4 pièces", sw: "4 pièces" },
  { id: "6", key: "appartement", en: "Appartement", sw: "Appartement" },
  { id: "7", key: "bungalow", en: "Villa", sw: "Villa" },
  { id: "8", key: "parcelle", en: "Parcelle", sw: "Parcelle" },
  { id: "9", key: "servant_quarter", en: "Boyerie", sw: "Boyerie" },
  { id: "10", key: "maisonette", en: "Duplex", sw: "Duplex" },
] as const;

export const COMMERCIAL_SUBTYPES = [
  { id: "1", key: "shop", en: "Boutique", sw: "Boutique" },
  { id: "2", key: "office", en: "Bureau", sw: "Bureau" },
  { id: "3", key: "warehouse", en: "Hangar / entrepôt", sw: "Hangar / entrepôt" },
  { id: "4", key: "restaurant", en: "Restaurant / bar", sw: "Restaurant / bar" },
  { id: "5", key: "salon", en: "Salon", sw: "Salon" },
  { id: "6", key: "workshop", en: "Atelier / garage", sw: "Atelier / garage" },
  { id: "7", key: "showroom", en: "Showroom", sw: "Showroom" },
  { id: "8", key: "commercial_space", en: "Autre local commercial", sw: "Autre local commercial" },
] as const;

export const ELECTRICITY_OPTIONS = [
  { id: "1", key: "none", en: "Pas d'électricité", sw: "Pas d'électricité" },
  { id: "2", key: "prepaid", en: "Compteur prépayé (SNEL)", sw: "Compteur prépayé" },
  { id: "3", key: "postpaid", en: "Compteur postpayé (SNEL)", sw: "Compteur postpayé" },
] as const;

export function subtypeLabel(id: string, lang: Language, category: "residential" | "commercial"): string {
  const hidden: Record<string, string> = { double_room: "Chambre", bedsitter: "Studio" };
  if (hidden[id]) return hidden[id];
  const list = category === "residential" ? RESIDENTIAL_SUBTYPES : COMMERCIAL_SUBTYPES;
  const item = list.find((x) => x.id === id || x.key === id);
  if (!item) return id;
  return item.en;
}

/** Bedroom / bathroom count prompts for larger homes. */
export function residentialSubtypeNeedsCounts(key: string): boolean {
  return (
    key === "one_bedroom" ||
    key === "two_bedroom" ||
    key === "three_bedroom_plus" ||
    key === "appartement" ||
    key === "maisonette" ||
    key === "bungalow" ||
    key === "parcelle" ||
    key === "studio"
  );
}
