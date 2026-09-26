import { casaWhatsAppLink } from "../../config/env.js";
import { sendTextMessage } from "../transport.js";

/** Prefill so a friend opens Casa chat with the referrer's number already in the message. */
export function referralSignupPrefill(_lang: "en", referralPhone: string): string {
  return `Bonjour Casa ! Je veux m'inscrire. Mon numéro de parrain est ${referralPhone}`;
}

/** Short forwardable invite — personalized with this user's referral number in the link. */
export function buildReferralInviteMessage(_lang: "en", referralPhone: string): string {
  const link = casaWhatsAppLink(referralSignupPrefill("en", referralPhone));

  return (
    "🏠 *Casa Congo* — trouvez ou publiez un logement en RDC sur l'app ou WhatsApp.\n\n" +
    "• *Locataire :* touchez le lien → Je cherche un logement → chercher\n" +
    "• *Propriétaire :* touchez le lien → Je suis propriétaire → publier\n\n" +
    "➡️ Transférez ce message. Votre ami appuie ici :\n" +
    `${link}`
  );
}

/** Send this user their personal invite to forward to friends. */
export async function sendReferralInvite(
  phone: string,
  lang: "en"
): Promise<void> {
  await sendTextMessage(phone, buildReferralInviteMessage(lang, phone));
}
