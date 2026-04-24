/**
 * Currency + date helpers for the Algerian store.
 * Prices are stored in DZD (integer, no decimals for the fractional dinar).
 * We display with Arabic-Indic digits when wrapped in `.font-arabic`.
 */

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "0 دج";
  const rounded = Math.round(value);
  const withSeparators = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withSeparators} دج`;
}

export function formatDate(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-DZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Deterministic ORD-XXXXXXXX id based on timestamp + random suffix.
 * Kept stable with the legacy single-file build so admin reports align.
 */
export function generateOrderId(): string {
  const base = Math.floor(Date.now()).toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${base}${rnd}`.slice(0, 16);
}
