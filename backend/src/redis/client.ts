import { Redis } from "ioredis";
import { env } from "../config/env.js";
import type { Language } from "../i18n/messages.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 5_000,
  commandTimeout: 5_000,
  enableOfflineQueue: false,
  tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

export type FlowState = {
  flow: string;
  step: string;
  data: Record<string, unknown>;
  language?: Language;
};

const SESSION_TTL = 60 * 60 * 24; // 24 hours

function sessionKey(phone: string) {
  return `casa:session:${phone}`;
}

export async function getSession(phone: string): Promise<FlowState | null> {
  try {
    if (redis.status !== "ready") return null;
    const raw = await redis.get(sessionKey(phone));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlowState;
    return { ...parsed, language: "en" };
  } catch (err) {
    console.warn("getSession failed:", err);
    return null;
  }
}

export async function setSession(phone: string, state: FlowState): Promise<void> {
  try {
    if (redis.status !== "ready") return;
    await redis.set(sessionKey(phone), JSON.stringify(state), "EX", SESSION_TTL);
  } catch (err) {
    console.warn("setSession failed:", err);
  }
}

export async function clearSession(phone: string): Promise<void> {
  try {
    if (redis.status !== "ready") return;
    await redis.del(sessionKey(phone));
  } catch (err) {
    console.warn("clearSession failed:", err);
  }
}

export async function updateSession(
  phone: string,
  patch: Partial<FlowState>
): Promise<FlowState> {
  const current = (await getSession(phone)) ?? {
    flow: "registration",
    step: "welcome",
    data: {},
  };
  const next = { ...current, ...patch, data: { ...current.data, ...patch.data } };
  await setSession(phone, next);
  return next;
}
