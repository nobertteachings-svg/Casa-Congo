import { electricityMeterLabel } from "../constants/property-taxonomy.js";
import type { Language } from "../i18n/messages.js";
import { setSession, type FlowState } from "../redis/client.js";
import { parseSearchFromText, compareHouses, generateRentalAgreement } from "../services/claude.js";
import { createSavedSearch } from "../services/features/saved-searches.js";
import { addToShortlist, getShortlist, clearShortlist } from "../services/features/shortlist.js";
import { getUnlockHistory } from "../services/features/unlocks.js";
import { flagListing, reportListingAlreadyRented } from "../services/features/community-flag.js";
import { getRentHeatMapText } from "../services/features/market-intel.js";
import { createReferral, getAvailableCredits } from "../services/features/referrals.js";
import { requestVerification } from "../services/features/verification.js";
import { findHouseById } from "../services/houses.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { showMainMenu } from "./main-menu.js";
import {
  flagReasonOptions,
  menuButtonLabel,
  tenantSubmenuOptions,
  verificationMethodOptions,
} from "./menu-options.js";

export async function handleTenantExtras(
  phone: string,
  text: string,
  session: FlowState
): Promise<void> {
  const lang = (session.language ?? "en") as Language;
  const choice = text.trim();
  const step = session.step;

  if (step === "submenu") {
    switch (choice) {
      case "1":
        await setSession(phone, { flow: "tenant_extras", step: "save_alert", language: lang, data: {} });
        await sendTextMessage(
          phone,
          "Décrivez le logement idéal (quartier, budget, équipements…). Vous serez prévenu dès qu'une annonce correspond.");
        return;
      case "2": {
        const list = await getShortlist(phone);
        if (list.length < 2) {
          await sendTextMessage(
            phone,
            `Votre sélection (${list.length}/2 min). Cherchez un logement et répondez *SAUVER* sur les détails.`);
        } else {
          const comparison = await compareHouses(
            list.map((h) => ({
              house_id: h.house_id,
              type: h.type,
              rent: h.rent,
              facilities: [
                h.water && "water",
                h.parking && "parking",
                (h.electricity_meter && h.electricity_meter !== "none"
                  ? electricityMeterLabel(h.electricity_meter, lang)
                  : h.electricity
                    ? "electricity"
                    : null),
              ]
                .filter(Boolean)
                .join(", "),
            })),
            lang
          );
          await sendTextMessage(phone, `⚖️ *Comparaison :*\n\n${comparison}`);
          await clearShortlist(phone);
        }
        await showMainMenu(phone, "tenant", lang);
        return;
      }
      case "3":
        await setSession(phone, { flow: "tenant_search", step: "diaspora_phone", language: lang, data: { diaspora: true } });
        await sendTextMessage(
          phone,
          "Entrez le numéro WhatsApp de votre proche en RDC (ex. 24381…) :");
        return;
      case "4":
        await setSession(phone, { flow: "tenant_extras", step: "verify_method", language: lang, data: {} });
        await sendMenuMessage(
          phone,
          "Vérification locataire — choisissez une méthode, puis envoyez vos documents.",
          verificationMethodOptions(lang),
          menuButtonLabel(lang)
        );
        return;
      case "5":
        await setSession(phone, { flow: "tenant_extras", step: "refer_phone", language: lang, data: {} });
        await sendTextMessage(
          phone,
          "Entrez le numéro WhatsApp de la personne que vous parrainez :");
        return;
      case "6": {
        const map = await getRentHeatMapText();
        await sendTextMessage(phone, map);
        await showMainMenu(phone, "tenant", lang);
        return;
      }
      default:
        await showMainMenu(phone, "tenant", lang);
    }
    return;
  }

  if (step === "save_alert" && text) {
    const parsed = await parseSearchFromText(text, lang);
    await createSavedSearch(phone, text, parsed);
    await sendTextMessage(
      phone,
      "✅ Alerte enregistrée ! Vous serez prévenu sur WhatsApp.");
    await showMainMenu(phone, "tenant", lang);
    return;
  }

  if (step === "verify_method") {
    const method = choice === "2" ? "bank" : "id";
    await requestVerification(phone, method);
    await sendTextMessage(
      phone,
      "✅ Demande reçue. Envoyez une carte d'identité / photo ou confirmez votre compte bancaire congolais. Le badge s'active après vérification.");
    await showMainMenu(phone, "tenant", lang);
    return;
  }

  if (step === "refer_phone" && text) {
    await createReferral(phone, choice.replace(/\D/g, ""));
    await sendTextMessage(
      phone,
      "✅ Parrainage enregistré ! Vous recevrez un crédit de déblocage gratuit quand ils termineront une transaction.");
    await showMainMenu(phone, "tenant", lang);
    return;
  }

  if (step === "flag_pick_reason") {
    const houseId = session.data.house_id as string;
    if (choice === "rented") {
      await reportListingAlreadyRented(houseId, phone);
      await sendTextMessage(
        phone,
        "✅ Merci. Cette annonce a été retirée de la recherche. Nous préviendrons le propriétaire.");
      await showMainMenu(phone, "tenant", lang);
      return;
    }
    if (choice === "other") {
      await setSession(phone, {
        flow: "tenant_extras",
        step: "flag_reason",
        language: lang,
        data: { house_id: houseId },
      });
      await sendTextMessage(
        phone,
        "Décrivez le problème avec cette annonce :");
      return;
    }
    await sendMenuMessage(
      phone,
      "Pourquoi signalez-vous cette annonce ?",
      flagReasonOptions(lang),
      menuButtonLabel(lang)
    );
    return;
  }

  if (step === "flag_reason" && text) {
    const houseId = session.data.house_id as string;
    await flagListing(houseId, phone, text);
    await sendTextMessage(
      phone,
      "✅ Signalement envoyé. Notre équipe va examiner cette annonce.");
    await showMainMenu(phone, "tenant", lang);
    return;
  }
}

export async function showUnlockedContacts(phone: string, lang: Language): Promise<void> {
  const history = await getUnlockHistory(phone);
  if (history.length === 0) {
    await sendTextMessage(
      phone,
      "Aucun contact débloqué pour le moment.");
    return;
  }
  const lines = history
    .slice(0, 10)
    .map((u) => `• *${u.house_id}* — ${u.landlord_phone} (${u.rent?.toLocaleString()} CDF)`)
    .join("\n");
  await sendTextMessage(phone, "📋 *Contacts débloqués :*\n" + lines);
}

export async function handleSaveOrFlag(
  phone: string,
  text: string,
  houseId: string,
  lang: Language
): Promise<boolean> {
  const cmd = text.toLowerCase();
  if (cmd === "save" || cmd === "sauver") {
    const count = await addToShortlist(phone, houseId);
    await sendTextMessage(
      phone,
      `✅ Ajouté à la sélection (${count}/3). Menu → Comparer quand vous en avez 2 ou plus.`);
    return true;
  }
  if (cmd === "flag" || cmd === "signaler") {
    await setSession(phone, {
      flow: "tenant_extras",
      step: "flag_pick_reason",
      language: lang,
      data: { house_id: houseId },
    });
    await sendMenuMessage(
      phone,
      "Pourquoi signalez-vous cette annonce ?",
      flagReasonOptions(lang),
      menuButtonLabel(lang)
    );
    return true;
  }
  if (cmd === "lease" || cmd === "bail") {
    const house = await findHouseById(houseId);
    if (house) {
      const agreement = await generateRentalAgreement(house, phone, lang);
      await sendTextMessage(phone, `📄 *Contrat de bail*\n\n${agreement}`);
    }
    return true;
  }
  return false;
}

export async function showTenantSubmenu(phone: string, lang: Language): Promise<void> {
  const credits = await getAvailableCredits(phone);
  const creditNote =
    credits > 0
      ? `\n🎁 ${credits} crédit(s) de déblocage gratuit`
      : "";

  const header =
    "🔧 *Plus d'options*" +
    creditNote +
    "\n\nTapez *MENU* pour revenir";

  await sendMenuMessage(phone, header, tenantSubmenuOptions(lang), menuButtonLabel(lang));
  await setSession(phone, { flow: "tenant_extras", step: "submenu", language: lang, data: {} });
}
