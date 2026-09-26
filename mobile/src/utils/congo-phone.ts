/** DRC mobile in E.164 digits without plus: 243 + 9 digits starting with 8 or 9. */
export function normalizeCongoPhone(input: string): string | null {
  const raw = input.trim().replace(/\D/g, "");
  if (!raw) return null;

  let digits = raw;
  if (digits.startsWith("243")) {
    /* already international */
  } else if (digits.startsWith("0") && digits.length === 10) {
    digits = `243${digits.slice(1)}`;
  } else if (digits.length === 9 && /^[89]/.test(digits)) {
    digits = `243${digits}`;
  } else {
    return null;
  }

  return /^243[89]\d{8}$/.test(digits) ? digits : null;
}

export function isCongoMobile(input: string): boolean {
  return normalizeCongoPhone(input) !== null;
}

/** @deprecated Use normalizeCongoPhone */
export const normalizeKenyaPhone = normalizeCongoPhone;
