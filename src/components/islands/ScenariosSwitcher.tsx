import { useState } from "react";
import { SCENARIOS, type ScenarioId } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";

const SCENARIO_KEYS: readonly ScenarioId[] = ["kreatif", "produk", "tim"] as const;

export default function ScenariosSwitcher() {
  const [activeKey, setActiveKey] = useState<ScenarioId>("kreatif");
  const current = SCENARIOS[activeKey];

  const handleApply = () => {
    const notes = `Tertarik dengan kombinasi: ${current.title}.`;
    window.location.assign(`/hubungi?notes=${encodeURIComponent(notes)}`);
  };

  return (
    <div className="workspace-card">
      <div className="ws-sidebar" role="tablist" aria-label="Contoh Paket Kebutuhan Tim">
        {SCENARIO_KEYS.map((key) => {
          const sc = SCENARIOS[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeKey === key}
              className={`ws-case-btn ${activeKey === key ? "active" : ""}`}
              onClick={() => setActiveKey(key)}
            >
              <small>{sc.tabEyebrow}</small>
              <strong>{sc.tabTitle}</strong>
            </button>
          );
        })}
      </div>

      <div className="ws-main" role="tabpanel">
        <div key={activeKey} className="detail-animate">
          <h3 style={{ margin: "0 0 8px", fontSize: "21px" }}>{current.title}</h3>
          <p style={{ margin: "0 0 18px", fontSize: "14px", color: "var(--ink-secondary)" }}>
            {current.summary}
          </p>
          <div className="ws-tasks">
            {current.tasks.map((task) => (
              <div key={task.text} className="ws-task">
                <span className="ws-task-left">
                  <SpriteIcon
                    id={task.icon}
                    className={task.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-sm"}
                  />
                  <span>{task.text}</span>
                </span>
                <span className="ws-task-status">{task.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
            Kombinasi dapat disesuaikan dengan kebutuhan tim Anda
          </span>
          <button type="button" className="btn btn-glass btn-sm" onClick={handleApply}>
            Gunakan Paket Ini
          </button>
        </div>
      </div>
    </div>
  );
}
