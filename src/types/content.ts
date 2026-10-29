import type { Localized } from "@/types";

/**
 * Everything on the storefront that the owner can edit from the studio.
 *
 * Each field is optional at the edge (see `mergeContent`) so adding a new key
 * later never breaks a catalogue that was saved by an older build.
 */

export interface HeroStat {
  id: string;
  value: string;
  suffix: string;
  label: Localized;
}

export interface PillarContent {
  id: string;
  title: Localized;
  body: Localized;
}

export interface TestimonialContent {
  id: string;
  quote: Localized;
  name: Localized;
  city: Localized;
  rating: number;
  initials: string;
  accent: string;
}

export interface FaqContent {
  id: string;
  question: Localized;
  answer: Localized;
}

export interface SectionCopy {
  eyebrow: Localized;
  title: Localized;
  lead: Localized;
}

export interface MarqueeContent {
  enabled: boolean;
  /** Pixels per second — identical perceived speed on every screen. */
  speed: number;
  direction: "left" | "right";
  items: Localized[];
  caption: Localized;
}

export interface ThemeContent {
  ink: string;
  bone: string;
  accent: string;
  lilac: string;
  /** Headings, in percent of the designed size (see lib/scale.ts for limits). */
  headingScale: number;
  /** Lead paragraphs, in percent. */
  bodyScale: number;
  /** Vertical rhythm between sections, in percent. */
  sectionSpacing: number;
}

export interface StripSettings {
  enabled: boolean;
  /** Pixels per second — identical perceived speed on every screen. */
  speed: number;
  /** Literal on-screen direction the strip travels. */
  direction: "left" | "right";
}

export interface HeroStripContent extends StripSettings {
  items: Localized[];
}

/** The announcement bar and the hero strip. The notes strip lives in `marquee`. */
export interface StripsContent {
  announcement: StripSettings;
  hero: HeroStripContent;
}

export interface ShopFiltersContent {
  search: boolean;
  family: boolean;
  sort: boolean;
  gender: boolean;
  price: boolean;
  savedOnly: boolean;
}

export interface Perfume3dContent {
  productSlug: string;
  collection: Localized;
  name: Localized;
  tagline: Localized;
  heroLine: Localized;
  craftTitle: Localized;
  craftBody: Localized;
  notes: Localized[];
  finalLine: Localized;
}

export interface BrandContent {
  wordmark: Localized;
  descriptor: Localized;
}

export interface ShopHeroContent {
  /** "compact" is the default; "standard" is the earlier, taller card. */
  size: "compact" | "standard";
  enabled: boolean;
  /** "featured" shows only products flagged as featured in the studio. */
  scope: "all" | "featured";
  /** Maximum number of slides. */
  max: number;
}

export interface SectionToggles {
  marquee: boolean;
  showcase: boolean;
  featured: boolean;
  perfume3d: boolean;
  scentFinder: boolean;
  story: boolean;
  pillars: boolean;
  testimonials: boolean;
  contactCta: boolean;
}

/** Hard cap on the showcase card. Enforced in the editor AND when content is read. */
export const MAX_SHOWCASE_IMAGES = 5;

export interface ShowcaseImage {
  id: string;
  /** Image URL, site path, or a compressed data URL from an upload. */
  src: string;
  /** Optional link: the scent this picture belongs to. */
  productSlug: string;
  /** "contain" suits transparent cut-outs, "cover" suits photographs. */
  fit: "cover" | "contain";
  /** Optional. Empty = use the linked scent's name. */
  caption: Localized;
}

export interface ShowcaseContent {
  eyebrow: Localized;
  title: Localized;
  lead: Localized;
  images: ShowcaseImage[];
}

export interface SiteContent {
  announcements: Localized[];
  hero: {
    eyebrow: Localized;
    titleLine1: Localized;
    titleLine2: Localized;
    lead: Localized;
    primaryCta: Localized;
    secondaryCta: Localized;
    stats: HeroStat[];
  };
  marquee: MarqueeContent;
  showcase: ShowcaseContent;
  featured: SectionCopy;
  finder: SectionCopy;
  story: {
    eyebrow: Localized;
    title: Localized;
    lead: Localized;
    quote: Localized;
    quoteBy: Localized;
  };
  pillars: {
    eyebrow: Localized;
    title: Localized;
    items: PillarContent[];
  };
  testimonials: {
    eyebrow: Localized;
    title: Localized;
    lead: Localized;
    items: TestimonialContent[];
  };
  cta: {
    eyebrow: Localized;
    title: Localized;
    lead: Localized;
  };
  faq: FaqContent[];
  shopHero: ShopHeroContent;
  shopFilters: ShopFiltersContent;
  strips: StripsContent;
  perfume3d: Perfume3dContent;
  brand: BrandContent;
  /**
   * Edits to any piece of site text, keyed by dictionary key ("shop.title") or
   * by "i:" + the English source text for strings written inline in a page.
   * Only differences from the built-in wording are stored.
   */
  textOverrides: Record<string, Localized>;
  theme: ThemeContent;
  sections: SectionToggles;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
