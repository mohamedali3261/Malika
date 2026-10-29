import { IMG } from "@/data/images";
import type { Product } from "@/types";

const oudMeridian: Product = {
  id: "oud-meridian",
  slug: "oud-meridian",
  name: { en: "Oud Meridian", ar: "خط العود" },
  tagline: { en: "Saffron · Laotian oud · Tonka", ar: "زعفران · عود لاوسي · تونكا" },
  description: {
    en: "Our richest composition. Saffron and nutmeg over aged oud, softened by tonka and a slow vanilla finish. One spray is a decision.",
    ar: "أغنى تركيباتنا. زعفران وجوزة الطيب فوق عود معتّق، يلطفه التونكا ونهاية فانيليا بطيئة. رشّة واحدة قرار.",
  },
  story: {
    en: "We spent eleven months sourcing this oud. It is smoky rather than animalic, which makes it wearable in Cairo heat. The saffron is there to keep it golden.",
    ar: "أمضينا أحد عشر شهراً في البحث عن هذا العود. دخاني وليس حيوانياً، مما يجعله قابلاً للاستخدام في حر القاهرة. الزعفران موجود ليبقيه ذهبياً.",
  },
  price: 3250,
  compareAt: 3800,
  sizes: [
    { ml: 30, price: 2250 },
    { ml: 50, price: 3250 },
    { ml: 100, price: 4450 },
  ],
  category: "oriental",
  gender: "unisex",
  moods: ["warm", "bold"],
  notes: {
    top: [
      { en: "Saffron", ar: "زعفران" },
      { en: "Nutmeg", ar: "جوزة الطيب" },
      { en: "Bergamot", ar: "برجموت" },
    ],
    heart: [
      { en: "Laotian oud", ar: "عود لاوسي" },
      { en: "Patchouli", ar: "باتشولي" },
      { en: "Rose absolute", ar: "ورد مطلق" },
    ],
    base: [
      { en: "Tonka bean", ar: "حبة التونكا" },
      { en: "Myrrh", ar: "مُر" },
      { en: "Madagascar vanilla", ar: "فانيليا مدغشقر" },
    ],
  },
  images: [IMG.incense, IMG.stone, IMG.grayStones],
  cutout: "/images/bottles/oud.webp",
  accent: "#D8A46B",
  featured: true,
  bestseller: true,
  rating: 5,
  reviews: 508,
  longevity: "12h+",
  sillage: { en: "Room-filling", ar: "يملأ المكان" },
  createdAt: "2024-11-30",
};

export default oudMeridian;
