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

export const CUSTOM_ID_PREFIX = "custom~";
export const MAX_CUSTOM_LABEL_LENGTH = 50;

export function isCustomSelectionId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX) && id.length > CUSTOM_ID_PREFIX.length;
}

export function createCustomSelectionId(rawLabel: string): string | null {
  const normalized = rawLabel.replace(/\s+/g, " ").trim().slice(0, MAX_CUSTOM_LABEL_LENGTH);
  if (normalized.length < 2) return null;
  return `${CUSTOM_ID_PREFIX}${encodeURIComponent(normalized.toLowerCase())}`;
}

export function getCustomSelectionLabel(id: string): string {
  if (!isCustomSelectionId(id)) return id;
  try {
    return decodeURIComponent(id.slice(CUSTOM_ID_PREFIX.length));
  } catch {
    return id.slice(CUSTOM_ID_PREFIX.length);
  }
}

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

export function addCustomSelection(
  selections: readonly CatalogSelection[],
  rawLabel: string
): { next: CatalogSelection[]; addedId: string | null } {
  const cleanLabel = rawLabel.replace(/\s+/g, " ").trim().slice(0, MAX_CUSTOM_LABEL_LENGTH);
  if (cleanLabel.length < 2) {
    return { next: [...selections], addedId: null };
  }

  // Prefer matching an existing catalog item if the user typed an exact label
  const exactCatalog = Array.from(CATALOG_MAP.values()).find(
    (item) => item.label.toLowerCase() === cleanLabel.toLowerCase()
  );
  if (exactCatalog) {
    return { next: addCatalogSelection(selections, exactCatalog.id), addedId: exactCatalog.id };
  }

  const customId = `${CUSTOM_ID_PREFIX}${encodeURIComponent(cleanLabel)}`;
  const duplicate = selections.some((s) => s.id.toLowerCase() === customId.toLowerCase());
  if (duplicate) {
    return { next: [...selections], addedId: customId };
  }

  return {
    next: [
      ...selections,
      {
        id: customId,
        quantity: 1,
        billing: "Tahunan"
      }
    ],
    addedId: customId
  };
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
  isCustom: boolean;
}

export function resolveSelections(selections: readonly CatalogSelection[]): ResolvedSelection[] {
  const resolved: ResolvedSelection[] = [];
  for (const selection of selections) {
    const item = CATALOG_MAP.get(selection.id);
    if (item) {
      resolved.push({ item, selection, isCustom: false });
      continue;
    }

    if (isCustomSelectionId(selection.id)) {
      const label = getCustomSelectionLabel(selection.id);
      if (label.length >= 2) {
        resolved.push({
          selection,
          isCustom: true,
          item: {
            id: selection.id,
            cat: "services",
            icon: "phd-stack",
            isBrand: false,
            label,
            sub: "Permintaan Khusus",
            type: "license",
            defaultQty: 1,
            defaultBilling: "Tahunan"
          }
        });
      }
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
    return "Mohon konsultasi kebutuhan website, desain UI/UX, atau lisensi software untuk tim kami.";
  }

  const lines = resolved.map(({ item, selection, isCustom }) => {
    if (item.type === "project") {
      return `- ${item.label} (Proyek Custom)`;
    }
    const suffix = isCustom ? " [Di luar katalog]" : "";
    return `- ${item.label}${suffix}: ${selection.quantity} akun · ${selection.billing}`;
  });

  return `Mohon penawaran harga dalam Rupiah untuk kebutuhan berikut:\n${lines.join("\n")}`;
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

    const catalogItem = CATALOG_MAP.get(id);
    if (catalogItem) {
      seen.add(id);
      const qty =
        catalogItem.type === "project"
          ? 1
          : clampQuantity(Number(qtyRaw ?? catalogItem.defaultQty));
      const billing: BillingPeriod = periodRaw === "m" ? "Bulanan" : "Tahunan";
      parsed.push({ id, quantity: qty, billing });
      continue;
    }

    if (isCustomSelectionId(id)) {
      const label = getCustomSelectionLabel(id).trim();
      if (label.length >= 2) {
        seen.add(id);
        const qty = clampQuantity(Number(qtyRaw ?? 1));
        const billing: BillingPeriod = periodRaw === "m" ? "Bulanan" : "Tahunan";
        parsed.push({ id, quantity: qty, billing });
      }
    }
  }

  return parsed.length > 0 ? parsed : null;
}
