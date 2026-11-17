import { COMPANY, ORDER_FEED_ITEMS, type OrderFeedItem } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchInquiryPrefill } from "@/lib/events";

function renderOrderRow(entry: OrderFeedItem, duplicateIndex: number) {
  return (
    <button
      key={`${entry.code}-${duplicateIndex}`}
      type="button"
      className={`order-feed-row ${entry.status === "processing" ? "is-processing" : ""}`}
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
          className={entry.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-xs"}
        />
        <span className="order-row-text">
          <strong>{entry.detail}</strong>
          <small>{entry.meta}</small>
        </span>
      </span>
      <span className={`order-row-status is-${entry.status}`}>
        <span>{entry.statusLabel}</span>
        {entry.status === "processing" ? (
          <span className="order-status-spinner" aria-hidden="true" />
        ) : (
          <span className="order-status-check" aria-hidden="true">
            <SpriteIcon id="ph-check" className="ph-icon ph-icon-xs" />
          </span>
        )}
      </span>
    </button>
  );
}

export default function OrderHookSection() {
  return (
    <div className="order-hook-grid">
      <div className="order-feed-card">
        <div className="order-feed-stage">
          <div className="order-feed-brand" aria-hidden="true">
            <div className="order-feed-brand-main">
              <img src="/logo-itb-green.png" alt="" className="brand-logo" />
            </div>
            <span className="order-feed-brand-sub">
              <SpriteIcon id="phd-shield-check" className="ph-icon ph-icon-xs" />
            </span>
          </div>

          <div className="order-feed-viewport" aria-label="Simulasi antrean pemesanan dan aktivasi">
            <div className="order-feed-track">
              <div className="order-feed-group">
                {ORDER_FEED_ITEMS.map((entry) => renderOrderRow(entry, 0))}
              </div>
              <div className="order-feed-group" aria-hidden="true">
                {ORDER_FEED_ITEMS.map((entry) => renderOrderRow(entry, 1))}
              </div>
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
