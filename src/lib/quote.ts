import { CATALOG_MAP, type BillingPeriod, type CatalogItem } from "@/domain/catalog";
import type { SelectedQuoteItem } from "@/domain/inquiry";

export interface CatalogSelection {
  id: string;
  quantity: number;
  billing: BillingPeriod;
}

export const INITIAL_SELECTIONS: readonly CatalogSelection[] = [
  { id: "adobe-cc", quantity: 2, billing: "Tahunan" },
  { id: "canva", quantity: 3, billing: "Tahunan" },
  { id: "chatgpt", quantity: 2, billing: "Bulanan" }
] as const;

export const MIN_SEAT_QTY = 1;
export const MAX_SEAT_QTY = 500;

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return MIN_SEAT_QTY;
  return Math.min(MAX_SEAT_QTY, Math.max(MIN_SEAT_QTY, Math.trunc(value)));
}

export function isSelected(selections: readonly CatalogSelection[], id: string): boolean {
  return selections.some((s) => s.id === id);
}

export function toggleCatalogSelection(
  selections: readonly CatalogSelection[],
  id: string
): CatalogSelection[] {
  const exists = selections.some((s) => s.id === id);
  if (exists) {
    return selections.filter((s) => s.id !== id);
  }
  const item = CATALOG_MAP.get(id);
  if (!item) return [...selections];
  return [
    ...selections,
    {
      id: item.id,
      quantity: item.defaultQty,
      billing: item.defaultBilling
    }
  ];
}

export function addCatalogSelection(
  selections: readonly CatalogSelection[],
  id: string
): CatalogSelection[] {
  if (isSelected(selections, id)) return [...selections];
  return toggleCatalogSelection(selections, id);
}

export function updateSelectionQuantity(
  selections: readonly CatalogSelection[],
  id: string,
  deltaOrExact: { delta?: number; exact?: number }
): CatalogSelection[] {
  return selections.map((entry) => {
    if (entry.id !== id) return entry;
    const item = CATALOG_MAP.get(id);
    if (item?.type === "project") return entry;
    const nextQty =
      typeof deltaOrExact.exact === "number"
        ? clampQuantity(deltaOrExact.exact)
        : clampQuantity(entry.quantity + (deltaOrExact.delta ?? 0));
    return { ...entry, quantity: nextQty };
  });
}

export function updateSelectionBilling(
  selections: readonly CatalogSelection[],
  id: string,
  billing: BillingPeriod
): CatalogSelection[] {
  return selections.map((entry) => {
    if (entry.id !== id) return entry;
    const item = CATALOG_MAP.get(id);
    if (item?.type === "project") return entry;
    return { ...entry, billing };
  });
}

export function removeCatalogSelection(
  selections: readonly CatalogSelection[],
  id: string
): CatalogSelection[] {
  return selections.filter((entry) => entry.id !== id);
}

export interface ResolvedSelection {
  item: CatalogItem;
  selection: CatalogSelection;
}

export function resolveSelections(selections: readonly CatalogSelection[]): ResolvedSelection[] {
  const resolved: ResolvedSelection[] = [];
  for (const selection of selections) {
    const item = CATALOG_MAP.get(selection.id);
    if (item) {
      resolved.push({ item, selection });
    }
  }
  return resolved;
}

export function toInquiryItems(selections: readonly CatalogSelection[]): SelectedQuoteItem[] {
  return resolveSelections(selections).map(({ item, selection }) => ({
    id: item.id,
    label: item.label,
    type: item.type,
    quantity: item.type === "project" ? 1 : selection.quantity,
    billing: item.type === "project" ? "Proyek Custom" : selection.billing
  }));
}

export function buildQuoteNote(selections: readonly CatalogSelection[]): string {
  const resolved = resolveSelections(selections);
  if (resolved.length === 0) {
    return "Mohon konsultasi kebutuhan website, desain UI/UX, atau lisensi software resmi untuk tim kami.";
  }

  const lines = resolved.map(({ item, selection }) =>
    item.type === "project"
      ? `- ${item.label} (Proyek Custom)`
      : `- ${item.label}: ${selection.quantity} akun · ${selection.billing}`
  );

  return `Mohon penawaran harga fix dalam Rupiah untuk kebutuhan berikut:\n${lines.join("\n")}`;
}

export function serializeQuoteSelections(selections: readonly CatalogSelection[]): string {
  const payload = selections.map(
    (s) => `${s.id}:${s.quantity}:${s.billing === "Bulanan" ? "m" : "y"}`
  );
  return payload.join(",");
}

export function parseQuoteSelections(raw: string | null): CatalogSelection[] | null {
  if (!raw || !raw.trim()) return null;
  const parts = raw.split(",").slice(0, 30);
  const parsed: CatalogSelection[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const [idRaw, qtyRaw, periodRaw] = part.split(":");
    const id = idRaw?.trim();
    if (!id || seen.has(id)) continue;
    const item = CATALOG_MAP.get(id);
    if (!item) continue;
    seen.add(id);
    const qty = item.type === "project" ? 1 : clampQuantity(Number(qtyRaw ?? item.defaultQty));
    const billing: BillingPeriod = periodRaw === "m" ? "Bulanan" : "Tahunan";
    parsed.push({ id, quantity: qty, billing });
  }

  return parsed.length > 0 ? parsed : null;
}
