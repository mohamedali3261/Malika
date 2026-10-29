import { cameraKeys, stages, type CameraKey, type PartConfig, type StageName, type Vec3 } from "@/config/perfumeModelConfig";

/* Pure math helpers — no React, no Three.js imports, fully tree-shakeable. */

export const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Smooth, symmetrical ease. Reversible, so scrolling up mirrors scrolling down. */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/** Maps a global progress value into a local 0–1 range. */
export function subProgress(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

export function stageProgress(progress: number, stage: StageName): number {
  const [start, end] = stages[stage];
  return subProgress(progress, start, end);
}

/**
 * Explosion amount for the whole rig: 0 assembled → 1 fully exploded → 0 again.
 * Separation and reassembly are driven by the same curve so the two directions
 * are exact mirrors of each other.
 */
export function explosionFactor(progress: number): number {
  const [sepStart, sepEnd] = stages.separation;
  const [showStart, showEnd] = stages.showcase;
  const [reStart, reEnd] = stages.reassembly;

  if (progress <= sepStart) return 0;
  if (progress < sepEnd) return subProgress(progress, sepStart, sepEnd);
  if (progress <= showEnd) return 1;
  if (progress < reEnd) return 1 - subProgress(progress, reStart, reEnd);
  return 0;
  // showStart is implied by sepEnd; kept in the destructure for readability
  void showStart;
}

/** Per-part amount, applying that part's stagger window to the rig factor. */
export function partFactor(part: PartConfig, rigFactor: number): number {
  const { start, end } = part.stagger;
  return easeInOutCubic(subProgress(rigFactor, start, end));
}

export function applyOffset(base: Vec3, offset: Vec3, amount: number, out: [number, number, number]) {
  out[0] = base[0] + offset[0] * amount;
  out[1] = base[1] + offset[1] * amount;
  out[2] = base[2] + offset[2] * amount;
}

/** Catmull-free piecewise interpolation of the camera keyframes. */
export function sampleCamera(progress: number): { position: Vec3; target: Vec3; fov: number } {
  const keys: readonly CameraKey[] = cameraKeys;
  if (progress <= keys[0].at) return keys[0];
  const last = keys[keys.length - 1];
  if (progress >= last.at) return last;

  let index = 0;
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (progress >= keys[i].at && progress <= keys[i + 1].at) {
      index = i;
      break;
    }
  }
  const a = keys[index];
  const b = keys[index + 1];
  const t = easeInOutCubic(subProgress(progress, a.at, b.at));

  return {
    position: [
      lerp(a.position[0], b.position[0], t),
      lerp(a.position[1], b.position[1], t),
      lerp(a.position[2], b.position[2], t),
    ],
    target: [
      lerp(a.target[0], b.target[0], t),
      lerp(a.target[1], b.target[1], t),
      lerp(a.target[2], b.target[2], t),
    ],
    fov: lerp(a.fov, b.fov, t),
  };
}

/** Opacity curve for a text block that fades in and out across a window. */
export function fadeWindow(progress: number, start: number, end: number, fade = 0.05): number {
  if (progress < start - fade || progress > end + fade) return 0;
  const rising = clamp01((progress - (start - fade)) / fade);
  const falling = clamp01(((end + fade) - progress) / fade);
  return Math.min(rising, falling, 1);
}

/** Which narrative stage a progress value belongs to. */
export function currentStage(progress: number): StageName {
  const names = Object.keys(stages) as StageName[];
  for (const name of names) {
    const [start, end] = stages[name];
    if (progress >= start && progress < end) return name;
  }
  return "finalReveal";
}

export function detectQuality(): "high" | "medium" | "low" {
  if (typeof window === "undefined") return "medium";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  // Phones always get the lightweight profile. Real-time refraction renders
  // the scene twice per frame, which no phone sustains at 60 fps.
  if (narrow) return "low";
  if (coarse) return cores >= 6 && memory >= 4 ? "medium" : "low";
  if (cores <= 4 || memory <= 4) return "medium";
  return "high";
}

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(context);
  } catch {
    return false;
  }
}

/**
 * Vertical offset of the 3D canvas as a fraction of the stage height, used
 * when the copy stacks above/below the bottle (phones and small tablets).
 * Positive pushes the bottle DOWN (copy sits above it); negative pushes it UP
 * (copy sits below it). It is applied as a compositor-only CSS transform.
 */
const stageShiftKeys: readonly (readonly [number, number])[] = [
  [0, 0.13],
  [0.4, 0.08],
  [0.6, 0.08],
  [0.84, 0.08],
  [0.93, -0.17],
  [1, -0.17],
];

export function mobileStageShift(progress: number): number {
  const keys = stageShiftKeys;
  if (progress <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (progress >= last[0]) return last[1];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [a, av] = keys[i];
    const [b, bv] = keys[i + 1];
    if (progress >= a && progress <= b) {
      return lerp(av, bv, easeInOutCubic(subProgress(progress, a, b)));
    }
  }
  return last[1];
}
