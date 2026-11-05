import type { Localized, SiteSettings } from "@/types";

/**
 * Brand source of truth. Change the name here and in src/i18n/translations.ts
 * to rename the whole storefront.
 * VLOR — the house is built around regal, lasting presence.
 */
export const BRAND = {
  name: "VLOR",
  nameAr: "ڨلور",
  wordmark: { en: "VLOR", ar: "ڨلور" } as Localized,
  descriptor: { en: "Maison de parfum", ar: "دار عطور" } as Localized,
  tagline: { en: "Presence, bottled.", ar: "حضورٌ في زجاجة." } as Localized,
  foundingYear: 2021,
  city: { en: "Online", ar: "أونلاين" } as Localized,
} as const;

export const defaultSettings: SiteSettings = {
  whatsapp: "201234567890",
  messenger: "vlor.perfumes",
  instagram: "vlor.perfumes",
  email: "hello@vlor-perfumes.com",
  phone: "+20 123 456 7890",
  freeShippingThreshold: 2000,
  address: {
    en: "Online store · Shipping across Egypt",
    ar: "متجر إلكتروني · شحن لكل محافظات مصر",
  },
  hours: {
    en: "Online · Daily 11:00 – 22:00",
    ar: "أونلاين · يومياً ١١:٠٠ – ٢٢:٠٠",
  },
};

export const atelierStats = {
  hours: 200,
  trials: 214,
  clients: 12400,
  rating: 4.9,
};
