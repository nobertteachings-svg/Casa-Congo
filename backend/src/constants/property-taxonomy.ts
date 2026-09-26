import type { Language } from "../i18n/messages.js";

/** 26 provinces of the DRC. */
export const DRC_PROVINCES = [
  { id: "kinshasa", en: "Kinshasa", sw: "Kinshasa" },
  { id: "kongo_central", en: "Kongo-Central", sw: "Kongo-Central" },
  { id: "kwango", en: "Kwango", sw: "Kwango" },
  { id: "kwilu", en: "Kwilu", sw: "Kwilu" },
  { id: "mai_ndombe", en: "Mai-Ndombe", sw: "Mai-Ndombe" },
  { id: "equateur", en: "Équateur", sw: "Équateur" },
  { id: "mongala", en: "Mongala", sw: "Mongala" },
  { id: "nord_ubangi", en: "Nord-Ubangi", sw: "Nord-Ubangi" },
  { id: "sud_ubangi", en: "Sud-Ubangi", sw: "Sud-Ubangi" },
  { id: "tshuapa", en: "Tshuapa", sw: "Tshuapa" },
  { id: "tshopo", en: "Tshopo", sw: "Tshopo" },
  { id: "bas_uele", en: "Bas-Uele", sw: "Bas-Uele" },
  { id: "haut_uele", en: "Haut-Uele", sw: "Haut-Uele" },
  { id: "ituri", en: "Ituri", sw: "Ituri" },
  { id: "nord_kivu", en: "Nord-Kivu", sw: "Nord-Kivu" },
  { id: "sud_kivu", en: "Sud-Kivu", sw: "Sud-Kivu" },
  { id: "maniema", en: "Maniema", sw: "Maniema" },
  { id: "haut_katanga", en: "Haut-Katanga", sw: "Haut-Katanga" },
  { id: "lualaba", en: "Lualaba", sw: "Lualaba" },
  { id: "haut_lomami", en: "Haut-Lomami", sw: "Haut-Lomami" },
  { id: "tanganyika", en: "Tanganyika", sw: "Tanganyika" },
  { id: "lomami", en: "Lomami", sw: "Lomami" },
  { id: "sankuru", en: "Sankuru", sw: "Sankuru" },
  { id: "kasai", en: "Kasaï", sw: "Kasaï" },
  { id: "kasai_central", en: "Kasaï-Central", sw: "Kasaï-Central" },
  { id: "kasai_oriental", en: "Kasaï-Oriental", sw: "Kasaï-Oriental" },
] as const;

/** @deprecated Use DRC_PROVINCES */
export const KENYA_COUNTIES = DRC_PROVINCES;

/** Common aliases people type instead of the official province id. */
const REGION_ALIASES: Record<string, (typeof DRC_PROVINCES)[number]["id"]> = {
  kinshasa: "kinshasa",
  kin: "kinshasa",
  gombe: "kinshasa",
  ngaliema: "kinshasa",
  limete: "kinshasa",
  masina: "kinshasa",
  ndjili: "kinshasa",
  lubumbashi: "haut_katanga",
  goma: "nord_kivu",
  bukavu: "sud_kivu",
  kisangani: "tshopo",
  "mbuji-mayi": "kasai_oriental",
  mbujimayi: "kasai_oriental",
  kananga: "kasai_central",
  matadi: "kongo_central",
  kolwezi: "lualaba",
  kikwit: "kwilu",
  "kongo central": "kongo_central",
  "nord kivu": "nord_kivu",
  "sud kivu": "sud_kivu",
  "haut katanga": "haut_katanga",
  "kasai oriental": "kasai_oriental",
  "kasai central": "kasai_central",
};

/** @deprecated Use DRC_PROVINCES */
export const KENYA_REGIONS = DRC_PROVINCES;

export type PropertyCategory = "residential" | "commercial";

/**
 * How people advertise homes in Kinshasa, Lubumbashi, Goma.
 * Menu IDs can change; old listing IDs still resolve via aliases + hidden labels.
 */
export const RESIDENTIAL_SUBTYPES = [
  { id: "single_room", en: "Chambre", sw: "Chambre" },
  { id: "studio", en: "Studio", sw: "Studio" },
  { id: "one_bedroom", en: "2 pièces", sw: "2 pièces" },
  { id: "two_bedroom", en: "3 pièces", sw: "3 pièces" },
  { id: "three_bedroom_plus", en: "4 pièces", sw: "4 pièces" },
  { id: "appartement", en: "Appartement", sw: "Appartement" },
  { id: "bungalow", en: "Villa", sw: "Villa" },
  { id: "parcelle", en: "Parcelle", sw: "Parcelle" },
  { id: "servant_quarter", en: "Boyerie", sw: "Boyerie" },
  { id: "maisonette", en: "Duplex", sw: "Duplex" },
] as const;

/** Old Kenya-fork IDs still stored on listings. */
const HIDDEN_RESIDENTIAL_LABELS = [
  { id: "double_room", en: "Chambre", sw: "Chambre" },
  { id: "bedsitter", en: "Studio", sw: "Studio" },
] as const;

/** Map legacy fork subtype ids → current ids (read-path safety). */
const LEGACY_SUBTYPE_ALIASES: Record<string, string> = {
  single_room_basic: "single_room",
  single_room_toilet: "studio",
  single_room_toilet_kitchen: "studio",
  apartment_2room_1toilet: "two_bedroom",
  apartment_2room_2toilet: "two_bedroom",
  apartment_3room_plus: "three_bedroom_plus",
  standalone_house: "bungalow",
  sq: "servant_quarter",
  "servant quarters": "servant_quarter",
  "double rooms": "single_room",
  double_room: "single_room",
  bedsitter: "studio",
  chambre: "single_room",
  "chambre simple": "single_room",
  "chambre double": "single_room",
  villa: "bungalow",
  maison: "bungalow",
  parcelle: "parcelle",
  appartement: "appartement",
  apartment: "appartement",
  boyerie: "servant_quarter",
  annexe: "servant_quarter",
  duplex: "maisonette",
  "2 pieces": "one_bedroom",
  "2 pièces": "one_bedroom",
  "chambre salon": "one_bedroom",
  f2: "one_bedroom",
  "3 pieces": "two_bedroom",
  "3 pièces": "two_bedroom",
  f3: "two_bedroom",
  "4 pieces": "three_bedroom_plus",
  "4 pièces": "three_bedroom_plus",
  f4: "three_bedroom_plus",
};

export const COMMERCIAL_SUBTYPES = [
  { id: "shop", en: "Boutique / local commercial", sw: "Duka / nafasi ya biashara" },
  { id: "office", en: "Bureau", sw: "Ofisi" },
  { id: "warehouse", en: "Hangar / entrepôt", sw: "Hangar / entrepôt" },
  { id: "restaurant", en: "Restaurant / bar / café", sw: "Restaurant / bar / café" },
  { id: "salon", en: "Salon / coiffure", sw: "Saluni / kinyozi" },
  { id: "workshop", en: "Atelier / garage", sw: "Warsha / garaji" },
  { id: "showroom", en: "Showroom", sw: "Showroom" },
  { id: "commercial_space", en: "Autre local commercial", sw: "Nafasi nyingine ya biashara" },
] as const;

export type PropertySubtype =
  | (typeof RESIDENTIAL_SUBTYPES)[number]["id"]
  | (typeof COMMERCIAL_SUBTYPES)[number]["id"];

function normalizeSubtypeId(subtypeId: string): string {
  return LEGACY_SUBTYPE_ALIASES[subtypeId] ?? subtypeId;
}

export function regionLabel(regionId: string, lang?: Language): string {
  const r = DRC_PROVINCES.find((x) => x.id === regionId);
  if (!r) return regionId;
  return r.en;
}

export function subtypeLabel(subtypeId: string, lang?: Language): string {
  const id = normalizeSubtypeId(subtypeId);
  const all = [...RESIDENTIAL_SUBTYPES, ...HIDDEN_RESIDENTIAL_LABELS, ...COMMERCIAL_SUBTYPES];
  const s = all.find((x) => x.id === id);
  if (!s) return subtypeId;
  return s.en;
}

export function categoryLabel(category: PropertyCategory, lang?: Language): string {
  if (category === "commercial") return "Commercial";
  return "Résidentiel";
}

/** Display label for a listing type in the mobile API. */
export function formatResidentialTypeLabel(
  house: { type?: string; property_subtype?: string; property_category?: string },
  lang: Language
): string {
  if (house.property_subtype) return subtypeLabel(house.property_subtype, lang);
  if (house.property_category === "commercial" || house.property_category === "residential") {
    return categoryLabel(house.property_category, lang);
  }
  return house.type?.trim() || "Logement";
}

export function formatRegionMenu(lang: Language): string {
  const lines = DRC_PROVINCES.map(
    (r, i) => `*${i + 1}.* ${r.en}`
  );
  const header =
    "Choisissez la province :";
  return `${header}\n\n${lines.join("\n")}`;
}

export function formatSubtypeMenu(category: PropertyCategory, lang: Language): string {
  const list = category === "residential" ? RESIDENTIAL_SUBTYPES : COMMERCIAL_SUBTYPES;
  const lines = list.map((s, i) => `*${i + 1}.* ${s.en}`);
  const header =
    category === "residential"
        ? "Type de logement :"
        : "Type de local commercial :";
  return `${header}\n\n${lines.join("\n")}`;
}

export function parseRegionChoice(choice: string): string | null {
  const trimmed = choice.trim();
  const idx = parseInt(trimmed, 10);
  if (
    Number.isInteger(idx) &&
    String(idx) === trimmed &&
    idx >= 1 &&
    idx <= DRC_PROVINCES.length
  ) {
    return DRC_PROVINCES[idx - 1].id;
  }

  const lower = trimmed.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const compact = lower.replace(/\s+/g, "");
  const underscored = lower.replace(/\s+/g, "_");

  const alias = REGION_ALIASES[lower] ?? REGION_ALIASES[compact];
  if (alias) return alias;

  const match = DRC_PROVINCES.find(
    (r) =>
      r.id === underscored ||
      r.id === compact ||
      r.en.toLowerCase() === lower ||
      r.sw.toLowerCase() === lower ||
      r.en.toLowerCase().replace(/[()']/g, "").trim() === lower
  );
  return match?.id ?? null;
}

/** Comma-separated province ids for AI prompts (kept in sync with DRC_PROVINCES). */
export function congoProvinceIdsForPrompt(): string {
  return DRC_PROVINCES.map((s) => s.id).join(", ");
}

export function parseSubtypeChoice(
  choice: string,
  category: PropertyCategory
): string | null {
  const list = category === "residential" ? RESIDENTIAL_SUBTYPES : COMMERCIAL_SUBTYPES;
  const trimmed = choice.trim();
  const idx = parseInt(trimmed, 10);
  if (Number.isInteger(idx) && String(idx) === trimmed && idx >= 1 && idx <= list.length) {
    return list[idx - 1].id;
  }

  const lower = trimmed.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const byAlias =
    LEGACY_SUBTYPE_ALIASES[trimmed] ??
    LEGACY_SUBTYPE_ALIASES[lower] ??
    LEGACY_SUBTYPE_ALIASES[lower.replace(/\s+/g, "_")];
  if (byAlias && category === "residential") return byAlias;

  const match = list.find(
    (s) =>
      s.id === lower.replace(/\s+/g, "_") ||
      s.en.toLowerCase() === lower ||
      s.en.toLowerCase().startsWith(lower) ||
      s.id.replace(/_/g, " ") === lower
  );
  return match?.id ?? null;
}

export function parseCategoryChoice(choice: string): PropertyCategory | null {
  const c = choice.trim().toLowerCase();
  if (c === "1" || c.includes("resident") || c.includes("logement") || c.includes("maison") || c.includes("parcelle") || c.includes("villa")) return "residential";
  if (c === "2" || c.includes("commercial") || c.includes("business") || c.includes("boutique")) return "commercial";
  return null;
}

/** Map subtype to legacy `type` column for DB compatibility */
export function legacyTypeFromSubtype(subtype: string): string {
  const id = normalizeSubtypeId(subtype);
  if (id === "single_room" || id === "double_room" || id === "bedsitter" || id === "servant_quarter") {
    return "room";
  }
  if (
    id === "studio" ||
    id === "one_bedroom" ||
    id === "two_bedroom" ||
    id === "three_bedroom_plus" ||
    id === "appartement" ||
    id === "maisonette" ||
    id === "bungalow" ||
    id === "parcelle"
  ) {
    return "apartment";
  }
  if (
    ["shop", "office", "warehouse", "restaurant", "salon", "workshop", "showroom", "commercial_space"].includes(
      id
    )
  ) {
    return "apartment";
  }
  return "room";
}

export const ELECTRICITY_METER_TYPES = [
  { id: "none", en: "Pas d'électricité", sw: "Hakuna umeme" },
  { id: "prepaid", en: "Compteur prépayé (SNEL)", sw: "Compteur prépayé (SNEL)" },
  { id: "postpaid", en: "Compteur postpayé (facture SNEL)", sw: "Compteur postpayé (SNEL)" },
] as const;

export type ElectricityMeter = (typeof ELECTRICITY_METER_TYPES)[number]["id"];

export function electricityMeterLabel(meter: string, lang: Language): string {
  const m = ELECTRICITY_METER_TYPES.find((x) => x.id === meter);
  if (!m) return meter;
  return m.en;
}

export function formatElectricityMeterMenu(lang: Language): string {
  const lines = ELECTRICITY_METER_TYPES.map(
    (m, i) => `*${i + 1}.* ${m.en}`
  );
  const header =
    "Type de compteur électrique :";
  return `${header}\n\n${lines.join("\n")}`;
}

export function parseElectricityMeterChoice(choice: string): ElectricityMeter | null {
  const idx = parseInt(choice.trim(), 10);
  if (idx >= 1 && idx <= ELECTRICITY_METER_TYPES.length) {
    return ELECTRICITY_METER_TYPES[idx - 1].id;
  }
  const lower = choice.trim().toLowerCase();
  if (["none", "no", "non", "pas", "hakuna"].some((w) => lower.includes(w))) return "none";
  if (
    lower.includes("prepaid") ||
    lower.includes("token") ||
    lower.includes("prépayé") ||
    lower.includes("prepaye") ||
    lower.includes("snel")
  ) {
    return "prepaid";
  }
  if (lower.includes("postpaid") || lower.includes("postpayé") || lower.includes("postpaye") || lower.includes("bill")) {
    return "postpaid";
  }
  return null;
}

export function formatFacilitiesSummary(
  draft: {
    fenced?: boolean;
    parking?: boolean;
    standby_generator?: boolean;
    borehole?: boolean;
    water?: boolean;
    electricity_meter?: ElectricityMeter;
    furnished?: boolean;
    security?: boolean;
  },
  lang: Language
): string {
  const boolItems = [
    { key: "fenced", en: "Clôturé / gardienné", sw: "Eneo lenye lango / ua" },
    { key: "parking", en: "Parking", sw: "Parking" },
    { key: "standby_generator", en: "Groupe électrogène", sw: "Umeme wa akiba / jenereta" },
    { key: "borehole", en: "Forage / réserve d'eau", sw: "Kisima / tanki la maji" },
    { key: "water", en: "Eau régulière", sw: "Maji ya kutegemewa" },
    { key: "furnished", en: "Meublé", sw: "Imewekewa samani" },
    { key: "security", en: "Gardien / sentinelle", sw: "Gardien / sentinelle" },
  ] as const;

  const lines = boolItems.map(({ key, en, sw }) => {
    const val = draft[key as keyof typeof draft];
    const yes = "Oui";
    const no = "Non";
    const label = en;
    return `${label}: ${val ? yes : no}`;
  });

  if (draft.electricity_meter) {
    lines.push(
      `${"Électricité"}: ${electricityMeterLabel(draft.electricity_meter, lang)}`
    );
  }

  return lines.join("\n");
}
