import { useMemo, useState, type KeyboardEvent } from "react";
import {
  DOCK_SHORTCUTS,
  HERO_COMMANDS,
  type CommandCategory,
  type HeroCommand
} from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchInquiryPrefill } from "@/lib/events";

const FILTER_TABS: readonly { id: CommandCategory; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "web", label: "Web" },
  { id: "design", label: "Desain" },
  { id: "license", label: "Lisensi & AI" }
] as const;

export default function HeroLauncher() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<CommandCategory>("all");
  const [activeCmdId, setActiveCmdId] = useState<string>(HERO_COMMANDS[0]?.id ?? "web-company");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HERO_COMMANDS.filter((cmd) => {
      const catOk = activeCat === "all" || cmd.category === activeCat;
      if (!catOk) return false;
      if (!q) return true;
      const brands = cmd.brands.map((b) => b.name.toLowerCase()).join(" ");
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.title.toLowerCase().includes(q) ||
        cmd.type.toLowerCase().includes(q) ||
        cmd.desc.toLowerCase().includes(q) ||
        brands.includes(q)
      );
    });
  }, [activeCat, search]);

  const current: HeroCommand | undefined = useMemo(() => {
    return filtered.find((item) => item.id === activeCmdId) ?? filtered[0];
  }, [activeCmdId, filtered]);

  const handleInquire = (cmd: HeroCommand) => {
    dispatchInquiryPrefill({
      notes: cmd.inquiry,
      scrollToId: "home-inquiry"
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;
    const idx = Math.max(
      0,
      filtered.findIndex((item) => item.id === current?.id)
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = filtered[(idx + 1) % filtered.length];
      if (next) setActiveCmdId(next.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = filtered[(idx - 1 + filtered.length) % filtered.length];
      if (prev) setActiveCmdId(prev.id);
    } else if (e.key === "Enter" && current) {
      e.preventDefault();
      handleInquire(current);
    }
  };

  return (
    <>
      <div className="hero-dock" role="tablist" aria-label="Pintasan Kategori Layanan">
        {DOCK_SHORTCUTS.map((chip) => {
          const isActive = current?.id === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`dock-chip ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveCat("all");
                setSearch("");
                setActiveCmdId(chip.id);
              }}
            >
              <SpriteIcon
                id={chip.iconId}
                className={chip.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-sm"}
              />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hero-showcase-wrap">
        <div className="launcher-stage">
          <div className="launcher-window" aria-label="Direktori Layanan Imajitek Studio">
            <div className="launcher-top">
              <div className="launcher-search-wrap">
                <SpriteIcon id="ph-magnifying-glass" className="ph-icon launcher-search-icon" />
                <input
                  id="launcher-search"
                  className="launcher-search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari layanan atau software... (mis. Adobe, Canva, Magnific, Claude, Web)"
                  aria-label="Cari layanan atau lisensi software"
                />
              </div>
              <div className="launcher-filter-pills" role="tablist" aria-label="Filter kategori">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCat === tab.id}
                    className={`l-pill ${activeCat === tab.id ? "active" : ""}`}
                    onClick={() => setActiveCat(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="launcher-split">
              <div className="launcher-list">
                {filtered.length === 0 ? (
                  <div className="launcher-empty">
                    Tidak ada hasil untuk &ldquo;{search}&rdquo;. Coba kata kunci seperti Adobe,
                    Canva, Magnific, Claude, atau Web.
                  </div>
                ) : (
                  filtered.map((item) => {
                    const isSelected = item.id === current?.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`cmd-row ${isSelected ? "active" : ""}`}
                        onClick={() => setActiveCmdId(item.id)}
                      >
                        <span className="cmd-row-left">
                          <span className="cmd-icon">
                            <SpriteIcon
                              id={item.iconId}
                              className={item.isBrand ? "brand-svg brand-svg-sm" : "ph-icon"}
                            />
                          </span>
                          <span className="cmd-name">{item.name}</span>
                        </span>
                        <span className="cmd-type">{item.type}</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="launcher-detail">
                {current ? (
                  <>
                    <div key={current.id} className="detail-animate">
                      <h3 className="detail-title">{current.title}</h3>
                      <p className="detail-desc">{current.desc}</p>
                      {current.brands.length > 0 && (
                        <div className="detail-brand-strip">
                          {current.brands.map((brand) => (
                            <span key={brand.id} className="detail-brand-chip">
                              <SpriteIcon id={brand.id} className="brand-svg brand-svg-sm" />
                              <span>{brand.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="detail-widget">
                        <div className="detail-highlight-row">
                          <SpriteIcon id="ph-check-circle" className="ph-icon ph-icon-sm" />
                          <span>{current.highlight}</span>
                        </div>
                        <div className="detail-meta-grid">
                          <div className="meta-cell">
                            <span>{current.meta1Label}</span>
                            <strong>{current.meta1Val}</strong>
                          </div>
                          <div className="meta-cell">
                            <span>{current.meta2Label}</span>
                            <strong>{current.meta2Val}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-foot">
                      <button
                        type="button"
                        className="btn btn-nvidia btn-sm"
                        onClick={() => handleInquire(current)}
                      >
                        <SpriteIcon id="ph-whatsapp-logo" className="ph-icon ph-icon-sm" />
                        <span>{current.ctaText}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="launcher-empty">
                    Ketik kata kunci lain atau pilih kategori untuk melihat detail layanan.
                  </div>
                )}
              </div>
            </div>

            <div className="launcher-footer">
              <div className="shortcut-hints">
                <span>
                  <span className="kbd-chip">&uarr;&darr;</span> Navigasi
                </span>
                <span>
                  <span className="kbd-chip">&crarr;</span> Pilih Layanan
                </span>
                <span>
                  <span className="kbd-chip">&#8984;K</span> Cari Cepat
                </span>
              </div>
              <span>Aktivasi Resmi · Transfer Rupiah</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
