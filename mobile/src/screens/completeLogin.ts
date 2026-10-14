import type { CasaUser, Language, UserRole } from "../api/client";
import { bootstrapSession, getMe, registerAccount, updateAppLanguage } from "../api/client";
import { saveAuth } from "../storage/auth";

export async function completeLogin(opts: {
  token: string;
  user: CasaUser | null;
  needsSignup: boolean;
  phone: string;
  language: Language;
  role: UserRole;
  referrer?: string;
}): Promise<{ user: CasaUser | null; needsSignup: boolean }> {
  let nextUser = opts.user;
  let signup = opts.needsSignup;
  if (signup) {
    try {
      const res = await registerAccount(opts.token, {
        role: opts.role,
        language: "en",
        referrer: opts.referrer,
      });
      nextUser = res.user;
      signup = false;
    } catch {
      const me = await getMe(opts.token);
      nextUser = me.user;
      signup = me.needsSignup;
    }
  }
  await saveAuth(opts.token, opts.phone);
  await bootstrapSession(opts.token, "en");
  try {
    const langRes = await updateAppLanguage(opts.token, "en");
    if (langRes.user) nextUser = langRes.user;
    signup = langRes.needsSignup;
  } catch {
    /* keep going even if the language stamp fails */
  }
  if (nextUser) nextUser = { ...nextUser, language: "en" };
  return { user: nextUser, needsSignup: signup };
}
