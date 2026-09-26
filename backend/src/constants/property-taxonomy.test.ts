import { describe, expect, it } from "vitest";
import {
  DRC_PROVINCES,
  COMMERCIAL_SUBTYPES,
  RESIDENTIAL_SUBTYPES,
  categoryLabel,
  electricityMeterLabel,
  formatElectricityMeterMenu,
  formatSubtypeMenu,
  legacyTypeFromSubtype,
  parseCategoryChoice,
  parseElectricityMeterChoice,
  parseRegionChoice,
  parseSubtypeChoice,
  subtypeLabel,
} from "../constants/property-taxonomy.js";

describe("property taxonomy", () => {
  it("lists all 26 DRC provinces", () => {
    expect(DRC_PROVINCES).toHaveLength(26);
    expect(DRC_PROVINCES.map((s) => s.id)).toContain("kinshasa");
    expect(DRC_PROVINCES.map((s) => s.id)).toContain("haut_katanga");
    expect(DRC_PROVINCES.map((s) => s.id)).toContain("nord_kivu");
    expect(DRC_PROVINCES.map((s) => s.id)).toContain("kasai_oriental");
  });

  it("parses region by number and name", () => {
    expect(parseRegionChoice("1")).toBe(DRC_PROVINCES[0].id);
    expect(parseRegionChoice("26")).toBe(DRC_PROVINCES[25].id);
    expect(parseRegionChoice("Kinshasa")).toBe("kinshasa");
    expect(parseRegionChoice("Goma")).toBe("nord_kivu");
    expect(parseRegionChoice("lubumbashi")).toBe("haut_katanga");
    expect(parseRegionChoice("invalid")).toBeNull();
  });

  it("parses residential and commercial categories", () => {
    expect(parseCategoryChoice("1")).toBe("residential");
    expect(parseCategoryChoice("2")).toBe("commercial");
    expect(parseCategoryChoice("I need commercial space")).toBe("commercial");
    expect(parseCategoryChoice("residentiel")).toBe("residential");
    expect(parseCategoryChoice("hotel")).toBeNull();
  });

  it("parses residential subtypes by menu index and Congolese names", () => {
    expect(parseSubtypeChoice("1", "residential")).toBe("single_room");
    expect(parseSubtypeChoice("2", "residential")).toBe("studio");
    expect(parseSubtypeChoice("3", "residential")).toBe("one_bedroom");
    expect(parseSubtypeChoice("6", "residential")).toBe("appartement");
    expect(parseSubtypeChoice("7", "residential")).toBe("bungalow");
    expect(parseSubtypeChoice("8", "residential")).toBe("parcelle");
    expect(parseSubtypeChoice("9", "residential")).toBe("servant_quarter");
    expect(parseSubtypeChoice("10", "residential")).toBe("maisonette");
    expect(parseSubtypeChoice("chambre", "residential")).toBe("single_room");
    expect(parseSubtypeChoice("2 pièces", "residential")).toBe("one_bedroom");
    expect(parseSubtypeChoice("villa", "residential")).toBe("bungalow");
    expect(parseSubtypeChoice("parcelle", "residential")).toBe("parcelle");
    expect(parseSubtypeChoice("99", "residential")).toBeNull();
  });

  it("parses commercial subtypes including office and shop", () => {
    expect(parseSubtypeChoice("1", "commercial")).toBe("shop");
    expect(parseSubtypeChoice("2", "commercial")).toBe("office");
    expect(parseSubtypeChoice("4", "commercial")).toBe("restaurant");
    expect(parseSubtypeChoice("8", "commercial")).toBe("commercial_space");
    expect(COMMERCIAL_SUBTYPES).toHaveLength(8);
    expect(RESIDENTIAL_SUBTYPES).toHaveLength(10);
  });

  it("maps subtypes to legacy house type column", () => {
    expect(legacyTypeFromSubtype("single_room")).toBe("room");
    expect(legacyTypeFromSubtype("double_room")).toBe("room");
    expect(legacyTypeFromSubtype("bedsitter")).toBe("apartment");
    expect(legacyTypeFromSubtype("servant_quarter")).toBe("room");
    expect(legacyTypeFromSubtype("two_bedroom")).toBe("apartment");
    expect(legacyTypeFromSubtype("studio")).toBe("apartment");
    expect(legacyTypeFromSubtype("office")).toBe("apartment");
    expect(legacyTypeFromSubtype("shop")).toBe("apartment");
    expect(legacyTypeFromSubtype("parcelle")).toBe("apartment");
    expect(legacyTypeFromSubtype("appartement")).toBe("apartment");
  });

  it("labels subtypes and categories in French", () => {
    expect(subtypeLabel("office", "en")).toContain("Bureau");
    expect(subtypeLabel("shop", "en")).toContain("Boutique");
    expect(categoryLabel("residential", "en")).toBe("Résidentiel");
    expect(categoryLabel("commercial", "en")).toBe("Commercial");
  });

  it("formats commercial subtype menu with all options", () => {
    const menu = formatSubtypeMenu("commercial", "en");
    expect(menu).toContain("Type de local commercial");
    expect(menu).toContain("Boutique");
    expect(menu).toContain("Bureau");
  });

  it("formats and parses electricity meter options", () => {
    expect(formatElectricityMeterMenu("en")).toContain("prépayé");
    expect(parseElectricityMeterChoice("2")).toBe("prepaid");
    expect(electricityMeterLabel("postpaid", "en")).toContain("postpayé");
    expect(subtypeLabel("bedsitter", "en")).toBe("Studio");
    expect(subtypeLabel("studio", "en")).toBe("Studio");
    expect(subtypeLabel("single_room", "en")).toBe("Chambre");
    expect(subtypeLabel("appartement", "en")).toBe("Appartement");
    expect(subtypeLabel("parcelle", "en")).toBe("Parcelle");
    expect(subtypeLabel("bungalow", "en")).toBe("Villa");
    expect(subtypeLabel("maisonette", "en")).toBe("Duplex");
    expect(subtypeLabel("servant_quarter", "en")).toBe("Boyerie");
    expect(subtypeLabel("double_room", "en")).toBe("Chambre");
  });
});
