import { AMBIENT_PRESETS, LIGHT_PRESETS } from "@/motion/presets/ambientAndLight";
import { CLIPS_PRESETS, ENTRANCES_PRESETS } from "@/motion/presets/entrancesAndClips";
import { INTERACTIONS_PRESETS, NAVIGATION_PRESETS } from "@/motion/presets/navigationAndInteractions";
import { PERSPECTIVE_3D_PRESETS, SPRINGS_PRESETS } from "@/motion/presets/perspectiveAndSprings";
import { CARDS_PRESETS, TYPOGRAPHY_PRESETS } from "@/motion/presets/typographyAndCards";
import type { MotionCategory, MotionPreset } from "@/motion/types";
import type { CSSProperties } from "react";

export const MOTION_CATALOG: readonly MotionPreset[] = [
  ...ENTRANCES_PRESETS,
  ...CLIPS_PRESETS,
  ...PERSPECTIVE_3D_PRESETS,
  ...SPRINGS_PRESETS,
  ...AMBIENT_PRESETS,
  ...LIGHT_PRESETS,
  ...TYPOGRAPHY_PRESETS,
  ...CARDS_PRESETS,
  ...NAVIGATION_PRESETS,
  ...INTERACTIONS_PRESETS,
];

export const MOTION_BY_ID: ReadonlyMap<string, MotionPreset> = new Map(
  MOTION_CATALOG.map((preset) => [preset.id, preset])
);

export function getMotionsByCategory(category: MotionCategory): readonly MotionPreset[] {
  return MOTION_CATALOG.filter((preset) => preset.category === category);
}

/** Curated entrance cycle for card grids so adjacent cards feel organically choreographed. */
const CARD_REVEAL_CYCLE = [
  "m-rise-deep",
  "m-pedestal-lift",
  "m-3d-flip-x-up",
  "m-spring-soft",
  "m-arc-rise-left",
  "m-arc-rise-right",
  "m-blur-rise",
  "m-velvet-unfold",
] as const;

export function pickCardRevealVariant(index: number): string {
  return CARD_REVEAL_CYCLE[index % CARD_REVEAL_CYCLE.length];
}

export function staggerStyle(index: number, stepMs = 45, durationMs?: number): CSSProperties {
  const style: Record<string, string | number> = {
    "--stagger-index": index,
    "--stagger-step": `${stepMs}ms`,
    "--m-delay": `${index * stepMs}ms`,
  };
  if (durationMs) style["--m-dur"] = `${durationMs}ms`;
  return style as CSSProperties;
}
