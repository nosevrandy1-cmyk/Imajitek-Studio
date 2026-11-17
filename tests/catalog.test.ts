import { describe, expect, it } from "vitest";
import {
  CATALOG_CATEGORIES,
  CATALOG_ITEMS,
  CATALOG_MAP,
  MARQUEE_BOTTOM_ROW,
  MARQUEE_TOP_ROW
} from "@/domain/catalog";
import {
  INITIAL_SELECTIONS,
  MAX_SEAT_QTY,
  MIN_SEAT_QTY,
  addCatalogSelection,
  buildQuoteNote,
  parseQuoteSelections,
  removeCatalogSelection,
  serializeQuoteSelections,
  toInquiryItems,
  toggleCatalogSelection,
  updateSelectionBilling,
  updateSelectionQuantity
} from "@/lib/quote";

describe("Catalog Domain Integrity", () => {
  it("contains unique catalog item IDs and valid category references", () => {
    const ids = CATALOG_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    const categoryIds = new Set(CATALOG_CATEGORIES.map((c) => c.id));
    for (const item of CATALOG_ITEMS) {
      expect(categoryIds.has(item.cat)).toBe(true);
    }
  });

  it("excludes an 'all' wall category and bounds each category cleanly", () => {
    expect(CATALOG_CATEGORIES.some((c) => (c.id as string) === "all")).toBe(false);
    for (const category of CATALOG_CATEGORIES) {
      const items = CATALOG_ITEMS.filter((item) => item.cat === category.id);
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(6);
    }
  });

  it("ensures every marquee brand maps 1:1 to a valid catalog item", () => {
    for (const pill of [...MARQUEE_TOP_ROW, ...MARQUEE_BOTTOM_ROW]) {
      expect(CATALOG_MAP.has(pill.id)).toBe(true);
    }
  });
});

describe("Per-Software Quote State Transitions", () => {
  it("maintains independent seat counts per selected software", () => {
    let state = [...INITIAL_SELECTIONS];
    state = updateSelectionQuantity(state, "adobe-cc", { delta: 3 });
    state = updateSelectionQuantity(state, "canva", { exact: 8 });
    state = updateSelectionBilling(state, "adobe-cc", "Bulanan");

    const adobe = state.find((s) => s.id === "adobe-cc");
    const canva = state.find((s) => s.id === "canva");
    const chatgpt = state.find((s) => s.id === "chatgpt");

    expect(adobe?.quantity).toBe(5);
    expect(adobe?.billing).toBe("Bulanan");
    expect(canva?.quantity).toBe(8);
    expect(canva?.billing).toBe("Tahunan");
    expect(chatgpt?.quantity).toBe(2);
  });

  it("clamps quantities strictly within [MIN_SEAT_QTY, MAX_SEAT_QTY]", () => {
    let state = [...INITIAL_SELECTIONS];
    state = updateSelectionQuantity(state, "adobe-cc", { delta: -99 });
    expect(state.find((s) => s.id === "adobe-cc")?.quantity).toBe(MIN_SEAT_QTY);

    state = updateSelectionQuantity(state, "adobe-cc", { exact: 9999 });
    expect(state.find((s) => s.id === "adobe-cc")?.quantity).toBe(MAX_SEAT_QTY);
  });

  it("keeps project items as Proyek Custom regardless of seat updates", () => {
    let state = addCatalogSelection([], "web");
    state = updateSelectionQuantity(state, "web", { exact: 12 });
    const items = toInquiryItems(state);
    expect(items).toEqual([
      {
        id: "web",
        label: "Pembuatan Website",
        type: "project",
        quantity: 1,
        billing: "Proyek Custom"
      }
    ]);
  });

  it("toggles, removes, formats summary notes, and round-trips URL serialization", () => {
    let state = toggleCatalogSelection([], "magnific");
    state = toggleCatalogSelection(state, "web");
    state = updateSelectionQuantity(state, "magnific", { exact: 4 });

    const note = buildQuoteNote(state);
    expect(note).toContain("Magnific: 4 akun · Bulanan");
    expect(note).toContain("Pembuatan Website (Proyek Custom)");

    const encoded = serializeQuoteSelections(state);
    const decoded = parseQuoteSelections(encoded);
    expect(decoded).toEqual(state);

    const trimmed = removeCatalogSelection(state, "magnific");
    expect(trimmed.map((s) => s.id)).toEqual(["web"]);
  });
});
