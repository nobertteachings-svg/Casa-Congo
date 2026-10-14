import AsyncStorage from "@react-native-async-storage/async-storage";

/** Backend base URL — set EXPO_PUBLIC_API_URL in EAS / .env */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://api.casahomesdrcongo.com";

/** Live Railway hostname if the custom-domain CNAME is stale or blocked. */
export const API_URL_FALLBACK =
  process.env.EXPO_PUBLIC_API_URL_FALLBACK?.replace(/\/$/, "") ??
  "https://casa-backend-production-add3.up.railway.app";

const PREFERRED_KEY = "casa:api-base";

let preferredBase: string | null = null;

export function apiBases(): string[] {
  return [...new Set([preferredBase, API_URL, API_URL_FALLBACK].filter(Boolean) as string[])];
}

export function getApiBase(): string {
  return preferredBase ?? API_URL;
}

export function rememberApiBase(base: string): void {
  if (!base || preferredBase === base) return;
  preferredBase = base;
  void AsyncStorage.setItem(PREFERRED_KEY, base);
}

export async function hydrateApiBase(): Promise<void> {
  const stored = await AsyncStorage.getItem(PREFERRED_KEY);
  if (stored === API_URL || stored === API_URL_FALLBACK) {
    preferredBase = stored;
  }
}

export function mediaUrl(ref: string, kind: "image" | "video" = "image"): string {
  const params = new URLSearchParams({ ref, kind });
  return `${getApiBase()}/api/public/media?${params}`;
}
