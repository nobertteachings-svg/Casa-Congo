import { describe, expect, it } from "vitest";
import {
  calculateMoveInCost,
  formatMoveInCost,
} from "./cost.js";

describe("move-in cost calculator", () => {
  it("calculates upfront rent without unlock fee when payments disabled", () => {
    const cost = calculateMoveInCost(80000, 2);
    expect(cost.rentMonthly).toBe(80000);
    expect(cost.upfrontTotal).toBe(160000);
    expect(cost.unlockFee).toBe(0);
    expect(cost.grandTotal).toBe(160000);
  });

  it("formats French cost breakdown without Casa fee", () => {
    const text = formatMoveInCost(60000, 1, "en");
    expect(text).toContain("Coût total pour emménager");
    expect(text).toContain("60");
    expect(text).not.toContain("Frais de déblocage Casa");
    expect(text).toContain("CDF");
  });

  it("formats a two-month French cost breakdown without Casa fee", () => {
    const text = formatMoveInCost(60000, 2, "en");
    expect(text).toContain("Coût total pour emménager");
    expect(text).toContain("120");
    expect(text).not.toContain("Frais de déblocage Casa");
    expect(text).toContain("CDF");
  });
});
