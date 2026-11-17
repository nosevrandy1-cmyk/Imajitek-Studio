import type { SelectedQuoteItem } from "@/domain/inquiry";

export const PREFILL_INQUIRY_EVENT = "imajitek:prefill-inquiry";
export const CATALOG_PICK_EVENT = "imajitek:catalog-pick";

export interface PrefillInquiryDetail {
  notes: string;
  topic?: string;
  items?: SelectedQuoteItem[];
  scrollToId?: string;
}

declare global {
  interface Window {
    __imajitekPendingPrefill?: PrefillInquiryDetail;
    __imajitekPendingCatalogPick?: string;
  }
}

export function dispatchInquiryPrefill(detail: PrefillInquiryDetail): void {
  if (typeof window === "undefined") return;

  // Persist last payload so client:visible islands that hydrate after scrollIntoView still receive it.
  window.__imajitekPendingPrefill = detail;
  window.dispatchEvent(new CustomEvent<PrefillInquiryDetail>(PREFILL_INQUIRY_EVENT, { detail }));

  const targetId = detail.scrollToId ?? "home-inquiry";
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const firstInput = target.querySelector<HTMLInputElement>("input[type='text']");
      firstInput?.focus({ preventScroll: true });
    }, 420);
  }
}

export function subscribeInquiryPrefill(
  handler: (detail: PrefillInquiryDetail) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  if (window.__imajitekPendingPrefill) {
    const pending = window.__imajitekPendingPrefill;
    delete window.__imajitekPendingPrefill;
    handler(pending);
  }

  const listener = (event: Event) => {
    const custom = event as CustomEvent<PrefillInquiryDetail>;
    if (custom.detail) {
      delete window.__imajitekPendingPrefill;
      handler(custom.detail);
    }
  };
  window.addEventListener(PREFILL_INQUIRY_EVENT, listener);
  return () => window.removeEventListener(PREFILL_INQUIRY_EVENT, listener);
}

export function dispatchCatalogPick(itemId: string): void {
  if (typeof window === "undefined") return;

  window.__imajitekPendingCatalogPick = itemId;
  window.dispatchEvent(
    new CustomEvent<{ itemId: string }>(CATALOG_PICK_EVENT, { detail: { itemId } })
  );

  const target = document.getElementById("home-catalog");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function subscribeCatalogPick(handler: (itemId: string) => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  if (window.__imajitekPendingCatalogPick) {
    const pending = window.__imajitekPendingCatalogPick;
    delete window.__imajitekPendingCatalogPick;
    handler(pending);
  }

  const listener = (event: Event) => {
    const custom = event as CustomEvent<{ itemId: string }>;
    if (custom.detail?.itemId) {
      delete window.__imajitekPendingCatalogPick;
      handler(custom.detail.itemId);
    }
  };
  window.addEventListener(CATALOG_PICK_EVENT, listener);
  return () => window.removeEventListener(CATALOG_PICK_EVENT, listener);
}
