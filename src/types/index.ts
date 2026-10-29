export type Lang = "en" | "ar";

export type Localized = { en: string; ar: string };

export type Category = "fresh" | "floral" | "woody" | "oriental";
export type Gender = "women" | "men" | "unisex";
export type Mood = "fresh" | "warm" | "bold" | "floral";
export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export interface SizeOption {
  ml: number;
  price: number;
}

export interface ScentNotes {
  top: Localized[];
  heart: Localized[];
  base: Localized[];
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  story: Localized;
  price: number;
  compareAt?: number;
  sizes: SizeOption[];
  category: Category;
  gender: Gender;
  moods: Mood[];
  notes: ScentNotes;
  images: string[];
  /**
   * Transparent-background PNG/WebP used by the product card. Falls back to
   * images[0] when absent.
   */
  cutout?: string;
  accent: string;
  featured?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  rating: number;
  reviews: number;
  longevity: string;
  sillage: Localized;
  createdAt: string;
}

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: Localized;
  image: string;
  ml: number;
  price: number;
  qty: number;
}

export interface SiteSettings {
  whatsapp: string;
  messenger: string;
  instagram: string;
  email: string;
  phone: string;
  freeShippingThreshold: number;
  address: Localized;
  hours: Localized;
}

export interface GithubConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface GithubPublishResult {
  bytes?: number;
  commitUrl?: string;
  contentUrl?: string;
  message: string;
}

export type OAuthScope = "public_repo" | "repo";

export interface OAuthSettings {
  clientId: string;
  relayUrl: string;
  scope: OAuthScope;
}

export interface GitHubSession {
  token: string;
  login: string;
  name?: string;
  avatar?: string;
  method: "oauth" | "token";
  scopes?: string;
  connectedAt: string;
}
