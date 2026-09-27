import { isWhatsAppConfigured } from "../config/env.js";
import type { Language } from "../i18n/messages.js";
import { setSession, type FlowState } from "../redis/client.js";
import type { IncomingMessage } from "../services/whatsapp.js";
import { sendTextMessage } from "../services/transport.js";
import {
  analyzePreparedSide,
  finalizeLandlordIdVerification,
  isLandlordVerified,
} from "../services/features/landlord-id-verification.js";
import { downloadWhatsAppMedia } from "../services/features/voice.js";
import { showMainMenu } from "./main-menu.js";

async function downloadImage(imageId: string): Promise<Buffer | null> {
  if (!isWhatsAppConfigured) return null;
  return downloadWhatsAppMedia(imageId);
}

export async function startLandlordIdVerification(
  phone: string,
  lang: Language
): Promise<void> {
  const already = await isLandlordVerified(phone);
  if (already) {
    await sendTextMessage(
      phone,
      "✅ Votre identité est déjà vérifiée.");
    await showMainMenu(phone, "landlord", lang);
    return;
  }

  await setSession(phone, {
    flow: "landlord_verify_id",
    step: "await_id_photo",
    language: lang,
    data: {},
  });

  await sendTextMessage(
    phone,
    "🪪 *Vérification d'identité*\n\nEnvoyez *une photo* d'un document où votre *nom* est clairement visible.\n\nExemples : carte d'identité nationale, passeport, permis, reçu, facture SNEL, ou tout autre document avec votre nom.\n\nPas besoin du recto *et* du verso — une photo suffit.");
}

export async function handleLandlordIdVerification(
  phone: string,
  text: string,
  session: FlowState,
  messageType?: string,
  message?: IncomingMessage
): Promise<void> {
  const lang = (session.language ?? "en") as Language;

  // Back-compat: old front/back sessions collapse to single-photo step
  const step =
    session.step === "await_id_front" ||
    session.step === "await_id_back" ||
    session.step === "await_id_doc"
      ? "await_id_photo"
      : session.step;

  if (step !== "await_id_photo") return;

  if (messageType !== "image" || (!message?.imageId && !message?.mediaRef)) {
    await sendTextMessage(
      phone,
      "Envoyez *une photo* d'un document où votre *nom* est visible.");
    return;
  }

  await sendTextMessage(phone, "🔍 Analyse de votre document…");

  let imageBuffer: Buffer | null = null;
  if (message.mediaRef) {
    const { fetchCloudinaryBuffer } = await import("../services/features/cloudinary-media.js");
    imageBuffer = await fetchCloudinaryBuffer(message.mediaRef);
  } else if (message.imageId) {
    imageBuffer = await downloadImage(message.imageId);
  } else {
    return;
  }

  if (!imageBuffer) {
    await sendTextMessage(
      phone,
      "⏳ Photo reçue mais le téléchargement a échoué. Réessayez.");
    return;
  }

  const scan = await analyzePreparedSide(imageBuffer, "front");
  if (!scan) {
    await sendTextMessage(
      phone,
      "⏳ Impossible d'analyser la photo. Renvoyez une image plus nette où le *nom* est lisible.");
    return;
  }

  const outcome = await finalizeLandlordIdVerification(
    phone,
    message.mediaRef ?? message.imageId!,
    null,
    scan,
    lang
  );
  await sendTextMessage(phone, outcome.message);

  if (outcome.status === "rejected") {
    await setSession(phone, {
      flow: "landlord_verify_id",
      step: "await_id_photo",
      language: lang,
      data: {},
    });
    return;
  }

  await showMainMenu(phone, "landlord", lang);
}

export async function requireLandlordVerification(
  phone: string,
  lang: Language
): Promise<boolean> {
  if (await isLandlordVerified(phone)) return true;

  await sendTextMessage(
    phone,
    "⚠️ *Vérification obligatoire*\n\nAvant de publier, envoyez *une photo* d'un document où votre *nom* est visible (carte d'identité, passeport, reçu, etc.).");
  await startLandlordIdVerification(phone, lang);
  return false;
}
