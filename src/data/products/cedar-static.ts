import { IMG } from "@/data/images";
import type { Product } from "@/types";

const cedarStatic: Product = {
  id: "cedar-static",
  slug: "cedar-static",
  name: { en: "Cedar Static", ar: "أرز ساكن" },
  tagline: { en: "Grapefruit · Cade · Ambergris", ar: "جريب فروت · كاد · عنبر" },
  description: {
    en: "Cold grapefruit and juniper crackle over dry cedar and vetiver. Clean without smelling like soap, sharp without being loud.",
    ar: "جريب فروت بارد وعرعر فوق أرز جاف ونجيل. نظيف دون أن يبدو كالصابون، وحدّي دون ضجيج.",
  },
  story: {
    en: "Named after the static before a thunderstorm in the mountains — the air feels charged and metallic. We replicated it with grapefruit peel, cade oil and a thread of ambergris.",
    ar: "سُمّي على اسم الشحنة الكهربائية قبل عاصفة رعدية في الجبال — هواء مشحون ومعدني. أعدنا إنتاجه بقشر الجريب فروت وزيت الكاد وخيط من العنبر.",
  },
  price: 2300,
  sizes: [
    { ml: 30, price: 1650 },
    { ml: 50, price: 2300 },
    { ml: 100, price: 3150 },
  ],
  category: "woody",
  gender: "men",
  moods: ["bold", "fresh"],
  notes: {
    top: [
      { en: "Pink grapefruit", ar: "جريب فروت وردي" },
      { en: "Juniper berry", ar: "حب العرعر" },
      { en: "Petitgrain", ar: "بيتيجرين" },
    ],
    heart: [
      { en: "Cypress", ar: "سرو" },
      { en: "Cade oil", ar: "زيت الكاد" },
      { en: "Black tea", ar: "شاي أسود" },
    ],
    base: [
      { en: "Atlas cedar", ar: "أرز أطلسي" },
      { en: "Ambergris", ar: "عنبر" },
      { en: "Vetiver root", ar: "جذور النجيل" },
    ],
  },
  images: [IMG.shadow, IMG.grayStones, IMG.minimalWhite],
  cutout: "/images/bottles/forest.webp",
  accent: "#9FC7B9",
  featured: true,
  rating: 4.8,
  reviews: 274,
  longevity: "8–10h",
  sillage: { en: "Crisp and present", ar: "نقي وحاضر" },
  createdAt: "2025-09-02",
};

export default cedarStatic;
