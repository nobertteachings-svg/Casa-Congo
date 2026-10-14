import { query } from "../db/pool.js";
import type { Language, UserRole } from "../i18n/messages.js";

export interface User {
  phone: string;
  role: UserRole;
  language: Language;
  display_name: string | null;
  email: string | null;
  created_at: Date;
}

export async function findUser(phone: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT phone, role, language, display_name, email, created_at FROM users WHERE phone = $1",
    [phone]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...row, language: "en" };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const result = await query<User>(
    "SELECT phone, role, language, display_name, email, created_at FROM users WHERE LOWER(email) = $1",
    [normalized]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ...row, language: "en" };
}

export async function isUserSuspended(phone: string): Promise<boolean> {
  const result = await query<{ suspended: boolean }>(
    "SELECT COALESCE(suspended, FALSE) AS suspended FROM users WHERE phone = $1",
    [phone]
  );
  return result.rows[0]?.suspended ?? false;
}

export async function createUser(
  phone: string,
  role: UserRole,
  language: Language,
  displayName?: string,
  email?: string
): Promise<User> {
  const name = displayName?.trim().slice(0, 100) || null;
  const mail = email?.trim().toLowerCase() || null;
  const result = await query<User>(
    `INSERT INTO users (phone, role, language, display_name, email)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (phone) DO UPDATE SET
       role = EXCLUDED.role,
       language = EXCLUDED.language,
       display_name = COALESCE(NULLIF(TRIM(users.display_name), ''), EXCLUDED.display_name),
       email = COALESCE(users.email, EXCLUDED.email),
       updated_at = NOW()
     RETURNING phone, role, language, display_name, email, created_at`,
    [phone, role, "en", name, mail]
  );
  const row = result.rows[0];
  return { ...row, language: "en" };
}

export async function attachUserEmailAndName(
  phone: string,
  email?: string,
  displayName?: string
): Promise<void> {
  const mail = email?.trim().toLowerCase() || null;
  const name = displayName?.trim().slice(0, 100) || null;
  if (!mail && !name) return;
  await query(
    `UPDATE users SET
       email = COALESCE(email, $2),
       display_name = COALESCE(NULLIF(TRIM(display_name), ''), $3),
       updated_at = NOW()
     WHERE phone = $1`,
    [phone, mail, name]
  );
}

/** Save WhatsApp profile name when the user has no display name yet. */
export async function syncWhatsAppDisplayName(
  phone: string,
  name?: string
): Promise<void> {
  const trimmed = name?.trim().slice(0, 100);
  if (!trimmed) return;

  await query(
    `UPDATE users SET display_name = $2, updated_at = NOW()
     WHERE phone = $1 AND (display_name IS NULL OR TRIM(display_name) = '')`,
    [phone, trimmed]
  );
}

export async function updateUserLanguage(
  phone: string,
  language: Language
): Promise<void> {
  await query(
    "UPDATE users SET language = $2, updated_at = NOW() WHERE phone = $1",
    [phone, language]
  );
}

export async function updateUserRole(
  phone: string,
  role: UserRole
): Promise<void> {
  await query(
    "UPDATE users SET role = $2, updated_at = NOW() WHERE phone = $1",
    [phone, role]
  );
}
