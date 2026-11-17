import { describe, expect, it, vi, afterEach } from "vitest";
import { handleHealthRequest } from "../functions/api/health";
import { handleInquiryRequest } from "../functions/api/inquiry";

function makeJsonRequest(body: unknown, method = "POST"): Request {
  return new Request("https://imajitek.pages.dev/api/inquiry", {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : null
  });
}

describe("Cloudflare Pages Edge Functions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/health returns 200 ok status", async () => {
    const req = new Request("https://imajitek.pages.dev/api/health", { method: "GET" });
    const res = handleHealthRequest(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; runtime: string };
    expect(json.ok).toBe(true);
    expect(json.runtime).toBe("cloudflare-pages-functions");
  });

  it("rejects non-POST methods with 405 and Allow header", async () => {
    const req = makeJsonRequest(null, "GET");
    const res = await handleInquiryRequest(req);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
  });

  it("rejects non-JSON content-type with 415", async () => {
    const req = new Request("https://imajitek.pages.dev/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "company=Test"
    });
    const res = await handleInquiryRequest(req);
    expect(res.status).toBe(415);
  });

  it("returns structured 400 validation errors when required fields are invalid or flood links", async () => {
    const req = makeJsonRequest({
      company: "A",
      whatsapp: "123",
      email: "bukan-email",
      notes: "https://a.com https://b.com https://c.com"
    });
    const res = await handleInquiryRequest(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as {
      ok: boolean;
      error: string;
      fieldErrors?: Record<string, string>;
    };
    expect(json.ok).toBe(false);
    expect(json.error).toBe("VALIDATION_ERROR");
    expect(json.fieldErrors?.company).toBeDefined();
    expect(json.fieldErrors?.whatsapp).toBeDefined();
    expect(json.fieldErrors?.email).toBeDefined();
    expect(json.fieldErrors?.notes).toBeDefined();
  });

  it("rejects automated bot speed submissions under 1.2s with 429", async () => {
    const req = makeJsonRequest({
      company: "Fast Bot",
      whatsapp: "08123456789",
      formStartedAt: Date.now() - 200
    });
    const res = await handleInquiryRequest(req);
    expect(res.status).toBe(429);
    const json = (await res.json()) as { ok: boolean; error: string };
    expect(json.ok).toBe(false);
    expect(json.error).toBe("BOT_SPEED_REJECTED");
  });

  it("rejects wrong anti-spam math challenge when Turnstile secret is unset", async () => {
    const req = makeJsonRequest({
      company: "Human Check",
      whatsapp: "08123456789",
      formStartedAt: Date.now() - 5000,
      spamChallenge: { a: 4, b: 5, answer: 10 }
    });
    const res = await handleInquiryRequest(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as {
      ok: boolean;
      error: string;
      fieldErrors?: Record<string, string>;
    };
    expect(json.ok).toBe(false);
    expect(json.error).toBe("SPAM_CHALLENGE_FAILED");
    expect(json.fieldErrors?.spamChallenge).toBeDefined();
  });

  it("dispatches email to imajistudio.id@gmail.com via Resend when RESEND_API_KEY is configured", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "re_test_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const req = makeJsonRequest({
      company: "PT Karya Nusantara",
      whatsapp: "0812-3456-7890",
      email: "tim@karyanusantara.co.id",
      topic: "Pembelian Lisensi Software & AI",
      notes: "Butuh 4 Adobe CC Pro dan 2 ChatGPT Team.",
      source: "home",
      formStartedAt: Date.now() - 5000,
      spamChallenge: { a: 3, b: 4, answer: 7 },
      selectedItems: [
        {
          id: "adobe-cc",
          label: "Adobe Creative Cloud Pro",
          type: "license",
          quantity: 4,
          billing: "Tahunan"
        }
      ]
    });

    const res = await handleInquiryRequest(req, { RESEND_API_KEY: "re_live_mock" });
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      ok: boolean;
      inquiryId: string;
      summary: string;
      emailDispatched?: boolean;
    };
    expect(json.ok).toBe(true);
    expect(json.emailDispatched).toBe(true);
    expect(json.inquiryId).toMatch(/^IMJ-[A-Z0-9]{8}$/);
    expect(json.summary).toContain("Imajitek Studio");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0]!;
    expect(calledUrl).toBe("https://api.resend.com/emails");
    const sentBody = JSON.parse(String(init?.body)) as { to: string[]; reply_to?: string };
    expect(sentBody.to).toEqual(["imajistudio.id@gmail.com"]);
    expect(sentBody.reply_to).toBe("tim@karyanusantara.co.id");
  });

  it("returns 503 EMAIL_NOT_CONFIGURED when neither RESEND_API_KEY nor INQUIRY_WEBHOOK_URL is set", async () => {
    const req = makeJsonRequest({
      company: "PT Bapenda Digital",
      whatsapp: "081234567890",
      formStartedAt: Date.now() - 5000,
      spamChallenge: { a: 2, b: 6, answer: 8 },
      selectedItems: [
        {
          id: "custom~Notion%20Plus",
          label: "Notion Plus",
          type: "license",
          quantity: 3,
          billing: "Tahunan"
        }
      ]
    });
    const res = await handleInquiryRequest(req, {});
    expect(res.status).toBe(503);
    const json = (await res.json()) as { ok: boolean; error: string };
    expect(json.ok).toBe(false);
    expect(json.error).toBe("EMAIL_NOT_CONFIGURED");
  });

  it("requires valid Turnstile token when TURNSTILE_SECRET_KEY is configured", async () => {
    const req = makeJsonRequest({
      company: "PT Tanpa Token",
      whatsapp: "081234567890",
      formStartedAt: Date.now() - 5000
    });
    const res = await handleInquiryRequest(req, { TURNSTILE_SECRET_KEY: "ts-secret" });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { ok: boolean; error: string };
    expect(json.error).toBe("CHALLENGE_REQUIRED");
  });

  it("silently absorbs honeypot spam submissions without failing", async () => {
    const req = makeJsonRequest({
      company: "Spam Bot",
      whatsapp: "08123456789",
      website: "https://spam.example.com"
    });
    const res = await handleInquiryRequest(req, {
      TURNSTILE_SECRET_KEY: "secret-should-not-trigger-on-honeypot"
    });
    expect(res.status).toBe(201);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
