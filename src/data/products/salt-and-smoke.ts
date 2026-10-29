import { IMG } from "@/data/images";
import type { Product } from "@/types";

const saltAndSmoke: Product = {
  id: "salt-and-smoke",
  slug: "salt-and-smoke",
  name: { en: "Salt & Smoke", ar: "ملح ودخان" },
  tagline: { en: "Sea salt · Rosemary · Driftwood", ar: "ملح البحر · إكليل الجبل · خشب البحر" },
  description: {
    en: "An aromatic marine scent with a hidden fire underneath. Salt on the opening, charcoal and driftwood at the close.",
    ar: "عطر بحري عشبي تحته نار خفية. ملح في المقدمة، وفحم وخشب في النهاية.",
  },
  story: {
    en: "Built for a weekend in Ain Sokhna that turned into a bonfire. Sunscreen, salt water and cedar smoke on a jacket — it shouldn't work as well as it does.",
    ar: "صُمم لعطلة في العين السخنة تحولت إلى نار خشب. صن بلوك وماء مالح ورائحة أرز مدخن على جاكيت — لا يجب أن تكون بهذا الجمال، لكنها كذلك.",
  },
  price: 1950,
  sizes: [
    { ml: 30, price: 1450 },
    { ml: 50, price: 1950 },
    { ml: 100, price: 2650 },
  ],
  category: "fresh",
  gender: "unisex",
  moods: ["fresh", "bold"],
  notes: {
    top: [
      { en: "Sea salt", ar: "ملح البحر" },
      { en: "Amalfi lemon", ar: "ليمون أمالفي" },
      { en: "Marine accord", ar: "أكورد بحري" },
    ],
    heart: [
      { en: "Rosemary", ar: "إكليل الجبل" },
      { en: "Clary sage", ar: "مريمية" },
      { en: "Juniper", ar: "عرعر" },
    ],
    base: [
      { en: "Driftwood", ar: "خشب البحر" },
      { en: "Birch tar", ar: "قطران البتولا" },
      { en: "Ambergris", ar: "عنبر" },
    ],
  },
  images: [IMG.blue, IMG.stone, IMG.minimalWhite],
  cutout: "/images/bottles/aqua.webp",
  accent: "#A9CFE0",
  rating: 4.8,
  reviews: 211,
  longevity: "7–9h",
  sillage: { en: "Fresh trail", ar: "أثر منعش" },
  createdAt: "2025-07-19",
};

export default saltAndSmoke;
