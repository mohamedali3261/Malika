import type { Localized, Product } from "@/types";

export interface NoteSwatch {
  tone: string;
  note?: Localized;
  stage: "top" | "heart" | "base";
}

/** Lighten / darken a hex colour — used to derive the three note swatches. */
export function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = Number.parseInt(clean, 16);
  const channel = (shift: number) => {
    const base = (num >> shift) & 0xff;
    const next = Math.round(base + (amount < 0 ? base : 255 - base) * amount);
    return Math.min(255, Math.max(0, next));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

export function buildSwatches(product: Product): NoteSwatch[] {
  return [
    { tone: shade(product.accent, 0.42), note: product.notes.top[0], stage: "top" },
    { tone: product.accent, note: product.notes.heart[0], stage: "heart" },
    { tone: shade(product.accent, -0.38), note: product.notes.base[0], stage: "base" },
  ];
}

export function computeBottleTilt(slug: string): { idle: number; open: number } {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000;
  }
  return { idle: -22 + (hash % 11), open: -13 + (hash % 7) };
}
