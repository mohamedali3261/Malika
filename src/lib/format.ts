import type { Lang } from "@/types";

/** Unicode isolate so digits + separators never reorder inside RTL text. */
function isolate(value: string): string {
  return `\u2068${value}\u2069`;
}

export function formatNumber(value: number, lang: Lang): string {
  const formatted = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
  return isolate(formatted);
}

export function formatPrice(value: number, lang: Lang): string {
  const amount = formatNumber(value, lang);
  return lang === "ar" ? `${amount} ج.م` : `EGP ${amount}`;
}

export function formatRating(value: number, lang: Lang): string {
  return isolate(
    new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)
  );
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function makeId(value: string): string {
  const clean = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${clean || "scent"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
