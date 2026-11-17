import { useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { HOME_FAQ_ITEMS, type FaqItem } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";

const DRUM_OFFSETS = [-2, -1, 0, 1, 2] as const;

const FALLBACK_FAQ: FaqItem = {
  question: "Apakah lisensi masuk langsung ke email kami?",
  answer:
    "Ya. Semua langganan aktif langsung ke email pribadi atau domain kantor Anda, bukan akun sharing.",
  imageSrc: "/images/faq/faq-01.webp",
  imageAlt:
    "Meja kerja minimalis dengan laptop terbuka dan amplop aktivasi lisensi resmi ke email perusahaan"
};

function wrapIndex(index: number, total: number): number {
  return ((index % total) + total) % total;
}

export default function FaqDrum() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const wheelLockRef = useRef(0);
  const dragStartYRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const capturedPointerIdRef = useRef<number | null>(null);

  const total = HOME_FAQ_ITEMS.length;
  const activeItem = HOME_FAQ_ITEMS[wrapIndex(activeIndex, total)] ?? FALLBACK_FAQ;

  const stepBy = (delta: number) => {
    if (delta === 0) return;
    setDirection(delta > 0 ? 1 : -1);
    setActiveIndex((prev) => wrapIndex(prev + delta, total));
  };

  const selectOffset = (offset: number) => {
    if (offset === 0) {
      setExpanded((prev) => !prev);
      return;
    }
    stepBy(offset);
    setExpanded(true);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 12) return;
    event.preventDefault();
    const now = Date.now();
    if (now - wheelLockRef.current < 180) return;
    wheelLockRef.current = now;
    stepBy(event.deltaY > 0 ? 1 : -1);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    didDragRef.current = false;
    capturedPointerIdRef.current = null;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const deltaY = event.clientY - dragStartYRef.current;
    if (Math.abs(deltaY) >= 6 && capturedPointerIdRef.current === null) {
      capturedPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (Math.abs(deltaY) >= 22) {
      didDragRef.current = true;
      stepBy(deltaY < 0 ? 1 : -1);
      dragStartYRef.current = event.clientY;
    }
  };

  const handlePointerUp = () => {
    dragStartYRef.current = null;
    capturedPointerIdRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setExpanded((prev) => !prev);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="faq-band-backdrop" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={activeItem.imageSrc}
            src={activeItem.imageSrc}
            alt={activeItem.imageAlt}
            width={518}
            height={694}
            loading="eager"
            decoding="async"
            className="faq-band-bg-photo"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.25 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
      </div>

      <div className="container faq-band-inner">
        <div className="faq-drum-layout" id="home-faq">
          <div className="faq-drum-left">
            <div className="faq-drum-spacer" aria-hidden="true" />

            <div className="faq-drum-intro">
              <span className="section-eyebrow tabular">TANYA JAWAB</span>
              <h2 className="faq-drum-heading">Pertanyaan yang sering diajukan</h2>
              <p className="faq-drum-sub">
                Putar daftar untuk memilih topik pertanyaan, lalu klik <strong>Baca</strong>.
              </p>
              <a className="bento-action-link" href="/hubungi">
                <span>Tanya tim kami</span>
                <SpriteIcon id="ph-arrow-right" className="ph-icon ph-icon-xs" />
              </a>
            </div>
          </div>

          <div className="faq-drum-stage">
            <div className="faq-drum-row">
              <div
                className="faq-drum-window"
                tabIndex={0}
                role="listbox"
                aria-label="Pilih pertanyaan FAQ"
                aria-activedescendant={`faq-drum-opt-${wrapIndex(activeIndex, total)}`}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
              >
                <div className="faq-drum-split-line" aria-hidden="true" />
                <div className="faq-drum-slots">
                  {DRUM_OFFSETS.map((offset) => {
                    const idx = wrapIndex(activeIndex + offset, total);
                    const entry = HOME_FAQ_ITEMS[idx] ?? FALLBACK_FAQ;
                    const isCenter = offset === 0;
                    const distanceClass = `is-dist-${Math.abs(offset)}`;

                    return (
                      <motion.div
                        key={`${offset}-${idx}`}
                        initial={{ opacity: isCenter ? 0.6 : 0.25, y: direction * 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={`faq-drum-slot ${distanceClass} ${isCenter ? "is-center" : ""}`}
                      >
                        <button
                          id={isCenter ? `faq-drum-opt-${idx}` : undefined}
                          type="button"
                          role="option"
                          aria-selected={isCenter}
                          className="faq-drum-item-btn"
                          onClick={() => selectOffset(offset)}
                        >
                          <span className="faq-drum-item-text">{entry.question}</span>
                          {isCenter && (
                            <span className="faq-drum-read-badge">
                              <span>{expanded ? "Tutup" : "Baca"}</span>
                              <SpriteIcon
                                id="ph-caret-down"
                                className={`ph-icon ph-icon-xs faq-drum-read-caret ${expanded ? "is-open" : ""}`}
                              />
                            </span>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="faq-drum-rail">
                <span className="faq-drum-rail-hint">Klik atau geser untuk memilih</span>
                <div className="faq-drum-track">
                  <span className="faq-drum-dot" aria-hidden="true" />
                  <div
                    className="faq-drum-handle"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <button
                      type="button"
                      className="faq-drum-step-btn"
                      aria-label="Pertanyaan sebelumnya"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (didDragRef.current) {
                          didDragRef.current = false;
                          return;
                        }
                        stepBy(-1);
                      }}
                    >
                      <SpriteIcon
                        id="ph-caret-down"
                        className="ph-icon ph-icon-xs faq-drum-caret-up"
                      />
                    </button>
                    <button
                      type="button"
                      className="faq-drum-step-btn"
                      aria-label="Pertanyaan berikutnya"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (didDragRef.current) {
                          didDragRef.current = false;
                          return;
                        }
                        stepBy(1);
                      }}
                    >
                      <SpriteIcon id="ph-caret-down" className="ph-icon ph-icon-xs" />
                    </button>
                  </div>
                  <span className="faq-drum-dot" aria-hidden="true" />
                </div>
                <span className="faq-drum-counter tabular">
                  {String(wrapIndex(activeIndex, total) + 1).padStart(2, "0")}/
                  {String(total).padStart(2, "0")}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key={`ans-${wrapIndex(activeIndex, total)}`}
                  className="faq-drum-answer"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="faq-drum-answer-head">
                    <span className="faq-drum-answer-tag tabular">
                      Q{String(wrapIndex(activeIndex, total) + 1).padStart(2, "0")}
                    </span>
                    <strong>{activeItem.question}</strong>
                  </div>
                  <p>{activeItem.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
