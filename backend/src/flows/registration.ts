import { t, parseRoleChoice, normalizeStoredLanguage } from "../i18n/index.js";
import type { Language } from "../i18n/messages.js";
import { clearSession, setSession, type FlowState } from "../redis/client.js";
import { createUser } from "../services/users.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { showMainMenu } from "./main-menu.js";
import { menuButtonLabel, roleMenuOptions } from "./menu-options.js";

const DEFAULT_LANG: Language = "en";

async function promptRole(phone: string, lang: Language): Promise<void> {
  const m = t(lang);
  await sendMenuMessage(phone, m.chooseRole, roleMenuOptions(lang), menuButtonLabel(lang));
}

export async function handleRegistration(
  phone: string,
  text: string,
  session: FlowState
): Promise<void> {
  const lang = normalizeStoredLanguage(session.language);
  const m = t(lang);
  const choice = text.trim();
  const step = session.step === "language" ? "role" : session.step;

  switch (step) {
    case "welcome": {
      await sendTextMessage(phone, m.welcome);
      await promptRole(phone, lang);
      await setSession(phone, {
        flow: "registration",
        step: "role",
        language: lang,
        data: session.data ?? {},
      });
      break;
    }

    case "role": {
      if (choice === "3" || text.toLowerCase().includes("referral") || text.toLowerCase().includes("parrain")) {
        await setSession(phone, {
          flow: "registration",
          step: "referrer",
          language: lang,
          data: session.data ?? {},
        });
        await sendTextMessage(
          phone,
          "Entrez le numéro WhatsApp de la personne qui vous a parrainé :"
        );
        return;
      }

      const role = parseRoleChoice(text);
      if (!role) {
        await sendTextMessage(phone, m.invalidChoice);
        await promptRole(phone, lang);
        return;
      }

      await createUser(phone, role, lang, session.data.whatsapp_name as string | undefined);
      const referrer = session.data.referrer as string | undefined;
      if (referrer) {
        const { createReferral } = await import("../services/features/referrals.js");
        await createReferral(referrer, phone);
      }
      await sendTextMessage(phone, m.roleSet(role));
      await clearSession(phone);
      await showMainMenu(phone, role, lang);
      break;
    }

    case "referrer": {
      const referrerPhone = text.replace(/\D/g, "");
      await setSession(phone, {
        flow: "registration",
        step: "role",
        language: lang,
        data: { ...session.data, referrer: referrerPhone },
      });
      await promptRole(phone, lang);
      break;
    }

    default:
      await setSession(phone, {
        flow: "registration",
        step: "welcome",
        language: lang,
        data: session.data ?? {},
      });
      await handleRegistration(phone, text, {
        flow: "registration",
        step: "welcome",
        language: lang,
        data: session.data ?? {},
      });
  }
}

export async function startRegistration(phone: string): Promise<void> {
  await handleRegistration(phone, "", {
    flow: "registration",
    step: "welcome",
    language: DEFAULT_LANG,
    data: {},
  });
}
