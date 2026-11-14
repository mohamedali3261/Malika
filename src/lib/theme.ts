import type { ThemeContent } from "@/types/content";

/** Lighten or darken a six-digit hex colour. */
export function shade(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return hex;
  const num = Number.parseInt(clean, 16);
  const channel = (shift: number) => {
    const base = (num >> shift) & 0xff;
    const next = Math.round(base + (percent < 0 ? base : 255 - base) * percent);
    return Math.min(255, Math.max(0, next));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

/** Replace purple product highlights with the site accent without changing saved product data. */
export function productAccent(colour: string | undefined, fallback: string): string {
  if (!colour || !/^#[0-9a-f]{6}$/i.test(colour)) return fallback;
  const r = parseInt(colour.slice(1, 3), 16);
  const g = parseInt(colour.slice(3, 5), 16);
  const b = parseInt(colour.slice(5, 7), 16);
  return b > g + 12 && r > g && b > r ? fallback : colour;
}

/** Existing palettes retain their derived backgrounds until explicitly changed. */
export function siteBackground(theme: ThemeContent, mode: "light" | "dark"): string {
  return mode === "dark"
    ? theme.backgroundDark ?? shade(theme.ink, 0.06)
    : theme.backgroundLight ?? shade(theme.bone, -0.07);
}

/** Section and card colours derive from the base palette, not the page background. */
export function siteSurfaces(theme: ThemeContent) {
  const cardLight = shade(theme.bone, -0.07);
  return {
    cardLight,
    surface: shade(cardLight, -0.06),
    surface2: shade(cardLight, -0.10),
    line: shade(cardLight, -0.13),
  };
}
