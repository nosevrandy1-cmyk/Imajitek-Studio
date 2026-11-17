import { useEffect, useMemo, useRef, useState } from "react";
import { SpriteIcon } from "@/components/SpriteIcon";

interface PaletteAction {
  label: string;
  hint: string;
  icon: string;
  isBrand: boolean;
  href: string;
}

const ACTIONS: readonly PaletteAction[] = [
  {
    label: "Halaman Beranda",
    hint: "Utama",
    icon: "ph-command",
    isBrand: false,
    href: "/"
  },
  {
    label: "Web & Desain Studio + Standar Kerja",
    hint: "Halaman",
    icon: "phd-code",
    isBrand: false,
    href: "/web-desain"
  },
  {
    label: "Katalog Software & AI (Adobe, Canva, Magnific, Envato)",
    hint: "Halaman",
    icon: "brand-adobe-cc",
    isBrand: true,
    href: "/software"
  },
  {
    label: "Filter Lisensi AI (ChatGPT, Claude, Gemini)",
    hint: "AI Tools",
    icon: "brand-chatgpt",
    isBrand: true,
    href: "/software?cat=ai"
  },
  {
    label: "Info Pembelian & Form Konsultasi",
    hint: "Kontak",
    icon: "ph-whatsapp-logo",
    isBrand: false,
    href: "/hubungi"
  }
] as const;

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="modal-palette" role="dialog" aria-modal="true" aria-label="Menu Cepat">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik tujuan... (misal: web, desain, adobe, magnific, kontak)"
          aria-label="Cari halaman tujuan"
        />
        <div className="modal-list">
          {filtered.map((action) => (
            <button
              key={action.href}
              type="button"
              className="cmd-row"
              onClick={() => {
                setOpen(false);
                window.location.assign(action.href);
              }}
            >
              <span className="cmd-row-left">
                <span className="cmd-icon">
                  <SpriteIcon
                    id={action.icon}
                    className={action.isBrand ? "brand-svg brand-svg-sm" : "ph-icon ph-icon-sm"}
                  />
                </span>
                <span className="cmd-name">{action.label}</span>
              </span>
              <span className="cmd-type">{action.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
