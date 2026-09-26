import { describe, expect, it } from "vitest";
import { formatCdf, isCongoMobile, normalizeCongoPhone } from "./congo-phone.js";

describe("DRC phone", () => {
  it("normalizes 08xx, +243, and 9-digit local mobiles", () => {
    expect(normalizeCongoPhone("0812345678")).toBe("243812345678");
    expect(normalizeCongoPhone("+243 812 345 678")).toBe("243812345678");
    expect(normalizeCongoPhone("243812345678")).toBe("243812345678");
    expect(normalizeCongoPhone("812345678")).toBe("243812345678");
    expect(normalizeCongoPhone("0991234567")).toBe("243991234567");
  });

  it("rejects non-Congolese numbers", () => {
    expect(normalizeCongoPhone("0712345678")).toBeNull();
    expect(normalizeCongoPhone("254712345678")).toBeNull();
    expect(normalizeCongoPhone("12025551234")).toBeNull();
    expect(isCongoMobile("243")).toBe(false);
  });

  it("formats money in Congolese francs", () => {
    expect(formatCdf(5000)).toContain("CDF");
    expect(formatCdf(5000)).toMatch(/5/);
  });
});
