import { IMG } from "@/data/images";
import type { Product } from "@/types";

const amberHours: Product = {
  id: "amber-hours",
  slug: "amber-hours",
  name: { en: "Amber Hours", ar: "ساعات العنبر" },
  tagline: { en: "Plum · Labdanum · Benzoin", ar: "برقوق · لبدانوم · بنزوين" },
  description: {
    en: "A golden, resinous amber that smells like a room with a fireplace and a good record on. Warm without sugar.",
    ar: "عنبر ذهبي راتنجي، رائحته كغرفة فيها مدفأة وأسطوانة جيدة. دافئ دون سكر.",
  },
  story: {
    en: "We wanted the feeling of staying in when everyone else goes out. Plum and cardamom open it; labdanum and benzoin hold the door shut.",
    ar: "أردنا إحساس البقاء في البيت حين يخرج الجميع. البرقوق والهيل يفتحانه، واللبدانوم والبنزوين يغلقان الباب.",
  },
  price: 2550,
  sizes: [
    { ml: 30, price: 1800 },
    { ml: 50, price: 2550 },
    { ml: 100, price: 3450 },
  ],
  category: "oriental",
  gender: "unisex",
  moods: ["warm"],
  notes: {
    top: [
      { en: "Plum", ar: "برقوق" },
      { en: "Green cardamom", ar: "هيل أخضر" },
      { en: "Pink pepper", ar: "فلفل وردي" },
    ],
    heart: [
      { en: "Labdanum", ar: "لبدانوم" },
      { en: "Cistus", ar: "قسطوس" },
      { en: "Immortelle", ar: "خلود" },
    ],
    base: [
      { en: "Benzoin", ar: "بنزوين" },
      { en: "Sandalwood", ar: "خشب الصندل" },
      { en: "Bourbon vanilla", ar: "فانيليا بوربون" },
    ],
  },
  images: [IMG.stoneRed, IMG.wood, IMG.anemone],
  cutout: "/images/bottles/amber.webp",
  accent: "#E4A66B",
  rating: 4.9,
  reviews: 289,
  longevity: "9–11h",
  sillage: { en: "Warm aura", ar: "هالة دافئة" },
  createdAt: "2025-10-10",
};

export default amberHours;
