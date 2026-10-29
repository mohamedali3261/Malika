import type { ThemeContent } from "@/types/content";

/** Allowed ranges, in percent. Enforced in the editor AND when content is read. */
export const SCALE_LIMITS = {
  headingScale: { min: 60, max: 130, step: 2 },
  bodyScale: { min: 80, max: 125, step: 2 },
  sectionSpacing: { min: 40, max: 140, step: 5 },
} as const;

export type ScaleKey = keyof typeof SCALE_LIMITS;

export const clampScale = (key: ScaleKey, value: number): number => {
  const { min, max } = SCALE_LIMITS[key];
  const n = Number.isFinite(value) ? value : 100;
  return Math.min(max, Math.max(min, Math.round(n)));
};

/**
 * Push the three scales into the CSS variables read by `.hd-*`, `.lead-copy`
 * and `.sec-*` (see index.css). Writing variables — not classes — means one
 * change restyles every page with no React re-render at all.
 */
export function applyScale(theme: Pick<ThemeContent, ScaleKey>) {
  const root = document.documentElement.style;
  root.setProperty("--hs", String(clampScale("headingScale", theme.headingScale) / 100));
  root.setProperty("--bs", String(clampScale("bodyScale", theme.bodyScale) / 100));
  root.setProperty("--ss", String(clampScale("sectionSpacing", theme.sectionSpacing) / 100));
}
