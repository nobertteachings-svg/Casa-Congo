import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createHouse,
  formatHouseSummary,
  formatLocation,
  googleMapsLink,
  haversineKm,
  searchNearbyHouses,
} from "../services/houses.js";
import { makeHouse } from "../test/fixtures.js";

vi.mock("../db/pool.js", () => ({
  query: vi.fn(),
}));

vi.mock("../services/whatsapp.js", () => ({
  sendTextMessage: vi.fn(),
}));

import { query } from "../db/pool.js";

const mockedQuery = vi.mocked(query);

function mockPostgisUnavailable() {
  mockedQuery.mockResolvedValueOnce({
    rows: [{ ok: false }],
    rowCount: 1,
    command: "SELECT",
    oid: 0,
    fields: [],
  });
}

describe("houses service", () => {
  beforeEach(async () => {
    mockedQuery.mockReset();
    const { resetPostgisCacheForTests } = await import("./house-search.js");
    resetPostgisCacheForTests();
  });

  it("computes haversine distance between two GPS points", () => {
    const westlands = { lat: -1.2679, lon: 36.8102 };
    const nearby = haversineKm(westlands.lat, westlands.lon, -1.27, 36.815);
    const far = haversineKm(westlands.lat, westlands.lon, -4.0435, 39.6682);
    expect(nearby).toBeLessThan(2);
    expect(far).toBeGreaterThan(150);
  });

  it("builds Google Maps link from coordinates", () => {
    expect(googleMapsLink(-1.2679, 36.8102)).toBe(
      "https://maps.google.com/?q=-1.2679,36.8102"
    );
  });

  it("formats location from quarter, town, and region", () => {
    const house = makeHouse();
    expect(formatLocation(house, "en")).toBe("Gombe, Kinshasa, Kinshasa");
    expect(formatLocation(makeHouse({ neighbourhood: null, town: null, city: null, region: null }), "en")).toBe(
      "Quartier inconnu"
    );
  });

  it("formats house summary with category, subtype, and prepaid meter", () => {
    const summary = formatHouseSummary(makeHouse(), "en");
    expect(summary).toContain("CASA-1001");
    expect(summary).toContain("Résidentiel");
    expect(summary).toContain("3 pièces");
    expect(summary).toContain("Gombe");
    expect(summary).toContain("prépayé");
    expect(summary).toContain("80,000");
  });

  it("formats commercial office listing in English", () => {
    const summary = formatHouseSummary(
      makeHouse({
        property_category: "commercial",
        property_subtype: "office",
        neighbourhood: "Gombe",
        town: "Kinshasa",
        region: "kinshasa",
      }),
      "en"
    );
    expect(summary).toContain("Commercial");
    expect(summary).toContain("Bureau");
    expect(summary).toContain("Gombe");
  });

  it("filters search results by category, subtype, rent, and electricity meter", async () => {
    const residential = makeHouse({ house_id: "CASA-1", distance_km: 0.2 });
    const commercial = makeHouse({
      house_id: "CASA-2",
      property_category: "commercial",
      property_subtype: "office",
      latitude: 3.849,
      longitude: 11.503,
      rent: 200000,
      electricity_meter: "postpaid",
      distance_km: 0.3,
    });

    mockPostgisUnavailable();
    mockedQuery.mockResolvedValueOnce({
      rows: [commercial],
      rowCount: 1,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const commercialOnly = await searchNearbyHouses(9.0765, 7.3986, 5, {
      property_category: "commercial",
    });
    expect(commercialOnly).toHaveLength(1);
    expect(commercialOnly[0].house_id).toBe("CASA-2");

    mockedQuery.mockResolvedValueOnce({
      rows: [residential],
      rowCount: 1,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const prepaidOnly = await searchNearbyHouses(9.0765, 7.3986, 5, {
      electricity_meter: "prepaid",
    });
    expect(prepaidOnly).toHaveLength(1);
    expect(prepaidOnly[0].house_id).toBe("CASA-1");

    mockedQuery.mockResolvedValueOnce({
      rows: [residential],
      rowCount: 1,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const maxRent = await searchNearbyHouses(9.0765, 7.3986, 5, {
      maxRent: 100000,
    });
    expect(maxRent.map((h) => h.house_id)).toEqual(["CASA-1"]);
  });

  it("sorts search results by distance ascending", async () => {
    const near = makeHouse({
      house_id: "NEAR",
      latitude: 9.0770,
      longitude: 7.3990,
      distance_km: 0.06,
    });
    const mid = makeHouse({
      house_id: "MID",
      latitude: 3.86,
      longitude: 11.51,
      distance_km: 1.4,
    });
    mockPostgisUnavailable();
    mockedQuery.mockResolvedValueOnce({
      rows: [near, mid],
      rowCount: 2,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const results = await searchNearbyHouses(9.0765, 7.3986, 10);
    expect(results[0].house_id).toBe("NEAR");
    expect(results[0].distance_km).toBeLessThan(results[1].distance_km);
  });

  it("rejects createHouse without a walkthrough video", async () => {
    await expect(
      createHouse({
        landlord_phone: "243810000001",
        type: "room",
        property_category: "residential",
        property_subtype: "single_room",
        region: "kinshasa",
        town: "Kinshasa",
        rent: 50000,
        months_upfront: 1,
        latitude: -1.2679,
        longitude: 36.8102,
        neighbourhood: "Gombe",
        videos: [],
      })
    ).rejects.toThrow(/video is required/i);
  });

  it("creates house with electricity_meter and syncs legacy electricity flag", async () => {
    const created = makeHouse({ house_id: "CASA-NEW" });
    mockedQuery.mockResolvedValueOnce({
      rows: [created],
      rowCount: 1,
      command: "INSERT",
      oid: 0,
      fields: [],
    });
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const result = await createHouse({
      landlord_phone: "243810000001",
      type: "apartment",
      property_category: "commercial",
      property_subtype: "shop",
      region: "kinshasa",
      town: "Kinshasa",
      rent: 150000,
      months_upfront: 2,
      latitude: 4.0511,
      longitude: 9.7679,
      neighbourhood: "Gombe",
      electricity_meter: "prepaid",
      videos: ["wa-media:video1"],
    });

    expect(result.house_id).toBe("CASA-NEW");
    const insertArgs = mockedQuery.mock.calls[0][1] as unknown[];
    expect(insertArgs[16]).toBe(true);
    expect(insertArgs[17]).toBe("prepaid");
  });

  it("updates listing status for the owning landlord only", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
      command: "UPDATE",
      oid: 0,
      fields: [],
    });

    const { updateHouseStatusByLandlord, isListingAvailable } = await import("./houses.js");
    const ok = await updateHouseStatusByLandlord("CASA-1001", "243810000099", "inactive");

    expect(ok).toBe(true);
    expect(mockedQuery.mock.calls[0][0]).toContain("landlord_phone = $2");
    expect(isListingAvailable(makeHouse({ status: "active" }))).toBe(true);
    expect(isListingAvailable(makeHouse({ status: "inactive" }))).toBe(false);
  });
});
