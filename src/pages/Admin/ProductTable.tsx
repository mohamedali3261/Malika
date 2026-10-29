import { SmartImage } from "@/components/ui/Primitives";
import { Pencil, Search, Trash } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { useMemo, useState } from "react";

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const { t, lang, l } = useLang();
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    const value = term.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) =>
      [product.name.en, product.name.ar, product.slug, product.category, product.gender]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [products, term]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-mist">
          {filtered.length} / {products.length} {t("shop.results")}
        </p>
        <label className="relative block w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist" />
          <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder={t("shop.search")} className="field h-9 ps-9 text-[11px]" />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-ink/15 py-10 text-center text-[12px] text-mist">{t("admin.noProducts")}</p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white/40">
          <div className="hidden grid-cols-[2.6fr_1fr_0.9fr_0.9fr_0.7fr] gap-3 border-b border-ink/10 bg-bone-2/50 px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-mist md:grid">
            <span>{t("admin.tab.products")}</span>
            <span>{t("shop.category")}</span>
            <span>{t("shop.gender")}</span>
            <span>{t("featured.eyebrow")}</span>
            <span className="text-end">{t("admin.edit")}</span>
          </div>
          {filtered.map((product) => (
            <div key={product.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-ink/8 px-3 py-3 last:border-0 hover:bg-white/60 md:grid-cols-[2.6fr_1fr_0.9fr_0.9fr_0.7fr] md:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <SmartImage src={product.images[0] ?? ""} alt={l(product.name)} className="h-12 w-10 shrink-0 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-bold">{product.name.en}</p>
                  <p className="truncate text-[10px] text-mist">{product.name.ar} · {formatPrice(product.price, lang)}</p>
                  <div className="mt-1 flex gap-1 md:hidden">
                    {product.featured && <span className="rounded-full bg-ink px-1.5 py-0.5 text-[7px] font-bold text-acid">featured</span>}
                    {product.isNew && <span className="rounded-full bg-lilac px-1.5 py-0.5 text-[7px] font-bold">new</span>}
                    {product.bestseller && <span className="rounded-full bg-acid px-1.5 py-0.5 text-[7px] font-bold">best</span>}
                  </div>
                </div>
              </div>
              <span className="hidden text-[11px] text-ink/60 md:block">{t(`shop.${product.category}`)}</span>
              <span className="hidden text-[11px] text-ink/60 md:block">{t(`shop.${product.gender}`)}</span>
              <div className="hidden flex-wrap gap-1 md:flex">
                {product.featured && <span className="rounded-full bg-ink px-1.5 py-0.5 text-[7px] font-bold text-acid">featured</span>}
                {product.isNew && <span className="rounded-full bg-lilac px-1.5 py-0.5 text-[7px] font-bold">new</span>}
                {product.bestseller && <span className="rounded-full bg-acid px-1.5 py-0.5 text-[7px] font-bold">best</span>}
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <button onClick={() => onEdit(product)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink transition hover:bg-ink hover:text-bone" aria-label={t("admin.edit")}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(product)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-mist transition hover:bg-rose-100 hover:text-rose-600" aria-label={t("admin.delete")}>
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
