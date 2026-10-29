import { IMG } from "@/data/images";
import type { Product } from "@/types";

const bloomLedger: Product = {
  id: "bloom-ledger",
  slug: "bloom-ledger",
  name: { en: "Bloom Ledger", ar: "دفتر الإزهار" },
  tagline: { en: "Pear · Tuberose · Cedar", ar: "كمثرى · توبروز · أرز" },
  description: {
    en: "A full white-floral bouquet with a crisp pear opening. Generous and romantic, yet grounded by cedar so it never floats away.",
    ar: "باقة زهور بيضاء كاملة بمقدمة كمثرى منعشة. كريمة ورومانسية، لكنها مثبتة بالأرز حتى لا تطفو بعيداً.",
  },
  story: {
    en: "Tuberose is loud by nature. We spent a summer learning how to let it speak at a conversational volume — with freesia, jasmine and a clean woody spine.",
    ar: "التوبروز بطبيعته صاخب. قضينا صيفاً نتعلم كيف نجعله يتحدث بصوت هادئ — مع الفريزيا والياسمين وعمود خشبي نظيف.",
  },
  price: 2250,
  sizes: [
    { ml: 30, price: 1600 },
    { ml: 50, price: 2250 },
    { ml: 100, price: 3050 },
  ],
  category: "floral",
  gender: "women",
  moods: ["floral"],
  notes: {
    top: [
      { en: "Pear", ar: "كمثرى" },
      { en: "Freesia", ar: "فريزيا" },
      { en: "Green mandarin", ar: "يوسفي أخضر" },
    ],
    heart: [
      { en: "Tuberose", ar: "توبروز" },
      { en: "Egyptian jasmine", ar: "ياسمين مصري" },
      { en: "Gardenia", ar: "جاردينيا" },
    ],
    base: [
      { en: "Cedar", ar: "أرز" },
      { en: "White musk", ar: "مسك أبيض" },
      { en: "Soft amber", ar: "عنبر ناعم" },
    ],
  },
  images: [IMG.magazines, IMG.stonesFloral, IMG.anemone],
  cutout: "/images/bottles/rose.webp",
  accent: "#F0AEC9",
  rating: 4.8,
  reviews: 197,
  longevity: "8–10h",
  sillage: { en: "Romantic trail", ar: "أثر رومانسي" },
  createdAt: "2025-03-24",
};

export default bloomLedger;
