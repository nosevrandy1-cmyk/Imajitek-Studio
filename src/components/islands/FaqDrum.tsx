import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent
} from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { HOME_FAQ_ITEMS, type FaqItem } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";

const ROLLER_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const;
const DRAG_STEP_PX = 20;

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
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  const wheelLockRef = useRef(0);
  const dragStartYRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const capturedPointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const sync = () => setIsCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const total = HOME_FAQ_ITEMS.length;
  const activeIdx = wrapIndex(virtualIndex, total);
  const activeItem = HOME_FAQ_ITEMS[activeIdx] ?? FALLBACK_FAQ;
  const pitch = isCompact ? 38 : 44;

  const stepBy = (delta: number) => {
    if (delta === 0) return;
    setDirection(delta > 0 ? 1 : -1);
    setVirtualIndex((prev) => prev + delta);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 10) return;
    event.preventDefault();
    const now = Date.now();
    if (now - wheelLockRef.current < 130) return;
    wheelLockRef.current = now;
    stepBy(event.deltaY > 0 ? 1 : -1);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    didDragRef.current = false;
    capturedPointerIdRef.current = null;
    setDragOffsetY(0);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const deltaY = event.clientY - dragStartYRef.current;

    if (Math.abs(deltaY) >= 6 && capturedPointerIdRef.current === null) {
      capturedPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (Math.abs(deltaY) >= DRAG_STEP_PX) {
      const steps = deltaY < 0 ? 1 : -1;
      didDragRef.current = true;
      stepBy(steps);
      dragStartYRef.current = event.clientY;
      setDragOffsetY(0);
    } else if (Math.abs(deltaY) >= 3) {
      didDragRef.current = true;
      setDragOffsetY(Math.max(-10, Math.min(10, deltaY * 0.45)));
    }
  };

  const handlePointerUp = () => {
    dragStartYRef.current = null;
    capturedPointerIdRef.current = null;
    setDragOffsetY(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(1);
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
                Putar, scroll, atau geser daftar untuk memilih topik pertanyaan.
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
                aria-activedescendant={`faq-drum-opt-${activeIdx}`}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="faq-drum-focus-band" aria-hidden="true" />
                <div className="faq-drum-slots">
                  <AnimatePresence initial={false}>
                    {ROLLER_OFFSETS.map((offset) => {
                      const vIdx = virtualIndex + offset;
                      const entryIdx = wrapIndex(vIdx, total);
                      const entry = HOME_FAQ_ITEMS[entryIdx] ?? FALLBACK_FAQ;
                      const isCenter = offset === 0;
                      const absOffset = Math.abs(offset);
                      const distanceClass = `is-dist-${Math.min(absOffset, 2)}`;

                      const targetY = offset * pitch + dragOffsetY;
                      const targetRotateX = -offset * 22;
                      const targetScale =
                        offset === 0 ? 1 : absOffset === 1 ? 0.94 : absOffset === 2 ? 0.87 : 0.8;
                      const targetOpacity = absOffset <= 2 ? 1 : 0;

                      return (
                        <motion.div
                          key={vIdx}
                          className={`faq-drum-slot ${distanceClass} ${isCenter ? "is-center" : ""}`}
                          initial={{
                            y: (offset + direction) * pitch,
                            rotateX: -(offset + direction) * 22,
                            scale: 0.8,
                            opacity: 0
                          }}
                          animate={{
                            y: targetY,
                            rotateX: targetRotateX,
                            scale: targetScale,
                            opacity: targetOpacity
                          }}
                          exit={{
                            y: (offset - direction) * pitch,
                            rotateX: -(offset - direction) * 22,
                            scale: 0.8,
                            opacity: 0
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                            mass: 0.72
                          }}
                        >
                          <button
                            id={isCenter ? `faq-drum-opt-${entryIdx}` : undefined}
                            type="button"
                            role="option"
                            aria-selected={isCenter}
                            tabIndex={isCenter ? 0 : -1}
                            className="faq-drum-item-btn"
                            onClick={() => {
                              if (didDragRef.current) {
                                didDragRef.current = false;
                                return;
                              }
                              if (offset !== 0) {
                                stepBy(offset);
                              }
                            }}
                          >
                            <span className="faq-drum-item-num tabular">
                              {String(entryIdx + 1).padStart(2, "0")}
                            </span>
                            <span className="faq-drum-item-text">{entry.question}</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="faq-drum-rail">
                <span className="faq-drum-rail-hint">Klik atau geser untuk memutar</span>
                <div className="faq-drum-track">
                  <span className="faq-drum-dot" aria-hidden="true" />
                  <motion.div
                    className="faq-drum-handle"
                    animate={{ y: dragOffsetY * 0.45 }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
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
                    <span className="faq-drum-handle-grip" aria-hidden="true" />
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
                  </motion.div>
                  <span className="faq-drum-dot" aria-hidden="true" />
                </div>
                <span className="faq-drum-counter tabular">
                  {String(activeIdx + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="faq-drum-answer" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`ans-${activeIdx}`}
                  className="faq-drum-answer-inner"
                  initial={{ opacity: 0, y: direction * 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -direction * 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="faq-drum-answer-head">
                    <span className="faq-drum-answer-tag tabular">
                      Q{String(activeIdx + 1).padStart(2, "0")}
                    </span>
                    <strong>{activeItem.question}</strong>
                  </div>
                  <p>{activeItem.answer}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
