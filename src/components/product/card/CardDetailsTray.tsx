import type { NoteSwatch } from "@/components/product/card/colorUtils";
import { Bag, Check, Star } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useState } from "react";

interface CardDetailsTrayProps {
  product: Product;
  ml: number;
  selectedPrice: number;
  swatches: NoteSwatch[];
  added: boolean;
  dense?: boolean;
  onSelectMl: (ml: number) => void;
  onAddToBag: () => void;
}

export function CardDetailsTray({
  product,
  ml,
  selectedPrice,
  swatches,
  added,
  dense,
  onSelectMl,
  onAddToBag,
}: CardDetailsTrayProps) {
  const { lang, t, l } = useLang();
  const [activeSwatch, setActiveSwatch] = useState<number | null>(null);

  const activeNote = activeSwatch !== null ? swatches[activeSwatch]?.note : swatches[1]?.note ?? swatches[0]?.note;

  return (
    <div
      className={cn(
        "pcard-compact-scope absolute inset-x-0 bottom-0 z-20 w-full bg-linear-to-t from-ink/90 via-plum/88 to-transparent text-center transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        dense
          ? "h-[82px] group-hover/card:h-[168px] touch:h-[168px]"
          : "h-[86px] sm:h-[92px] group-hover/card:h-[178px] sm:group-hover/card:h-[190px] touch:h-[178px]"
      )}
    >
      <div className="flex h-full flex-col items-center justify-start px-2.5 pt-2 sm:px-3.5 sm:pt-2.5">
        {/* Micro category + rating row */}
        <div className="flex items-center justify-center gap-1.5 text-bone/55">
          <span className="pcard-keep text-[8px] font-bold uppercase tracking-[0.16em]">
            {t(`shop.${product.category}`)}
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-bone/35" />
          <span className="pcard-keep inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-acid/90">
            <Star className="h-2.5 w-2.5" />
            {product.rating.toFixed(1)}
          </span>
          <span className="hidden h-0.5 w-0.5 rounded-full bg-bone/35 sm:inline-block" />
          <span className="pcard-keep hidden text-[8px] font-medium text-bone/45 sm:inline">
            {product.longevity}
          </span>
        </div>

        {/* Perfume title */}
        <Link to={`/product/${product.slug}`} className="w-full shrink-0">
          <h3
            className={cn(
              "pcard-keep font-display mt-0.5 w-full truncate leading-tight tracking-tight text-bone transition-colors hover:text-acid",
              dense ? "text-[14.5px] sm:text-[16px]" : "text-[15.5px] sm:text-[17.5px]"
            )}
          >
            {l(product.name)}
          </h3>
        </Link>

        {/* Animated price morph when switching ml */}
        <p className="mt-0.5 flex shrink-0 items-baseline justify-center gap-1.5">
          <span
            key={ml}
            className="pcard-keep m-price-morph inline-block text-[12.5px] font-extrabold text-bone sm:text-[13.5px]"
          >
            {formatPrice(selectedPrice, lang)}
          </span>
          {product.compareAt && (
            <span className="pcard-keep text-[9.5px] text-bone/40 line-through">
              {formatPrice(product.compareAt, lang)}
            </span>
          )}
        </p>

        {/* Compact sizes + interactive note swatches row */}
        <div className="pointer-events-none flex w-full shrink-0 items-center justify-center gap-1.5 pt-2 opacity-0 transition-opacity duration-300 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-hover/card:delay-[60ms] touch:pointer-events-auto touch:opacity-100">
          <div className="flex items-center gap-1">
            {product.sizes.map((size) => {
              const isSelected = ml === size.ml;
              return (
                <button
                  key={size.ml}
                  type="button"
                  onClick={() => onSelectMl(size.ml)}
                  aria-pressed={isSelected}
                  className={cn(
                    "pcard-chip pcard-keep m-press-spring h-6 min-w-7 rounded-[5px] px-1.5 text-[10px] font-bold leading-6 transition-colors duration-200 sm:h-6.5 sm:text-[10.5px]",
                    isSelected
                      ? "m-size-pill-select bg-acid text-ink shadow-xs"
                      : "bg-bone/90 text-ink hover:bg-bone"
                  )}
                >
                  {size.ml}
                </button>
              );
            })}
          </div>

          <span className="h-3 w-px bg-bone/15" aria-hidden="true" />

          {/* Interactive 3-stage note swatches */}
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setActiveSwatch(null)}
          >
            {swatches.map((swatch, index) => (
              <button
                key={swatch.stage}
                type="button"
                onMouseEnter={() => setActiveSwatch(index)}
                onClick={() => setActiveSwatch((prev) => (prev === index ? null : index))}
                title={swatch.note ? l(swatch.note) : undefined}
                aria-label={swatch.note ? l(swatch.note) : swatch.stage}
                className={cn(
                  "pcard-chip h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-white/25 transition-transform duration-200 hover:scale-125",
                  activeSwatch === index && "scale-125 ring-acid"
                )}
                style={{ background: swatch.tone }}
              />
            ))}
          </div>
        </div>

        {/* Subtle active note whisper */}
        {activeNote && (
          <p
            key={activeNote.en}
            className="pcard-keep m-tooltip-pop pointer-events-none mt-1 hidden max-w-full truncate text-[8.5px] font-medium tracking-wide text-bone/60 opacity-0 group-hover/card:opacity-100 sm:block"
          >
            {l(activeNote)}
          </p>
        )}

        {/* Sleek compact Add-to-Bag button */}
        <button
          type="button"
          onClick={onAddToBag}
          className={cn(
            "pcard-chip pcard-keep m-press-spring pointer-events-none mt-2 inline-flex h-7.5 w-full max-w-[196px] shrink-0 translate-y-3 items-center justify-center gap-1.5 rounded-full px-3.5 text-[10.5px] font-bold opacity-0 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 group-hover/card:delay-[110ms] touch:pointer-events-auto touch:translate-y-0 touch:opacity-100 sm:mt-1.5 sm:h-8 sm:text-[11px]",
            added
              ? "m-card-add-success bg-acid text-ink"
              : "bg-bone text-ink hover:bg-acid"
          )}
        >
          {added ? <Check className="anim-check h-3 w-3" /> : <Bag className="h-3 w-3" />}
          <span className="truncate">{added ? t("product.added") : t("product.addToBag")}</span>
        </button>
      </div>
    </div>
  );
}
