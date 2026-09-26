import { subtypeLabel } from "../constants/property-taxonomy.js";
import type { Language } from "../i18n/messages.js";
import { setSession, type FlowState } from "../redis/client.js";
import {
  findHousesByLandlord,
  findHouseById,
  updateHouseStatusByLandlord,
  type House,
} from "../services/houses.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { showMainMenu } from "./main-menu.js";
import {
  landlordListingActionOptions,
  landlordListingPickerOptions,
  menuButtonLabel,
} from "./menu-options.js";

function statusLabel(status: string): string {
  if (status === "active") return "disponible";
  if (status === "inactive") return "loué / hors marché";
  if (status === "flagged") return "signalé";
  if (status === "under_review") return "en révision";
  return status;
}

async function showListingActions(
  phone: string,
  house: House,
  lang: Language
): Promise<void> {
  const kind = house.property_subtype ? subtypeLabel(house.property_subtype) : house.type;
  const header = `🏠 *${house.house_id}*\n${kind} — ${house.rent.toLocaleString("fr-CD")} CDF/mois\nStatut : ${statusLabel(house.status)}`;

  await sendMenuMessage(
    phone,
    header,
    landlordListingActionOptions(lang, house.status),
    menuButtonLabel(lang)
  );

  await setSession(phone, {
    flow: "landlord_listings",
    step: "listing_action",
    language: lang,
    data: { house_id: house.house_id, house_status: house.status },
  });
}

export async function showLandlordListingManager(phone: string, lang: Language): Promise<void> {
  const houses = await findHousesByLandlord(phone);
  if (houses.length === 0) {
    await sendTextMessage(
      phone,
      "Vous n'avez pas encore d'annonces."
    );
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  const header =
    "🏘 *Mes annonces*\nChoisissez un bien pour le marquer comme loué ou le remettre en ligne.";

  await sendMenuMessage(phone, header, landlordListingPickerOptions(houses, lang), menuButtonLabel(lang));

  await setSession(phone, {
    flow: "landlord_listings",
    step: "pick_listing",
    language: lang,
    data: { house_ids: houses.map((h) => h.house_id) },
  });
}

export async function handleLandlordListings(
  phone: string,
  text: string,
  session: FlowState
): Promise<void> {
  const lang = (session.language ?? "en") as Language;
  const choice = text.trim();

  if (choice.toLowerCase() === "menu") {
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  if (session.step === "pick_listing") {
    const houseId = choice.toUpperCase();
    const house = await findHouseById(houseId);
    if (!house || house.landlord_phone !== phone) {
      await sendTextMessage(
        phone,
        "Annonce introuvable. Choisissez dans la liste."
      );
      await showLandlordListingManager(phone, lang);
      return;
    }
    await showListingActions(phone, house, lang);
    return;
  }

  if (session.step === "listing_action") {
    const houseId = session.data.house_id as string;
    const house = await findHouseById(houseId);
    if (!house || house.landlord_phone !== phone) {
      await showMainMenu(phone, "landlord", lang);
      return;
    }

    if (choice === "rented") {
      const ok = await updateHouseStatusByLandlord(houseId, phone, "inactive");
      await sendTextMessage(
        phone,
        ok
          ? `✅ *${houseId}* marqué comme loué. Il n'apparaîtra plus dans les recherches.`
          : "Impossible de mettre à jour cette annonce."
      );
      await showLandlordListingManager(phone, lang);
      return;
    }

    if (choice === "reactivate") {
      const ok = await updateHouseStatusByLandlord(houseId, phone, "active");
      await sendTextMessage(
        phone,
        ok
          ? `✅ *${houseId}* est de nouveau en ligne. Les locataires peuvent le trouver.`
          : "Impossible de réactiver cette annonce."
      );
      await showLandlordListingManager(phone, lang);
      return;
    }

    await showLandlordListingManager(phone, lang);
  }
}
