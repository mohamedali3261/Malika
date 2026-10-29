import { IMG } from "@/data/images";
import type { Product } from "@/types";

const nightJasmine: Product = {
  id: "night-jasmine",
  slug: "night-jasmine",
  name: { en: "Night Jasmine", ar: "ياسمين الليل" },
  tagline: { en: "Blackcurrant · Jasmine sambac · Vanilla", ar: "كشمش أسود · ياسمين سامباك · فانيليا" },
  description: {
    en: "Egyptian jasmine at its most narcotic, lifted by blackcurrant and settled with vanilla and warm wood. An evening with intention.",
    ar: "ياسمين مصري في أقصى جاذبيته، يرفعه الكشمش الأسود ويستقر بالفانيليا والخشب الدافئ. أمسية بنيّة واضحة.",
  },
  story: {
    en: "Our grandparents put jasmine garlands by the window at night. This is that memory, made denser for evening wear and rounded with a drop of vanilla.",
    ar: "كان أجدادنا يضعون قلائد الياسمين بجانب النافذة ليلاً. هذه هي تلك الذكرى، أكثر كثافة لساعات المساء، ومستديرة بقطرة فانيليا.",
  },
  price: 2650,
  sizes: [
    { ml: 30, price: 1850 },
    { ml: 50, price: 2650 },
    { ml: 100, price: 3550 },
  ],
  category: "floral",
  gender: "women",
  moods: ["floral", "bold"],
  notes: {
    top: [
      { en: "Blackcurrant", ar: "كشمش أسود" },
      { en: "Bergamot", ar: "برجموت" },
      { en: "Pink pepper", ar: "فلفل وردي" },
    ],
    heart: [
      { en: "Jasmine sambac", ar: "ياسمين سامباك" },
      { en: "Orange blossom", ar: "زهر البرتقال" },
      { en: "Ylang ylang", ar: "إيلانغ إيلانغ" },
    ],
    base: [
      { en: "Madagascar vanilla", ar: "فانيليا مدغشقر" },
      { en: "Warm woods", ar: "أخشاب دافئة" },
      { en: "Musk", ar: "مسك" },
    ],
  },
  images: [IMG.magazines, IMG.stonesFloral, IMG.magazines],
  cutout: "/images/bottles/lilac.webp",
  accent: "#A9A6E8",
  bestseller: true,
  rating: 4.9,
  reviews: 361,
  longevity: "10h+",
  sillage: { en: "Evening presence", ar: "حضور مسائي" },
  createdAt: "2025-12-01",
};

export default nightJasmine;
