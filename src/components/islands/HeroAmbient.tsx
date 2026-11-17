import { MotionConfig, motion } from "motion/react";

export default function HeroAmbient() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="hero-ambient-layer" aria-hidden="true">
        <motion.div
          className="hero-grid-pattern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="hero-axis-frame">
          <span className="hero-tick hero-tick-tl" />
          <span className="hero-tick hero-tick-tr" />
        </div>
      </div>
    </MotionConfig>
  );
}
