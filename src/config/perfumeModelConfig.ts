import type { Localized } from "@/types";

/* ------------------------------------------------------------------ *
 * VLOR — scroll-driven exploded perfume experience: asset config.
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

export type MaterialKind =
  | "glass"
  | "thinGlass"
  | "liquid"
  | "metal"
  | "darkMetal"
  | "cap"
  | "label"
  | "tube";

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
 * Precision-seated flacon rig:
 * When assembled (progress = 0 or 1), `BottleCap` seats flush on the brass
 * `Collar`, enclosing `SprayPump` and `AtomizerNozzle` completely inside.
 */
export const partsConfig: readonly PartConfig[] = [
  {
    id: "BottleCap",
    nodeName: "BottleCap",
    assembled: { position: [0, 1.045, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, 0.92, 0.0], rotation: [0.04, 0.58, -0.02] },
    stagger: { start: 0, end: 0.5 },
    material: "cap",
    label: { en: "Weighted cap", ar: "غطاء موزون" },
    labelOffset: [0.48, 0.06, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "AtomizerNozzle",
    nodeName: "AtomizerNozzle",
    assembled: { position: [0, 0.98, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.28, 0.62, 0.06], rotation: [0.18, 0.36, 0.12] },
    stagger: { start: 0.08, end: 0.6 },
    material: "metal",
    label: { en: "Micro-mist atomizer", ar: "بخاخ الرذاذ الدقيق" },
    labelOffset: [0.44, 0.05, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "SprayPump",
    nodeName: "SprayPump",
    assembled: { position: [0, 0.895, 0], rotation: [0, 0, 0] },
    exploded: { position: [-0.32, 0.44, 0.08], rotation: [-0.15, -0.28, -0.16] },
    stagger: { start: 0.14, end: 0.66 },
    material: "darkMetal",
    label: { en: "Hermetic pump", ar: "مضخة لا هوائية" },
    labelOffset: [-0.48, 0.08, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "Collar",
    nodeName: "Collar",
    assembled: { position: [0, 0.812, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.24, 0.25, -0.14], rotation: [0.22, 0.46, 0.08] },
    stagger: { start: 0.2, end: 0.72 },
    material: "metal",
    label: { en: "Brushed brass collar", ar: "طوق نحاسي مصقول" },
    labelOffset: [0.46, 0.04, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "BottleNeck",
    nodeName: "BottleNeck",
    assembled: { position: [0, 0.695, 0], rotation: [0, 0, 0] },
    exploded: { position: [-0.24, 0.1, -0.14], rotation: [-0.18, -0.38, -0.09] },
    stagger: { start: 0.24, end: 0.78 },
    material: "thinGlass",
    label: { en: "Fire-polished neck", ar: "عنق زجاجي مصقول" },
    labelOffset: [-0.42, 0.04, 0],
  },
  {
    id: "DipTube",
    nodeName: "DipTube",
    assembled: { position: [0, 0.08, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.46, 0.06, 0.18], rotation: [0, 0, 0.22] },
    stagger: { start: 0.18, end: 0.8 },
    material: "tube",
    label: { en: "Capillary tube", ar: "أنبوب السحب الشعري" },
    labelOffset: [0.36, 0.42, 0],
    connector: true,
  },
  {
    id: "BottleLabel",
    nodeName: "BottleLabel",
    assembled: { position: [0, -0.06, 0], rotation: [0, 0, 0] },
    exploded: { position: [-0.36, -0.06, 0.42], rotation: [0, -0.36, 0] },
    stagger: { start: 0.26, end: 0.84 },
    material: "label",
    label: { en: "Hot-foil crest", ar: "وسام مذهّب مرقّم" },
    labelOffset: [-0.52, -0.1, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "BottleGlass",
    nodeName: "BottleGlass",
    assembled: { position: [0, 0, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.16, -0.14], rotation: [0, 0.22, 0] },
    stagger: { start: 0.06, end: 0.7 },
    material: "glass",
    label: { en: "Hand-blown crystal", ar: "كريستال منفوخ يدوياً" },
    labelOffset: [0.58, 0.1, 0],
    showLabel: true,
    connector: true,
  },
  {
    id: "PerfumeLiquid",
    nodeName: "PerfumeLiquid",
    assembled: { position: [0, -0.04, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.2, -0.14], rotation: [0, 0.22, 0] },
    stagger: { start: 0.06, end: 0.7 },
    material: "liquid",
    label: { en: "Extrait 30%", ar: "إكستريه ٣٠٪" },
    labelOffset: [-0.54, -0.08, 0],
    showLabel: true,
  },
  {
    id: "BottleBase",
    nodeName: "BottleBase",
    assembled: { position: [0, -0.685, 0], rotation: [0, 0, 0] },
    exploded: { position: [0.0, -0.54, -0.1], rotation: [0, -0.3, 0] },
    stagger: { start: 0.1, end: 0.72 },
    material: "cap",
    label: { en: "Weighted plinth", ar: "القاعدة الكريستالية الموزونة" },
    labelOffset: [0.58, -0.08, 0],
    showLabel: true,
    connector: true,
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
  { at: 0, position: [0, 0.26, 4.95], target: [-0.3, 0.02, 0], fov: 32 },
  { at: 0.15, position: [0.22, 0.32, 5.15], target: [-0.28, 0.04, 0], fov: 32 },
  { at: 0.4, position: [0.88, 0.68, 6.35], target: [0.3, 0.26, 0], fov: 34 },
  { at: 0.5, position: [0.05, 0.88, 6.55], target: [0.32, 0.28, 0], fov: 34 },
  { at: 0.6, position: [-0.92, 0.64, 6.35], target: [0.3, 0.26, 0], fov: 34 },
  { at: 0.85, position: [-0.15, 0.26, 5.0], target: [-0.22, 0.02, 0], fov: 32 },
  { at: 1, position: [0, 0.08, 4.85], target: [-0.32, 0.0, 0], fov: 30 },
];

/** Palette, aligned with the storefront design tokens. */
export const perfumePalette = {
  glassTint: "#e7efec",
  liquid: "#d49035",
  liquidEmissive: "#7c3f09",
  metal: "#dfcaa4",
  darkMetal: "#2b2432",
  cap: "#16111c",
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
  /** 0 = live every frame (desktop), 1 = baked once at zero ongoing cost (mobile/tablet). */
  shadowFrames: number;
  connectors: boolean;
  labels: boolean;
  glassSamples: number;
  glassResolution: number;
  reflectiveFloor: boolean;
  segments: number;
}

export const qualityProfiles: Record<"high" | "medium" | "low", QualityProfile> = {
  high: {
    dpr: [1, 1.6],
    transmission: true,
    contactShadows: true,
    shadowFrames: 0,
    connectors: true,
    labels: true,
    glassSamples: 4,
    glassResolution: 256,
    reflectiveFloor: false,
    segments: 64,
  },
  medium: {
    dpr: [1, 1.35],
    transmission: false,
    contactShadows: false,
    shadowFrames: 1,
    connectors: false,
    labels: false,
    glassSamples: 0,
    glassResolution: 128,
    reflectiveFloor: false,
    segments: 48,
  },
  low: {
    dpr: [1, 1.2],
    transmission: false,
    contactShadows: false,
    shadowFrames: 1,
    connectors: false,
    labels: false,
    glassSamples: 0,
    glassResolution: 128,
    reflectiveFloor: false,
    segments: 32,
  },
};

/** Scroll length of the pinned section, per breakpoint. */
export const scrollLength = {
  desktop: 320,
  tablet: 300,
  mobile: 260,
} as const;

/** Editorial copy for the experience (merged with Studio `c.perfume3d`). */
export const perfumeStory = {
  collection: { en: "The Signature Collection", ar: "مجموعة التوقيع" },
  productSlug: "vlor-noir",
  name: { en: "VLOR Noir", ar: "VLOR نوار" },
  tagline: {
    en: "Ten precision elements. One unforgettable presence.",
    ar: "عشرة أجزاء دقيقة. حضورٌ واحد لا يُنسى.",
  },
  heroLine: {
    en: "Extrait de parfum · 30% concentration",
    ar: "إكستريه دو بارفان · تركيز ٣٠٪",
  },
  craft: {
    title: { en: "Engineered to be opened.", ar: "مصمّمة لتُفتَح." },
    body: {
      en: "Every VLOR bottle is assembled by hand: heavy hand-blown crystal, a weighted plinth, a hermetic pump and a brass collar machined to a tenth of a millimetre. Scroll to take it apart, or drag to rotate.",
      ar: "كل زجاجة من VLOR تُجمَّع يدوياً: كريستال سميك منفوخ يدوياً، قاعدة موزونة، مضخة محكمة وطوق نحاسي مخرَّط بدقة عُشر المليمتر. مرّر لتفكيكها أو اسحب لتدويرها.",
    },
  },
} as const;
