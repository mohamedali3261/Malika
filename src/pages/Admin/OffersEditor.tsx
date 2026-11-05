import { AddButton, BilingualField, RepeatableItem, TextField } from "@/pages/Admin/ContentFields";
import { useLang } from "@/i18n/LanguageContext";
import type { OffersContent } from "@/types/content";
import type { Product } from "@/types";

interface Props {
  value: OffersContent;
  onChange: (next: OffersContent) => void;
  products: Product[];
}

export function OffersEditor({ value, onChange, products }: Props) {
  const { lang } = useLang();
  const ar = lang === "ar";
  const { l } = useLang();

  const update = (mutate: (draft: OffersContent) => void) => {
    const next: OffersContent = structuredClone(value);
    mutate(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={value.eyebrow} onChange={(v) => update((d) => { d.eyebrow = v; })} />
      <BilingualField label={ar ? "العنوان" : "Title"} value={value.title} onChange={(v) => update((d) => { d.title = v; })} />
      <BilingualField label={ar ? "النص التمهيدي" : "Lead"} value={value.lead} onChange={(v) => update((d) => { d.lead = v; })} multiline rows={2} />

      <div className="rounded-xl border border-ink/10 bg-bone-2/40 p-3">
        <p className="text-[11px] font-bold text-ink">
          {ar ? "الباقات — اختر ٢–٤ عطور لكل باقة وحدد سعر الباقة" : "Bundles — pick 2–4 scents per bundle and set the bundle price"}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-mist">
          {ar ? "سيظهر للمستخدم سعر كل عطر وحده، ثم سعر الباقة والخصم." : "Each bundle will show every scent's single price, then the bundle price and savings."}
        </p>
      </div>

      {value.bundles.map((bundle, index) => (
        <RepeatableItem
          key={bundle.id}
          index={index}
          onRemove={() => update((d) => { d.bundles.splice(index, 1); })}
        >
          <BilingualField label={ar ? "عنوان الباقة" : "Bundle title"} value={bundle.title} onChange={(v) => update((d) => { d.bundles[index].title = v; })} />
          <BilingualField label={ar ? "وصف الباقة" : "Description"} value={bundle.description} onChange={(v) => update((d) => { d.bundles[index].description = v; })} multiline rows={2} />
          <BilingualField label={ar ? "شارة الخصم (مثل وفر ٢٥٪)" : "Badge (e.g. Save 25%)"} value={bundle.badge} onChange={(v) => update((d) => { d.bundles[index].badge = v; })} />

          <div className="grid gap-2 sm:grid-cols-2">
            <TextField
              label={ar ? "سعر الباقة (ج.م)" : "Bundle price (EGP)"}
              type="number"
              value={String(bundle.bundlePrice)}
              onChange={(v) => update((d) => { d.bundles[index].bundlePrice = Math.max(0, Math.round(Number(v) || 0)); })}
            />
            <div className="flex items-end pb-1">
              <span className="text-[11px] text-mist">
                {ar ? `عدد المنتجات: ${bundle.productSlugs.length}` : `Products: ${bundle.productSlugs.length}`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist">
              {ar ? "المنتجات في الباقة" : "Products in bundle"}
            </p>
            {bundle.productSlugs.map((slug, sIdx) => (
              <div key={`${slug}-${sIdx}`} className="flex gap-2">
                <select
                  value={slug}
                  onChange={(e) => update((d) => { d.bundles[index].productSlugs[sIdx] = e.target.value; })}
                  className="field flex-1 text-[12px]"
                >
                  <option value="">{ar ? "اختر عطراً" : "Choose scent"}</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {l(p.name)} — {p.sizes?.[0]?.price ?? p.price} EGP
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => update((d) => { d.bundles[index].productSlugs.splice(sIdx, 1); })}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-ink/15 text-mist hover:border-rose-300 hover:text-rose-600"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={bundle.productSlugs.length >= 4}
                onClick={() => update((d) => { d.bundles[index].productSlugs.push(products[0]?.slug || ""); })}
                className="rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-bold text-ink hover:border-ink/40 disabled:opacity-40"
              >
                + {ar ? "إضافة عطر" : "Add scent"}
              </button>
              {bundle.productSlugs.length < 2 && (
                <span className="text-[10px] leading-5 text-rose-600">{ar ? "يجب اختيار عطرين على الأقل" : "Pick at least 2 scents"}</span>
              )}
            </div>

            {/* preview prices */}
            <div className="rounded-lg bg-white/60 p-2 text-[11px]">
              <p className="font-bold text-ink">{ar ? "معاينة الأسعار:" : "Price preview:"}</p>
              {bundle.productSlugs.map((slug) => {
                const prod = products.find((p) => p.slug === slug);
                if (!prod) return <p key={slug} className="text-mist">— {slug} —</p>;
                return (
                  <p key={slug} className="flex justify-between text-mist">
                    <span>{l(prod.name)}</span>
                    <span dir="ltr">{prod.sizes?.[0]?.price ?? prod.price} EGP</span>
                  </p>
                );
              })}
              <p className="mt-1 flex justify-between border-t border-ink/10 pt-1 font-bold text-ink">
                <span>{ar ? "الإجمالي الأصلي" : "Original total"}</span>
                <span dir="ltr">
                  {bundle.productSlugs
                    .map((s) => products.find((p) => p.slug === s)?.sizes?.[0]?.price ?? 0)
                    .reduce((a, b) => a + b, 0)}{" "}
                  EGP
                </span>
              </p>
              <p className="flex justify-between font-bold text-emerald-700">
                <span>{ar ? "سعر الباقة" : "Bundle"}</span>
                <span dir="ltr">{bundle.bundlePrice} EGP</span>
              </p>
            </div>
          </div>
        </RepeatableItem>
      ))}

      <AddButton
        label={ar ? "إضافة باقة" : "Add bundle"}
        onClick={() =>
          update((d) => {
            d.bundles.push({
              id: Math.random().toString(36).slice(2, 8),
              title: { en: "New bundle", ar: "باقة جديدة" },
              description: { en: "A curated set.", ar: "مجموعة مختارة." },
              productSlugs: products.slice(0, 2).map((p) => p.slug),
              bundlePrice: 5000,
              badge: { en: "Save 20%", ar: "وفّر ٢٠٪" },
            });
          })
        }
      />
    </div>
  );
}
