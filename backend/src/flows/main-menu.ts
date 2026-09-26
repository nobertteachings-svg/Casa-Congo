import { t } from "../i18n/index.js";
import type { Language, UserRole } from "../i18n/messages.js";
import { setSession } from "../redis/client.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { startRegistration } from "./registration.js";
import { showTenantSubmenu, showUnlockedContacts } from "./tenant-features.js";
import { showLandlordSubmenu } from "./landlord-features.js";
import { showLandlordListingManager } from "./landlord-listings.js";
import {
  categoryMenuOptions,
  listingModeMenuOptions,
  mainMenuOptions,
  menuButtonLabel,
} from "./menu-options.js";

export async function showMainMenu(
  phone: string,
  role: UserRole,
  lang: Language = "en"
): Promise<void> {
  const m = t(lang);
  await sendMenuMessage(
    phone,
    role === "landlord" ? m.mainMenuLandlord : m.mainMenuTenant,
    mainMenuOptions(role, lang),
    menuButtonLabel(lang)
  );
  await setSession(phone, {
    flow: "main_menu",
    step: "idle",
    language: lang,
    data: { role },
  });
}

export async function handleMainMenu(
  phone: string,
  text: string,
  lang: Language,
  role: UserRole
): Promise<void> {
  const m = t(lang);
  const choice = text.trim();

  if (choice === "4" || ["help", "aide", "msaada"].includes(choice.toLowerCase())) {
    await sendTextMessage(phone, m.help);
    await showMainMenu(phone, role, lang);
    return;
  }

  if (role === "landlord") {
    if (choice === "1") {
      await setSession(phone, {
        flow: "landlord_listing",
        step: "mode",
        language: lang,
        data: {},
      });
      await sendMenuMessage(
        phone,
        "Comment voulez-vous publier ?",
        listingModeMenuOptions(lang),
        menuButtonLabel(lang)
      );
      return;
    }
    if (choice === "2") {
      await showLandlordListingManager(phone, lang);
      return;
    }
    if (choice === "3") {
      await showLandlordSubmenu(phone, lang);
      return;
    }
  }

  if (role === "tenant") {
    if (choice === "1") {
      await setSession(phone, {
        flow: "tenant_search",
        step: "category",
        language: lang,
        data: {},
      });
      await sendMenuMessage(
        phone,
        "Vous cherchez :",
        categoryMenuOptions(lang),
        menuButtonLabel(lang)
      );
      return;
    }
    if (choice === "2") {
      await showUnlockedContacts(phone, lang);
      await showMainMenu(phone, role, lang);
      return;
    }
    if (choice === "3") {
      await showTenantSubmenu(phone, lang);
      return;
    }
  }

  await sendTextMessage(phone, m.invalidChoice);
  await showMainMenu(phone, role, lang);
}

export async function handleSettings(
  phone: string,
  _text: string,
  lang: Language,
  role: UserRole
): Promise<void> {
  await showMainMenu(phone, role, lang);
}

export { startRegistration };
