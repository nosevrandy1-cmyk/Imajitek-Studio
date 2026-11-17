import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import UseAnimations from "react-useanimations";
import searchToX from "react-useanimations/lib/searchToX";
import { CATALOG_CATEGORIES, CATALOG_ITEMS, type CatalogItem } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchCatalogCustom, dispatchCatalogPick } from "@/lib/events";

const CATEGORY_LABEL_MAP = new Map(CATALOG_CATEGORIES.map((c) => [c.id, c.label]));

export default function HeroLauncher() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = search.trim().toLowerCase();

  const matches = useMemo<readonly CatalogItem[]>(() => {
    if (!trimmedQuery) return [];
    return CATALOG_ITEMS.filter((item) => {
      const catLabel = CATEGORY_LABEL_MAP.get(item.cat)?.toLowerCase() ?? "";
      return (
        item.label.toLowerCase().includes(trimmedQuery) ||
        item.sub.toLowerCase().includes(trimmedQuery) ||
        catLabel.includes(trimmedQuery) ||
        item.id.toLowerCase().includes(trimmedQuery)
      );
    }).slice(0, 6);
  }, [trimmedQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectItem = (item: CatalogItem) => {
    setOpen(false);
    setSearch("");
    dispatchCatalogPick(item.id);
  };

  const addCustomQuery = () => {
    const label = search.trim();
    if (label.length < 2) return;
    setOpen(false);
    setSearch("");
    dispatchCatalogCustom(label);
  };

  const showDropdown = open && trimmedQuery.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (matches.length === 0) {
      if (e.key === "Enter" && showDropdown && search.trim().length >= 2) {
        e.preventDefault();
        addCustomQuery();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" && showDropdown) {
      e.preventDefault();
      const target = matches[activeIndex] ?? matches[0];
      if (target) selectItem(target);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="hero-search-shell"
        ref={shellRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 24, delay: 0.06 }}
      >
        <div className={`hero-search-bar ${showDropdown ? "is-open" : ""}`}>
          <UseAnimations
            animation={searchToX}
            interaction="hover-replay"
            size={20}
            className="hero-search-icon"
          />
          <input
            id="launcher-search"
            className="hero-search-input"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            value={search}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari software atau layanan (Adobe, Canva, Claude, Web)..."
            aria-label="Cari layanan atau lisensi software"
            aria-expanded={showDropdown}
            aria-controls="hero-search-results"
            aria-activedescendant={
              showDropdown && matches[activeIndex]
                ? `hero-search-opt-${matches[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
          />
          {search.length > 0 ? (
            <button
              type="button"
              className="hero-search-clear"
              aria-label="Bersihkan pencarian"
              onClick={() => {
                setSearch("");
                setOpen(false);
              }}
            >
              <SpriteIcon id="ph-x" className="ph-icon ph-icon-xs" />
            </button>
          ) : (
            <span className="hero-search-kbd kbd-chip" aria-hidden="true">
              &#8984;K
            </span>
          )}
        </div>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              id="hero-search-results"
              className="hero-search-results"
              role="listbox"
              aria-label="Hasil pencarian layanan dan software"
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {matches.length === 0 ? (
                search.trim().length >= 2 ? (
                  <button
                    type="button"
                    role="option"
                    aria-selected="true"
                    className="hero-search-item is-highlighted"
                    onClick={addCustomQuery}
                  >
                    <span className="hero-search-item-left">
                      <SpriteIcon id="phd-stack" className="ph-icon ph-icon-sm" />
                      <span className="hero-search-item-text">
                        <strong>+ Tambahkan &ldquo;{search.trim()}&rdquo;</strong>
                        <small>Masukkan sebagai kebutuhan khusus di luar katalog standar</small>
                      </span>
                    </span>
                    <span className="hero-search-item-cat">Kebutuhan Khusus</span>
                  </button>
                ) : (
                  <div className="hero-search-empty">
                    Ketik minimal 2 huruf untuk mencari atau menambahkan software.
                  </div>
                )
              ) : (
                matches.map((item, idx) => {
                  const catLabel = CATEGORY_LABEL_MAP.get(item.cat) ?? "Layanan";
                  const isHighlighted = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`hero-search-opt-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      className={`hero-search-item ${isHighlighted ? "is-highlighted" : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => selectItem(item)}
                    >
                      <span className="hero-search-item-left">
                        <SpriteIcon
                          id={item.icon}
                          className={item.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-sm"}
                        />
                        <span className="hero-search-item-text">
                          <strong>{item.label}</strong>
                          <small>{item.sub}</small>
                        </span>
                      </span>
                      <span className="hero-search-item-cat">{catLabel}</span>
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
