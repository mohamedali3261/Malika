import { IMG } from "@/data/images";
import type { Product } from "@/types";

const citrusArchive: Product = {
  id: "citrus-archive",
  slug: "citrus-archive",
  name: { en: "Citrus Archive", ar: "أرشيف الحمضيات" },
  tagline: { en: "Blood orange · Neroli · White musk", ar: "برتقال أحمر · نيرولي · مسك أبيض" },
  description: {
    en: "The brightest thing we make. Blood orange and yuzu open like a window; green tea and neroli keep it from becoming a dessert.",
    ar: "أكثر ما نصنعه إشراقاً. برتقال أحمر ويوزو يفتحان كنافذة، والشاي الأخضر والنيرولي يمنعانه من أن يصبح حلوى.",
  },
  story: {
    en: "A morning perfume for people who hate morning perfumes. We removed the sugar and kept the peel — bitter, clean, awake.",
    ar: "عطر صباحي لمن يكرهون عطور الصباح. أزلنا السكر واحتفظنا بالقشر — مُرّ، نظيف، مستيقظ.",
  },
  price: 1750,
  sizes: [
    { ml: 30, price: 1250 },
    { ml: 50, price: 1750 },
    { ml: 100, price: 2350 },
  ],
  category: "fresh",
  gender: "unisex",
  moods: ["fresh"],
  notes: {
    top: [
      { en: "Blood orange", ar: "برتقال أحمر" },
      { en: "Yuzu", ar: "يوزو" },
      { en: "Grapefruit peel", ar: "قشر جريب فروت" },
    ],
    heart: [
      { en: "Neroli", ar: "نيرولي" },
      { en: "Green tea", ar: "شاي أخضر" },
      { en: "Petitgrain", ar: "بيتيجرين" },
    ],
    base: [
      { en: "White musk", ar: "مسك أبيض" },
      { en: "Cedar", ar: "أرز" },
      { en: "Ambrette seed", ar: "بذور الأمبريت" },
    ],
  },
  images: [IMG.minimalWhite, IMG.shell, IMG.blue],
  cutout: "/images/bottles/aqua.webp",
  accent: "#E4F06A",
  isNew: true,
  rating: 4.7,
  reviews: 143,
  longevity: "6–8h",
  sillage: { en: "Bright and light", ar: "مشرق وخفيف" },
  createdAt: "2026-03-01",
};

export default citrusArchive;
