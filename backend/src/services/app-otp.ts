import { env } from "../config/env.js";
import { redis } from "../redis/client.js";
import { normalizeCongoPhone } from "../utils/congo-phone.js";

export const APP_OTP_TTL_SEC = env.APP_OTP_TTL_SEC;
export const APP_LOGIN_TRIGGER = "CASA-APP-LOGIN";

/** Digits only, with DRC 243 prefix when the user typed 08xx / 09xx. */
export function canonicalPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  return normalizeCongoPhone(d) ?? d;
}

export function phoneAliases(raw: string): string[] {
  const digits = raw.replace(/\D/g, "");
  const canonical = canonicalPhone(raw);
  const out = new Set<string>([canonical, digits].filter((p) => p.length >= 7));
  if (canonical.startsWith("243") && canonical.length === 12) {
    const national = canonical.slice(3);
    out.add(national);
    out.add(`0${national}`);
  }
  return [...out];
}

export function otpKey(phone: string): string {
  return `casa:login:${canonicalPhone(phone)}`;
}

function otpCodeKey(code: string): string {
  return `casa:login-code:${code.replace(/\D/g, "")}`;
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isAppLoginTrigger(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    t.includes("casa-app-login") ||
    t.includes("app login code") ||
    t.includes("code de connexion") ||
    t.includes("send my app login") ||
    t.includes("envoyer mon code") ||
    t.includes("login code") ||
    t === "casa login" ||
    t === "code app"
  );
}

/** Store-app fallback: they already requested a code, then opened WhatsApp or WhatsApp Business. */
export function isPendingOtpFollowup(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (isAppLoginTrigger(t)) return true;
  if (["hi", "hello", "bonjour", "salut", "bonsoir", "menu", "start"].includes(t)) return true;
  return /want to sign up|je veux m['’]?inscrire|ouvrir casa/i.test(t);
}

export function appLoginWhatsAppUrl(_lang: "en" | "fr" = "fr"): string {
  const phone = (env.PUBLIC_WHATSAPP_PHONE || "243862768917").replace(/\D/g, "");
  const text = `${APP_LOGIN_TRIGGER}\nEnvoyez ce message pour recevoir votre code Casa.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export async function peekLoginOtp(phone: string): Promise<string | null> {
  for (const p of phoneAliases(phone)) {
    const stored = await redis.get(`casa:login:${p}`);
    if (stored) return stored;
  }
  return null;
}

export async function storeLoginOtp(phone: string, otp: string): Promise<void> {
  const aliases = phoneAliases(phone);
  if (aliases.length === 0) return;
  const digits = otp.replace(/\D/g, "");
  const pipe = redis.multi();
  for (const p of aliases) {
    pipe.set(`casa:login:${p}`, digits, "EX", APP_OTP_TTL_SEC);
  }
  if (digits) {
    pipe.set(otpCodeKey(digits), canonicalPhone(phone), "EX", APP_OTP_TTL_SEC);
  }
  await pipe.exec();
}

export async function rememberOtpRequest(phone: string): Promise<void> {
  const p = canonicalPhone(phone);
  if (p.length < 7) return;
  const now = Date.now();
  await redis.zadd("casa:login-recent", now, p);
  await redis.zremrangebyscore("casa:login-recent", 0, now - APP_OTP_TTL_SEC * 1000);
  await redis.expire("casa:login-recent", APP_OTP_TTL_SEC);
}

/** Same code for personal vs Business WhatsApp when only one login is in flight. */
export async function otpForInboundWhatsApp(senderPhone: string): Promise<string> {
  const existing = await peekLoginOtp(senderPhone);
  if (existing) {
    await storeLoginOtp(senderPhone, existing);
    return existing;
  }

  const now = Date.now();
  const windowMs = 3 * 60 * 1000;
  await redis.zremrangebyscore("casa:login-recent", 0, now - windowMs);
  const recent = await redis.zrangebyscore("casa:login-recent", now - windowMs, now);
  const others = recent.filter((p) => canonicalPhone(p) !== canonicalPhone(senderPhone));
  if (others.length === 1) {
    const borrowed = await peekLoginOtp(others[0]);
    if (borrowed) {
      await storeLoginOtp(senderPhone, borrowed);
      return borrowed;
    }
  }

  const otp = generateOTP();
  await storeLoginOtp(senderPhone, otp);
  return otp;
}

async function clearLoginOtp(phone: string, code: string): Promise<void> {
  const pipe = redis.multi();
  for (const q of phoneAliases(phone)) pipe.del(`casa:login:${q}`);
  const digits = code.replace(/\D/g, "");
  if (digits) pipe.del(otpCodeKey(digits));
  await pipe.exec().catch(() => undefined);
}

export async function consumeLoginOtp(
  phone: string,
  code: string
): Promise<{ status: "ok" | "mismatch" | "missing"; phone?: string }> {
  const want = code.replace(/\D/g, "");
  if (want.length < 4) return { status: "missing" };

  for (const p of phoneAliases(phone)) {
    const stored = await redis.get(`casa:login:${p}`);
    if (stored && stored.replace(/\D/g, "") === want) {
      await clearLoginOtp(p, want);
      return { status: "ok", phone: canonicalPhone(p) };
    }
  }

  const owner = await redis.get(otpCodeKey(want));
  if (owner) {
    const stored = await peekLoginOtp(owner);
    if (stored && stored.replace(/\D/g, "") === want) {
      await clearLoginOtp(owner, want);
      return { status: "ok", phone: canonicalPhone(owner) };
    }
  }

  const anyForPhone = await peekLoginOtp(phone);
  return { status: anyForPhone ? "mismatch" : "missing" };
}

export function loginOtpMessage(otp: string, _lang: "en" | "fr" = "fr"): string {
  const mins = Math.round(APP_OTP_TTL_SEC / 60);
  return `🔐 *Code de connexion Casa : ${otp}*\n\nValable ${mins} minutes. Ne partagez pas ce code.\n\nRetournez dans l'application et saisissez ce code.`;
}
