import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
const zset = new Map<string, number>();

vi.mock("../redis/client.js", () => ({
  redis: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string) => {
      store.set(key, value);
      return "OK";
    },
    del: async (...keys: string[]) => {
      let n = 0;
      for (const key of keys) {
        if (store.delete(key)) n += 1;
      }
      return n;
    },
    multi() {
      const ops: Array<() => void> = [];
      return {
        set(key: string, value: string) {
          ops.push(() => store.set(key, value));
          return this;
        },
        del(key: string) {
          ops.push(() => {
            store.delete(key);
          });
          return this;
        },
        async exec() {
          for (const op of ops) op();
          return [];
        },
      };
    },
    zadd: async (_key: string, score: number, member: string) => {
      zset.set(member, score);
      return 1;
    },
    zremrangebyscore: async (_key: string, min: number, max: number) => {
      for (const [member, score] of [...zset.entries()]) {
        if (score >= min && score <= max) zset.delete(member);
      }
      return 1;
    },
    expire: async () => 1,
    zrangebyscore: async (_key: string, min: number, max: number) =>
      [...zset.entries()].filter(([, score]) => score >= min && score <= max).map(([m]) => m),
  },
}));

const { consumeLoginOtp, otpForInboundWhatsApp, peekLoginOtp, rememberOtpRequest, storeLoginOtp } =
  await import("./app-otp.js");

describe("OTP store matches WhatsApp and WhatsApp Business", () => {
  beforeEach(() => {
    store.clear();
    zset.clear();
  });

  it("stores one code under 08 / 243 aliases so either form verifies", async () => {
    await storeLoginOtp("0812345678", "847291");
    expect(await peekLoginOtp("243812345678")).toBe("847291");
    expect(await peekLoginOtp("812345678")).toBe("847291");

    const consumed = await consumeLoginOtp("243812345678", "847291");
    expect(consumed).toEqual({ status: "ok", phone: "243812345678" });
  });

  it("reuses the app-requested code when WhatsApp inbound is a different wa_id", async () => {
    await storeLoginOtp("243812345678", "112233");
    await rememberOtpRequest("243812345678");

    const inbound = await otpForInboundWhatsApp("243810000111");
    expect(inbound).toBe("112233");

    const consumed = await consumeLoginOtp("0812345678", "112233");
    expect(consumed.status).toBe("ok");
    expect(consumed.phone).toBe("243812345678");
  });

  it("does not mint a second code when the same number writes in again", async () => {
    await storeLoginOtp("243812345678", "556677");
    const again = await otpForInboundWhatsApp("0812345678");
    expect(again).toBe("556677");
  });
});
