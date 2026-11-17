import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
  CATALOG_CATEGORIES,
  CATALOG_ITEMS,
  CATALOG_MAP,
  CatalogCategoryIdSchema,
  MARQUEE_BOTTOM_ROW,
  MARQUEE_TOP_ROW,
  type BillingPeriod,
  type CatalogCategoryId
} from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchInquiryPrefill, subscribeCatalogCustom, subscribeCatalogPick } from "@/lib/events";
import {
  INITIAL_SELECTIONS,
  MAX_CUSTOM_LABEL_LENGTH,
  MAX_SEAT_QTY,
  MIN_SEAT_QTY,
  addCatalogSelection,
  addCustomSelection,
  buildQuoteNote,
  removeCatalogSelection,
  resolveSelections,
  serializeQuoteSelections,
  toInquiryItems,
  toggleCatalogSelection,
  updateSelectionBilling,
  updateSelectionQuantity,
  type CatalogSelection
} from "@/lib/quote";

interface CatalogBuilderProps {
  mode: "home" | "contact";
  showMarquee?: boolean;
}

export default function CatalogBuilder({ mode, showMarquee = true }: CatalogBuilderProps) {
  const [activeCat, setActiveCat] = useState<CatalogCategoryId>("creative");
  const [selections, setSelections] = useState<CatalogSelection[]>(() => [...INITIAL_SELECTIONS]);
  const [customInput, setCustomInput] = useState("");

  // Apply URL filter params when opened via /software?cat=...&pick=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    const pickParam = params.get("pick");

    if (catParam) {
      const parsedCat = CatalogCategoryIdSchema.safeParse(catParam);
      if (parsedCat.success) {
        setActiveCat(parsedCat.data);
      }
    }

    if (pickParam && CATALOG_MAP.has(pickParam)) {
      const item = CATALOG_MAP.get(pickParam);
      if (item && !catParam) {
        setActiveCat(item.cat);
      }
      setSelections((prev) => addCatalogSelection(prev, pickParam));
    }
  }, []);

  useEffect(() => {
    return subscribeCatalogPick((itemId) => {
      const item = CATALOG_MAP.get(itemId);
      if (!item) return;
      setActiveCat(item.cat);
      setSelections((prev) => addCatalogSelection(prev, itemId));
    });
  }, []);

  useEffect(() => {
    return subscribeCatalogCustom((label) => {
      setSelections((prev) => addCustomSelection(prev, label).next);
    });
  }, []);

  const visibleItems = useMemo(
    () => CATALOG_ITEMS.filter((item) => item.cat === activeCat),
    [activeCat]
  );

  const activeCategoryMeta = useMemo(
    () => CATALOG_CATEGORIES.find((cat) => cat.id === activeCat) ?? CATALOG_CATEGORIES[0],
    [activeCat]
  );

  const resolvedSelections = useMemo(() => resolveSelections(selections), [selections]);

  const handleAddCustom = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed.length < 2) return;
    setSelections((prev) => addCustomSelection(prev, trimmed).next);
    setCustomInput("");
  };

  const handleStep = (id: string, delta: number) => {
    setSelections((prev) => updateSelectionQuantity(prev, id, { delta }));
  };

  const handleBilling = (id: string, billing: BillingPeriod) => {
    setSelections((prev) => updateSelectionBilling(prev, id, billing));
  };

  const handleRemove = (id: string) => {
    setSelections((prev) => removeCatalogSelection(prev, id));
  };

  const handleSubmitQuote = () => {
    const note = buildQuoteNote(selections);
    const items = toInquiryItems(selections);

    if (mode === "home") {
      dispatchInquiryPrefill({
        notes: note,
        topic: "Pembelian Lisensi Software & AI",
        items,
        scrollToId: "home-inquiry"
      });
      return;
    }

    const encoded = serializeQuoteSelections(selections);
    const nextUrl = encoded ? `/hubungi?quote=${encodeURIComponent(encoded)}` : "/hubungi";
    window.location.assign(nextUrl);
  };

  return (
    <>
      {showMarquee && (
        <div className="marquee-wrap" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE_TOP_ROW, ...MARQUEE_TOP_ROW].map((pill, index) => (
              <span key={`top-${pill.id}-${index}`} className="ext-pill">
                <SpriteIcon id={pill.icon} className="brand-svg" />
                <span>{pill.label}</span>
              </span>
            ))}
          </div>
          <div className="marquee-track reverse">
            {[...MARQUEE_BOTTOM_ROW, ...MARQUEE_BOTTOM_ROW].map((pill, index) => (
              <span key={`btm-${pill.id}-${index}`} className="ext-pill">
                <SpriteIcon id={pill.icon} className="brand-svg" />
                <span>{pill.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="calculator-box">
        <div className="calc-controls">
          <div className="calc-top-bar">
            <span className="calc-bar-title">Pilih Software &amp; Layanan</span>
            <div className="calc-cat-tabs" role="tablist" aria-label="Filter kategori katalog">
              {CATALOG_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCat === cat.id}
                  className={`calc-cat-btn ${activeCat === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {activeCategoryMeta && <p className="calc-cat-hint">{activeCategoryMeta.hint}</p>}

          <div className="calc-check-grid" role="tabpanel">
            {visibleItems.map((item) => {
              const selectedEntry = selections.find((s) => s.id === item.id);
              const selected = Boolean(selectedEntry);
              const subText = selectedEntry
                ? item.type === "project"
                  ? "Dipilih · Proyek Custom"
                  : `${selectedEntry.quantity} akun · ${selectedEntry.billing}`
                : item.sub;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`calc-check ${selected ? "selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => setSelections((prev) => toggleCatalogSelection(prev, item.id))}
                >
                  <span className="calc-item-left">
                    <SpriteIcon id={item.icon} className={item.isBrand ? "brand-svg" : "ph-icon"} />
                    <span className="calc-item-text">
                      <strong>{item.label}</strong>
                      <small>{subText}</small>
                    </span>
                  </span>
                  <span className="calc-item-state" aria-hidden="true">
                    <SpriteIcon id="ph-check" className="ph-icon ph-icon-xs" />
                  </span>
                </button>
              );
            })}
          </div>

          <form className="calc-custom-adder" onSubmit={handleAddCustom}>
            <input
              type="text"
              className="calc-custom-input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              maxLength={MAX_CUSTOM_LABEL_LENGTH}
              placeholder="Tidak ada di daftar? Tulis software / jasa lain..."
              aria-label="Tambah software atau jasa di luar daftar"
            />
            <button
              type="submit"
              className="btn btn-glass btn-sm calc-custom-btn"
              disabled={customInput.trim().length < 2}
            >
              + Tambah
            </button>
          </form>
        </div>

        <div className="calc-summary">
          <div>
            <div className="calc-summary-head">
              <span className="calc-summary-eyebrow">Ringkasan Kebutuhan</span>
              <span className="calc-summary-eyebrow tabular">{resolvedSelections.length} item</span>
            </div>
            <div className="calc-total tabular">
              {resolvedSelections.length === 0
                ? "Belum ada item"
                : `${resolvedSelections.length} item siap diajukan`}
            </div>
            <p className="calc-note">
              Atur jumlah akun dan durasi per software sebelum mengirim permintaan penawaran resmi.
            </p>
          </div>

          <div className="calc-breakdown">
            {resolvedSelections.length === 0 ? (
              <div className="calc-empty-box">
                Pilih software atau layanan di sebelah kiri, atau tulis kebutuhan khusus di bawah
                daftar.
              </div>
            ) : (
              resolvedSelections.map(({ item, selection, isCustom }) => (
                <div key={item.id} className="calc-line-item">
                  <div className="calc-line-top">
                    <div className="calc-line-title">
                      <SpriteIcon
                        id={item.icon}
                        className={item.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-sm"}
                      />
                      <span>{item.label}</span>
                      {isCustom && <span className="calc-custom-badge">Di luar daftar</span>}
                    </div>
                    <button
                      type="button"
                      className="calc-remove-btn"
                      aria-label={`Hapus ${item.label}`}
                      onClick={() => handleRemove(item.id)}
                    >
                      <SpriteIcon id="ph-x" className="ph-icon ph-icon-xs" />
                    </button>
                  </div>

                  <div className="calc-line-controls">
                    {item.type === "project" ? (
                      <span className="project-badge">Proyek Custom · Sesuai Scope</span>
                    ) : (
                      <>
                        <div
                          className="qty-stepper"
                          role="group"
                          aria-label={`Jumlah akun ${item.label}`}
                        >
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label={`Kurangi akun ${item.label}`}
                            disabled={selection.quantity <= MIN_SEAT_QTY}
                            onClick={() => handleStep(item.id, -1)}
                          >
                            &minus;
                          </button>
                          <span className="qty-val tabular">{selection.quantity} Akun</span>
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label={`Tambah akun ${item.label}`}
                            disabled={selection.quantity >= MAX_SEAT_QTY}
                            onClick={() => handleStep(item.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        <div
                          className="mini-billing-toggle"
                          role="group"
                          aria-label={`Durasi ${item.label}`}
                        >
                          <button
                            type="button"
                            className={`mini-billing-btn ${selection.billing === "Tahunan" ? "active" : ""}`}
                            onClick={() => handleBilling(item.id, "Tahunan")}
                          >
                            Tahunan
                          </button>
                          <button
                            type="button"
                            className={`mini-billing-btn ${selection.billing === "Bulanan" ? "active" : ""}`}
                            onClick={() => handleBilling(item.id, "Bulanan")}
                          >
                            Bulanan
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="btn btn-nvidia"
            style={{ width: "100%" }}
            onClick={handleSubmitQuote}
          >
            <span>Minta Penawaran</span>
            <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-sm" />
          </button>
        </div>
      </div>
    </>
  );
}
