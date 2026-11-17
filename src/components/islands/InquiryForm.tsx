import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import UseAnimations from "react-useanimations";
import mail from "react-useanimations/lib/mail";
import refreshCcw from "react-useanimations/lib/refreshCcw";
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
  "Pembuatan Web & Aplikasi",
  "Desain Grafis",
  "Langganan Software & AI",
  "Gabungan Web, Desain & Software"
] as const;

function normalizeTopicParam(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if ((TOPICS as readonly string[]).includes(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower.includes("lisensi") || lower.includes("software")) {
    if (lower.includes("website") || lower.includes("web")) {
      return "Gabungan Web, Desain & Software";
    }
    return "Langganan Software & AI";
  }
  if (lower.includes("desain")) return "Desain Grafis";
  if (lower.includes("web")) return "Pembuatan Web & Aplikasi";
  return null;
}

const TURNSTILE_SITE_KEY = (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();

function randomChallengePair(): { a: number; b: number } {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b };
}

export default function InquiryForm({ variant }: InquiryFormProps) {
  const [company, setCompany] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [topic, setTopic] = useState<string>("");
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
      const mapped = normalizeTopicParam(detail.topic ?? null);
      if (mapped) {
        setTopic(mapped);
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
        const items = toInquiryItems(parsed);
        setSelectedItems(items);
        setNotes(buildQuoteNote(parsed));
        const hasProject = items.some((i) => i.type === "project");
        const hasLicense = items.some((i) => i.type === "license");
        setTopic(
          hasProject && hasLicense
            ? "Gabungan Web, Desain & Software"
            : hasProject
              ? "Pembuatan Web & Aplikasi"
              : "Langganan Software & AI"
        );
        triggerFlash();
      }
    } else if (notesParam) {
      setNotes(notesParam);
      triggerFlash();
    }

    const mapped = normalizeTopicParam(topicParam);
    if (mapped) {
      setTopic(mapped);
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
    email: string;
    topic: string;
    notes: string;
  }) => {
    const contactLine = [data.whatsapp, data.email].filter(Boolean).join(" / ");
    const summaryBody = [
      `Halo ${COMPANY.brandName},`,
      `Nama Lengkap / Instansi: ${data.company}`,
      `Kontak: ${contactLine}`,
      `Kategori Kebutuhan: ${data.topic}`,
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
    const trimmedContact = contactValue.trim();
    const isEmailInput = trimmedContact.includes("@");
    const effectiveTopic = variant === "contact" ? topic || TOPICS[0] : "Konsultasi Beranda";

    const payload = {
      company,
      whatsapp: isEmailInput ? "" : trimmedContact,
      email: isEmailInput ? trimmedContact : "",
      topic: effectiveTopic,
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

    if (!trimmedContact) {
      extraErrors.contact = "Masukkan email atau nomor WhatsApp yang valid.";
    }

    if (variant === "contact" && !topic) {
      extraErrors.topic = "Pilih kategori layanan terlebih dahulu.";
    }

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
          const targetKey = key === "whatsapp" || key === "email" ? "contact" : key;
          if (!nextErrors[targetKey]) {
            nextErrors[targetKey] = issue.message;
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
          const mappedErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.fieldErrors)) {
            mappedErrors[k === "whatsapp" || k === "email" ? "contact" : k] = v;
          }
          setFieldErrors(mappedErrors);
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
          <label htmlFor={`${prefix}-company`}>Nama Lengkap / Instansi</label>
          <input
            id={`${prefix}-company`}
            name="company"
            type="text"
            required
            placeholder="Contoh: Budi Santoso / PT Maju Bersama"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          {fieldErrors.company && <span className="field-error">{fieldErrors.company}</span>}
        </div>

        <div className={`field ${fieldErrors.contact ? "has-error" : ""}`}>
          <label htmlFor={`${prefix}-contact`}>Email atau Nomor WhatsApp</label>
          <input
            id={`${prefix}-contact`}
            name="contact"
            type="text"
            required
            placeholder="Contoh: 0812-xxxx-xxxx atau nama@email.com"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
          />
          {fieldErrors.contact && <span className="field-error">{fieldErrors.contact}</span>}
        </div>
      </div>

      {variant === "contact" && (
        <div className={`field ${fieldErrors.topic ? "has-error" : ""}`}>
          <label htmlFor="rfq-service">Kategori Kebutuhan</label>
          <select
            id="rfq-service"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="">
              Pilih layanan: Pembuatan Web &amp; Aplikasi / Desain Grafis / Langganan Software &amp;
              AI
            </option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {fieldErrors.topic && <span className="field-error">{fieldErrors.topic}</span>}
        </div>
      )}

      <div className={`field ${fieldErrors.notes ? "has-error" : ""}`}>
        <label htmlFor={`${prefix}-notes`}>Detail Kebutuhan</label>
        <textarea
          id={`${prefix}-notes`}
          name="notes"
          rows={4}
          className={flashNotes ? "field-flash" : ""}
          placeholder="Tuliskan gambaran singkat proyek web/desain Anda, atau sebutkan nama software beserta jumlah akun yang ingin dilanggan..."
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
            <UseAnimations
              animation={refreshCcw}
              interaction="click-replay"
              size={15}
              render={(eventProps, animationProps) => (
                <button
                  type="button"
                  className="antispam-refresh"
                  aria-label="Ganti soal verifikasi anti-spam"
                  title="Ganti soal"
                  {...eventProps}
                  onClick={(e) => {
                    eventProps.onClick(e);
                    refreshChallenge();
                  }}
                >
                  <span {...animationProps} />
                </button>
              )}
            />
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

      {submitting ? (
        <button
          type="submit"
          className="btn btn-nvidia is-loading"
          style={{ width: "100%" }}
          disabled
        >
          <span className="btn-spinner" aria-hidden="true" />
          <span>Mengirim...</span>
        </button>
      ) : (
        <UseAnimations
          animation={mail}
          interaction="hover-replay"
          size={18}
          render={(eventProps, animationProps) => (
            <button
              type="submit"
              className="btn btn-nvidia"
              style={{ width: "100%" }}
              {...eventProps}
            >
              <span {...animationProps} />
              <span>Kirim Permintaan Penawaran</span>
            </button>
          )}
        />
      )}

      {variant === "contact" && (
        <p className="rfq-wa-alt">
          Ingin respons lebih cepat? Hubungi kami langsung melalui{" "}
          <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          .
        </p>
      )}

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
