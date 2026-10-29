import type { Localized, SiteSettings } from "@/types";

/**
 * Brand source of truth. Change the name here and in src/i18n/translations.ts
 * to rename the whole storefront.
 * «مليكة» (Malika) = queen — the house is built around regal, lasting presence.
 */
export const BRAND = {
  name: "MALIKA",
  nameAr: "مليكة",
  wordmark: { en: "MALIKA", ar: "مليكة" } as Localized,
  descriptor: { en: "Maison de parfum", ar: "دار عطور" } as Localized,
  tagline: { en: "Presence, bottled.", ar: "حضورٌ في زجاجة." } as Localized,
  foundingYear: 2021,
  city: { en: "Cairo, Egypt", ar: "القاهرة، مصر" } as Localized,
} as const;

export const defaultSettings: SiteSettings = {
  whatsapp: "201234567890",
  messenger: "malika.perfumes",
  instagram: "malika.perfumes",
  email: "hello@malika-perfumes.com",
  phone: "+20 123 456 7890",
  freeShippingThreshold: 2000,
  address: {
    en: "14 Zeinab Khatoun St., Al-Muizz, Cairo",
    ar: "١٤ شارع زينب خاتون، المعز، القاهرة",
  },
  hours: {
    en: "Sat – Thu · 11:00 – 19:00",
    ar: "السبت – الخميس · ١١:٠٠ – ١٩:٠٠",
  },
};

export const atelierStats = {
  hours: 200,
  trials: 214,
  clients: 12400,
  rating: 4.9,
};
