import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CATALOG_CATEGORIES, CATALOG_ITEMS, type CatalogItem } from "@/domain/catalog";
import { SpriteIcon } from "@/components/SpriteIcon";
import { dispatchCatalogPick } from "@/lib/events";

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

  const showDropdown = open && trimmedQuery.length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (matches.length === 0) return;

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
    <div className="hero-search-shell" ref={shellRef}>
      <div className={`hero-search-bar ${showDropdown ? "is-open" : ""}`}>
        <SpriteIcon id="ph-magnifying-glass" className="ph-icon hero-search-icon" />
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
          placeholder="Cari software / layanan (Adobe, Canva, Claude, Web)..."
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

      {showDropdown && (
        <div
          id="hero-search-results"
          className="hero-search-results"
          role="listbox"
          aria-label="Hasil pencarian layanan dan software"
        >
          {matches.length === 0 ? (
            <div className="hero-search-empty">
              Tidak ditemukan hasil untuk &ldquo;{search.trim()}&rdquo;. Coba Adobe, Canva,
              Magnific, ChatGPT, atau Website.
            </div>
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
        </div>
      )}
    </div>
  );
}
