import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/Primitives";
import { ChevronDown, Plus, Refresh, Trash, Upload } from "@/components/ui/icons";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAsset } from "@/lib/assets";
import { ImageError, compressImage, kb } from "@/lib/image";
import { BilingualField } from "@/pages/Admin/ContentFields";
import type { Product } from "@/types";
import { MAX_SHOWCASE_IMAGES, type ShowcaseContent, type ShowcaseImage } from "@/types/content";
import { cn } from "@/utils/cn";
import { useRef, useState } from "react";

/** localStorage holds the whole site (~5 MB). Keep the uploaded images well inside that. */
const UPLOAD_BUDGET_KB = 1400;

const uid = () => Math.random().toString(36).slice(2, 8);

interface Props {
  value: ShowcaseContent;
  products: Product[];
  onChange: (next: ShowcaseContent) => void;
}

export function ShowcaseEditor({ value, products, onChange }: Props) {
  const { lang } = useLang();
  const { push } = useToast();
  const ar = lang === "ar";
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  const images = value.images;
  const full = images.length >= MAX_SHOWCASE_IMAGES;

  const patch = (next: Partial<ShowcaseContent>) => onChange({ ...value, ...next });
  const patchImage = (id: string, next: Partial<ShowcaseImage>) =>
    patch({ images: images.map((image) => (image.id === id ? { ...image, ...next } : image)) });

  const add = () => {
    if (full) return;
    patch({
      images: [
        ...images,
        { id: uid(), src: "", productSlug: "", fit: "contain", caption: { en: "", ar: "" } },
      ],
    });
  };

  const remove = (id: string) => patch({ images: images.filter((image) => image.id !== id) });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ images: next });
  };

  const productImage = (slug: string) => {
    const product = products.find((item) => item.slug === slug);
    if (!product) return null;
    return { src: product.cutout || product.images[0] || "", fit: (product.cutout ? "contain" : "cover") as ShowcaseImage["fit"] };
  };

  const pickProduct = (id: string, slug: string) => {
    const current = images.find((image) => image.id === id);
    const found = productImage(slug);
    // Fill an empty slot automatically; never overwrite a picture already chosen.
    if (found && current && !current.src) patchImage(id, { productSlug: slug, ...found });
    else patchImage(id, { productSlug: slug });
  };

  const startUpload = (id: string) => {
    uploadTarget.current = id;
    fileRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    const id = uploadTarget.current;
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !id) return;

    setBusy(id);
    try {
      const dataUrl = await compressImage(file);
      // Budget check counts every OTHER uploaded image plus this one.
      const others = images
        .filter((image) => image.id !== id && image.src.startsWith("data:"))
        .reduce((sum, image) => sum + kb(image.src), 0);
      if (others + kb(dataUrl) > UPLOAD_BUDGET_KB) {
        push(
          ar
            ? "حجم الصور المرفوعة كبير. استخدم رابط صورة بدلاً من الرفع."
            : "Uploaded images are getting too large. Use an image link instead.",
          "error"
        );
        return;
      }
      patchImage(id, { src: dataUrl });
      push(ar ? `تم رفع الصورة (${kb(dataUrl)} ك.ب)` : `Image added (${kb(dataUrl)} KB)`);
    } catch (error) {
      const code = error instanceof ImageError ? error.code : "decode";
      push(
        code === "type"
          ? ar ? "الملف ليس صورة." : "That file is not an image."
          : code === "size"
            ? ar ? "الصورة أكبر من ١٥ ميجا." : "That image is over 15 MB."
            : ar ? "تعذّرت قراءة الصورة." : "Could not read that image.",
        "error"
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={value.eyebrow} onChange={(v) => patch({ eyebrow: v })} />
      <BilingualField label={ar ? "العنوان" : "Title"} value={value.title} onChange={(v) => patch({ title: v })} />
      <BilingualField label={ar ? "النص" : "Lead"} value={value.lead} onChange={(v) => patch({ lead: v })} multiline rows={2} />

      <div className="mb-3 mt-5 flex items-center justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "صور الكارت" : "Card images"}</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold",
            full ? "bg-ink text-bone" : "bg-bone-2 text-mist"
          )}
          dir="ltr"
        >
          {images.length} / {MAX_SHOWCASE_IMAGES}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />

      {images.map((image, index) => {
        const product = products.find((item) => item.slug === image.productSlug);
        const available = product ? productImage(product.slug) : null;
        const isUpload = image.src.startsWith("data:");
        return (
          <div key={image.id} className="mb-3 rounded-xl border border-ink/10 bg-bone/60 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-[72px] w-[58px] shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-bone-2">
                {image.src ? (
                  <SmartImage
                    src={resolveAsset(image.src)}
                    alt=""
                    className="h-full w-full"
                    imgClassName={image.fit === "contain" ? "object-contain p-1" : "object-cover"}
                  />
                ) : (
                  <span className="grid h-full place-items-center text-[9px] font-bold text-mist">{ar ? "فارغة" : "empty"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">
                  #{String(index + 1).padStart(2, "0")}
                  {isUpload && <span className="ms-2 text-plum">{ar ? `مرفوعة · ${kb(image.src)} ك.ب` : `uploaded · ${kb(image.src)} KB`}</span>}
                </p>
                <p className="truncate text-[12px] font-bold">{product ? product.name[lang] : ar ? "بدون عطر مرتبط" : "No linked scent"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="press grid h-9 w-9 place-items-center rounded-full border border-ink/10 disabled:opacity-30" aria-label={ar ? "للأعلى" : "Move up"}>
                  <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} className="press grid h-9 w-9 place-items-center rounded-full border border-ink/10 disabled:opacity-30" aria-label={ar ? "للأسفل" : "Move down"}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => remove(image.id)} className="press grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-mist hover:bg-rose-50 hover:text-rose-600" aria-label={ar ? "حذف" : "Remove"}>
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <label className="mb-3 block">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "العطر المرتبط (اختياري)" : "Linked scent (optional)"}</span>
              <select value={image.productSlug} onChange={(event) => pickProduct(image.id, event.target.value)} className="field">
                <option value="">{ar ? "— بدون —" : "— none —"}</option>
                {products.map((item) => (
                  <option key={item.id} value={item.slug}>{item.name[lang]}</option>
                ))}
              </select>
            </label>

            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "الصورة" : "Image"}</span>
            <div className="mb-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startUpload(image.id)}
                disabled={busy === image.id}
                icon={busy === image.id ? <Refresh className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                iconPosition="start"
              >
                {ar ? "رفع صورة" : "Upload"}
              </Button>
              {available?.src && (
                <Button type="button" size="sm" variant="ghost" onClick={() => patchImage(image.id, available)}>
                  {ar ? "استخدم صورة العطر" : "Use the scent's image"}
                </Button>
              )}
            </div>
            <input
              value={isUpload ? "" : image.src}
              onChange={(event) => patchImage(image.id, { src: event.target.value.trim() })}
              placeholder={isUpload ? (ar ? "صورة مرفوعة — الصق رابطاً لاستبدالها" : "Uploaded — paste a link to replace it") : "https://… or /images/bottles/dark.webp"}
              className="field mb-3 text-[11px]"
              dir="ltr"
            />

            <div className="mb-3 flex gap-2">
              {(["contain", "cover"] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => patchImage(image.id, { fit })}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2 text-[11px] font-bold transition",
                    image.fit === fit ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/60 hover:border-ink/40"
                  )}
                >
                  {fit === "contain" ? (ar ? "زجاجة بخلفية شفافة" : "Transparent bottle") : ar ? "صورة بخلفية" : "Photo (fill)"}
                </button>
              ))}
            </div>

            <BilingualField
              label={ar ? "عنوان مخصص (اختياري)" : "Custom caption (optional)"}
              value={image.caption}
              onChange={(v) => patchImage(image.id, { caption: v })}
              hint={ar ? "اتركه فارغاً لعرض اسم العطر المرتبط." : "Leave empty to show the linked scent's name."}
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        disabled={full}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-2 text-[11px] font-bold transition",
          full ? "cursor-not-allowed border-ink/10 text-mist/60" : "border-ink/25 text-plum hover:border-ink/50 hover:bg-white/60"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {full
          ? ar ? `وصلت للحد الأقصى (${MAX_SHOWCASE_IMAGES} صور)` : `Maximum reached (${MAX_SHOWCASE_IMAGES} images)`
          : ar ? "إضافة صورة" : "Add image"}
      </button>
    </div>
  );
}
