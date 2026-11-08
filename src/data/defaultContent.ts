import { clampScale } from "@/lib/scale";
import { isValidTextId } from "@/i18n/textCatalog";
import { MAX_SHOWCASE_IMAGES, type DeepPartial, type SiteContent } from "@/types/content";

/** Factory so every consumer gets its own mutable copy. */
export function createDefaultContent(): SiteContent {
  return {
    announcements: [
      { en: "Complimentary delivery on orders over EGP 2,000", ar: "توصيل مجاني للطلبات فوق ٢٠٠٠ ج.م" },
    ],

    hero: {
      eyebrow: { en: "Independent perfume house · Est. 2021", ar: "دار عطور مستقلة · تأسست ٢٠٢١" },
      titleLine1: { en: "Arrive like", ar: "حضورٌ" },
      titleLine2: { en: "royalty.", ar: "ملكي." },
      lead: {
        en: "Extraits composed for people who are remembered before they speak. Blended slowly, in small batches — made with care.",
        ar: "عطور تُركَّب لمن يُذكَرون قبل أن يتكلّموا. تُمزج ببطء، بكميات صغيرة — صُنعت بعناية.",
      },
      primaryCta: { en: "Discover the collection", ar: "اكتشف المجموعة" },
      secondaryCta: { en: "Contact us", ar: "تواصل معنا" },
      stats: [
        { id: "rating", value: "4.9", suffix: "/5", label: { en: "rated by clients", ar: "تقييم عملائنا" } },
        { id: "scents", value: "12", suffix: "", label: { en: "signature scents", ar: "عطراً بتوقيعنا" } },
        { id: "delivery", value: "48", suffix: "h", label: { en: "hours to your door", ar: "ساعة حتى بابك" } },
      ],
    },

    showcase: {
      eyebrow: { en: "Curated editions", ar: "إصدارات مختارة" },
      title: { en: "Icons of VLOR.", ar: "أيقوناتُ ڨلور." },
      lead: {
        en: "Swipe through our defining extraits — each flacon carries its own chapter.",
        ar: "تجوّل بين أبرز عطور الدار — كل زجاجة تروي فصلاً خاصاً.",
      },
      images: [
        { id: "s1", src: "/images/bottles/dark.webp", productSlug: "vlor-noir", fit: "contain", caption: { en: "", ar: "" } },
        { id: "s2", src: "/images/bottles/amber.webp", productSlug: "fig-and-ember", fit: "contain", caption: { en: "", ar: "" } },
        { id: "s3", src: "/images/bottles/rose.webp", productSlug: "velvet-dusk", fit: "contain", caption: { en: "", ar: "" } },
        { id: "s4", src: "/images/bottles/lilac.webp", productSlug: "iris-mirage", fit: "contain", caption: { en: "", ar: "" } },
        { id: "s5", src: "/images/bottles/oud.webp", productSlug: "oud-meridian", fit: "contain", caption: { en: "", ar: "" } },
      ],
    },

    featured: {
      eyebrow: { en: "The signature edit", ar: "مختارات التوقيع" },
      title: { en: "Scents that stay in the room.", ar: "عطورٌ تبقى بعد أن تغادر." },
      lead: {
        en: "Six compositions we return to again and again. Find the one that feels like you — or like the version of you you're becoming.",
        ar: "ست تركيبات نعود إليها دائماً. اختر ما يشبهك — أو ما يشبه النسخة التي تصبح عليها.",
      },
    },

    story: {
      eyebrow: { en: "The house of VLOR", ar: "دار ڨلور" },
      title: { en: "Built slowly. Worn quietly.", ar: "يُصنع ببطء. ويُلبَس بهدوء." },
      lead: {
        en: "VLOR began with one question: why do some scents vanish while others become part of your memory? We spent two years, 214 trials and many quiet nights looking for the answer.",
        ar: "بدأت ڨلور بسؤال واحد: لماذا تختفي بعض العطور بينما تصبح أخرى جزءاً من ذاكرتك؟ قضينا عامين و٢١٤ محاولة وكثيراً من الليالي الهادئة بحثاً عن الإجابة.",
      },
      quote: {
        en: "A perfume should not announce you. It should make people lean in.",
        ar: "العطر لا يُعلن عنكِ، بل يجعل الناس يقتربون.",
      },
      quoteBy: { en: "Yara Selim · Founder & perfumer", ar: "يارا سليم · المؤسسة والعطّارة" },
    },

    pillars: {
      eyebrow: { en: "The difference", ar: "الفرق" },
      title: { en: "Three promises in every bottle.", ar: "ثلاثة وعود في كل زجاجة." },
      items: [
        {
          id: "batch",
          title: { en: "Small batch, always", ar: "كميات صغيرة دائماً" },
          body: {
            en: "We blend 40 litres at a time. Enough to care about every bottle, never enough to cut a corner.",
            ar: "نركّب ٤٠ لتراً في المرة. كفاية للاهتمام بكل زجاجة، وليست كفاية للتفريط في الجودة.",
          },
        },
        {
          id: "skin",
          title: { en: "Skin-first chemistry", ar: "كيمياء تبدأ من البشرة" },
          body: {
            en: "Dermatologically tested, alcohol-balanced and free from dyes. Long wear without the headache.",
            ar: "مختبر جلدياً، متوازن الكحول، وخالٍ من الصبغات. ثبات طويل دون صداع.",
          },
        },
        {
          id: "refill",
          title: { en: "Refill, don't replace", ar: "أعد التعبئة، لا تستبدل" },
          body: {
            en: "Keep the heavy glass. Order a refill for 25% less and we'll plant a tree in your name.",
            ar: "احتفظ بالزجاجة الثقيلة. اطلب إعادة تعبئة بخصم ٢٥٪ وسنزرع شجرة باسمك.",
          },
        },
      ],
    },

    testimonials: {
      eyebrow: { en: "Worn & loved", ar: "مُجرَّب ومحبوب" },
      title: { en: "The trail people leave.", ar: "الأثر الذي يتركونه خلفهم." },
      lead: {
        en: "4.9/5 from 1,842 verified reviews. These are a few of our favourites.",
        ar: "٤٫٩/٥ من ١٨٤٢ تقييماً موثقاً. هذه بعض المفضلة لدينا.",
      },
      items: [
        {
          id: "nour",
          quote: {
            en: "I wore VLOR Noir to a wedding and three people followed me to the parking lot to ask what it was. It's the first perfume I've finished a full bottle of.",
            ar: "لبست ڨلور نوار في فرح، فتبعني ثلاثة أشخاص إلى الجراج يسألون عن العطر. أول برفان أُكمل زجاجته كاملة.",
          },
          name: { en: "Nour El-Sayed", ar: "نور السيد" },
          city: { en: "New Cairo", ar: "القاهرة الجديدة" },
          rating: 5,
          initials: "NS",
          accent: "#B89A62",
        },
        {
          id: "omar",
          quote: {
            en: "I ordered on WhatsApp at midnight expecting silence. Yara replied in nine minutes, described three scents, and sent samples. The service alone earned my loyalty.",
            ar: "طلبت على واتساب بعد منتصف الليل ولم أتوقع رداً. ردّت يارا في تسع دقائق، ووصفت لي ثلاثة عطور، وأرسلت عينات. الخدمة وحدها كسبت ولائي.",
          },
          name: { en: "Omar Khalil", ar: "عمر خليل" },
          city: { en: "Alexandria", ar: "الإسكندرية" },
          rating: 5,
          initials: "OK",
          accent: "#C9B5F7",
        },
        {
          id: "salma",
          quote: {
            en: "Fig & Ember is the only thing that survived a 12-hour hospital shift. Subtle by hour ten, but still there on my scarf the next morning.",
            ar: "تين وجمر هو الوحيد الذي صمد معي في شيفت ١٢ ساعة. هادئ بعد عشر ساعات، لكنه ما زال على الشال صباح اليوم التالي.",
          },
          name: { en: "Salma Fathy", ar: "سلمى فتحي" },
          city: { en: "Giza", ar: "الجيزة" },
          rating: 5,
          initials: "SF",
          accent: "#B8D48A",
        },
      ],
    },

    cta: {
      eyebrow: { en: "Your scent, thoughtfully chosen", ar: "عطرك، نختاره معك" },
      title: { en: "Discover the scent that feels like you.", ar: "اكتشف عطراً يشبهك." },
      lead: {
        en: "Tell us which notes you love, and our team will guide you to a composition that feels unmistakably yours.",
        ar: "أخبرنا بالنفحات التي تفضّلها، وسنرشدك إلى تركيبة تعبّر عنك بكل عناية.",
      },
    },

    faq: [
      {
        id: "order",
        question: { en: "How do I order?", ar: "كيف أطلب؟" },
        answer: {
          en: "Choose your scent and size, then tap Order on WhatsApp. We confirm availability and delivery in minutes. You can also DM us on Messenger.",
          ar: "اختر عطرك وحجمه، ثم اضغط اطلب على واتساب. نؤكد التوفر والتوصيل في دقائق. يمكنك أيضاً مراسلتنا على ماسنجر.",
        },
      },
      {
        id: "delivery",
        question: { en: "How long does delivery take?", ar: "كم يستغرق التوصيل؟" },
        answer: {
          en: "Cairo and Giza: 1–2 working days. Other governorates: 2–4 working days. Orders above EGP 2,000 ship free.",
          ar: "القاهرة والجيزة: ١–٢ يوم عمل. المحافظات الأخرى: ٢–٤ أيام عمل. الطلبات فوق ٢٠٠٠ ج.م توصيلها مجاني.",
        },
      },
      {
        id: "samples",
        question: { en: "Can I try before buying?", ar: "هل يمكنني التجربة قبل الشراء؟" },
        answer: {
          en: "Yes. Order a discovery set of five 2ml samples for EGP 350, and we'll deduct it from your first full bottle.",
          ar: "نعم. اطلب طقم اكتشاف من خمس عينات ٢ مل بـ٣٥٠ ج.م، وسنخصم قيمته من أول زجاجة كاملة.",
        },
      },
      {
        id: "bespoke",
        question: { en: "Do you make custom scents?", ar: "هل تصنعون عطوراً مخصصة؟" },
        answer: {
          en: "We do — for weddings, hotels and brands. A bespoke composition starts at EGP 12,000 and takes 4–6 weeks.",
          ar: "نعم — للأعراس والفنادق والعلامات التجارية. التركيبة المخصصة تبدأ من ١٢٠٠٠ ج.م وتستغرق ٤–٦ أسابيع.",
        },
      },
    ],

    shopFilters: {
      search: true,
      family: true,
      sort: true,
      gender: true,
      price: false,
      savedOnly: true,
    },

    strips: {
      announcement: { enabled: true, speed: 44, direction: "left" },
    },

    brand: {
      wordmark: { en: "VLOR", ar: "ڨلور" },
      descriptor: { en: "Maison de parfum", ar: "دار عطور" },
    },

    textOverrides: {},

    theme: {
      ink: "#141019",
      bone: "#f3efe7",
      accent: "#B89A62",
      lilac: "#c9b5f7",
      headingScale: 100,
      bodyScale: 100,
      sectionSpacing: 100,
    },

    shopHero: {
      size: "compact",
      enabled: true,
      scope: "all",
      max: 8,
    },

    sections: {
      runwayLookbook: true,
      showcase: true,
      featured: true,
      story: true,
      pillars: false,
      testimonials: false,
      contactCta: true,
    },
  };
}

export const defaultContent: SiteContent = createDefaultContent();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merge a stored (possibly older, possibly partial) content object onto the
 * current defaults. Arrays are replaced wholesale — the owner's list is the
 * source of truth — while objects are merged key by key so new fields added in
 * a later release appear automatically.
 */
export function mergeContent(stored: DeepPartial<SiteContent> | null | undefined): SiteContent {
  const base = createDefaultContent();
  if (!stored) return base;

  const merge = (target: unknown, patch: unknown): unknown => {
    if (Array.isArray(patch)) return patch;
    if (isPlainObject(target) && isPlainObject(patch)) {
      const result: Record<string, unknown> = { ...target };
      for (const key of Object.keys(patch)) {
        result[key] = key in target ? merge(target[key], patch[key]) : patch[key];
      }
      return result;
    }
    return patch === undefined ? target : patch;
  };

  const merged = merge(base, stored) as unknown as Record<string, unknown>;

  // Keep only keys this build knows about. Removed fields saved by older
  // versions are discarded instead of lingering in storage or published data.
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(base)) clean[key] = merged[key];

  const sections: Record<string, unknown> = {};
  const baseSections = base.sections as unknown as Record<string, unknown>;
  const mergedSections = (merged.sections ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(baseSections)) sections[key] = mergedSections[key] ?? baseSections[key];
  clean.sections = sections;

  const result = clean as unknown as SiteContent;
  // The cap holds even for hand-edited or imported data.
  // Also upgrade untouched legacy default wording stored in older localStorage snapshots.
  const replaceLegacyBrand = (val?: { en?: string; ar?: string }) =>
    val
      ? {
          en: (val.en ?? "").replace(/MALIKA/g, "VLOR").replace(/Malika/g, "VLOR"),
          ar: (val.ar ?? "").replace(/مليكة/g, "ڨلور"),
        }
      : val;

  if (result.brand?.wordmark) {
    const enMark = result.brand.wordmark.en?.trim();
    const arMark = result.brand.wordmark.ar?.trim();
    if (!enMark || enMark.toUpperCase() === "MALIKA" || arMark === "مليكة") {
      result.brand = { ...result.brand, wordmark: base.brand.wordmark };
    }
  }

  const legacyShowcaseTitle =
    result.showcase?.title?.ar === "خمس زجاجات. دارٌ واحدة." ||
    result.showcase?.title?.en === "Five bottles. One house." ||
    result.showcase?.title?.ar === "أيقوناتُ مليكة." ||
    result.showcase?.title?.en === "Icons of Malika.";
  const legacyShowcaseEyebrow =
    result.showcase?.eyebrow?.ar === "التشكيلة" && result.showcase?.eyebrow?.en === "The lineup";
  const legacyShowcaseLead =
    result.showcase?.lead?.ar === "تصفّح الزجاجات التي تُعرّف الدار — وكل واحدة تفتح حكايتها.";

  result.showcase = {
    ...result.showcase,
    eyebrow: legacyShowcaseEyebrow ? base.showcase.eyebrow : result.showcase.eyebrow,
    title: legacyShowcaseTitle ? base.showcase.title : (replaceLegacyBrand(result.showcase.title) as typeof base.showcase.title),
    lead: legacyShowcaseLead ? base.showcase.lead : result.showcase.lead,
    images: (result.showcase?.images ?? []).slice(0, MAX_SHOWCASE_IMAGES).map((img) => ({
      ...img,
      productSlug: img.productSlug === "malika-noir" ? "vlor-noir" : img.productSlug,
    })),
  };

  // Replace the previous built-in consultation copy in saved catalogues while
  // preserving any wording the owner intentionally changed in either language.
  const upgradeLegacyCopy = (
    value: { en?: string; ar?: string } | undefined,
    old: { en: string; ar: string },
    next: { en: string; ar: string },
  ) => ({
    en: value?.en === old.en ? next.en : value?.en ?? next.en,
    ar: value?.ar === old.ar ? next.ar : value?.ar ?? next.ar,
  });
  result.cta = {
    ...result.cta,
    eyebrow: upgradeLegacyCopy(
      result.cta?.eyebrow,
      { en: "Let's talk scent", ar: "لنتحدث عن العطر" },
      base.cta.eyebrow,
    ),
    title: upgradeLegacyCopy(
      result.cta?.title,
      { en: "Not sure which one? Ask a human.", ar: "لم تحسم اختيارك؟ اسأل إنساناً." },
      base.cta.title,
    ),
    lead: upgradeLegacyCopy(
      result.cta?.lead,
      {
        en: "Send us three words about yourself on WhatsApp and our perfumer will reply with three scents — usually within the hour.",
        ar: "أرسل لنا ثلاث كلمات عن نفسك على واتساب وسيرد عليك عطّارنا بثلاثة عطور — عادةً خلال ساعة.",
      },
      base.cta.lead,
    ),
  };

  if (result.story) {
    result.story = {
      ...result.story,
      eyebrow: replaceLegacyBrand(result.story.eyebrow) as typeof base.story.eyebrow,
      lead: replaceLegacyBrand(result.story.lead) as typeof base.story.lead,
    };
  }

  if (Array.isArray(result.testimonials?.items)) {
    result.testimonials = {
      ...result.testimonials,
      items: result.testimonials.items.map((item) => ({
        ...item,
        accent: item.accent?.toLowerCase() === "#ddf25c" ? base.theme.accent : item.accent,
        quote: replaceLegacyBrand(item.quote) as typeof item.quote,
      })),
    };
  }

  result.theme = {
    ...result.theme,
    accent: result.theme.accent?.toLowerCase() === "#ddf25c" ? base.theme.accent : result.theme.accent,
    headingScale: clampScale("headingScale", Number(result.theme.headingScale)),
    bodyScale: clampScale("bodyScale", Number(result.theme.bodyScale)),
    sectionSpacing: clampScale("sectionSpacing", Number(result.theme.sectionSpacing)),
  };
  const strip = (value: { enabled?: unknown; speed?: unknown; direction?: unknown }, fallback: { enabled: boolean; speed: number; direction: "left" | "right" }) => ({
    enabled: value?.enabled === false ? false : fallback.enabled,
    speed: Math.min(200, Math.max(10, Math.round(Number(value?.speed)) || fallback.speed)),
    direction: (value?.direction === "right" ? "right" : value?.direction === "left" ? "left" : fallback.direction) as "left" | "right",
  });
  result.strips = {
    announcement: strip(result.strips.announcement, base.strips.announcement),
  };

  const filters = result.shopFilters as unknown as Record<string, unknown>;
  const baseFilters = base.shopFilters as unknown as Record<string, unknown>;
  const cleanFilters: Record<string, boolean> = {};
  for (const key of Object.keys(baseFilters)) cleanFilters[key] = typeof filters?.[key] === "boolean" ? (filters[key] as boolean) : (baseFilters[key] as boolean);
  result.shopFilters = cleanFilters as unknown as typeof result.shopFilters;

  // Text edits: keep only known text ids with string values; an empty field
  // means "use the built-in wording".
  const overrides: Record<string, { en: string; ar: string }> = {};
  for (const [id, value] of Object.entries(result.textOverrides ?? {})) {
    if (!isValidTextId(id) || !value || typeof value !== "object") continue;
    const en = typeof value.en === "string" ? value.en : "";
    const ar = typeof value.ar === "string" ? value.ar : "";
    if (en.trim() || ar.trim()) overrides[id] = { en, ar };
  }
  result.textOverrides = overrides;

  result.shopHero = {
    size: result.shopHero.size === "standard" ? "standard" : "compact",
    enabled: result.shopHero.enabled !== false,
    scope: result.shopHero.scope === "featured" ? "featured" : "all",
    max: Math.min(12, Math.max(3, Math.round(Number(result.shopHero.max)) || 8)),
  };
  return result;
}
