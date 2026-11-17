import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import { COMPANY, ORDER_FEED_ITEMS } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchInquiryPrefill } from "@/lib/events";

const VISIBLE_SLOTS = [0, 1, 2, 3, 4] as const;
const STEP_INTERVAL_MS = 2800;

export default function OrderHookSection() {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget as Node | null;
    if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
      setPaused(false);
    }
  };

  return (
    <div className="order-hook-grid" id="home-order-hook">
      <div
        className="order-feed-card"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={handleBlurCapture}
      >
        <div className="order-feed-stage">
          <div className="order-feed-brand" aria-hidden="true">
            <div className="order-feed-brand-main">
              <img src="/logo-itb-green.png" alt="" width="40" height="21" className="brand-logo" />
            </div>
            <span className="order-feed-brand-sub">
              <SpriteIcon id="phd-shield-check" className="ph-icon ph-icon-xs" />
            </span>
          </div>

          <div className="order-feed-viewport" aria-label="Simulasi antrean pemesanan dan aktivasi">
            <div className="order-feed-stack">
              {VISIBLE_SLOTS.map((slot) => {
                const cycleId = tick - slot;
                const total = ORDER_FEED_ITEMS.length;
                const itemIndex = ((cycleId % total) + total) % total;
                const entry = ORDER_FEED_ITEMS[itemIndex];
                if (!entry) return null;

                const isFeatured = slot === 0;
                const isEntering = tick > 0 && slot === 0;
                const isExiting = slot === 4;
                const slotStyle = { "--slot": slot } as CSSProperties;
                const statusLabel = isFeatured
                  ? "Diproses"
                  : entry.statusLabel === "Diproses"
                    ? "Aktif"
                    : entry.statusLabel;

                return (
                  <div
                    key={`order-cycle-${cycleId}`}
                    className={`order-feed-slot ${isFeatured ? "is-featured" : ""} ${isEntering ? "is-entering" : ""} ${isExiting ? "is-exiting" : ""}`}
                    data-slot={slot}
                    style={slotStyle}
                    aria-hidden={isExiting ? true : undefined}
                  >
                    <button
                      type="button"
                      tabIndex={isExiting ? -1 : undefined}
                      className={`order-feed-row ${isFeatured ? "is-processing" : ""}`}
                      onClick={() =>
                        dispatchInquiryPrefill({
                          notes: entry.prefillNote,
                          topic: entry.prefillTopic,
                          scrollToId: "home-inquiry"
                        })
                      }
                      aria-label={`Ajukan kebutuhan serupa: ${entry.detail}`}
                    >
                      <span className="order-row-code tabular">{entry.code}</span>
                      <span className="order-row-detail">
                        <SpriteIcon
                          id={entry.icon}
                          className={
                            entry.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-xs"
                          }
                        />
                        <span className="order-row-text">
                          <strong>{entry.detail}</strong>
                          <small>{entry.meta}</small>
                        </span>
                      </span>
                      <span
                        className={`order-row-status ${isFeatured ? "is-processing" : "is-active"}`}
                      >
                        <span>{statusLabel}</span>
                        {isFeatured ? (
                          <span className="order-status-spinner" aria-hidden="true" />
                        ) : (
                          <span className="order-status-check" aria-hidden="true">
                            <SpriteIcon id="ph-check" className="ph-icon ph-icon-xs" />
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="order-feed-foot">
          <h3>Aktivasi rapi, transparan, dan langsung ke email Anda</h3>
          <p>
            Setiap pengadaan lisensi resmi maupun proyek web &amp; Figma tercatat jelas per akun,
            dibayar dalam Rupiah tanpa kartu kredit dolar.
          </p>
        </div>
      </div>

      <aside className="order-cta-card">
        <div className="order-cta-top">
          <span className="order-cta-icon" aria-hidden="true">
            <SpriteIcon id="phd-stack" className="ph-icon" />
          </span>
          <h3>Satu tim untuk web, Figma, dan semua lisensi resmi.</h3>
          <p>
            Mulai dari company profile, desain antarmuka di Figma, hingga akun Adobe CC Pro, ChatGPT
            Team, Claude, dan Canva — langsung jalan dalam satu koordinasi via{" "}
            {COMPANY.whatsappDisplay}.
          </p>
        </div>

        <div className="order-cta-actions">
          <button
            type="button"
            className="btn order-cta-btn"
            onClick={() =>
              dispatchInquiryPrefill({
                notes:
                  "Halo Imajitek Studio, saya ingin mengajukan pesanan lisensi software / konsultasi pembuatan website & Figma.",
                topic: "Website + Desain + Lisensi",
                scrollToId: "home-inquiry"
              })
            }
          >
            <span>Ajukan Pesanan Sekarang</span>
            <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
          </button>
        </div>
      </aside>
    </div>
  );
}
