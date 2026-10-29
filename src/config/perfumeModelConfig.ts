import type { Localized } from "@/types";

/* ------------------------------------------------------------------ *
 * MALIKA — scroll-driven exploded perfume experience: asset config.
 *
 * Everything the animation needs is declared here. Swapping the visual
 * asset (procedural → real GLB) never requires touching animation code.
 * ------------------------------------------------------------------ */

export type PartId =
  | "BottleGlass"
  | "PerfumeLiquid"
  | "BottleBase"
  | "BottleNeck"
  | "Collar"
  | "SprayPump"
  | "AtomizerNozzle"
  | "DipTube"
  | "BottleCap"
  | "BottleLabel";

export type Vec3 = readonly [number, number, number];

export type MaterialKind = "glass" | "thinGlass" | "liquid" | "metal" | "darkMetal" | "cap" | "label" | "tube";

export interface PartConfig {
  /** Semantic id used by the animation timeline. */
  id: PartId;
  /**
   * Node name to look for inside the GLB. The mapping is intentionally
   * decoupled from `id` so a model can use any naming convention.
   */
  nodeName: string;
  /** Resting transform — the fully assembled product. */
  assembled: { position: Vec3; rotation: Vec3 };
  /** Offsets ADDED to the assembled transform at full explosion. */
  exploded: { position: Vec3; rotation: Vec3 };
  /**
   * Normalised start/end within the separation stage (0–1). Staggering
   * these makes the disassembly read as a mechanism, not a scatter.
   */
  stagger: { start: number; end: number };
  material: MaterialKind;
  label?: Localized;
  /** Anchor offset for the technical label in exploded view. */
  labelOffset?: Vec3;
  /**
   * Only a handful of callouts are shown. A technical drawing stays premium
   * by labelling the parts that matter, not every component.
   */
  showLabel?: boolean;
  /** Draw a connector line back to the bottle axis in exploded view. */
  connector?: boolean;
}

/**
 * Asset source.
 *
 * `useGlb: false` renders the procedural, fully-separated bottle that ships
 * with the project. Set `useGlb: true` and drop a model at `glbPath` whose
 * meshes are named like `nodeName` below to switch to your own asset.
 */
export const perfumeAsset = {
  useGlb: false,
  glbPath: "/models/perfume-bottle.glb",
  /** Uniform scale applied to an imported GLB so it matches the rig below. */
  glbScale: 1,
  /** Lift an imported GLB so its base sits on the shadow plane. */
  glbYOffset: 0,
} as const;

/** Scroll stage boundaries, expressed as master-timeline progress. */
export const stages = {
  heroReveal: [0, 0.15],
  separation: [0.15, 0.4],
  showcase: [0.4, 0.6],
  reassembly: [0.6, 0.85],
  finalReveal: [0.85, 1],
} as const;

export type StageName = keyof typeof stages;

/**
 * The bottle rig. Units are "bottle units" — the body is 1.2 tall, which
 * keeps the whole product a little under 2 units so a 35° camera at z≈4.6
 * frames it with generous negative space.
 */
export const partsConfig: readonly PartConfig[] = [
  {
    id: "BottleCap",
    nodeName: "BottleCap",
    assembled: { position: [0, 1.17, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, 0.78, 0.0], rotation: [0, 0.6, 0] },
    stagger: { start: 0, end: 0.55 },
    material: "cap",
    label: { en: "Weighted cap", ar: "غطاء موزون" },
    labelOffset: [0.44, 0.06, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "AtomizerNozzle",
    nodeName: "AtomizerNozzle",
    assembled: { position: [0, 1.04, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.322, 0.57, 0.062], rotation: [0.25, 0.4, 0.18] },
    stagger: { start: 0.08, end: 0.62 },
    material: "metal",
    label: { en: "Atomizer", ar: "البخاخ" },
    labelOffset: [0.4, 0.06, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "SprayPump",
    nodeName: "SprayPump",
    assembled: { position: [0, 0.94, 0], rotation: [0, 0, 0] },
    exploded: { position: [-0.384, 0.409, 0.087], rotation: [-0.2, -0.3, -0.22] },
    stagger: { start: 0.14, end: 0.68 },
    material: "darkMetal",
    label: { en: "Pump", ar: "المضخة" },
    labelOffset: [-0.46, 0.1, 0],
    connector: true,
  },
  {
    id: "Collar",
    nodeName: "Collar",
    assembled: { position: [0, 0.84, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.285, 0.211, -0.198], rotation: [0.3, 0.5, 0.1] },
    stagger: { start: 0.2, end: 0.74 },
    material: "metal",
    label: { en: "Collar", ar: "الطوق" },
    labelOffset: [0.44, 0.06, 0],
  },
  {
    id: "BottleNeck",
    nodeName: "BottleNeck",
    assembled: { position: [0, 0.71, 0], rotation: [0, 0, 0] },
    exploded: { position: [-0.298, 0.074, -0.186], rotation: [-0.26, -0.45, -0.12] },
    stagger: { start: 0.24, end: 0.78 },
    material: "thinGlass",
    label: { en: "Neck", ar: "العنق" },
    labelOffset: [-0.42, 0.04, 0],
  },
  {
    id: "DipTube",
    nodeName: "DipTube",
    assembled: { position: [0, 0.1, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.533, 0.062, 0.211], rotation: [0, 0, 0.3] },
    stagger: { start: 0.18, end: 0.8 },
    material: "tube",
    label: { en: "Dip tube", ar: "أنبوب السحب" },
    labelOffset: [0.34, 0.5, 0],
    connector: true,
  },
  {
    id: "BottleLabel",
    nodeName: "BottleLabel",
    assembled: { position: [0, -0.16, 0.281], rotation: [0, 0, 0] },
    exploded: { position: [-0.484, -0.112, 0.31], rotation: [0, -0.5, 0] },
    stagger: { start: 0.3, end: 0.86 },
    material: "label",
    label: { en: "Hand-numbered label", ar: "ملصق مرقّم يدوياً" },
    labelOffset: [-0.5, -0.2, 0],
  },
  {
    id: "BottleGlass",
    nodeName: "BottleGlass",
    assembled: { position: [0, 0, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.186, -0.174], rotation: [0, 0.22, 0] },
    stagger: { start: 0.06, end: 0.7 },
    material: "glass",
    label: { en: "Glass body", ar: "جسم الزجاج" },
    labelOffset: [0.56, 0.1, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "PerfumeLiquid",
    // Travels with the glass body so it always reads as liquid *inside* it.
    nodeName: "PerfumeLiquid",
    assembled: { position: [0, -0.1, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.186, -0.174], rotation: [0, 0.22, 0] },
    stagger: { start: 0.06, end: 0.7 },
    material: "liquid",
    label: { en: "Extrait 30%", ar: "إكستريه ٣٠٪" },
    labelOffset: [-0.52, -0.08, 0],
    showLabel: true,
  },
  {
    id: "BottleBase",
    nodeName: "BottleBase",
    assembled: { position: [0, -0.66, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.57, -0.124], rotation: [0, -0.3, 0] },
    stagger: { start: 0.1, end: 0.72 },
    material: "cap",
    label: { en: "Weighted base", ar: "القاعدة الموزونة" },
    labelOffset: [0.6, -0.1, 0],
  },
];

/** Camera keyframes sampled across master progress. */
export interface CameraKey {
  at: number;
  position: Vec3;
  target: Vec3;
  fov: number;
}

export const cameraKeys: readonly CameraKey[] = [
  // target.x offsets the product away from the copy column. It is ignored on
  // narrow viewports, where the text stacks above/below instead (see CameraRig).
  { at: 0, position: [0, 0.3, 5.1], target: [-0.3, 0.02, 0], fov: 32 },
  { at: 0.15, position: [0.2, 0.34, 5.3], target: [-0.28, 0.04, 0], fov: 32 },
  { at: 0.4, position: [0.95, 0.72, 6.5], target: [0.3, 0.28, 0], fov: 34 },
  { at: 0.5, position: [0.05, 0.95, 6.75], target: [0.32, 0.3, 0], fov: 34 },
  { at: 0.6, position: [-1.0, 0.68, 6.5], target: [0.3, 0.28, 0], fov: 34 },
  { at: 0.85, position: [-0.15, 0.28, 5.15], target: [-0.2, 0.02, 0], fov: 32 },
  { at: 1, position: [0, 0.06, 4.95], target: [-0.32, 0.0, 0], fov: 30 },
];

/** Palette, aligned with the storefront design tokens. */
export const perfumePalette = {
  glassTint: "#dfe8e4",
  liquid: "#c8872e",
  liquidEmissive: "#7a3d08",
  metal: "#d8c9a8",
  darkMetal: "#2a2430",
  cap: "#17121d",
  label: "#f3efe7",
  background: "#141019",
  accent: "#ddf25c",
  lilac: "#c9b5f7",
} as const;

/** Per-device animation profile — keeps low-power hardware smooth. */
export interface QualityProfile {
  dpr: [number, number];
  transmission: boolean;
  contactShadows: boolean;
  connectors: boolean;
  labels: boolean;
  /** MeshTransmissionMaterial sample count (refraction quality). */
  glassSamples: number;
  /** Render-target size for the transmission buffer. */
  glassResolution: number;
  /** Mirror floor beneath the product. */
  reflectiveFloor: boolean;
  segments: number;
}

export const qualityProfiles: Record<"high" | "medium" | "low", QualityProfile> = {
  high: { dpr: [1, 1.9], transmission: true, contactShadows: true, connectors: true, labels: true, glassSamples: 6, glassResolution: 512, reflectiveFloor: true, segments: 96 },
  medium: { dpr: [1, 1.5], transmission: true, contactShadows: true, connectors: true, labels: true, glassSamples: 3, glassResolution: 256, reflectiveFloor: false, segments: 64 },
  low: { dpr: [1, 1.5], transmission: false, contactShadows: false, connectors: false, labels: false, glassSamples: 0, glassResolution: 128, reflectiveFloor: false, segments: 40 },
};

/** Scroll length of the pinned section, per breakpoint. */
export const scrollLength = {
  desktop: 320,
  tablet: 300,
  mobile: 260,
} as const;

/** Editorial copy for the experience. */
export const perfumeStory = {
  collection: { en: "The Signature Collection", ar: "مجموعة التوقيع" },
  productSlug: "malika-noir",
  name: { en: "Malika Noir", ar: "مليكة نوار" },
  tagline: {
    en: "Nine parts. One unforgettable presence.",
    ar: "تسعة أجزاء. حضورٌ واحد لا يُنسى.",
  },
  heroLine: {
    en: "Extrait de parfum · 30% concentration",
    ar: "إكستريه دو بارفان · تركيز ٣٠٪",
  },
  craft: {
    title: { en: "Engineered to be opened.", ar: "مصمّمة لتُفتَح." },
    body: {
      en: "Every Malika bottle is assembled by hand from nine parts: hand-blown glass, a weighted base, a precision pump and a brass collar machined to a tenth of a millimetre. Scroll to take it apart.",
      ar: "كل زجاجة مليكة تُجمَّع يدوياً من تسعة أجزاء: زجاج منفوخ يدوياً، قاعدة موزونة، مضخة دقيقة، وطوق نحاسي مخرَّط بدقة عُشر المليمتر. مرّر لتفكيكها.",
    },
  },
  notes: [
    { en: "Black pepper · Bergamot", ar: "فلفل أسود · برجموت" },
    { en: "Frankincense · Smoked cedar", ar: "لبان · أرز مدخن" },
    { en: "Laotian oud · Leather", ar: "عود لاوسي · جلد" },
  ],
  finalLine: {
    en: "Assembled, numbered and sealed in Cairo.",
    ar: "تُجمَّع وتُرقَّم وتُختَم في القاهرة.",
  },
} as const;
