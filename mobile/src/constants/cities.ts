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
