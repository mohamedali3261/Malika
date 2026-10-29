import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { ImageError, uploadImageToD1 } from "@/lib/image";
import { copyText } from "@/lib/messaging";

type StoredImage = { key: string; size: number; uploaded?: string };

export function Images() {
  const { lang } = useLang();
  const [images, setImages] = useState<StoredImage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(
    async (next?: string) => {
      try {
        const r = await fetch("/api/admin/images" + (next ? `?cursor=${encodeURIComponent(next)}` : ""));
        if (!r.ok) throw new Error();
        const data = await r.json();
        setImages((prev) => (next ? [...prev, ...data.images] : data.images));
        setCursor(data.cursor);
      } catch {
        setMessage(lang === "ar" ? "تعذر تحميل الصور" : "Could not load images");
      }
    },
    [lang],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (key: string) => {
    if (
      !window.confirm(
        lang === "ar"
          ? "حذف الصورة نهائيًا من D1؟ تأكد أنها غير مستخدمة خارج المنتجات أيضًا."
          : "Permanently delete this image from D1? Make sure it is not used outside product data.",
      )
    )
      return;
    setMessage("");
    try {
      const r = await fetch(`/api/admin/images/${key}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setImages((prev) => prev.filter((x) => x.key !== key));
    } catch {
      setMessage(
        lang === "ar"
          ? "تعذر الحذف؛ قد تكون الصورة مستخدمة في منتج."
          : "Could not delete; the image may be used by a product.",
      );
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">{lang === "ar" ? "صور المنتجات (D1)" : "Product images (D1)"}</h2>
          <p className="my-2 text-sm text-ink/75">
            {lang === "ar"
              ? "تُخزّن الصور في D1 بحد أقصى ١ ميجابايت للصورة (تُضغط الصور الكبيرة تلقائيًا). لا يمكن حذف الصور المستخدمة في المنتجات."
              : "Images are stored in D1 with a 1 MB max per image (large photos are compressed automatically). Images referenced by products cannot be deleted."}
          </p>
        </div>
        <label className="cursor-pointer rounded-full border border-ink/20 px-4 py-2 text-xs font-bold hover:border-ink">
          {uploading
            ? lang === "ar"
              ? "جاري الرفع…"
              : "Uploading…"
            : lang === "ar"
              ? "+ رفع صورة"
              : "+ Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setMessage("");
              setUploading(true);
              try {
                await uploadImageToD1(file);
                await load();
              } catch (err) {
                setMessage(
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
        </label>
      </div>
      {message && (
        <p role="alert" className="my-2 text-sm text-rose-700">
          {message}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((i) => {
          const url = `/api/images/${i.key}`;
          return (
            <div key={i.key} className="rounded-xl border border-ink/10 bg-white/60 p-2.5">
              <img src={url} alt="" className="h-32 w-full object-contain" />
              <p className="mt-1.5 text-[11px] break-all text-ink/80" dir="ltr">
                {i.key}
              </p>
              <p className="text-[11px] text-mist">{Math.max(1, Math.round(i.size / 1024))} KB</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyText(url);
                    if (ok) setMessage(lang === "ar" ? `تم نسخ الرابط: ${url}` : `Copied URL: ${url}`);
                  }}
                  className="underline"
                >
                  {lang === "ar" ? "نسخ الرابط" : "Copy URL"}
                </button>
                <button type="button" onClick={() => void remove(i.key)} className="text-rose-700 underline">
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {cursor && (
        <button className="mt-4 underline" onClick={() => void load(cursor)}>
          {lang === "ar" ? "المزيد" : "Load more"}
        </button>
      )}
    </section>
  );
}
