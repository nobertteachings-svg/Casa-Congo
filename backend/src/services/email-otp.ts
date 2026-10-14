import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { APP_OTP_TTL_SEC } from "./app-otp.js";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw);
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isResendConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildLoginOtpEmail(
  otp: string,
  name: string
): { subject: string; html: string; text: string } {
  const mins = Math.round(APP_OTP_TTL_SEC / 60);
  const safeName = name.trim();
  const greeting = safeName ? `Bonjour ${safeName},` : "Bonjour,";
  const subject = "Votre code de connexion Casa Congo";
  const intro = "Utilisez ce code pour vous connecter à l’application Casa Congo. Il expire dans";
  const share =
    "Ne communiquez ce code à personne. Casa ne vous le demandera jamais par téléphone, WhatsApp ou e-mail.";
  const ignore = "Si vous n’avez pas demandé ce code, ignorez cet e-mail. Votre compte reste sécurisé.";
  const minsLabel = `${mins} minutes`;
  const support = "hello@casahomesdrcongo.com";
  const site = "https://casahomesdrcongo.com";
  const footer = "Casa Congo — logements en RDC.";

  const text = [
    greeting,
    "",
    `${intro} ${minsLabel} :`,
    otp,
    "",
    share,
    ignore,
    "",
    footer,
    site,
    support,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e4e8e6;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#0f2f24;padding:28px 32px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#c8d9d0;">Casa Congo</p>
              <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:20px;font-weight:600;color:#ffffff;line-height:1.3;">Vérification de connexion</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#1a241f;">${escapeHtml(
                greeting
              )}</p>
              <p style="margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:23px;color:#3d4a44;">${escapeHtml(
                intro
              )} <strong>${escapeHtml(minsLabel)}</strong>.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#f4f8f6;border:1px solid #d5e3db;border-radius:8px;padding:20px 16px;">
                    <p style="margin:0;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:32px;letter-spacing:10px;font-weight:700;color:#0f2f24;">${escapeHtml(
                      otp
                    )}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#5c6b64;">${escapeHtml(
                share
              )}</p>
              <p style="margin:12px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#5c6b64;">${escapeHtml(
                ignore
              )}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e4e8e6;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#7a8781;">${escapeHtml(
                footer
              )}<br />
              <a href="${site}" style="color:#1f6b4a;text-decoration:none;">casahomesdrcongo.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:${support}" style="color:#1f6b4a;text-decoration:none;">${support}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendLoginOtpEmail(to: string, otp: string, name: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  const { subject, html, text } = buildLoginOtpEmail(otp, name);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [normalizeEmail(to)],
      reply_to: "hello@casahomesdrcongo.com",
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.warn("Resend OTP email failed", { status: response.status, err: err.slice(0, 300) });
    return false;
  }

  return true;
}
