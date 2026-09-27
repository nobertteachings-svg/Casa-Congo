/** Grandes villes de RDC. */
export const MAJOR_TOWNS = [
  "Kinshasa",
  "Lubumbashi",
  "Goma",
  "Bukavu",
  "Kisangani",
  "Mbuji-Mayi",
  "Kananga",
  "Matadi",
  "Kolwezi",
  "Kikwit",
  "Bunia",
  "Kindu",
] as const;

export const NEIGHBOURHOODS: Record<string, string[]> = {
  Kinshasa: [
    "Gombe",
    "Ngaliema",
    "Lingwala",
    "Kintambo",
    "Bandalungwa",
    "Kasa-Vubu",
    "Limete",
    "Lemba",
    "Matete",
    "Masina",
    "Ndjili",
    "Kimbanseke",
    "Mont-Ngafula",
    "Ngaba",
    "Bumbu",
  ],
  Lubumbashi: ["Kenya", "Kampemba", "Annexe", "Kamalondo", "Rwashi"],
  Goma: ["Himbi", "Keshero", "Mabanga", "Ndosho", "Virunga"],
  Bukavu: ["Ibanda", "Kadutu", "Bagira"],
  Kisangani: ["Makiso", "Tshopo", "Mangobo"],
};

export const ALL_NEIGHBOURHOODS = Object.values(NEIGHBOURHOODS).flat();

export function neighbourhoodsForTown(town: string): string[] {
  const key = Object.keys(NEIGHBOURHOODS).find((k) => k.toLowerCase() === town.toLowerCase());
  return key ? NEIGHBOURHOODS[key] : ["Centre-ville", "Quartier résidentiel", "Quartier commercial"];
}

/** Typical monthly rent bands in CDF. */
export const RENT_PRESETS = [
  50000, 100000, 150000, 250000, 400000, 600000, 1000000, 2000000,
] as const;

export const MONTHS_UPFRONT_OPTIONS = [1, 2, 3, 6, 12] as const;
