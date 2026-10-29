import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDown, Sparkle } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  total: number;
  visible: number;
  onMore: () => void;
  onReset: () => void;
  /** True when "saved only" is on but nothing has been saved yet. */
  emptySaved?: boolean;
}

export function ProductGrid({ products, total, visible, onMore, onReset, emptySaved }: ProductGridProps) {
  const { t, lang, x } = useLang();

  if (products.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-ink/20 bg-white/30 px-6 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-lilac-soft">
          <Sparkle className="h-6 w-6 text-plum" />
        </span>
        <p className="font-display mt-5 text-3xl">{emptySaved ? t("shop.noSaved") : t("shop.empty")}</p>
        <p className="mt-2 max-w-sm text-[12px] text-mist">
          {x("Try clearing filters or searching for another note.", "جرّب مسح الفلاتر أو البحث عن نوتة أخرى.")}
        </p>
        <Button variant="outline" size="sm" onClick={onReset} className="mt-5">
          {t("shop.clear")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
        <span>
          {t("shop.showing")} {formatNumber(products.length, lang)} {t("shop.of")} {formatNumber(total, lang)}{" "}
          {t(total === 1 ? "shop.result" : "shop.results")}
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <span className="h-1 w-1 rounded-full bg-acid-deep" />
          {x("quality guaranteed", "جودة مضمونة")}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:gap-7">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={(index % 6) * 55}>
            <ProductCard product={product} priority={index < 3} />
          </Reveal>
        ))}
      </div>

      {visible < total && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist">
            {formatNumber(total - visible, lang)} {t(total - visible === 1 ? "shop.result" : "shop.results")} · {x("still to discover", "بانتظارك")}
          </p>
          <div className="h-1 w-36 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-plum transition-all duration-500" style={{ width: `${(visible / total) * 100}%` }} />
          </div>
          <Button variant="outline" onClick={onMore} icon={<ArrowDown className="h-4 w-4" />}>
            {t("shop.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
