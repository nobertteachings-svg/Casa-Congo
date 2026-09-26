/** 26 provinces of the DRC — keep in sync with backend property-taxonomy. */
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

export type RegionId = (typeof DRC_PROVINCES)[number]["id"];

export function regionLabel(id: string, lang?: "fr" | "en"): string {
  const r = DRC_PROVINCES.find((x) => x.id === id);
  if (!r) return id;
  return r.en;
}
