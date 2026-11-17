import { useState } from "react";
import { HOME_FAQ_ITEMS } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-accordion" id="home-faq">
      {HOME_FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.question} className={`faq-acc-item ${isOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="faq-acc-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <span>{item.question}</span>
              <SpriteIcon id="ph-caret-down" className="ph-icon ph-icon-sm faq-acc-caret" />
            </button>
            <div className="faq-acc-panel">{item.answer}</div>
          </div>
        );
      })}
    </div>
  );
}
