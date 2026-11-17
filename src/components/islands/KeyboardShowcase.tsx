import { useEffect, useState } from "react";
import { WEB_DESAIN_TABS, type WebDesainTabKey } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";

const TAB_KEYS: readonly WebDesainTabKey[] = ["W", "D", "S"] as const;

export default function KeyboardShowcase() {
  const [activeKey, setActiveKey] = useState<WebDesainTabKey>("W");

  const selectTab = (key: WebDesainTabKey, syncUrl = true) => {
    setActiveKey(key);
    if (syncUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("spec", key);
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specParam = params.get("spec")?.toUpperCase();
    if (specParam && TAB_KEYS.includes(specParam as WebDesainTabKey)) {
      setActiveKey(specParam as WebDesainTabKey);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const upper = e.key.toUpperCase();
      if (TAB_KEYS.includes(upper as WebDesainTabKey)) {
        selectTab(upper as WebDesainTabKey);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="webdesain-tabs-shell">
      <div className="webdesain-tab-bar" role="tablist" aria-label="Pilih layanan web dan desain">
        {WEB_DESAIN_TABS.map((tab) => {
          const isActive = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-spec-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-spec-${tab.key}`}
              className={`webdesain-tab-btn ${isActive ? "is-active" : ""}`}
              onClick={() => selectTab(tab.key)}
            >
              <span className="webdesain-tab-key">{tab.key}</span>
              <span>{tab.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {WEB_DESAIN_TABS.map((tab) => {
        const isActive = activeKey === tab.key;
        const topicHref =
          tab.key === "D"
            ? "/hubungi?topic=Desain%20Grafis"
            : "/hubungi?topic=Pembuatan%20Web%20%26%20Aplikasi";

        return (
          <div
            key={tab.key}
            id={`panel-spec-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`tab-spec-${tab.key}`}
            hidden={!isActive}
            className="webdesain-panel detail-animate"
          >
            <div className="webdesain-panel-head">
              <span className="kb-badge">{tab.eyebrow}</span>
              <h2>{tab.heading}</h2>
              <p>{tab.description}</p>
            </div>

            <div className="webdesain-points-wrap">
              <div className="webdesain-points-label">{tab.listHeading}</div>
              <div
                className={`webdesain-points-grid ${tab.points.length === 4 ? "is-four" : "is-three"}`}
              >
                {tab.points.map((pt, idx) => (
                  <article key={pt.title} className="webdesain-point-card">
                    <div className="webdesain-point-head">
                      <span className="webdesain-point-num tabular">
                        {tab.listKind === "steps" ? (
                          String(idx + 1).padStart(2, "0")
                        ) : (
                          <SpriteIcon id="ph-check" className="ph-icon ph-icon-xs" />
                        )}
                      </span>
                      <h3>{pt.title}</h3>
                    </div>
                    <p>{pt.desc}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="webdesain-panel-foot">
              <span className="webdesain-foot-note">
                Pintasan keyboard: tekan <strong>W</strong>, <strong>D</strong>, atau{" "}
                <strong>S</strong> untuk berpindah tab
              </span>
              <a className="btn btn-nvidia btn-sm" href={topicHref}>
                <span>Konsultasikan Kebutuhan Anda</span>
                <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
