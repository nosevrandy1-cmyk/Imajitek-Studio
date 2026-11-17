import { useEffect, useRef } from "react";
import { CATALOG_MAP } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchCatalogPick } from "@/lib/events";

interface ShowcaseCard {
  id: string;
  label: string;
  tag: string;
  sub: string;
  icon: string;
}

const CARD_DEFS: readonly { id: string; tag: string; shortSub: string }[] = [
  { id: "adobe-cc", tag: "Kreatif", shortSub: "All Apps Suite" },
  { id: "canva", tag: "Desain", shortSub: "Pro & Business" },
  { id: "chatgpt", tag: "AI", shortSub: "Plus & Team" },
  { id: "claude", tag: "AI", shortSub: "Pro & Team" },
  { id: "gemini", tag: "AI", shortSub: "Workspace AI" },
  { id: "figma", tag: "UI/UX", shortSub: "Organization" },
  { id: "magnific", tag: "AI Visual", shortSub: "Image Upscaler" },
  { id: "envato", tag: "Aset", shortSub: "Template & Video" },
  { id: "m365", tag: "Office", shortSub: "Business Cloud" },
  { id: "jetbrains", tag: "Dev", shortSub: "All Products Pack" },
  { id: "github", tag: "Dev", shortSub: "Team License" },
  { id: "autodesk", tag: "CAD", shortSub: "AutoCAD / Revit" }
];

const SHOWCASE_CARDS: ShowcaseCard[] = CARD_DEFS.flatMap((def) => {
  const item = CATALOG_MAP.get(def.id);
  if (!item) return [];
  return [
    {
      id: item.id,
      label: item.label,
      tag: def.tag,
      sub: def.shortSub,
      icon: item.icon
    }
  ];
});

const RING_CARDS: ShowcaseCard[] = [...SHOWCASE_CARDS, ...SHOWCASE_CARDS];

export default function HeroCardsCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pausedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;

    const onMediaChange = () => {
      reducedMotion = mediaQuery.matches;
    };
    mediaQuery.addEventListener("change", onMediaChange);

    let offsetPx = 0;
    let rafId = 0;
    let lastTs = performance.now();

    const layoutFrame = (now: number) => {
      const dt = Math.min(0.033, Math.max(0, (now - lastTs) / 1000));
      lastTs = now;

      const stageWidth = stage.clientWidth || 1200;
      const isMobile = stageWidth < 680;
      const cardW = isMobile ? 108 : 146;
      const gap = isMobile ? 12 : 18;
      const step = cardW + gap;
      const totalWidth = RING_CARDS.length * step;

      if (!pausedRef.current && !reducedMotion) {
        offsetPx = (offsetPx + dt * (isMobile ? 26 : 34)) % totalWidth;
      }

      const halfStage = stageWidth * 0.5;
      const halfCard = cardW * 0.5;
      const wrapShift = step * 2;
      const fadeZone = isMobile ? 54 : 110;

      cardRefs.current.forEach((btn, idx) => {
        if (!btn) return;
        const raw = (idx * step - offsetPx + wrapShift) % totalWidth;
        const x = (raw < 0 ? raw + totalWidth : raw) - wrapShift;

        if (x < -cardW - 16 || x > stageWidth + 16) {
          btn.style.visibility = "hidden";
          btn.style.opacity = "0";
          btn.style.pointerEvents = "none";
          return;
        }

        const cardCenter = x + halfCard;
        const dist = cardCenter - halfStage;
        const norm = Math.max(-1.25, Math.min(1.25, dist / Math.max(halfStage * 0.92, 220)));

        const rotateY = norm * (isMobile ? -12 : -20);
        const arcDrop = norm * norm * (isMobile ? 14 : 24);
        const depthZ = -(norm * norm) * (isMobile ? 18 : 42);
        const scale = 1 - Math.min(0.14, Math.abs(norm) * 0.08);

        const leftAlpha = Math.min(1, Math.max(0, (cardCenter - 8) / fadeZone));
        const rightAlpha = Math.min(1, Math.max(0, (stageWidth - cardCenter - 8) / fadeZone));
        const opacity = Math.min(leftAlpha, rightAlpha);

        btn.style.visibility = opacity <= 0.005 ? "hidden" : "visible";
        btn.style.pointerEvents = opacity <= 0.08 ? "none" : "auto";
        btn.style.width = `${cardW}px`;
        btn.style.transform = `perspective(1050px) translate3d(${x.toFixed(2)}px, ${arcDrop.toFixed(2)}px, ${depthZ.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        btn.style.opacity = opacity.toFixed(3);
        btn.style.zIndex = String(Math.round(50 - Math.abs(norm) * 25));
      });

      rafId = window.requestAnimationFrame(layoutFrame);
    };

    rafId = window.requestAnimationFrame(layoutFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      mediaQuery.removeEventListener("change", onMediaChange);
    };
  }, []);

  const handlePick = (id: string) => {
    dispatchCatalogPick(id);
  };

  return (
    <div
      className="hero-3d-carousel"
      ref={stageRef}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(e) => {
        const next = e.relatedTarget as Node | null;
        if (!next || !e.currentTarget.contains(next)) {
          pausedRef.current = false;
        }
      }}
    >
      <div className="hero-3d-track" role="region" aria-label="Software & layanan resmi Imajitek">
        {RING_CARDS.map((card, index) => (
          <button
            key={`${card.id}-${index}`}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            type="button"
            className="hero-3d-card"
            onClick={() => handlePick(card.id)}
            aria-label={`Pilih ${card.label} di katalog`}
          >
            <div className="hero-3d-card-top">
              <span className="hero-3d-card-icon">
                <SpriteIcon id={card.icon} className="brand-svg" />
              </span>
              <span className="hero-3d-card-tag">{card.tag}</span>
            </div>
            <div className="hero-3d-card-body">
              <strong>{card.label}</strong>
              <small>{card.sub}</small>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
