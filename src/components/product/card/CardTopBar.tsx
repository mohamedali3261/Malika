import { Eye, Heart } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import type { CSSProperties } from "react";

interface CardTopBarProps {
  product: Product;
  discount: number | null;
  wished: boolean;
  heartBurst: number;
  onToggleWishlist: () => void;
  onQuickView: () => void;
}

export function CardTopBar({
  product,
  discount,
  wished,
  heartBurst,
  onToggleWishlist,
  onQuickView,
}: CardTopBarProps) {
  const { t, x } = useLang();

  return (
    <>
      {/* Compact Staggered Badges */}
      <div className="pcard-compact-scope absolute start-2.5 top-2.5 z-30 flex flex-col items-start gap-1 sm:start-3 sm:top-3">
        {product.isNew && (
          <span
            className="pcard-keep m-card-badge-slide rounded-full bg-ink px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-bone"
            style={{ "--m-delay": "30ms" } as CSSProperties}
          >
            {t("product.new")}
          </span>
        )}
        {product.bestseller && (
          <span
            className="pcard-keep m-card-badge-slide rounded-full bg-bone px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-ink shadow-xs"
            style={{ "--m-delay": "90ms" } as CSSProperties}
          >
            {t("product.bestseller")}
          </span>
        )}
        {discount && (
          <span
            dir="ltr"
            className="pcard-keep m-card-badge-slide rounded-full bg-acid px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-ink"
            style={{ "--m-delay": "140ms" } as CSSProperties}
          >
            −{discount}%
          </span>
        )}
      </div>

      {/* Wishlist + Quick View Action Stack */}
      <div className="absolute end-2.5 top-2.5 z-30 flex flex-col items-center gap-1.5 sm:end-3 sm:top-3">
        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={wished ? t("product.removeWishlist") : t("product.wishlist")}
          aria-pressed={wished}
          className={cn(
            "pcard-chip m-press-spring grid h-7.5 w-7.5 place-items-center rounded-full border transition-colors duration-300 sm:h-8 sm:w-8",
            wished
              ? "border-ink bg-ink text-bone shadow-sm"
              : "border-ink/20 bg-ink/10 text-ink hover:bg-ink hover:text-bone"
          )}
        >
          <span key={heartBurst} className={cn("grid place-items-center", heartBurst > 0 && (wished ? "m-heart-bloom" : "m-tactile-tap"))}>
            <Heart className="h-3.5 w-3.5" fill={wished ? "currentColor" : "none"} />
          </span>
        </button>

        <button
          type="button"
          onClick={onQuickView}
          aria-label={x("Quick view", "معاينة سريعة")}
          title={x("Quick view", "معاينة سريعة")}
          className="pcard-chip m-press-spring grid h-7.5 w-7.5 translate-y-1 place-items-center rounded-full border border-bone/20 bg-ink/55 text-bone opacity-0 backdrop-blur-xs transition-all duration-300 hover:border-acid hover:bg-acid hover:text-ink group-hover/card:translate-y-0 group-hover/card:opacity-100 touch:translate-y-0 touch:opacity-90 sm:h-8 sm:w-8"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
