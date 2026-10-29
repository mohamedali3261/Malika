import catalog from "@/data/products/catalog.json";
import type { Product, SiteSettings } from "@/types";
import type { DeepPartial, SiteContent } from "@/types/content";

/**
 * The product studio publishes a catalogue JSON into this exact file through the
 * GitHub API. On the next deployment the storefront merges these products with
 * the hand-written ones in src/data/products/*.ts.
 */
interface PublishedCatalogue {
  generatedAt?: string | null;
  settings?: SiteSettings | null;
  content?: DeepPartial<SiteContent> | null;
  products?: Product[];
}

const data = catalog as PublishedCatalogue;

function isProduct(value: unknown): value is Product {
  const product = value as Product;
  return Boolean(product && product.slug && product.name?.en && Array.isArray(product.sizes));
}

export const publishedProducts: Product[] = Array.isArray(data.products)
  ? data.products.filter(isProduct)
  : [];

/** Changes whenever the studio publishes, so fresh deployments replace stale local edits. */
export const publishedAt: string = typeof data.generatedAt === "string" ? data.generatedAt : "";

export const publishedSettings: SiteSettings | null =
  data.settings && typeof data.settings === "object" && "whatsapp" in data.settings
    ? (data.settings as SiteSettings)
    : null;

export function mergeCatalogue(base: Product[]): Product[] {
  // Once the studio has published, the committed catalogue is the source of
  // truth (so deletions and edits survive the redeploy). Otherwise use the
  // hand-written product files.
  return publishedProducts.length > 0 ? publishedProducts : base;
}

/**
 * Site content (copy, strip, image card, theme) published from the studio.
 * Without this, edits would exist only in the owner's own browser.
 */
export const publishedContent: DeepPartial<SiteContent> | null =
  data.content && typeof data.content === "object" ? data.content : null;
