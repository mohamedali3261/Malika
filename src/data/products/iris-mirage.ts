import { IMG } from "@/data/images";
import type { Product } from "@/types";

const irisMirage: Product = {
  id: "iris-mirage",
  slug: "iris-mirage",
  name: { en: "Iris Mirage", ar: "سراب السوسن" },
  tagline: { en: "Iris root · Violet · Cashmere wood", ar: "جذور السوسن · بنفسج · خشب الكشمير" },
  description: {
    en: "Powdery, cool and almost transparent at first — then a warm, skin-like musk appears. The quietest scent in the collection.",
    ar: "بودري وبارد وشبه شفاف في البداية — ثم يظهر مسك دافئ يشبه البشرة. أهدأ عطر في المجموعة.",
  },
  story: {
    en: "Iris takes six years to mature. We waited, and the result is a scent that behaves like light on water — never quite where you thought it was.",
    ar: "يحتاج السوسن ست سنوات ليصل إلى نضجه. انتظرنا، والنتيجة عطر يتصرف كالضوء على الماء — لا يكون أبداً حيث ظننت.",
  },
  price: 2850,
  sizes: [
    { ml: 30, price: 2050 },
    { ml: 50, price: 2850 },
    { ml: 100, price: 3950 },
  ],
  category: "floral",
  gender: "unisex",
  moods: ["floral"],
  notes: {
    top: [
      { en: "Bergamot", ar: "برجموت" },
      { en: "Peach skin", ar: "قشرة خوخ" },
      { en: "Aldehydes", ar: "ألدهيدات" },
    ],
    heart: [
      { en: "Iris root", ar: "جذور السوسن" },
      { en: "Violet", ar: "بنفسج" },
      { en: "Carrot seed", ar: "بذور الجزر" },
    ],
    base: [
      { en: "Cashmere wood", ar: "خشب الكشمير" },
      { en: "Clean musk", ar: "مسك نظيف" },
      { en: "Ambrette", ar: "أمبريت" },
    ],
  },
  images: [IMG.glass, IMG.shell, IMG.stoneRed],
  cutout: "/images/bottles/lilac.webp",
  accent: "#C9B5F7",
  featured: true,
  isNew: true,
  rating: 4.7,
  reviews: 96,
  longevity: "7–9h",
  sillage: { en: "Whispered", ar: "كهمسة" },
  createdAt: "2026-02-14",
};

export default irisMirage;
