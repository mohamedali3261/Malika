export type MotionCategory =
  | "entrances"
  | "clips"
  | "perspective3d"
  | "springs"
  | "ambient"
  | "light"
  | "typography"
  | "cards"
  | "navigation"
  | "interactions";

export type MotionTrigger = "enter" | "loop" | "hover" | "active" | "pointer";

export interface MotionPreset {
  /** 1..200 sequential index */
  readonly index: number;
  /** CSS class / preset identifier (e.g. "m-rise-soft") */
  readonly id: string;
  readonly category: MotionCategory;
  readonly trigger: MotionTrigger;
  readonly durationMs: number;
  readonly label: { readonly en: string; readonly ar: string };
}
