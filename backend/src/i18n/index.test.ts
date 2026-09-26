import { describe, expect, it } from "vitest";
import {
  normalizeStoredLanguage,
  parseLanguageChoice,
  parseLanguageSwitch,
  parseRoleChoice,
  t,
} from "../i18n/index.js";

describe("i18n", () => {
  it("returns French Casa Congo copy", () => {
    expect(t("en").welcome).toContain("Casa Congo");
    expect(t().welcome).toContain("Bienvenue");
    expect(t().help).toContain("WhatsApp");
    expect(t().mainMenuLandlord).toContain("Propriétaire");
  });

  it("does not offer a language switch", () => {
    expect(parseLanguageChoice("1")).toBeNull();
    expect(parseLanguageChoice("lingala")).toBeNull();
    expect(parseLanguageSwitch("français")).toBeNull();
    expect(normalizeStoredLanguage("sw")).toBe("en");
    expect(normalizeStoredLanguage("fr")).toBe("en");
  });

  it("parses French and English role choices", () => {
    expect(parseRoleChoice("1")).toBe("landlord");
    expect(parseRoleChoice("Je suis propriétaire")).toBe("landlord");
    expect(parseRoleChoice("2")).toBe("tenant");
    expect(parseRoleChoice("locataire")).toBe("tenant");
    expect(parseRoleChoice("admin")).toBeNull();
  });
});
