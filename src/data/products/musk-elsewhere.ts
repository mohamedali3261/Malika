import { IMG } from "@/data/images";
import type { Product } from "@/types";

const muskElsewhere: Product = {
  id: "musk-elsewhere",
  slug: "musk-elsewhere",
  name: { en: "Musk Elsewhere", ar: "مسك في مكان آخر" },
  tagline: { en: "Pear · Orange blossom · Cashmeran", ar: "كمثرى · زهر البرتقال · كشميران" },
  description: {
    en: "The scent of clean laundry on someone else's shoulder. Airy musk, orange blossom and just enough cashmeran to feel like skin.",
    ar: "رائحة غسيل نظيف على كتف شخص آخر. مسك هوائي وزهر برتقال وقليل من الكشميران ليشبه البشرة.",
  },
  story: {
    en: "Our most-gifted bottle, because it suits everyone. Designed for layering — it makes other scents feel more like yours.",
    ar: "أكثر زجاجة تُهدى، لأنها تناسب الجميع. صُممت للدمج — تجعل العطور الأخرى تبدو أكثر لك.",
  },
  price: 1850,
  sizes: [
    { ml: 30, price: 1350 },
    { ml: 50, price: 1850 },
    { ml: 100, price: 2450 },
  ],
  category: "fresh",
  gender: "unisex",
  moods: ["fresh", "warm"],
  notes: {
    top: [
      { en: "Pear", ar: "كمثرى" },
      { en: "Aldehydes", ar: "ألدهيدات" },
      { en: "Bergamot", ar: "برجموت" },
    ],
    heart: [
      { en: "Orange blossom", ar: "زهر البرتقال" },
      { en: "Iris", ar: "سوسن" },
      { en: "Lily of the valley", ar: "زنبق الوادي" },
    ],
    base: [
      { en: "Cashmeran", ar: "كشميران" },
      { en: "White musk", ar: "مسك أبيض" },
      { en: "Blond wood", ar: "خشب فاتح" },
    ],
  },
  images: [IMG.glass, IMG.minimalWhite, IMG.shell],
  cutout: "/images/bottles/lilac.webp",
  accent: "#D9D2E8",
  rating: 4.8,
  reviews: 238,
  longevity: "6–8h",
  sillage: { en: "Skin-close", ar: "قريب من البشرة" },
  createdAt: "2025-05-05",
};

export default muskElsewhere;
