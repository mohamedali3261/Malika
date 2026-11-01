import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDown, GridCompact, GridEditorial, Sparkle } from "@/components/ui/icons";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";
import { pickCardRevealVariant } from "@/motion";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";

interface ProductGridProps {
  products: Product[];
  total: number;
  visible: number;
  onMore: () => void;
  onReset: () => void;
  /** True when "saved only" is on but nothing has been saved yet. */
  emptySaved?: boolean;
}

type GridDensity = "compact" | "dense";

export function ProductGrid({ products, total, visible, onMore, onReset, emptySaved }: ProductGridProps) {
  const { t, lang, x } = useLang();
  const [density, setDensity] = usePersistentState<GridDensity>("malika.gridDensity.v1", "compact");
  const isDense = density === "dense";

  if (products.length === 0) {
    return (
      <div className="m-spring-soft mt-7 flex flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-ink/20 bg-white/30 px-6 py-16 text-center">
        <span className="m-float-feather grid h-14 w-14 place-items-center rounded-full bg-lilac-soft">
          <Sparkle className="h-5 w-5 text-plum" />
        </span>
        <p className="font-display mt-4 text-3xl">{emptySaved ? t("shop.noSaved") : t("shop.empty")}</p>
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
      <div className="mt-5 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
        <span>
          {t("shop.showing")} {formatNumber(products.length, lang)} {t("shop.of")} {formatNumber(total, lang)}{" "}
          {t(total === 1 ? "shop.result" : "shop.results")}
        </span>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="m-pulse-beacon h-1.5 w-1.5 rounded-full bg-acid-deep" />
            {x("quality guaranteed", "جودة مضمونة")}
          </span>

          {/* Grid density toggle (4-col compact vs 5-col gallery on wide screens) */}
          <div
            role="group"
            aria-label={x("Card size", "حجم الكروت")}
            className="hidden items-center gap-0.5 rounded-full border border-ink/12 bg-white/60 p-0.5 md:flex"
          >
            <button
              type="button"
              onClick={() => setDensity("compact")}
              aria-pressed={!isDense}
              title={x("Standard compact cards", "كروت مدمجة متوازنة")}
              className={cn(
                "m-press-spring grid h-7 w-7 place-items-center rounded-full transition-colors",
                !isDense ? "bg-ink text-bone" : "text-ink/50 hover:text-ink"
              )}
            >
              <GridEditorial className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDensity("dense")}
              aria-pressed={isDense}
              title={x("Smaller gallery cards", "كروت أصغر وأكثر كثافة")}
              className={cn(
                "m-press-spring grid h-7 w-7 place-items-center rounded-full transition-colors",
                isDense ? "bg-ink text-bone" : "text-ink/50 hover:text-ink"
              )}
            >
              <GridCompact className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid",
          isDense
            ? "grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-3.5"
            : "grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4.5"
        )}
      >
        {products.map((product, index) => (
          <Reveal
            key={`${product.id}-${density}`}
            variant={pickCardRevealVariant(index)}
            delay={(index % 8) * 42}
          >
            <ProductCard product={product} priority={index < 4} dense={isDense} />
          </Reveal>
        ))}
      </div>

      {visible < total && (
        <div className="mt-10 flex flex-col items-center gap-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist">
            {formatNumber(total - visible, lang)} {t(total - visible === 1 ? "shop.result" : "shop.results")} ·{" "}
            {x("still to discover", "بانتظارك")}
          </p>
          <div className="h-1 w-36 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-plum transition-all duration-500"
              style={{ width: `${(visible / total) * 100}%` }}
            />
          </div>
          <Button variant="outline" size="sm" onClick={onMore} icon={<ArrowDown className="h-3.5 w-3.5" />}>
            {t("shop.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
