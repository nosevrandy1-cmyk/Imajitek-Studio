import type { PagesFunction, Response as CFResponse } from "@cloudflare/workers-types";
import { COMPANY } from "@/domain/catalog";
import {
  InquiryRequestSchema,
  type InquiryApiResponse,
  type InquiryRequest
} from "@/domain/inquiry";

export interface InquiryEnv {
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
  INQUIRY_WEBHOOK_URL?: string;
}

const MAX_BODY_BYTES = 16 * 1024;
const MIN_HUMAN_FILL_MS = 1200;

function jsonResponse(
  body: InquiryApiResponse,
  status: number,
  extraHeaders?: HeadersInit
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHeaderText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp: string | null
): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);
  if (remoteIp) {
    formData.set("remoteip", remoteIp);
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });

  if (!res.ok) return false;
  const payload = (await res.json()) as { success?: boolean };
  return payload.success === true;
}

function buildHumanSummary(data: InquiryRequest, emailDispatched: boolean): string {
  const targetEmail = COMPANY.email;
  const count = data.selectedItems.length;
  const itemPrefix =
    count > 0 ? `${count} item pilihan dari ${data.company}` : `Permintaan dari ${data.company}`;

  if (emailDispatched) {
    return `${itemPrefix} telah dikirim ke email ${targetEmail}. Tim kami segera menghubungi WhatsApp ${data.whatsapp}.`;
  }
  return `${itemPrefix} telah tercatat rapi. Tim kami siap membalas melalui WhatsApp ${data.whatsapp} atau email ${targetEmail}.`;
}

function buildEmailBodies(
  inquiryId: string,
  receivedAt: string,
  data: InquiryRequest
): { subject: string; text: string; html: string } {
  const safeCompany = sanitizeHeaderText(data.company);
  const safeTopic = sanitizeHeaderText(data.topic);
  const subject = `[Imajitek Studio] ${safeTopic} — ${safeCompany} (${inquiryId})`;

  const itemsText =
    data.selectedItems.length > 0
      ? data.selectedItems
          .map((item) =>
            item.type === "project"
              ? `- ${item.label}: Proyek Custom`
              : `- ${item.label}: ${item.quantity} akun · ${item.billing}`
          )
          .join("\n")
      : "- Tidak ada item katalog terlampir";

  const text = [
    `Permintaan Baru (${inquiryId})`,
    `Waktu: ${receivedAt}`,
    `Sumber: ${data.source}`,
    `Nama / Perusahaan: ${data.company}`,
    `Nomor WhatsApp: ${data.whatsapp}`,
    `Email Pengirim: ${data.email || "-"}`,
    `Topik: ${data.topic}`,
    "",
    "Item Terpilih:",
    itemsText,
    "",
    "Catatan Kebutuhan:",
    data.notes || "-"
  ].join("\n");

  const itemsHtml =
    data.selectedItems.length > 0
      ? `<ul>${data.selectedItems
          .map((item) => {
            const detail =
              item.type === "project"
                ? "Proyek Custom"
                : `${item.quantity} akun · ${escapeHtml(item.billing)}`;
            return `<li><strong>${escapeHtml(item.label)}</strong>: ${detail}</li>`;
          })
          .join("")}</ul>`
      : "<p><em>Tidak ada item katalog terlampir</em></p>";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; color: #161c14;">
      <div style="border: 1px solid #dce3d7; border-radius: 14px; padding: 24px; background: #ffffff;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #3c6600; text-transform: uppercase;">
          Imajitek Studio · Permintaan Penawaran Baru
        </p>
        <h2 style="margin: 0 0 16px; font-size: 20px;">${escapeHtml(data.company)} (${escapeHtml(inquiryId)})</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #5f695b; width: 140px;">WhatsApp</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(data.whatsapp)}</td></tr>
          <tr><td style="padding: 6px 0; color: #5f695b;">Email Pengirim</td><td style="padding: 6px 0;">${escapeHtml(data.email || "-")}</td></tr>
          <tr><td style="padding: 6px 0; color: #5f695b;">Topik</td><td style="padding: 6px 0;">${escapeHtml(data.topic)}</td></tr>
          <tr><td style="padding: 6px 0; color: #5f695b;">Sumber Form</td><td style="padding: 6px 0;">${escapeHtml(data.source)}</td></tr>
          <tr><td style="padding: 6px 0; color: #5f695b;">Waktu Masuk</td><td style="padding: 6px 0;">${escapeHtml(receivedAt)}</td></tr>
        </table>
        <h3 style="margin: 16px 0 8px; font-size: 14px;">Item Katalog Dipilih</h3>
        ${itemsHtml}
        <h3 style="margin: 16px 0 8px; font-size: 14px;">Rincian Kebutuhan</h3>
        <pre style="margin: 0; padding: 12px; background: #f4f6f2; border-radius: 8px; white-space: pre-wrap; font-family: inherit; font-size: 14px;">${escapeHtml(data.notes || "-")}</pre>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
}

async function dispatchResendEmail(
  env: InquiryEnv,
  inquiryId: string,
  receivedAt: string,
  data: InquiryRequest
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  const toEmail = env.INQUIRY_TO_EMAIL || COMPANY.email;
  const fromEmail = env.INQUIRY_FROM_EMAIL || `${COMPANY.brandName} <onboarding@resend.dev>`;
  const { subject, text, html } = buildEmailBodies(inquiryId, receivedAt, data);

  const payload: Record<string, unknown> = {
    from: fromEmail,
    to: [toEmail],
    subject,
    text,
    html
  };
  if (data.email) {
    payload.reply_to = data.email;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown error");
    console.error("Resend email delivery failed:", res.status, errText);
    return false;
  }
  return true;
}

async function forwardInquiryWebhook(
  webhookUrl: string,
  inquiryId: string,
  receivedAt: string,
  data: InquiryRequest
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        inquiryId,
        receivedAt,
        recipientEmail: COMPANY.email,
        source: data.source,
        company: data.company,
        whatsapp: data.whatsapp,
        email: data.email || null,
        topic: data.topic,
        notes: data.notes,
        selectedItems: data.selectedItems
      })
    });
  } catch (err) {
    console.error("Failed to dispatch inquiry webhook:", err);
  }
}

export async function handleInquiryRequest(
  request: Request,
  env: InquiryEnv = {},
  waitUntil?: (promise: Promise<unknown>) => void
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Endpoint ini hanya menerima permintaan POST."
      },
      405,
      { Allow: "POST" }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(
      {
        ok: false,
        error: "UNSUPPORTED_MEDIA_TYPE",
        message: "Header Content-Type harus application/json."
      },
      415
    );
  }

  const rawText = await request.text();
  if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(
      {
        ok: false,
        error: "PAYLOAD_TOO_LARGE",
        message: "Ukuran permintaan melebihi batas 16 KB."
      },
      413
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "INVALID_JSON",
        message: "Payload JSON tidak dapat dibaca."
      },
      400
    );
  }

  const result = InquiryRequestSchema.safeParse(parsedJson);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] ? String(issue.path[0]) : "_form";
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return jsonResponse(
      {
        ok: false,
        error: "VALIDATION_ERROR",
        message: "Mohon periksa kembali isian formulir Anda.",
        fieldErrors
      },
      400
    );
  }

  const data = result.data;
  const receivedAt = new Date().toISOString();
  const inquiryId = `IMJ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Layer 1 Anti-Spam: Honeypot field filled -> drop silently without forwarding downstream
  if (data.website && data.website.trim().length > 0) {
    return jsonResponse(
      {
        ok: true,
        inquiryId,
        receivedAt,
        summary: "Permintaan telah diterima."
      },
      201
    );
  }

  // Layer 2 Anti-Spam: Reject impossibly fast automated submissions (<1.2s)
  if (typeof data.formStartedAt === "number") {
    const elapsedMs = Date.now() - data.formStartedAt;
    if (elapsedMs < MIN_HUMAN_FILL_MS || elapsedMs < -60_000) {
      return jsonResponse(
        {
          ok: false,
          error: "BOT_SPEED_REJECTED",
          message: "Pengiriman terdeteksi terlalu cepat. Mohon tunggu sebentar lalu kirim ulang."
        },
        429
      );
    }
  }

  // Layer 3 Anti-Spam: Cloudflare Turnstile when configured, or human verification challenge fallback
  if (env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      return jsonResponse(
        {
          ok: false,
          error: "CHALLENGE_REQUIRED",
          message: "Verifikasi keamanan Turnstile diperlukan.",
          fieldErrors: {
            turnstileToken: "Selesaikan verifikasi keamanan terlebih dahulu."
          }
        },
        400
      );
    }

    const clientIp = request.headers.get("cf-connecting-ip");
    const passed = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, data.turnstileToken, clientIp);
    if (!passed) {
      return jsonResponse(
        {
          ok: false,
          error: "CHALLENGE_FAILED",
          message: "Verifikasi Turnstile tidak valid. Silakan muat ulang verifikasi.",
          fieldErrors: {
            turnstileToken: "Verifikasi Turnstile tidak valid. Silakan coba lagi."
          }
        },
        403
      );
    }
  } else if (
    data.spamChallenge &&
    data.spamChallenge.a + data.spamChallenge.b !== data.spamChallenge.answer
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "SPAM_CHALLENGE_FAILED",
        message: "Jawaban verifikasi anti-spam tidak sesuai.",
        fieldErrors: {
          spamChallenge: "Jawaban verifikasi anti-spam belum tepat."
        }
      },
      400
    );
  }

  let emailDispatched = false;
  if (env.RESEND_API_KEY) {
    emailDispatched = await dispatchResendEmail(env, inquiryId, receivedAt, data);
    if (!emailDispatched) {
      return jsonResponse(
        {
          ok: false,
          error: "EMAIL_DELIVERY_FAILED",
          message: `Pengiriman email ke ${COMPANY.email} sedang mengalami gangguan. Anda tetap dapat menghubungi WhatsApp ${COMPANY.whatsappDisplay}.`
        },
        502
      );
    }
  }

  if (env.INQUIRY_WEBHOOK_URL) {
    const job = forwardInquiryWebhook(env.INQUIRY_WEBHOOK_URL, inquiryId, receivedAt, data);
    if (waitUntil) {
      waitUntil(job);
    } else {
      await job;
    }
  }

  return jsonResponse(
    {
      ok: true,
      inquiryId,
      receivedAt,
      summary: buildHumanSummary(data, emailDispatched),
      emailDispatched
    },
    201
  );
}

export const onRequest: PagesFunction<InquiryEnv> = async (context) => {
  return (await handleInquiryRequest(context.request as unknown as Request, context.env, (p) =>
    context.waitUntil(p)
  )) as unknown as CFResponse;
};
