import type { Category, Gender, Mood, Product } from "@/types";
import malikaNoir from "./malika-noir";
import figAndEmber from "./fig-and-ember";
import velvetDusk from "./velvet-dusk";
import cedarStatic from "./cedar-static";
import irisMirage from "./iris-mirage";
import saltAndSmoke from "./salt-and-smoke";
import oudMeridian from "./oud-meridian";
import citrusArchive from "./citrus-archive";
import bloomLedger from "./bloom-ledger";
import amberHours from "./amber-hours";
import muskElsewhere from "./musk-elsewhere";
import nightJasmine from "./night-jasmine";

/** Every scent lives in its own file — add a file, import it, add it here. */
export const baseProducts: Product[] = [
  malikaNoir,
  figAndEmber,
  velvetDusk,
  cedarStatic,
  irisMirage,
  saltAndSmoke,
  oudMeridian,
  citrusArchive,
  bloomLedger,
  amberHours,
  muskElsewhere,
  nightJasmine,
];

export const categories: Category[] = ["fresh", "floral", "woody", "oriental"];
export const genders: Gender[] = ["women", "men", "unisex"];
export const moods: Mood[] = ["fresh", "warm", "bold", "floral"];

export const categoryLabel = {
  fresh: { en: "shop.fresh", ar: "shop.fresh" },
  floral: { en: "shop.floral", ar: "shop.floral" },
  woody: { en: "shop.woody", ar: "shop.woody" },
  oriental: { en: "shop.oriental", ar: "shop.oriental" },
} as const;

export function getProductBySlug(products: Product[], slug: string): Product | undefined {
  return products.find((product) => product.slug === slug || product.id === slug);
}

export function findRelated(products: Product[], product: Product, count = 3): Product[] {
  const scored = products
    .filter((item) => item.id !== product.id)
    .map((item) => {
      let score = 0;
      if (item.category === product.category) score += 3;
      if (item.gender === product.gender) score += 1;
      score += item.moods.filter((mood) => product.moods.includes(mood)).length * 2;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating);
  return scored.slice(0, count).map((entry) => entry.item);
}

export function productPriceRange(product: Product): { min: number; max: number } {
  const prices = product.sizes.map((size) => size.price);
  return { min: Math.min(product.price, ...prices), max: Math.max(product.price, ...prices) };
}
