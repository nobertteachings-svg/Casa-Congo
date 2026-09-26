import { env, isPaymentsEnabled } from "../config/env.js";
import type { Language } from "../i18n/messages.js";
import { parseCategoryChoice, type PropertyCategory } from "../constants/property-taxonomy.js";
import { setSession, type FlowState } from "../redis/client.js";
import { parseSearchFromText } from "../services/claude.js";
import { resolveSearchCoordinates } from "../services/geocoding.js";
import {
  formatHouseSummary,
  googleMapsLink,
  isListingAvailable,
  searchNearbyHouses,
  type House,
} from "../services/houses.js";
import { formatMoveInCost } from "../services/features/cost.js";
import { recordListingView } from "../services/features/views.js";
import { recordUnlock } from "../services/features/unlocks.js";
import { sendPostUnlockConcierge } from "../services/features/concierge.js";
import { completeReferralReward } from "../services/features/referrals.js";
import { isVerified, verifiedBadge } from "../services/features/verification.js";
import { isLandlordVerified, landlordVerifiedBadge } from "../services/features/landlord-id-verification.js";
import { getAvailableCredits } from "../services/features/referrals.js";
import { sendMenuMessage, sendTextMessage } from "../services/transport.js";
import { sendHouseListingMedia } from "../services/features/listing-media.js";
import { checkUnlockAllowed } from "../services/features/unlock-limits.js";
import { notifyLandlordOfUnlock } from "../services/features/unlock-notifications.js";
import { showMainMenu } from "./main-menu.js";
import { handleSaveOrFlag } from "./tenant-features.js";
import {
  categoryMenuOptions,
  houseActionOptions,
  houseSelectOptions,
  menuButtonLabel,
} from "./menu-options.js";

type SearchData = {
  latitude?: number;
  longitude?: number;
  results?: string[];
  selected_house_id?: string;
  beneficiary_phone?: string;
  diaspora?: boolean;
  property_category?: PropertyCategory | "either";
};

async function deliverUnlock(
  phone: string,
  house: House,
  data: SearchData,
  lang: Language,
  options?: { skipMedia?: boolean }
): Promise<boolean> {
  if (!isListingAvailable(house)) {
    await sendTextMessage(
      phone,
      "⛔ Ce logement n'est plus disponible (déjà loué ou retiré). Relancez une recherche.");
    return false;
  }

  const unlockCheck = await checkUnlockAllowed(phone);
  if (!unlockCheck.allowed) {
    await sendTextMessage(
      phone,
      `⛔ Limite quotidienne atteinte : ${unlockCheck.limit} contacts par jour. Réessayez demain ou contactez le support.`);
    return false;
  }

  const credits = isPaymentsEnabled ? await getAvailableCredits(phone) : 0;

  await recordUnlock({
    tenantPhone: phone,
    houseId: house.house_id,
    beneficiaryPhone: data.beneficiary_phone,
    payerPhone: phone,
    useCredit: credits > 0,
    amountPaid: isPaymentsEnabled ? undefined : 0,
  });

  await completeReferralReward(phone);

  await notifyLandlordOfUnlock(house, phone).catch((err) => {
    console.error("Landlord unlock notification failed:", err);
  });

  const contactMsg =
    `✅ *Contact du propriétaire :*\n\n📞 ${house.landlord_phone}\n🗺 ${googleMapsLink(house.latitude, house.longitude)}`;

  if (!options?.skipMedia) {
    await sendHouseListingMedia(phone, house, lang);
  }
  await sendTextMessage(phone, contactMsg);

  if (data.beneficiary_phone) {
    await sendHouseListingMedia(data.beneficiary_phone, house, lang);
    await sendTextMessage(
      data.beneficiary_phone,
      `🏠 *Casa — Un logement pour vous*\n\n${formatHouseSummary(house, lang)}\n📞 Propriétaire : ${house.landlord_phone}\n🗺 ${googleMapsLink(house.latitude, house.longitude)}`);
  }

  await sendPostUnlockConcierge(phone, house, lang);
  return true;
}

function buildListingDetails(
  house: House,
  lang: Language,
  phone: string,
  credits: number
): Promise<string> {
  return Promise.all([isVerified(phone), isLandlordVerified(house.landlord_phone)]).then(
    ([verified, landlordVerified]) => {
      const costBlock = formatMoveInCost(house.rent, house.months_upfront, lang);
      const creditNote =
        isPaymentsEnabled && credits > 0
          ? `\n🎁 Vous avez ${credits} crédit(s) de déblocage gratuit !`
          : "";

      return (
        formatHouseSummary(house, lang) +
        verifiedBadge(lang, verified) +
        landlordVerifiedBadge(lang, landlordVerified) +
        (house.trust_tier === "verified_plus" ? "\n✨ Vérifiée+" : "") +
        (house.ai_description ? `\n\n${house.ai_description}` : "") +
        `\n\n${costBlock}` +
        creditNote +
        `\n\n🗺 ${googleMapsLink(house.latitude, house.longitude)}`
      );
    }
  );
}

export async function handleTenantSearch(
  phone: string,
  text: string,
  session: FlowState,
  messageType?: string,
  location?: { latitude: number; longitude: number }
): Promise<void> {
  const lang = (session.language ?? "en") as Language;
  const data = (session.data as SearchData) ?? {};
  const choice = text.trim();

  if (session.step === "diaspora_phone" && text) {
    await setSession(phone, {
      flow: "tenant_search",
      step: "category",
      language: lang,
      data: { ...data, beneficiary_phone: choice.replace(/\D/g, "") },
    });
    await sendTextMessage(
      phone,
      `✅ Mode diaspora activé pour ${data.beneficiary_phone ?? choice}.`);
    await sendMenuMessage(
      phone,
      "Vous cherchez :",
      categoryMenuOptions(lang),
      menuButtonLabel(lang)
    );
    return;
  }

  switch (session.step) {
    case "category": {
      const cat = parseCategoryChoice(choice);
      if (choice === "3" || choice.toLowerCase().includes("either") || choice.toLowerCase().includes("les deux") || choice.toLowerCase().includes("tout")) {
        data.property_category = "either";
      } else if (cat) {
        data.property_category = cat;
      } else {
        await sendTextMessage(phone, "Choix invalide.");
        return;
      }
      await setSession(phone, {
        flow: "tenant_search",
        step: "await_query",
        language: lang,
        data,
      });
      await sendTextMessage(
        phone,
        "Envoyez votre position 📍 ou décrivez ce que vous cherchez (quartier, loyer max, équipements…).\n\nAstuce : les notes vocales sont acceptées 🎤");
      return;
    }

    case "await_query": {
      let lat = data.latitude;
      let lon = data.longitude;

      if (messageType === "location" && location) {
        lat = location.latitude;
        lon = location.longitude;
      } else if (text) {
        const parsed = await parseSearchFromText(text, lang);
        const geo = await resolveSearchCoordinates(parsed);
        if (geo) {
          lat = geo.latitude;
          lon = geo.longitude;
        } else {
          await sendTextMessage(
            phone,
            "Quartier introuvable. Envoyez votre position 📍 ou un quartier (ex. Gombe, Ngaliema, Limete).");
          return;
        }
      } else {
        return;
      }

      const filters = text ? await parseSearchFromText(text, lang) : { raw_query: "" };
      const categoryFilter =
        data.property_category && data.property_category !== "either"
          ? data.property_category
          : filters.property_category;

      const results = await searchNearbyHouses(lat!, lon!, env.DEFAULT_SEARCH_RADIUS_KM, {
        maxRent: filters.max_rent,
        property_category: categoryFilter,
        property_subtype: filters.property_subtype,
        region: filters.region,
        town: filters.town ?? filters.city,
        water: filters.water,
        parking: filters.parking,
        electricity_meter: filters.electricity_meter,
        fenced: filters.fenced,
        borehole: filters.borehole,
        standby_generator: filters.standby_generator,
      });

      if (results.length === 0) {
        await sendTextMessage(
          phone,
          "Aucun logement trouvé à proximité.");
        await showMainMenu(phone, "tenant", lang);
        return;
      }

      const topResults = results.slice(0, 5);

      const header =
        `✅ *${results.length} logement(s) trouvé(s)*\n👇 Les photos et vidéos sont dans le chat — faites défiler pour voir`;
      await sendTextMessage(phone, header);

      for (let i = 0; i < topResults.length; i++) {
        await sendHouseListingMedia(phone, topResults[i], lang, { listIndex: i + 1 });
      }

      await sendMenuMessage(
        phone,
        isPaymentsEnabled
            ? "Touchez une annonce pour les détails et débloquer le contact."
            : "Touchez une annonce pour les détails et le contact du propriétaire.",
        houseSelectOptions(topResults),
        menuButtonLabel(lang)
      );

      await setSession(phone, {
        flow: "tenant_search",
        step: "select",
        language: lang,
        data: { ...data, latitude: lat, longitude: lon, results: topResults.map((h) => h.house_id) },
      });
      return;
    }

    case "select": {
      if (choice.toLowerCase() === "menu") {
        await showMainMenu(phone, "tenant", lang);
        return;
      }

      const idx = parseInt(choice, 10);
      const houseIds = data.results ?? [];
      if (idx < 1 || idx > houseIds.length) {
        await sendTextMessage(phone, "Numéro invalide.");
        return;
      }

      const houseId = houseIds[idx - 1];
      const { findHouseById } = await import("../services/houses.js");
      const house = await findHouseById(houseId);
      if (!house) {
        await showMainMenu(phone, "tenant", lang);
        return;
      }

      if (!isListingAvailable(house)) {
        await sendTextMessage(
          phone,
          "⛔ Ce logement n'est plus disponible. Choisissez-en un autre ou relancez la recherche.");
        return;
      }

      await recordListingView(houseId, phone);

      const credits = isPaymentsEnabled ? await getAvailableCredits(phone) : 0;
      const details = await buildListingDetails(house, lang, phone, credits);

      await sendHouseListingMedia(phone, house, lang, { listIndex: idx, caption: details });

      if (!isPaymentsEnabled) {
        const unlocked = await deliverUnlock(phone, house, data, lang, { skipMedia: true });
        if (!unlocked) {
          await showMainMenu(phone, "tenant", lang);
          return;
        }
        await sendMenuMessage(
          phone,
          "Que voulez-vous faire ?",
          houseActionOptions(lang, false),
          menuButtonLabel(lang)
        );
        await setSession(phone, {
          flow: "tenant_search",
          step: "house_actions",
          language: lang,
          data: { ...data, selected_house_id: houseId },
        });
        return;
      }

      await sendTextMessage(
        phone,
        `Pour débloquer : payez *${env.UNLOCK_FEE_CDF.toLocaleString("fr-CD")} CDF* (réf. : *${house.house_id}*) puis appuyez sur *J'ai payé*.`);
      await sendMenuMessage(
        phone,
        "Que voulez-vous faire ?",
        houseActionOptions(lang, true),
        menuButtonLabel(lang)
      );

      await setSession(phone, {
        flow: "tenant_search",
        step: "house_actions",
        language: lang,
        data: { ...data, selected_house_id: houseId },
      });
      return;
    }

    case "house_actions": {
      const houseId = data.selected_house_id!;
      if (await handleSaveOrFlag(phone, choice, houseId, lang)) return;

      if (choice.toLowerCase() === "menu") {
        await showMainMenu(phone, "tenant", lang);
        return;
      }

      if (!isPaymentsEnabled) {
        await sendMenuMessage(
          phone,
          "Choisissez une action :",
          houseActionOptions(lang, false),
          menuButtonLabel(lang)
        );
        return;
      }

      if (!["paid", "payé", "paye"].includes(choice.toLowerCase())) {
        await sendMenuMessage(
          phone,
          "Choisissez une action :",
          houseActionOptions(lang, true),
          menuButtonLabel(lang)
        );
        return;
      }

      await setSession(phone, {
        flow: "tenant_search",
        step: "await_payment",
        language: lang,
        data,
      });
      await handleTenantSearch(phone, choice, { ...session, step: "await_payment" }, messageType, location);
      return;
    }

    case "await_payment": {
      if (!["paid", "payé", "paye"].includes(choice.toLowerCase())) {
        await sendTextMessage(
          phone,
          `Après le paiement, répondez PAYÉ (réf. : ${data.selected_house_id}).`);
        return;
      }

      const { findHouseById } = await import("../services/houses.js");
      const house = await findHouseById(data.selected_house_id!);
      if (!house) {
        await showMainMenu(phone, "tenant", lang);
        return;
      }

      await deliverUnlock(phone, house, data, lang);

      await setSession(phone, {
        flow: "tenant_search",
        step: "post_unlock",
        language: lang,
        data: { selected_house_id: house.house_id },
      });
      return;
    }

    case "post_unlock":
      await showMainMenu(phone, "tenant", lang);
      return;
  }
}
