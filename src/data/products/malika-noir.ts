import { IMG } from "@/data/images";
import type { Product } from "@/types";

const malikaNoir: Product = {
  id: "malika-noir",
  slug: "malika-noir",
  name: { en: "Malika Noir", ar: "مليكة نوار" },
  tagline: { en: "Incense · Oud · Smoked leather", ar: "بخور · عود · جلد مدخن" },
  description: {
    en: "A midnight extrait built around incense smoke, black pepper and a warm leather base. The one people ask about before they say hello.",
    ar: "إكستريه منتصف الليل، حوله دخان البخور والفلفل الأسود وقاعدة جلدية دافئة. العطر الذي يسألون عنه قبل أن يقولوا مرحباً.",
  },
  story: {
    en: "Our first composition and still our most requested. Yara built it for a Cairo rooftop in December — cool air, warm company, charcoal in the corner. Ninety-one trials before the balance was right.",
    ar: "أول تركيبة لنا وما زالت الأكثر طلباً. صممته يارا لسطح مبنى في القاهرة في ديسمبر — هواء بارد، صحبة دافئة، وفحم في الزاوية. إحدى وتسعون محاولة قبل أن يصبح التوازن صحيحاً.",
  },
  price: 2650,
  compareAt: 3100,
  sizes: [
    { ml: 30, price: 1850 },
    { ml: 50, price: 2650 },
    { ml: 100, price: 3750 },
  ],
  category: "woody",
  gender: "unisex",
  moods: ["bold", "warm"],
  notes: {
    top: [
      { en: "Black pepper", ar: "فلفل أسود" },
      { en: "Sicilian bergamot", ar: "برجموت صقلي" },
      { en: "Clove", ar: "قرنفل" },
    ],
    heart: [
      { en: "Frankincense", ar: "لبان" },
      { en: "Smoked cedar", ar: "أرز مدخن" },
      { en: "Elemi resin", ar: "راتنج إيلمي" },
    ],
    base: [
      { en: "Laotian oud", ar: "عود لاوسي" },
      { en: "Leather", ar: "جلد" },
      { en: "Grey amber", ar: "عنبر رمادي" },
    ],
  },
  images: [IMG.incense, IMG.anemone, IMG.shadow],
  cutout: "/images/bottles/dark.webp",
  accent: "#DDF25C",
  featured: true,
  bestseller: true,
  rating: 4.9,
  reviews: 412,
  longevity: "10–12h",
  sillage: { en: "Strong presence", ar: "حضور قوي" },
  createdAt: "2025-01-12",
};

export default malikaNoir;
