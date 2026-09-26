import type { Language } from "../../i18n/messages.js";
import type { House } from "../houses.js";
import { formatHouseSummary } from "../houses.js";
import { findUser } from "../users.js";
import { sendTextMessage } from "../whatsapp.js";

export async function notifyLandlordOfUnlock(
  house: House,
  tenantPhone: string
): Promise<void> {
  const landlord = await findUser(house.landlord_phone);
  const lang = (landlord?.language ?? "en") as Language;

  const message =
    `🔔 *Un locataire est intéressé !*\n\n` +
        `Quelqu'un a demandé votre contact pour :\n${formatHouseSummary(house, lang)}\n\n` +
        `Numéro du locataire : ${tenantPhone}\n\n` +
        `Attendez un appel ou un message WhatsApp.`;

  await sendTextMessage(house.landlord_phone, message);
}
