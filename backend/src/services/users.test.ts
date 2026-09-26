import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../db/pool.js", () => ({
  query: vi.fn(),
}));

import { query } from "../db/pool.js";
import { createUser, syncWhatsAppDisplayName } from "./users.js";

const mockedQuery = vi.mocked(query);

describe("users service", () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it("createUser saves WhatsApp display name on signup", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          phone: "243810000001",
          role: "tenant",
          language: "en",
          display_name: "Grace Mbala",
          created_at: new Date(),
        },
      ],
      rowCount: 1,
      command: "INSERT",
      oid: 0,
      fields: [],
    });

    const user = await createUser("243810000001", "tenant", "en", "Grace Mbala");
    expect(user.display_name).toBe("Grace Mbala");
    expect(mockedQuery.mock.calls[0][1]).toContain("Grace Mbala");
  });

  it("syncWhatsAppDisplayName only fills empty display names", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 1,
      command: "UPDATE",
      oid: 0,
      fields: [],
    });

    await syncWhatsAppDisplayName("243810000001", "Patrick");

    expect(mockedQuery.mock.calls[0][0]).toMatch(/display_name IS NULL/);
    expect(mockedQuery.mock.calls[0][1]).toEqual(["243810000001", "Patrick"]);
  });
});
