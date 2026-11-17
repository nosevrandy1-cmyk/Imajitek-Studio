import { useEffect, useState } from "react";
import { STUDIO_SPECS, type StudioSpecKey } from "@/domain/catalog";

const SPEC_KEYS: readonly StudioSpecKey[] = ["W", "D", "L", "S"] as const;

export default function KeyboardShowcase() {
  const [activeKey, setActiveKey] = useState<StudioSpecKey>("W");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specParam = params.get("spec")?.toUpperCase();
    if (specParam && SPEC_KEYS.includes(specParam as StudioSpecKey)) {
      setActiveKey(specParam as StudioSpecKey);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const upper = e.key.toUpperCase();
      if (SPEC_KEYS.includes(upper as StudioSpecKey)) {
        setActiveKey(upper as StudioSpecKey);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const spec = STUDIO_SPECS[activeKey];

  return (
    <div className="keyboard-showcase">
      <div className="kb-mobile-tabs" role="tablist" aria-label="Pilih standar kerja">
        <button
          type="button"
          className={`kb-mobile-tab ${activeKey === "W" ? "active-key" : ""}`}
          onClick={() => setActiveKey("W")}
        >
          [W] Web Build
        </button>
        <button
          type="button"
          className={`kb-mobile-tab ${activeKey === "D" ? "active-key" : ""}`}
          onClick={() => setActiveKey("D")}
        >
          [D] Desain Figma
        </button>
        <button
          type="button"
          className={`kb-mobile-tab ${activeKey === "L" ? "active-key" : ""}`}
          onClick={() => setActiveKey("L")}
        >
          [L] Aktivasi Lisensi
        </button>
        <button
          type="button"
          className={`kb-mobile-tab ${activeKey === "S" ? "active-key" : ""}`}
          onClick={() => setActiveKey("S")}
        >
          [S] Support
        </button>
      </div>

      <div className="keyboard-deck" aria-label="Keyboard Interaktif Cara Kerja">
        <div className="kb-row">
          <span className="kb-key">ESC</span>
          <span className="kb-key">1</span>
          <span className="kb-key">2</span>
          <span className="kb-key">3</span>
          <span className="kb-key">4</span>
          <span className="kb-key">5</span>
          <span className="kb-key">6</span>
          <span className="kb-key">7</span>
          <span className="kb-key">8</span>
          <span className="kb-key wide">DEL</span>
        </div>
        <div className="kb-row">
          <span className="kb-key wide">TAB</span>
          <span className="kb-key">Q</span>
          <button
            type="button"
            className={`kb-key lit ${activeKey === "W" ? "active-key" : ""}`}
            title="Web Development"
            onClick={() => setActiveKey("W")}
          >
            W
          </button>
          <span className="kb-key">E</span>
          <span className="kb-key">R</span>
          <span className="kb-key">T</span>
          <span className="kb-key">Y</span>
          <span className="kb-key">U</span>
          <span className="kb-key">I</span>
          <span className="kb-key">O</span>
        </div>
        <div className="kb-row">
          <span className="kb-key wide">CAPS</span>
          <span className="kb-key">A</span>
          <button
            type="button"
            className={`kb-key lit ${activeKey === "S" ? "active-key" : ""}`}
            title="Pembayaran & Support"
            onClick={() => setActiveKey("S")}
          >
            S
          </button>
          <button
            type="button"
            className={`kb-key lit ${activeKey === "D" ? "active-key" : ""}`}
            title="Desain Figma"
            onClick={() => setActiveKey("D")}
          >
            D
          </button>
          <span className="kb-key">F</span>
          <span className="kb-key">G</span>
          <span className="kb-key">H</span>
          <span className="kb-key">J</span>
          <span className="kb-key">K</span>
          <button
            type="button"
            className={`kb-key lit ${activeKey === "L" ? "active-key" : ""}`}
            title="Aktivasi Lisensi"
            onClick={() => setActiveKey("L")}
          >
            L
          </button>
        </div>
        <div className="kb-row">
          <span className="kb-key wide">SHIFT</span>
          <span className="kb-key">Z</span>
          <span className="kb-key">X</span>
          <span className="kb-key">C</span>
          <span className="kb-key space">IMAJITEK STUDIO</span>
          <span className="kb-key">&#8984;</span>
          <span className="kb-key">OPT</span>
        </div>
      </div>

      <div className="kb-inspector">
        <span className="kb-badge">{spec.badge}</span>
        <h3>{spec.title}</h3>
        <p>{spec.desc}</p>
        <div className="kb-stat-box">
          <span style={{ fontSize: "13px", color: "var(--ink-secondary)" }}>
            {spec.metricLabel}
          </span>
          <strong>{spec.metricValue}</strong>
        </div>
      </div>
    </div>
  );
}
