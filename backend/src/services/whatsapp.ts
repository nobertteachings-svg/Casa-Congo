import { env, isWhatsAppConfigured } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { canonicalPhone } from "./app-otp.js";

const GRAPH_API = "https://graph.facebook.com/v21.0";
const API_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(API_TIMEOUT_MS) });
}

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "video" | "location" | "interactive" | "button" | "unknown";
  text?: string;
  /** Stable id from a tapped button or list row (e.g. "1", "2"). */
  choiceId?: string;
  imageId?: string;
  audioId?: string;
  videoId?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  /** App upload reference, already stored outside WhatsApp media IDs. */
  mediaRef?: string;
}

export interface MenuOption {
  id: string;
  title: string;
  description?: string;
}

async function sendWhatsAppPayload(to: string, payload: Record<string, unknown>): Promise<boolean> {
  if (!isWhatsAppConfigured) {
    console.log(`[WhatsApp mock] → ${to}: ${JSON.stringify(payload).slice(0, 120)}...`);
    return true;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetchWithTimeout(
      `${GRAPH_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          ...payload,
        }),
      }
    );

    if (response.ok) return true;

    const err = await response.text();
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 400));
      continue;
    }

    console.error("WhatsApp send failed:", err);
    return false;
  }

  return false;
}

export async function sendImageMessage(
  to: string,
  mediaId: string,
  caption?: string
): Promise<boolean> {
  const image: Record<string, string> = { id: mediaId };
  if (caption) image.caption = caption.slice(0, 1024);
  return sendWhatsAppPayload(to, { type: "image", image });
}

export async function sendVideoMessage(
  to: string,
  mediaId: string,
  caption?: string
): Promise<boolean> {
  const video: Record<string, string> = { id: mediaId };
  if (caption) video.caption = caption.slice(0, 1024);
  return sendWhatsAppPayload(to, { type: "video", video });
}

export async function sendImageLink(
  to: string,
  url: string,
  caption?: string
): Promise<boolean> {
  const image: Record<string, string> = { link: url };
  if (caption) image.caption = caption.slice(0, 1024);
  return sendWhatsAppPayload(to, { type: "image", image });
}

export async function sendVideoLink(
  to: string,
  url: string,
  caption?: string
): Promise<boolean> {
  const video: Record<string, string> = { link: url };
  if (caption) video.caption = caption.slice(0, 1024);
  return sendWhatsAppPayload(to, { type: "video", video });
}

type TemplateComponent = Record<string, unknown>;

export function authOtpLanguageFallbacks(lang: "en" | "fr" = "fr"): string[] {
  const preferred =
    lang === "fr" ? env.WHATSAPP_OTP_TEMPLATE_LANG_FR : env.WHATSAPP_OTP_TEMPLATE_LANG_EN;
  const extras =
    lang === "fr" ? ["fr", "fr_FR", "en", "en_US"] : ["en", "en_US", "en_GB", "fr", "fr_FR"];
  return [...new Set([preferred, ...extras].map((c) => c.trim()).filter(Boolean))];
}

export function authOtpTemplateNames(): string[] {
  const named = env.WHATSAPP_OTP_TEMPLATE_NAME?.trim();
  return [...new Set([named, "casa_login_code"].filter((n): n is string => Boolean(n)))];
}

export function authOtpComponentVariants(code: string): TemplateComponent[][] {
  const bodyParam = { type: "text", text: code };
  return [
    [
      { type: "body", parameters: [bodyParam] },
      { type: "button", sub_type: "url", index: "0", parameters: [bodyParam] },
    ],
    [{ type: "body", parameters: [bodyParam] }],
  ];
}

interface WaTemplateInfo {
  name: string;
  language: string;
  status: string;
  category: string;
}

let templateCache: { at: number; items: WaTemplateInfo[] } | null = null;
const TEMPLATE_CACHE_MS = 5 * 60 * 1000;

async function listWabaTemplates(): Promise<WaTemplateInfo[]> {
  if (!isWhatsAppConfigured || !env.WHATSAPP_BUSINESS_ACCOUNT_ID) return [];
  if (templateCache && Date.now() - templateCache.at < TEMPLATE_CACHE_MS) {
    return templateCache.items;
  }

  const url = `${GRAPH_API}/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?limit=100&fields=name,status,category,language`;
  const response = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
  });
  if (!response.ok) {
    logger.warn("WhatsApp template list failed", { status: response.status });
    return templateCache?.items ?? [];
  }
  const json = (await response.json()) as { data?: WaTemplateInfo[] };
  const items = json.data ?? [];
  templateCache = { at: Date.now(), items };
  return items;
}

async function ensureCasaLoginTemplates(): Promise<void> {
  if (!isWhatsAppConfigured || !env.WHATSAPP_BUSINESS_ACCOUNT_ID) return;

  const existing = await listWabaTemplates();
  const needed: Array<{ language: string; button: string }> = [
    { language: "fr", button: "Copier le code" },
    { language: "en", button: "Copy Code" },
  ];

  for (const spec of needed) {
    const already = existing.some(
      (t) =>
        t.name === "casa_login_code" &&
        t.language === spec.language &&
        (t.status === "APPROVED" || t.status === "PENDING" || t.status === "PENDING_DELETION")
    );
    if (already) continue;

    const response = await fetchWithTimeout(
      `${GRAPH_API}/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "casa_login_code",
          language: spec.language,
          category: "AUTHENTICATION",
          message_send_ttl_seconds: 600,
          components: [
            { type: "BODY", add_security_recommendation: true },
            { type: "FOOTER", code_expiration_minutes: 10 },
            {
              type: "BUTTONS",
              buttons: [{ type: "OTP", otp_type: "COPY_CODE", text: spec.button }],
            },
          ],
        }),
      }
    );
    const body = await response.text();
    if (response.ok) {
      templateCache = null;
      logger.info("WhatsApp OTP template submitted", { language: spec.language });
    } else if (!body.includes("already exists") && !body.includes("834")) {
      logger.warn("WhatsApp OTP template create failed", {
        language: spec.language,
        status: response.status,
        err: body.slice(0, 400),
      });
    }
  }
}

/**
 * Send login OTP via a Meta authentication/utility template so it arrives
 * even if the user has never messaged Casa (outside the 24h session window).
 */
export async function sendAuthenticationOtp(
  to: string,
  code: string,
  lang: "en" | "fr" = "fr",
  options?: { discover?: boolean }
): Promise<boolean> {
  if (!isWhatsAppConfigured) return false;

  try {
    const languages = authOtpLanguageFallbacks(lang);
    const names = authOtpTemplateNames();
    const componentsList = authOtpComponentVariants(code);

    const tryName = async (name: string, langs: string[]): Promise<boolean> => {
      for (const language of langs) {
        for (const components of componentsList) {
          const ok = await sendWhatsAppPayload(to, {
            type: "template",
            template: { name, language: { code: language }, components },
          });
          if (ok) {
            logger.info("WhatsApp OTP template sent", { name, language });
            return true;
          }
        }
      }
      return false;
    };

    for (const name of names) {
      if (await tryName(name, languages)) return true;
    }

    if (options?.discover === false) return false;

    const listed = await listWabaTemplates();
    const approvedAuth = listed.filter(
      (t) => t.status === "APPROVED" && (t.category === "AUTHENTICATION" || t.category === "UTILITY")
    );
    const preferred = approvedAuth.filter((t) => languages.includes(t.language));
    for (const t of [...preferred, ...approvedAuth]) {
      if (await tryName(t.name, [t.language])) return true;
    }

    await ensureCasaLoginTemplates();
    return tryName("casa_login_code", languages);
  } catch (err) {
    logger.warn("WhatsApp OTP template send failed", { err: String(err) });
    return false;
  }
}

export async function sendTextMessage(to: string, body: string): Promise<void> {
  const ok = await sendWhatsAppPayload(to, {
    type: "text",
    text: { preview_url: true, body },
  });
  if (!ok) {
    throw new Error("WhatsApp text send failed");
  }
}

/** Up to 3 tappable reply buttons. */
export async function sendButtonMessage(
  to: string,
  body: string,
  options: MenuOption[]
): Promise<void> {
  if (options.length === 0 || options.length > 3) {
    throw new Error("Button messages support 1–3 options");
  }

  const ok = await sendWhatsAppPayload(to, {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: options.map((opt) => ({
          type: "reply",
          reply: {
            id: opt.id.slice(0, 256),
            title: opt.title.slice(0, 20),
          },
        })),
      },
    },
  });

  if (!ok) {
    throw new Error("WhatsApp button send failed");
  }
}

/** Scrollable list for 4–10 tappable options. */
export async function sendListMessage(
  to: string,
  body: string,
  options: MenuOption[],
  listButtonText: string
): Promise<void> {
  if (options.length === 0 || options.length > 10) {
    throw new Error("List messages support 1–10 options");
  }

  const ok = await sendWhatsAppPayload(to, {
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body.slice(0, 1024) },
      action: {
        button: listButtonText.slice(0, 20),
        sections: [
          {
            rows: options.map((opt) => ({
              id: opt.id.slice(0, 200),
              title: opt.title.slice(0, 24),
              ...(opt.description ? { description: opt.description.slice(0, 72) } : {}),
            })),
          },
        ],
      },
    },
  });

  if (!ok) {
    throw new Error("WhatsApp list send failed");
  }
}

/** Buttons for ≤3 options, list message otherwise. Falls back to numbered text if send fails. */
export async function sendMenuMessage(
  to: string,
  body: string,
  options: MenuOption[],
  listButtonText: string
): Promise<void> {
  try {
    if (options.length <= 3) {
      await sendButtonMessage(to, body, options);
    } else {
      await sendListMessage(to, body, options, listButtonText);
    }
  } catch (err) {
    console.warn("Interactive menu failed, falling back to text:", err);
    const numbered = options
      .map((opt, i) => `*${opt.id || i + 1}.* ${opt.title}${opt.description ? ` — ${opt.description}` : ""}`)
      .join("\n");
    await sendTextMessage(to, `${body}\n\n${numbered}`);
  }
}

export async function probeWhatsAppSend(
  to: string,
  body = "Casa connectivity test — you can ignore this."
): Promise<{ ok: boolean; status: number; body: unknown }> {
  if (!isWhatsAppConfigured) {
    return { ok: false, status: 0, body: { error: "WhatsApp not configured" } };
  }

  const response = await fetchWithTimeout(
    `${GRAPH_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  const parsed = await response.json().catch(async () => response.text());
  return { ok: response.ok, status: response.status, body: parsed };
}

export async function markAsRead(messageId: string): Promise<void> {
  if (!isWhatsAppConfigured) return;

  await fetchWithTimeout(`${GRAPH_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

/** Prefer the phone in contacts.wa_id when Meta sends a LID in messages.from. */
export function resolveWhatsAppSenderPhone(
  from: string,
  contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>
): { phone: string; name?: string } {
  const fromDigits = from.replace(/\D/g, "");
  const looksLikeMsisdn = (d: string) => d.length >= 10 && d.length <= 15;
  const named = contacts?.find((c) => c.wa_id === from) ?? contacts?.[0];
  const waDigits = (named?.wa_id ?? "").replace(/\D/g, "");

  if (waDigits && looksLikeMsisdn(waDigits) && waDigits !== fromDigits) {
    return { phone: waDigits, name: named?.profile?.name };
  }
  if (looksLikeMsisdn(fromDigits)) {
    return { phone: fromDigits, name: named?.profile?.name };
  }
  if (waDigits) return { phone: waDigits, name: named?.profile?.name };
  return { phone: fromDigits || from, name: named?.profile?.name };
}

export function parseWebhookPayload(body: unknown): IncomingMessage[] {
  const messages: IncomingMessage[] = [];
  if (!body || typeof body !== "object") return messages;

  const payload = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
          messages?: Array<Record<string, unknown>>;
        };
      }>;
    }>;
  };

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;

      for (const msg of value.messages) {
        const rawFrom = String(msg.from ?? "");
        const sender = resolveWhatsAppSenderPhone(rawFrom, value.contacts);
        const contact =
          value.contacts?.find((c) => c.wa_id === rawFrom) ??
          value.contacts?.find((c) => c.wa_id === sender.phone) ??
          value.contacts?.[0];
        const base = {
          from: canonicalPhone(sender.phone),
          id: String(msg.id ?? ""),
          timestamp: String(msg.timestamp ?? ""),
          name: sender.name ?? contact?.profile?.name,
        };

        if (msg.type === "text" && msg.text && typeof msg.text === "object") {
          const textObj = msg.text as { body?: string };
          messages.push({
            ...base,
            type: "text",
            text: textObj.body ?? "",
          });
        } else if (msg.type === "location" && msg.location) {
          const loc = msg.location as { latitude?: number; longitude?: number };
          messages.push({
            ...base,
            type: "location",
            latitude: loc.latitude,
            longitude: loc.longitude,
          });
        } else if (msg.type === "image" && msg.image) {
          const img = msg.image as { id?: string };
          messages.push({
            ...base,
            type: "image",
            imageId: img.id,
          });
        } else if (msg.type === "audio" && msg.audio) {
          const audio = msg.audio as { id?: string };
          messages.push({
            ...base,
            type: "audio",
            audioId: audio.id,
          });
        } else if (msg.type === "video" && msg.video) {
          const video = msg.video as { id?: string };
          messages.push({
            ...base,
            type: "video",
            videoId: video.id,
          });
        } else if (msg.type === "interactive" && msg.interactive) {
          const interactive = msg.interactive as {
            button_reply?: { id?: string; title?: string };
            list_reply?: { id?: string; title?: string };
          };
          const reply = interactive.button_reply ?? interactive.list_reply;
          const choiceId = reply?.id ?? "";
          const title = reply?.title ?? "";
          messages.push({
            ...base,
            type: "interactive",
            text: choiceId || title,
            choiceId: choiceId || undefined,
          });
        } else if (msg.type === "button" && msg.button) {
          const button = msg.button as { text?: string; payload?: string };
          messages.push({
            ...base,
            type: "button",
            text: button.payload ?? button.text ?? "",
            choiceId: button.payload ?? undefined,
          });
        } else {
          messages.push({ ...base, type: "unknown" });
        }
      }
    }
  }

  return messages;
}
