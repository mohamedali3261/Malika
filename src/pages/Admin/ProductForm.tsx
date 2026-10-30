import { Button } from "@/components/ui/Button";
import { Portal, SmartImage } from "@/components/ui/Primitives";
import { Check, Plus, Trash, X } from "@/components/ui/icons";
import { useBodyLock } from "@/hooks/useUi";
import { useLang } from "@/i18n/LanguageContext";
import { ImageError, uploadImageToD1 } from "@/lib/image";
import type { Category, Gender, Localized, Mood, Product, SizeOption } from "@/types";
import { cn } from "@/utils/cn";
import { useEffect, useState, type FormEvent } from "react";

const moodsList: Mood[] = ["fresh", "warm", "bold", "floral"];
const categories: Category[] = ["fresh", "floral", "woody", "oriental"];
const genders: Gender[] = ["women", "men", "unisex"];

const emptyDraft = {
  nameEn: "",
  nameAr: "",
  slug: "",
  taglineEn: "",
  taglineAr: "",
  descEn: "",
  descAr: "",
  storyEn: "",
  storyAr: "",
  price: 1800,
  compareAt: 0,
  category: "woody" as Category,
  gender: "unisex" as Gender,
  moods: ["warm"] as Mood[],
  topEn: "",
  topAr: "",
  heartEn: "",
  heartAr: "",
  baseEn: "",
  baseAr: "",
  images: "",
  cutout: "",
  accent: "#C9B5F7",
  featured: false,
  isNew: true,
  bestseller: false,
  longevity: "8–10h",
  sillageEn: "Soft presence",
  sillageAr: "حضور ناعم",
  rating: 4.8,
  reviews: 0,
  sizes: [{ ml: 50, price: 1800 }] as SizeOption[],
};

type Draft = typeof emptyDraft;

function toDraft(product: Product): Draft {
  return {
    nameEn: product.name.en,
    nameAr: product.name.ar,
    slug: product.slug,
    taglineEn: product.tagline.en,
    taglineAr: product.tagline.ar,
    descEn: product.description.en,
    descAr: product.description.ar,
    storyEn: product.story.en,
    storyAr: product.story.ar,
    price: product.price,
    compareAt: product.compareAt ?? 0,
    category: product.category,
    gender: product.gender,
    moods: product.moods,
    topEn: product.notes.top.map((note) => note.en).join(", "),
    topAr: product.notes.top.map((note) => note.ar).join(", "),
    heartEn: product.notes.heart.map((note) => note.en).join(", "),
    heartAr: product.notes.heart.map((note) => note.ar).join(", "),
    baseEn: product.notes.base.map((note) => note.en).join(", "),
    baseAr: product.notes.base.map((note) => note.ar).join(", "),
    images: product.images.join("\n"),
    cutout: product.cutout ?? "",
    accent: product.accent,
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    bestseller: Boolean(product.bestseller),
    longevity: product.longevity,
    sillageEn: product.sillage.en,
    sillageAr: product.sillage.ar,
    rating: product.rating,
    reviews: product.reviews,
    sizes: product.sizes.length > 0 ? product.sizes : [{ ml: 50, price: product.price }],
  };
}

function parseNotes(en: string, ar: string): Localized[] {
  const enNotes = en.split(/[,،]/).map((note) => note.trim()).filter(Boolean);
  const arNotes = ar.split(/[,،]/).map((note) => note.trim()).filter(Boolean);
  const length = Math.max(enNotes.length, arNotes.length);
  return Array.from({ length }).map((_, index) => ({
    en: enNotes[index] || arNotes[index] || "",
    ar: arNotes[index] || enNotes[index] || "",
  })).filter((note) => note.en);
}

function Field({ label, children, hint, full }: { label: string; children: React.ReactNode; hint?: string; full?: boolean }) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[9px] text-mist/80">{hint}</span>}
    </label>
  );
}

export function ProductForm({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const { t, l, lang } = useLang();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useBodyLock(open);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ? toDraft(initial) : emptyDraft);
    setError("");
    setUploading(false);
  }, [open, initial]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMood = (mood: Mood) => {
    update(
      "moods",
      draft.moods.includes(mood) ? draft.moods.filter((item) => item !== mood) : [...draft.moods, mood]
    );
  };

  const setSize = (index: number, key: keyof SizeOption, value: number) => {
    update(
      "sizes",
      draft.sizes.map((size, sizeIndex) => (sizeIndex === index ? { ...size, [key]: value } : size))
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.nameEn.trim() || !draft.slug.trim()) {
      setError(lang === "ar" ? "الاسم الإنجليزي والرابط مطلوبان." : "English name and slug are required.");
      return;
    }
    if (!draft.images.trim()) {
      setError(lang === "ar" ? "أضف رابط صورة واحدة على الأقل." : "Add at least one image URL.");
      return;
    }
    const sizes = draft.sizes.filter((size) => size.ml > 0 && size.price > 0);
    if (sizes.length === 0) {
      setError(lang === "ar" ? "أضف حجماً وسعراً صحيحاً." : "Add at least one valid size and price.");
      return;
    }

    const notes = {
      top: parseNotes(draft.topEn, draft.topAr),
      heart: parseNotes(draft.heartEn, draft.heartAr),
      base: parseNotes(draft.baseEn, draft.baseAr),
    };

    const product: Product = {
      id: initial?.id ?? `${draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${Date.now().toString(36).slice(-4)}`,
      slug: draft.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: { en: draft.nameEn.trim(), ar: draft.nameAr.trim() || draft.nameEn.trim() },
      tagline: { en: draft.taglineEn.trim(), ar: draft.taglineAr.trim() || draft.taglineEn.trim() },
      description: { en: draft.descEn.trim(), ar: draft.descAr.trim() || draft.descEn.trim() },
      story: { en: draft.storyEn.trim() || draft.descEn.trim(), ar: draft.storyAr.trim() || draft.descAr.trim() || draft.descEn.trim() },
      price: Number(draft.price) || sizes[0].price,
      compareAt: draft.compareAt > 0 ? Number(draft.compareAt) : undefined,
      sizes,
      category: draft.category,
      gender: draft.gender,
      moods: draft.moods.length > 0 ? draft.moods : ["warm"],
      notes,
      images: draft.images.split("\n").map((url) => url.trim()).filter(Boolean),
      cutout: draft.cutout.trim() || undefined,
      accent: draft.accent,
      featured: draft.featured,
      isNew: draft.isNew,
      bestseller: draft.bestseller,
      rating: Number(draft.rating) || 4.8,
      reviews: Number(draft.reviews) || 0,
      longevity: draft.longevity,
      sillage: { en: draft.sillageEn || "Soft", ar: draft.sillageAr || "ناعم" },
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    onSave(product);
  };

  if (!open) return null;

  const preview: Product = {
    ...(initial ?? ({} as Product)),
    id: "preview",
    slug: draft.slug,
    name: { en: draft.nameEn || "New scent", ar: draft.nameAr || draft.nameEn || "عطر جديد" },
    tagline: { en: draft.taglineEn || "Scent notes", ar: draft.taglineAr || "نوتات العطر" },
    description: { en: draft.descEn, ar: draft.descAr },
    story: { en: draft.storyEn, ar: draft.storyAr },
    price: Number(draft.price) || 0,
    compareAt: draft.compareAt > 0 ? draft.compareAt : undefined,
    sizes: draft.sizes,
    category: draft.category,
    gender: draft.gender,
    moods: draft.moods,
    notes: { top: [], heart: [], base: [] },
    images: draft.images.split("\n").map((url) => url.trim()).filter(Boolean),
    cutout: draft.cutout.trim() || undefined,
    accent: draft.accent,
    featured: draft.featured,
    isNew: draft.isNew,
    bestseller: draft.bestseller,
    rating: draft.rating,
    reviews: draft.reviews,
    longevity: draft.longevity,
    sillage: { en: draft.sillageEn, ar: draft.sillageAr },
    createdAt: "2026-01-01",
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-[115]" role="dialog" aria-modal="true">
      <div onClick={onClose} className="anim-fade absolute inset-0 bg-ink/55 backdrop-blur-sm" />
      <div className="absolute inset-y-0 end-0 flex w-full max-w-2xl flex-col bg-bone shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">{t("admin.tab.products")}</p>
            <h2 className="font-display text-2xl">{initial ? t("admin.edit") : t("admin.newProduct")}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-bone" aria-label={t("nav.close")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-5">
          {/* preview */}
          <div className="mb-5 flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/40 p-3">
            <SmartImage src={preview.images[0] ?? ""} alt={l(preview.name)} className="h-24 w-20 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{l(preview.name)}</p>
              <p className="truncate text-[10px] text-mist">{l(preview.tagline)}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {draft.featured && <span className="rounded-full bg-ink px-2 py-0.5 text-[8px] font-bold text-acid">featured</span>}
                {draft.isNew && <span className="rounded-full bg-lilac px-2 py-0.5 text-[8px] font-bold">new</span>}
                {draft.sizes.length > 0 && <span className="rounded-full bg-bone-2 px-2 py-0.5 text-[8px] font-bold">{draft.price} EGP</span>}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (English) *">
              <input value={draft.nameEn} onChange={(event) => update("nameEn", event.target.value)} className="field" dir="ltr" placeholder="Nuit Blanche" />
            </Field>
            <Field label="الاسم (عربي)">
              <input value={draft.nameAr} onChange={(event) => update("nameAr", event.target.value)} className="field" dir="rtl" placeholder="نوي بلانش" />
            </Field>
            <Field label="Slug / URL *" full hint="stored at /#/product/your-slug">
              <input value={draft.slug} onChange={(event) => update("slug", event.target.value)} className="field" dir="ltr" placeholder="nuit-blanche" />
            </Field>
            <Field label="Tagline (English)">
              <input value={draft.taglineEn} onChange={(event) => update("taglineEn", event.target.value)} className="field" dir="ltr" placeholder="Iris · Musk · Cedar" />
            </Field>
            <Field label="الوصف المختصر (عربي)">
              <input value={draft.taglineAr} onChange={(event) => update("taglineAr", event.target.value)} className="field" dir="rtl" placeholder="سوسن · مسك · أرز" />
            </Field>
            <Field label="Description (English)" full>
              <textarea value={draft.descEn} onChange={(event) => update("descEn", event.target.value)} rows={2} className="field resize-none" dir="ltr" />
            </Field>
            <Field label="الوصف (عربي)" full>
              <textarea value={draft.descAr} onChange={(event) => update("descAr", event.target.value)} rows={2} className="field resize-none" dir="rtl" />
            </Field>

            <div className="sm:col-span-2 my-1 border-t border-ink/10 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-mist">{lang === "ar" ? "السعر والحجم" : "Pricing & sizes"}</p>
            </div>
            <Field label="Price (EGP)">
              <input type="number" min={0} value={draft.price} onChange={(event) => update("price", Number(event.target.value))} className="field" dir="ltr" />
            </Field>
            <Field label="Compare-at price (optional)">
              <input type="number" min={0} value={draft.compareAt} onChange={(event) => update("compareAt", Number(event.target.value))} className="field" dir="ltr" />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(event) => update("category", event.target.value as Category)} className="field">
                {categories.map((category) => (
                  <option key={category} value={category}>{t(`shop.${category}`)}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select value={draft.gender} onChange={(event) => update("gender", event.target.value as Gender)} className="field">
                {genders.map((gender) => (
                  <option key={gender} value={gender}>{t(`shop.${gender}`)}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("product.size")}</span>
              <div className="space-y-2">
                {draft.sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="number" min={1} value={size.ml} onChange={(event) => setSize(index, "ml", Number(event.target.value))} className="field h-10 w-24" aria-label="ml" />
                    <span className="text-[10px] text-mist">ml</span>
                    <input type="number" min={0} value={size.price} onChange={(event) => setSize(index, "price", Number(event.target.value))} className="field h-10 flex-1" aria-label="price" />
                    <span className="text-[10px] text-mist">EGP</span>
                    <button type="button" onClick={() => update("sizes", draft.sizes.filter((_, i) => i !== index))} className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-mist hover:text-rose-500" aria-label="remove size">
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => update("sizes", [...draft.sizes, { ml: 100, price: Math.round(draft.price * 1.4) }])} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-plum">
                <Plus className="h-3 w-3" /> {lang === "ar" ? "إضافة حجم" : "Add size"}
              </button>
            </div>

            <Field
              label={`${t("admin.image")} *`}
              full
              hint={
                lang === "ar"
                  ? "حد أقصى ١ ميجابايت للصورة في D1 (تُضغط الصور الكبيرة تلقائيًا قبل الرفع)، أو الصق رابطًا مباشرًا."
                  : "Max 1 MB per D1 image (large photos are compressed automatically before upload), or paste a direct URL."
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setError("");
                  setUploading(true);
                  try {
                    const result = await uploadImageToD1(file);
                    update("images", [draft.images, result.url].filter(Boolean).join("\n"));
                  } catch (err) {
                    setError(
                      err instanceof ImageError && err.code === "size"
                        ? lang === "ar"
                          ? "حجم الصورة يتجاوز ١ ميجابايت؛ اضغط الصورة قبل الرفع."
                          : "Image exceeds 1 MB; compress it before uploading."
                        : lang === "ar"
                          ? "تعذر رفع الصورة"
                          : "Image upload failed",
                    );
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {uploading && (
                <span className="mt-1 block text-[10px] text-plum">
                  {lang === "ar" ? "جاري ضغط ورفع الصورة إلى D1…" : "Compressing and uploading image to D1…"}
                </span>
              )}
              <textarea value={draft.images} onChange={(event) => update("images", event.target.value)} rows={3} className="field mt-1.5 resize-none text-[11px]" dir="ltr" placeholder="/api/images/… or https://…" />
            </Field>

            <Field label={t("admin.cutout")} full hint={t("admin.cutoutHint")}>
              <input
                type="file"
                accept="image/png,image/webp"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setError("");
                  setUploading(true);
                  try {
                    const result = await uploadImageToD1(file);
                    update("cutout", result.url);
                  } catch (err) {
                    setError(
                      err instanceof ImageError && err.code === "size"
                        ? lang === "ar"
                          ? "حجم الصورة يتجاوز ١ ميجابايت؛ اضغط الصورة قبل الرفع."
                          : "Image exceeds 1 MB; compress it before uploading."
                        : lang === "ar"
                          ? "تعذر رفع الصورة"
                          : "Image upload failed",
                    );
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <input
                value={draft.cutout}
                onChange={(event) => update("cutout", event.target.value)}
                className="field mt-1.5 text-[11px]"
                dir="ltr"
                placeholder="/images/bottles/dark.webp or /api/images/…"
              />
            </Field>

            <Field label={lang === "ar" ? "لون البطاقة" : "Card accent"}>
              <div className="flex items-center gap-2">
                <input type="color" value={draft.accent} onChange={(event) => update("accent", event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15 bg-white p-1" />
                <input value={draft.accent} onChange={(event) => update("accent", event.target.value)} className="field" dir="ltr" />
              </div>
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("admin.badges")}</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "featured" as const, label: t("admin.featured") },
                  { key: "isNew" as const, label: t("product.new") },
                  { key: "bestseller" as const, label: t("product.bestseller") },
                ].map((badge) => (
                  <button
                    key={badge.key}
                    type="button"
                    onClick={() => update(badge.key, !draft[badge.key])}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition",
                      draft[badge.key] ? "border-acid-deep bg-acid text-ink" : "border-ink/15 text-ink/60"
                    )}
                  >
                    {draft[badge.key] && <Check className="h-3 w-3" />} {badge.label}
                  </button>
                ))}
              </div>
            </div>

          {error && <p className="mt-4 rounded-xl bg-rose-100 px-3 py-2 text-[11px] font-semibold text-rose-700">{error}</p>}

          <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-ink/10 bg-bone py-4">
            <Button type="button" variant="outline" onClick={onClose}>{t("admin.cancel")}</Button>
            <Button type="submit" variant="acid" full icon={<Check className="h-4 w-4" />} iconPosition="start">
              {initial ? t("admin.update") : t("admin.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
