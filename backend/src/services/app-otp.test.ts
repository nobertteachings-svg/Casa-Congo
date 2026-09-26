import { describe, expect, it } from "vitest";
import {
  canonicalPhone,
  isAppLoginTrigger,
  isPendingOtpFollowup,
  phoneAliases,
} from "./app-otp.js";

describe("canonicalPhone", () => {
  it("adds 243 to local Congolese mobiles", () => {
    expect(canonicalPhone("812345678")).toBe("243812345678");
    expect(canonicalPhone("0812345678")).toBe("243812345678");
    expect(canonicalPhone("+243 812 345 678")).toBe("243812345678");
    expect(canonicalPhone("243812345678")).toBe("243812345678");
    expect(canonicalPhone("0991234567")).toBe("243991234567");
  });
});

describe("phoneAliases", () => {
  it("includes local and international forms so WhatsApp and the app match", () => {
    const aliases = phoneAliases("0812345678");
    expect(aliases).toContain("243812345678");
    expect(aliases).toContain("812345678");
    expect(aliases).toContain("0812345678");
  });

  it("matches a WhatsApp Business wa_id to the app-entered 07 number", () => {
    const fromApp = phoneAliases("0812345678");
    const fromWhatsApp = phoneAliases("243812345678");
    expect(fromApp.some((p) => fromWhatsApp.includes(p))).toBe(true);
  });
});

describe("isAppLoginTrigger", () => {
  it("matches the app prefill", () => {
    expect(isAppLoginTrigger("CASA-APP-LOGIN\nSend this message to get your Casa login code.")).toBe(
      true
    );
  });

  it("matches french prefill from WhatsApp or WhatsApp Business", () => {
    expect(
      isAppLoginTrigger("CASA-APP-LOGIN\nEnvoyez ce message pour recevoir votre code Casa.")
    ).toBe(true);
    expect(isAppLoginTrigger("envoyer mon code")).toBe(true);
    expect(isAppLoginTrigger("code de connexion")).toBe(true);
  });

  it("ignores normal chat", () => {
    expect(isAppLoginTrigger("hi")).toBe(false);
    expect(isAppLoginTrigger("I need a 2 bedroom in Gombe")).toBe(false);
  });
});

describe("isPendingOtpFollowup", () => {
  it("matches the current store-app WhatsApp link", () => {
    expect(isPendingOtpFollowup("Hi Casa! I want to sign up.")).toBe(true);
    expect(isPendingOtpFollowup("hi")).toBe(true);
    expect(isPendingOtpFollowup("Bonjour Casa ! Je veux m'inscrire.")).toBe(true);
    expect(isPendingOtpFollowup("bonjour")).toBe(true);
    expect(isPendingOtpFollowup("salut")).toBe(true);
  });

  it("ignores listing search", () => {
    expect(isPendingOtpFollowup("I need a 2 bedroom in Gombe")).toBe(false);
    expect(isPendingOtpFollowup("Je cherche un 2 pièces à Gombe")).toBe(false);
  });
});
