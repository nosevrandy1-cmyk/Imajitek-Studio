import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { COMPANY, buildWhatsAppUrl } from "@/domain/catalog";
import {
  InquiryRequestSchema,
  type InquiryApiResponse,
  type SelectedQuoteItem
} from "@/domain/inquiry";
import { SpriteIcon } from "@/components/SpriteIcon";
import { subscribeInquiryPrefill } from "@/lib/events";
import { buildQuoteNote, parseQuoteSelections, toInquiryItems } from "@/lib/quote";

interface InquiryFormProps {
  variant: "home" | "contact";
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TOPICS = [
  "Website + Desain + Lisensi",
  "Pembuatan Website / Web App",
  "Desain UI/UX & Brand",
  "Pembelian Lisensi Software & AI"
] as const;

const TURNSTILE_SITE_KEY = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();

function randomChallengePair(): { a: number; b: number } {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b };
}

export default function InquiryForm({ variant }: InquiryFormProps) {
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedQuoteItem[]>([]);
  const [flashNotes, setFlashNotes] = useState(false);

  // Anti-spam states
  const formStartedAtRef = useRef<number | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengePair, setChallengePair] = useState<{ a: number; b: number }>({ a: 3, b: 4 });
  const [spamAnswer, setSpamAnswer] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    message: string;
    inquiryId?: string;
    followUpWaUrl?: string;
    followUpMailtoUrl?: string;
  } | null>(null);

  const triggerFlash = () => {
    setFlashNotes(false);
    window.requestAnimationFrame(() => setFlashNotes(true));
  };

  useEffect(() => {
    formStartedAtRef.current = Date.now();
    setChallengePair(randomChallengePair());
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileHostRef.current) return;

    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !turnstileHostRef.current || !window.turnstile) return;
      if (turnstileWidgetIdRef.current) return;
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileHostRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken("")
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      );
      if (existing) {
        existing.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeInquiryPrefill((detail) => {
      if (detail.notes) {
        setNotes(detail.notes);
        triggerFlash();
      }
      if (detail.topic) {
        setTopic(detail.topic);
      }
      if (detail.items) {
        setSelectedItems(detail.items);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (variant !== "contact") return;
    const params = new URLSearchParams(window.location.search);
    const quoteRaw = params.get("quote");
    const topicParam = params.get("topic");
    const notesParam = params.get("notes");

    if (quoteRaw) {
      const parsed = parseQuoteSelections(quoteRaw);
      if (parsed) {
        setSelectedItems(toInquiryItems(parsed));
        setNotes(buildQuoteNote(parsed));
        setTopic("Pembelian Lisensi Software & AI");
        triggerFlash();
      }
    } else if (notesParam) {
      setNotes(notesParam);
      triggerFlash();
    }

    if (topicParam) {
      setTopic(topicParam);
    }
  }, [variant]);

  const refreshChallenge = () => {
    setChallengePair(randomChallengePair());
    setSpamAnswer("");
    setFieldErrors((prev) => {
      const { spamChallenge: _, ...rest } = prev;
      return rest;
    });
  };

  const buildDirectLinks = (data: {
    company: string;
    whatsapp: string;
    topic: string;
    notes: string;
  }) => {
    const summaryBody = [
      `Halo ${COMPANY.brandName},`,
      `Nama / Perusahaan: ${data.company}`,
      `WhatsApp: ${data.whatsapp}`,
      `Topik: ${data.topic}`,
      "",
      data.notes || "Mohon informasi penawaran & estimasi pengerjaan."
    ].join("\n");

    const followUpWaUrl = buildWhatsAppUrl(summaryBody);
    const followUpMailtoUrl = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
      `[Imajitek Studio] ${data.topic} - ${data.company}`
    )}&body=${encodeURIComponent(summaryBody)}`;

    return { followUpWaUrl, followUpMailtoUrl };
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setToast(null);

    const parsedSpamInt = Number.parseInt(spamAnswer.trim(), 10);

    const payload = {
      company,
      whatsapp,
      email: variant === "contact" ? email : "",
      topic: variant === "contact" ? topic : "Konsultasi Beranda",
      notes,
      selectedItems,
      source: variant,
      website,
      formStartedAt: formStartedAtRef.current ?? Date.now() - 3000,
      ...(TURNSTILE_SITE_KEY
        ? { turnstileToken }
        : Number.isInteger(parsedSpamInt)
          ? {
              spamChallenge: {
                a: challengePair.a,
                b: challengePair.b,
                answer: parsedSpamInt
              }
            }
          : {})
    };

    const validated = InquiryRequestSchema.safeParse(payload);
    const extraErrors: Record<string, string> = {};

    if (TURNSTILE_SITE_KEY) {
      if (!turnstileToken) {
        extraErrors.turnstileToken = "Selesaikan verifikasi Cloudflare Turnstile terlebih dahulu.";
      }
    } else if (
      !Number.isInteger(parsedSpamInt) ||
      parsedSpamInt !== challengePair.a + challengePair.b
    ) {
      extraErrors.spamChallenge = "Jawaban verifikasi anti-spam belum tepat.";
    }

    if (!validated.success || Object.keys(extraErrors).length > 0) {
      const nextErrors: Record<string, string> = { ...extraErrors };
      if (!validated.success) {
        for (const issue of validated.error.issues) {
          const key = issue.path[0] ? String(issue.path[0]) : "_form";
          if (!nextErrors[key]) {
            nextErrors[key] = issue.message;
          }
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    const directLinks = buildDirectLinks(validated.data);

    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data)
      });

      // Local static `astro preview` serves dist/ without Cloudflare Pages Functions
      if (response.status === 404 || response.status === 405) {
        setToast({
          kind: "error",
          message:
            "Mode pratinjau statis tidak menjalankan server pengirim email. Saat live di Cloudflare Pages, formulir terkirim otomatis—atau lanjutkan langsung lewat jalur kontak di bawah:",
          ...directLinks
        });
        return;
      }

      const data = (await response.json()) as InquiryApiResponse;
      if (!response.ok || !data.ok) {
        if (!data.ok && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setToast({
          kind: "error",
          message: !data.ok
            ? data.message
            : "Pengiriman sedang terkendala. Silakan lanjutkan langsung lewat WhatsApp atau email di bawah:",
          ...directLinks
        });
        return;
      }

      setToast({
        kind: "success",
        message: data.summary,
        inquiryId: data.inquiryId
      });

      if (TURNSTILE_SITE_KEY && turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
        setTurnstileToken("");
      } else {
        refreshChallenge();
      }
    } catch {
      setToast({
        kind: "error",
        message:
          "Koneksi sedang terganggu. Silakan coba lagi atau lanjutkan langsung lewat WhatsApp atau email di bawah:",
        ...directLinks
      });
    } finally {
      setSubmitting(false);
    }
  };

  const prefix = variant === "home" ? "hq" : "rfq";

  return (
    <form
      className={variant === "home" ? "home-quick-form" : "rfq-form"}
      id={`${prefix}-form`}
      onSubmit={handleSubmit}
      noValidate
    >
      {variant === "home" && (
        <div>
          <h3>Kirim permintaan penawaran</h3>
          <p>
            Ceritakan kebutuhan proyek atau daftar software Anda—tim kami akan membalas dengan
            estimasi resmi.
          </p>
        </div>
      )}

      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${prefix}-website`}>Website</label>
        <input
          id={`${prefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="form-grid-2">
        <div className={`field ${fieldErrors.company ? "has-error" : ""}`}>
          <label htmlFor={`${prefix}-company`}>Nama Anda / Perusahaan</label>
          <input
            id={`${prefix}-company`}
            name="company"
            type="text"
            required
            placeholder="PT Sinar Karya / Andi"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          {fieldErrors.company && <span className="field-error">{fieldErrors.company}</span>}
        </div>

        <div className={`field ${fieldErrors.whatsapp ? "has-error" : ""}`}>
          <label htmlFor={`${prefix}-wa`}>Nomor WhatsApp</label>
          <input
            id={`${prefix}-wa`}
            name="whatsapp"
            type="text"
            required
            placeholder="0812-xxxx-xxxx"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          {fieldErrors.whatsapp && <span className="field-error">{fieldErrors.whatsapp}</span>}
        </div>
      </div>

      {variant === "contact" && (
        <div className="form-grid-2">
          <div className={`field ${fieldErrors.email ? "has-error" : ""}`}>
            <label htmlFor="rfq-email">Email</label>
            <input
              id="rfq-email"
              name="email"
              type="email"
              placeholder="nama@perusahaan.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="rfq-service">Topik Utama</label>
            <select
              id="rfq-service"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className={`field ${fieldErrors.notes ? "has-error" : ""}`}>
        <label htmlFor={`${prefix}-notes`}>
          {variant === "home" ? "Rincian Proyek atau Daftar Software" : "Rincian Kebutuhan"}
        </label>
        <textarea
          id={`${prefix}-notes`}
          name="notes"
          rows={4}
          className={flashNotes ? "field-flash" : ""}
          placeholder={
            variant === "home"
              ? "Misal: 2 Adobe CC Pro, 3 ChatGPT Team, atau konsultasi website perusahaan..."
              : "Misal: 2 akun Adobe CC Pro, 5 Canva Business, 3 ChatGPT Team, dan website company profile..."
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onAnimationEnd={() => setFlashNotes(false)}
        />
        {fieldErrors.notes && <span className="field-error">{fieldErrors.notes}</span>}
      </div>

      <div
        className={`antispam-box ${fieldErrors.spamChallenge || fieldErrors.turnstileToken ? "has-error" : ""}`}
      >
        <div className="antispam-head">
          <span className="antispam-badge">
            <SpriteIcon id="phd-shield-check" className="ph-icon ph-icon-xs" />
            <span>{TURNSTILE_SITE_KEY ? "Verifikasi Keamanan" : "Verifikasi Anti-Spam"}</span>
          </span>
          {!TURNSTILE_SITE_KEY && (
            <button
              type="button"
              className="antispam-refresh"
              aria-label="Ganti soal verifikasi anti-spam"
              title="Ganti soal"
              onClick={refreshChallenge}
            >
              <SpriteIcon id="ph-arrows-clockwise" className="ph-icon ph-icon-xs" />
            </button>
          )}
        </div>

        {TURNSTILE_SITE_KEY ? (
          <div ref={turnstileHostRef} className="turnstile-slot" />
        ) : (
          <div className="antispam-math-row">
            <label htmlFor={`${prefix}-antispam`} className="antispam-question">
              Berapa hasil{" "}
              <strong className="tabular">
                {challengePair.a} + {challengePair.b}
              </strong>
              ?
            </label>
            <input
              id={`${prefix}-antispam`}
              name="spamChallenge"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              required
              autoComplete="off"
              placeholder="Jawaban"
              className="antispam-input tabular"
              value={spamAnswer}
              onChange={(e) => setSpamAnswer(e.target.value)}
            />
          </div>
        )}

        {(fieldErrors.spamChallenge || fieldErrors.turnstileToken) && (
          <span className="field-error">
            {fieldErrors.spamChallenge ?? fieldErrors.turnstileToken}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={`btn btn-nvidia ${submitting ? "is-loading" : ""}`}
        style={{ width: "100%" }}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            <span>Mengirim...</span>
          </>
        ) : (
          <>
            <SpriteIcon id="ph-envelope" className="ph-icon ph-icon-sm" />
            <span>{variant === "home" ? "Kirim Permintaan" : "Kirim ke Tim Kami"}</span>
          </>
        )}
      </button>

      {toast && (
        <div
          className={`rfq-toast ${toast.kind === "error" ? "is-error" : ""}`}
          role="status"
          aria-live="polite"
        >
          <div>
            {toast.message}
            {toast.inquiryId && <span className="rfq-id-tag">#{toast.inquiryId}</span>}
          </div>
          {toast.kind === "error" && (toast.followUpWaUrl || toast.followUpMailtoUrl) && (
            <div className="rfq-toast-actions">
              {toast.followUpWaUrl && (
                <a
                  className="btn btn-glass btn-sm"
                  href={toast.followUpWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SpriteIcon id="ph-whatsapp-logo" className="ph-icon ph-icon-xs" />
                  <span>Lanjut via WhatsApp</span>
                </a>
              )}
              {toast.followUpMailtoUrl && (
                <a className="btn btn-glass btn-sm" href={toast.followUpMailtoUrl}>
                  <SpriteIcon id="ph-envelope" className="ph-icon ph-icon-xs" />
                  <span>Kirim via Email</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
