export const NETWORK_ERROR_FR =
  "Impossible de joindre Casa. Vérifiez votre connexion et réessayez.";

export function isNetworkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /fetch failed|Network request failed|ConnectException|Failed to connect|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|timed out|AbortError|NetworkError/i.test(
    msg
  );
}

export function toUserFacingApiError(error: unknown): Error {
  if (isNetworkError(error)) return new Error(NETWORK_ERROR_FR);
  if (error instanceof Error) return error;
  return new Error(NETWORK_ERROR_FR);
}
