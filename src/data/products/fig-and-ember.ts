import { IMG } from "@/data/images";
import type { Product } from "@/types";

const figAndEmber: Product = {
  id: "fig-and-ember",
  slug: "fig-and-ember",
  name: { en: "Fig & Ember", ar: "تين وجَمر" },
  tagline: { en: "Black fig · Cardamom · Vetiver", ar: "تين أسود · هيل · نجيل الهند" },
  description: {
    en: "Green fig leaf and mandarin over a quiet bed of cedar and vetiver. Soft, skin-close and impossible to over-apply.",
    ar: "ورق تين أخضر ويوسفي فوق قاعدة هادئة من الأرز والنجيل. ناعم، قريب من البشرة، ويستحيل المبالغة في رشّه.",
  },
  story: {
    en: "Inspired by the fig tree in our founder's grandmother's garden in Maadi — fruit warmed by the afternoon, earth still cool underneath. A scent for the hour before sunset.",
    ar: "مستوحى من شجرة التين في حديقة جدة مؤسستنا في المعادي — فاكهة دافئة من بعد الظهر، وتراب لا يزال بارداً تحتها. عطر للساعة التي تسبق الغروب.",
  },
  price: 2150,
  sizes: [
    { ml: 30, price: 1550 },
    { ml: 50, price: 2150 },
    { ml: 100, price: 2950 },
  ],
  category: "woody",
  gender: "unisex",
  moods: ["fresh", "warm"],
  notes: {
    top: [
      { en: "Black fig", ar: "تين أسود" },
      { en: "Green fig leaf", ar: "ورق تين أخضر" },
      { en: "Mandarin", ar: "يوسفي" },
    ],
    heart: [
      { en: "Cardamom", ar: "هيل" },
      { en: "Cedarwood", ar: "خشب الأرز" },
      { en: "Coconut milk", ar: "حليب جوز الهند" },
    ],
    base: [
      { en: "Haitian vetiver", ar: "نجيل هايتي" },
      { en: "Grey amber", ar: "عنبر رمادي" },
      { en: "Moss", ar: "طحالب" },
    ],
  },
  images: [IMG.minimalWhite, IMG.anemone, IMG.glass],
  cutout: "/images/bottles/amber.webp",
  accent: "#B8C98A",
  featured: true,
  isNew: true,
  rating: 4.8,
  reviews: 188,
  longevity: "8–10h",
  sillage: { en: "Intimate, then noticed", ar: "هادئ ثم يُلاحظ" },
  createdAt: "2026-01-08",
};

export default figAndEmber;
