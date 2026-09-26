import { subtypeLabel } from "../constants/property-taxonomy.js";
import type { Language } from "../i18n/messages.js";
import { setSession, type FlowState } from "../redis/client.js";
import { getListingStats, getLandlordWeeklyDigest } from "../services/features/views.js";
import { bulkUpdateListingStatus } from "../services/features/listing-bulk.js";
import { createReferral } from "../services/features/referrals.js";
import { getMarketTrendReport } from "../services/features/market-intel.js";
import { generateRentalAgreement } from "../services/claude.js";
import { findHousesByLandlord, findHouseById } from "../services/houses.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { showMainMenu } from "./main-menu.js";
import { startLandlordIdVerification } from "./landlord-verify-id.js";
import { landlordSubmenuOptions, menuButtonLabel } from "./menu-options.js";

export async function handleLandlordExtras(
  phone: string,
  text: string,
  session: FlowState
): Promise<void> {
  const lang = (session.language ?? "en") as Language;
  const choice = text.trim();
  const step = session.step;

  if (step === "submenu") {
    switch (choice) {
      case "1": {
        const stats = await getLandlordWeeklyDigest(phone);
        if (stats.length === 0) {
          await sendTextMessage(phone, "Aucune annonce active.");
        } else {
          const lines = await Promise.all(
            stats.map(async (s) => {
              const st = await getListingStats(s.house_id, 7);
              return `• *${s.house_id}* : ${st.views} vues, ${st.unlocks} déblocages (7 j)`;
            })
          );
          await sendTextMessage(
            phone,
            "📊 *Statistiques :*\n" + lines.join("\n")
          );
        }
        await showMainMenu(phone, "landlord", lang);
        return;
      }
      case "2":
        await setSession(phone, { flow: "landlord_extras", step: "lease_house_id", language: lang, data: {} });
        await sendTextMessage(phone, "Entrez la référence (ex. CASA-1001) :");
        return;
      case "3": {
        const houses = await findHousesByLandlord(phone);
        if (houses.length === 0) {
          await sendTextMessage(phone, "Aucune annonce.");
        } else {
          const list = houses
            .map((h, i) => `${i + 1}. *${h.house_id}* — ${h.property_subtype ? subtypeLabel(h.property_subtype) : h.type}, ${h.rent.toLocaleString("fr-CD")} CDF (${h.status})`)
            .join("\n");
          await sendTextMessage(
            phone,
            "🏘 *Gestion groupée :*\n" +
              list +
              "\n\nRépondez *ACTIVER TOUT* ou *DÉSACTIVER TOUT*"
          );
          await setSession(phone, { flow: "landlord_extras", step: "bulk_action", language: lang, data: {} });
          return;
        }
        await showMainMenu(phone, "landlord", lang);
        return;
      }
      case "4":
        await setSession(phone, { flow: "landlord_extras", step: "refer_phone", language: lang, data: {} });
        await sendTextMessage(
          phone,
          "Numéro WhatsApp à parrainer :");
        return;
      case "5": {
        const trends = await getMarketTrendReport();
        await sendTextMessage(phone, trends);
        await showMainMenu(phone, "landlord", lang);
        return;
      }
      case "6":
        await startLandlordIdVerification(phone, lang);
        return;
      default:
        await showMainMenu(phone, "landlord", lang);
    }
    return;
  }

  if (step === "lease_house_id" && text) {
    const house = await findHouseById(choice.toUpperCase());
    if (!house) {
      await sendTextMessage(phone, "Annonce introuvable.");
    } else {
      const agreement = await generateRentalAgreement(house, "TENANT-TBD", lang);
      await sendTextMessage(phone, `📄 *Modèle de bail*\n\n${agreement}`);
    }
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  if (step === "bulk_action") {
    const activate = ["activate all", "activer tout"].includes(choice.toLowerCase());
    const deactivate = ["deactivate all", "désactiver tout", "desactiver tout"].includes(choice.toLowerCase());
    if (activate || deactivate) {
      const count = await bulkUpdateListingStatus(phone, activate ? "active" : "inactive");
      await sendTextMessage(
        phone,
        `✅ ${count} annonce(s) ${activate ? "activée(s)" : "désactivée(s)"}.`);
    }
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  if (step === "refer_phone" && text) {
    await createReferral(phone, choice.replace(/\D/g, ""));
    await sendTextMessage(phone, "✅ Parrainage enregistré !");
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  // Legacy agent-link step — mode agent retiré pour Casa Congo
  if (step === "link_landlord") {
    await sendTextMessage(
      phone,
      "Casa Congo relie directement propriétaires et locataires — le mode agent n'est pas disponible."
    );
    await showMainMenu(phone, "landlord", lang);
  }
}

export async function showLandlordSubmenu(phone: string, lang: Language): Promise<void> {
  const header =
    "🔧 *Plus d'options*" +
    "\n\nTapez *MENU* pour revenir";

  await sendMenuMessage(phone, header, landlordSubmenuOptions(lang), menuButtonLabel(lang));
  await setSession(phone, { flow: "landlord_extras", step: "submenu", language: lang, data: {} });
}
