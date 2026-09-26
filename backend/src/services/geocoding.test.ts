import { describe, expect, it, vi, beforeEach } from "vitest";
import { forwardGeocode, resolveSearchCoordinates, reverseGeocode } from "./geocoding.js";
import { redis } from "../redis/client.js";

vi.mock("../redis/client.js", () => ({
  redis: {
    status: "ready",
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
  },
}));

describe("forwardGeocode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns coordinates from Nominatim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { lat: "-1.2676", lon: "36.8108", display_name: "Gombe, Kinshasa, RDC" },
        ],
      })
    );

    const result = await forwardGeocode("Gombe, Kinshasa");
    expect(result).toMatchObject({ latitude: -1.2676, longitude: 36.8108 });
  });

  it("returns null when geocoder finds nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    );

    expect(await forwardGeocode("unknown place xyz")).toBeNull();
  });
});

describe("resolveSearchCoordinates", () => {
  it("combines neighbourhood and town into a query", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { lat: "4.0511", lon: "9.7679", display_name: "Gombe, Kinshasa" },
        ],
      })
    );

    const result = await resolveSearchCoordinates({
      neighbourhood: "Gombe",
      town: "Kinshasa",
    });
    expect(result?.latitude).toBeCloseTo(4.0511);
  });
});

describe("reverseGeocode", () => {
  beforeEach(() => {
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.set).mockClear();
  });

  it("returns cached reverse geocode without calling Nominatim", async () => {
    vi.mocked(redis.get).mockResolvedValue(
      JSON.stringify({
        neighbourhood: "Gombe",
        city: "Kinshasa",
        displayName: "Gombe, Kinshasa, RDC",
      })
    );

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await reverseGeocode(3.848, 11.5021);
    expect(result.neighbourhood).toBe("Gombe");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("caches reverse geocode results in Redis", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: "Gombe, Kinshasa, RDC",
          address: { suburb: "Gombe", city: "Kinshasa" },
        }),
      })
    );

    await reverseGeocode(4.0511, 9.7679);

    expect(redis.set).toHaveBeenCalledWith(
      "casa:geo:rev:4.0511:9.7679",
      expect.stringContaining("Gombe"),
      "EX",
      expect.any(Number)
    );
  });
});
