import { IMG } from "@/data/images";
import type { Product } from "@/types";

const velvetDusk: Product = {
  id: "velvet-dusk",
  slug: "velvet-dusk",
  name: { en: "Velvet Dusk", ar: "غسق مخملي" },
  tagline: { en: "Peony · Orris · Vanilla absolute", ar: "بيوني · سوسن · فانيليا مطلقة" },
  description: {
    en: "A floral chypre with a raspberry opening and a sandalwood finish. Sophisticated enough for the evening, relaxed enough for lunch.",
    ar: "شيبري زهري بمقدمة توت العليق ونهاية من خشب الصندل. راقٍ للمساء، ومريح بما يكفي للغداء.",
  },
  story: {
    en: "The pink of the sky ten minutes after the sun disappears. We chased that colour with orris butter — one of the most expensive materials we use — and let it unfold slowly.",
    ar: "لون السماء الوردي بعد اختفاء الشمس بعشر دقائق. طاردنا ذلك اللون بزبدة السوسن — أغلى المواد التي نستخدمها — وتركناه يتكشف ببطء.",
  },
  price: 2450,
  sizes: [
    { ml: 30, price: 1750 },
    { ml: 50, price: 2450 },
    { ml: 100, price: 3350 },
  ],
  category: "floral",
  gender: "women",
  moods: ["floral", "warm"],
  notes: {
    top: [
      { en: "Raspberry", ar: "توت العليق" },
      { en: "Peony", ar: "بيوني" },
      { en: "Pink pepper", ar: "فلفل وردي" },
    ],
    heart: [
      { en: "Orris butter", ar: "زبدة السوسن" },
      { en: "Rose de Mai", ar: "وردة مايو" },
      { en: "Jasmine", ar: "ياسمين" },
    ],
    base: [
      { en: "Vanilla absolute", ar: "فانيليا مطلقة" },
      { en: "Sandalwood", ar: "خشب الصندل" },
      { en: "White musk", ar: "مسك أبيض" },
    ],
  },
  images: [IMG.anemone, IMG.stonesFloral, IMG.bottleEditorial],
  cutout: "/images/bottles/rose.webp",
  accent: "#D9B8E8",
  featured: true,
  bestseller: true,
  rating: 4.9,
  reviews: 326,
  longevity: "9–11h",
  sillage: { en: "Softly generous", ar: "حضور ناعم" },
  createdAt: "2025-06-21",
};

export default velvetDusk;
