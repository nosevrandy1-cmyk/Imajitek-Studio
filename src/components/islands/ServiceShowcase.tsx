import { useState } from "react";
import { WEB_SUB_MODES, type WebSubModeId } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchInquiryPrefill } from "@/lib/events";

type ServiceTabId = "web" | "design" | "license";

const DESIGN_SWATCHES = [
  { hex: "#76b900", label: "Hijau" },
  { hex: "#0ea5e9", label: "Biru" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#10150f", label: "Gelap Netral" }
] as const;

const CREATIVE_BRANDS = [
  { id: "brand-adobe-cc", name: "Adobe Creative Cloud Pro" },
  { id: "brand-canva", name: "Canva Pro & Business" },
  { id: "brand-magnific", name: "Magnific AI" },
  { id: "brand-envato", name: "Envato Elements" },
  { id: "brand-figma", name: "Figma Organization" }
] as const;

const AI_OFFICE_BRANDS = [
  { id: "brand-chatgpt", name: "ChatGPT Plus & Team" },
  { id: "brand-claude", name: "Claude Pro & Team" },
  { id: "brand-gemini", name: "Google Gemini" },
  { id: "brand-microsoft", name: "Microsoft 365" },
  { id: "brand-google", name: "Google Workspace" }
] as const;

export default function ServiceShowcase() {
  const [activeSvc, setActiveSvc] = useState<ServiceTabId>("web");
  const [webMode, setWebMode] = useState<WebSubModeId>("profile");
  const [designMode, setDesignMode] = useState<"ui" | "ds">("ui");
  const [designSwatch, setDesignSwatch] = useState<string>("#76b900");
  const [licenseGroup, setLicenseGroup] = useState<"creative" | "ai">("creative");

  const webDetail = WEB_SUB_MODES[webMode];
  const isUiDesign = designMode === "ui";
  const isCreativeLic = licenseGroup === "creative";
  const licenseBrands = isCreativeLic ? CREATIVE_BRANDS : AI_OFFICE_BRANDS;

  return (
    <div className="svc-shell">
      <div className="svc-tabs" role="tablist" aria-label="Layanan Imajitek Studio">
        <button
          type="button"
          role="tab"
          aria-selected={activeSvc === "web"}
          className={`svc-tab-btn ${activeSvc === "web" ? "active" : ""}`}
          onClick={() => setActiveSvc("web")}
        >
          <span className="svc-tab-icon">
            <SpriteIcon id="phd-code" className="ph-icon" />
          </span>
          <span className="svc-tab-copy">
            <strong>Pembuatan Website &amp; Web App</strong>
            <span className="svc-tab-desc">
              Company profile, landing page produk, hingga portal tim dengan kode milik Anda.
            </span>
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSvc === "design"}
          className={`svc-tab-btn ${activeSvc === "design" ? "active" : ""}`}
          onClick={() => setActiveSvc("design")}
        >
          <span className="svc-tab-icon">
            <SpriteIcon id="brand-figma" className="brand-svg brand-svg-sm" />
          </span>
          <span className="svc-tab-copy">
            <strong>Desain UI/UX &amp; Brand Figma</strong>
            <span className="svc-tab-desc">
              Wireframe, tampilan antarmuka final, komponen Auto Layout &amp; prototipe interaktif.
            </span>
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSvc === "license"}
          className={`svc-tab-btn ${activeSvc === "license" ? "active" : ""}`}
          onClick={() => setActiveSvc("license")}
        >
          <span className="svc-tab-icon">
            <SpriteIcon id="phd-key" className="ph-icon" />
          </span>
          <span className="svc-tab-copy">
            <strong>Pengadaan Lisensi Software &amp; AI</strong>
            <span className="svc-tab-desc">
              Adobe CC Pro, Canva, Magnific, Envato, ChatGPT, Claude &amp; Gemini resmi ke email
              Anda.
            </span>
          </span>
        </button>
      </div>

      <div className="svc-stage" role="tabpanel">
        {activeSvc === "web" && (
          <>
            <div key={`web-${webMode}`} className="detail-animate svc-stage-body">
              <div className="svc-preview-head">
                <div className="svc-sub-pills">
                  {(
                    Object.entries(WEB_SUB_MODES) as [
                      WebSubModeId,
                      (typeof WEB_SUB_MODES)["profile"]
                    ][]
                  ).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`svc-sub-pill ${webMode === key ? "active" : ""}`}
                      onClick={() => setWebMode(key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="svc-stack-tag">{webDetail.stack}</span>
              </div>

              <h3 className="svc-stage-title">{webDetail.title}</h3>
              <p className="svc-stage-desc">{webDetail.desc}</p>

              <div className="svc-deliverables">
                <div className="svc-deliv-cell">
                  <small>{webDetail.d1Label}</small>
                  <strong>{webDetail.d1Val}</strong>
                </div>
                <div className="svc-deliv-cell">
                  <small>{webDetail.d2Label}</small>
                  <strong>{webDetail.d2Val}</strong>
                </div>
              </div>
            </div>

            <div className="svc-stage-foot">
              <a className="bento-action-link" href="/web-desain?spec=W">
                <span>Lihat detail teknis &amp; cara kerja</span>
                <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
              </a>
              <button
                type="button"
                className="btn btn-nvidia btn-sm"
                onClick={() =>
                  dispatchInquiryPrefill({
                    notes: `Saya ingin konsultasi pembuatan ${webDetail.title}.`,
                    topic: "Pembuatan Website / Web App"
                  })
                }
              >
                <SpriteIcon id="ph-whatsapp-logo" className="ph-icon ph-icon-xs" />
                <span>Tanyakan Proyek {webDetail.label}</span>
              </button>
            </div>
          </>
        )}

        {activeSvc === "design" && (
          <>
            <div
              key={`design-${designMode}`}
              className="detail-animate svc-stage-body svc-stage-accent"
              style={{ borderLeftColor: designSwatch }}
            >
              <div className="svc-preview-head">
                <div className="svc-sub-pills">
                  <button
                    type="button"
                    className={`svc-sub-pill ${isUiDesign ? "active" : ""}`}
                    onClick={() => setDesignMode("ui")}
                  >
                    Tampilan Web &amp; App
                  </button>
                  <button
                    type="button"
                    className={`svc-sub-pill ${!isUiDesign ? "active" : ""}`}
                    onClick={() => setDesignMode("ds")}
                  >
                    Design System Figma
                  </button>
                </div>
                <div className="svc-swatch-row" aria-label="Pilih warna aksen preview">
                  {DESIGN_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      className={`swatch-btn ${designSwatch === swatch.hex ? "active" : ""}`}
                      style={{ backgroundColor: swatch.hex }}
                      aria-label={swatch.label}
                      onClick={() => setDesignSwatch(swatch.hex)}
                    />
                  ))}
                </div>
              </div>

              <h3 className="svc-stage-title">
                <SpriteIcon id="brand-figma" className="brand-svg brand-svg-sm" />
                <span>
                  {isUiDesign
                    ? "Wireframe, UI Final & Prototipe Klik-able"
                    : "Komponen Modular, Auto Layout & Variabel"}
                </span>
              </h3>
              <p className="svc-stage-desc">
                {isUiDesign
                  ? "Desain dirancang terukur untuk desktop dan mobile sekaligus. Sebelum masuk tahap coding, Anda bisa mencoba prototipe alurnya langsung di Figma."
                  : "Setiap tombol, kartu, warna, dan ukuran font disusun sebagai komponen reusable sehingga tim developer mudah mengimplementasikannya dengan konsisten."}
              </p>

              <div className="svc-deliverables">
                <div className="svc-deliv-cell">
                  <small>Estimasi Pengerjaan</small>
                  <strong>10 – 14 Hari Kerja</strong>
                </div>
                <div className="svc-deliv-cell">
                  <small>Hasil Akhir</small>
                  <strong>File Figma + Style Guide</strong>
                </div>
              </div>
            </div>

            <div className="svc-stage-foot">
              <a className="bento-action-link" href="/web-desain?spec=D">
                <span>Lihat standar desain Figma</span>
                <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
              </a>
              <button
                type="button"
                className="btn btn-nvidia btn-sm"
                onClick={() =>
                  dispatchInquiryPrefill({
                    notes: `Saya butuh jasa ${isUiDesign ? "Desain UI/UX Web & Aplikasi" : "Design System Figma"}.`,
                    topic: "Desain UI/UX & Brand"
                  })
                }
              >
                <SpriteIcon id="ph-whatsapp-logo" className="ph-icon ph-icon-xs" />
                <span>Tanyakan Desain UI/UX</span>
              </button>
            </div>
          </>
        )}

        {activeSvc === "license" && (
          <>
            <div key={`lic-${licenseGroup}`} className="detail-animate svc-stage-body">
              <div className="svc-preview-head">
                <div className="svc-sub-pills">
                  <button
                    type="button"
                    className={`svc-sub-pill ${isCreativeLic ? "active" : ""}`}
                    onClick={() => setLicenseGroup("creative")}
                  >
                    Desain &amp; Aset Kreatif
                  </button>
                  <button
                    type="button"
                    className={`svc-sub-pill ${!isCreativeLic ? "active" : ""}`}
                    onClick={() => setLicenseGroup("ai")}
                  >
                    AI &amp; Office Tim
                  </button>
                </div>
                <span className="svc-stack-tag">Resmi · Non-Sharing</span>
              </div>

              <div className="detail-brand-strip" style={{ marginBottom: 0 }}>
                {licenseBrands.map((brand) => (
                  <span key={brand.id} className="detail-brand-chip">
                    <SpriteIcon id={brand.id} className="brand-svg brand-svg-sm" />
                    <span>{brand.name}</span>
                  </span>
                ))}
              </div>

              <p className="svc-stage-desc">
                Lisensi diaktifkan langsung ke email pribadi atau domain kantor Anda. Bisa pesan 1
                akun maupun puluhan akun tim dengan jumlah berbeda per software, dibayar praktis
                lewat transfer Rupiah.
              </p>

              <div className="svc-deliverables">
                <div className="svc-deliv-cell">
                  <small>Aktivasi Akun</small>
                  <strong>Email Anda / Tim</strong>
                </div>
                <div className="svc-deliv-cell">
                  <small>Skema Pembayaran</small>
                  <strong>Transfer Bank Rupiah</strong>
                </div>
              </div>
            </div>

            <div className="svc-stage-foot">
              <button
                type="button"
                className="bento-action-link"
                onClick={() => {
                  document.getElementById("home-catalog")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                  });
                }}
              >
                <span>Susun daftar di katalog bawah</span>
                <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
              </button>
              <button
                type="button"
                className="btn btn-nvidia btn-sm"
                onClick={() =>
                  dispatchInquiryPrefill({
                    notes:
                      "Saya ingin menanyakan harga resmi lisensi software / AI untuk tim kami.",
                    topic: "Pembelian Lisensi Software & AI"
                  })
                }
              >
                <SpriteIcon id="ph-whatsapp-logo" className="ph-icon ph-icon-xs" />
                <span>Tanyakan Lisensi Software</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
