import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { discountPercent, formatPrice } from "@/lib/format";
import { resolveAsset } from "@/lib/assets";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { memo, useMemo, useState, type CSSProperties } from "react";
import { Check, Heart } from "@/components/ui/icons";
import { QuickView } from "@/components/product/QuickView";

/* Lighten / darken a hex colour — used to derive the three note swatches. */
function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = Number.parseInt(clean, 16);
  const channel = (shift: number) => {
    const base = (num >> shift) & 0xff;
    const next = Math.round(base + (amount < 0 ? base : 255 - base) * amount);
    return Math.min(255, Math.max(0, next));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

function ProductCardBase({
  product,
  priority,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { lang, t, l } = useLang();
  const { add, open } = useCart();
  const { toggleWishlist, isWished } = useStore();
  const { push } = useToast();

  const [quickOpen, setQuickOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);

  const wished = isWished(product.id);
  const discount = discountPercent(product.price, product.compareAt);
  const selected = product.sizes.find((size) => size.ml === ml) ?? initial;
  const [cutoutFailed, setCutoutFailed] = useState(false);
  // A broken cut-out path falls back to the product photograph instead of a hole.
  const image = resolveAsset(cutoutFailed || !product.cutout ? product.images[0] : product.cutout);

  /** Top / heart / base swatches derived from the product's own accent. */
  const swatches = useMemo(
    () => [
      { tone: shade(product.accent, 0.42), note: product.notes.top[0] },
      { tone: product.accent, note: product.notes.heart[0] },
      { tone: shade(product.accent, -0.38), note: product.notes.base[0] },
    ],
    [product.accent, product.notes]
  );

  /** Stable per-product tilt, derived from the slug. */
  const tilt = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.slug.length; i += 1) hash = (hash * 31 + product.slug.charCodeAt(i)) % 1000;
    return { idle: -28 + (hash % 13), open: -18 + (hash % 9) };
  }, [product.slug]);

  /** Watermark word behind the bottle — the product's own name. */
  const watermark = (lang === "ar" ? product.name.ar : product.name.en).split(" ")[0];

  const addToBag = () => {
    if (!selected) return;
    add(product, selected.ml, selected.price);
    setAdded(true);
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleSave = () => {
    const saved = toggleWishlist(product.id);
    push(saved ? t("product.saved") : t("product.unsaved"), saved ? "success" : "info");
  };

  return (
    <article
      className={cn(
        "group/card relative mx-auto h-[460px] w-full max-w-[340px] overflow-hidden rounded-[22px] bg-plum shadow-[0_18px_50px_-30px_rgba(20,16,25,0.9)] transition-shadow duration-500 hover:shadow-[0_34px_70px_-32px_rgba(20,16,25,1)] sm:h-[470px]",
        className
      )}
    >
      {/* Accent disc — expands out of the corner on hover (always open on touch). */}
      <span
        aria-hidden="true"
        className="absolute inset-0 transition-[clip-path] duration-500 ease-in-out [clip-path:circle(140px_at_80%_18%)] group-hover/card:[clip-path:circle(330px_at_80%_-18%)] touch:[clip-path:circle(330px_at_80%_-18%)] rtl:[clip-path:circle(140px_at_20%_18%)] rtl:group-hover/card:[clip-path:circle(330px_at_20%_-18%)] rtl:touch:[clip-path:circle(330px_at_20%_-18%)]"
        style={{ background: product.accent }}
      />

      {/* Oversized watermark of the scent's own name. */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute top-[26%] -start-[14%] select-none whitespace-nowrap text-[8.5rem] font-extrabold italic leading-none text-bone/[0.07]"
      >
        {watermark}
      </span>

      {/* Badges */}
      <div className="absolute start-4 top-4 z-30 flex flex-col items-start gap-1.5">
        {product.isNew && (
          <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-bone">
            {t("product.new")}
          </span>
        )}
        {product.bestseller && (
          <span className="rounded-full bg-bone px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-ink">
            {t("product.bestseller")}
          </span>
        )}
        {discount && (
          <span dir="ltr" className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-bone">
            −{discount}%
          </span>
        )}
      </div>

      {/* Wishlist — sits on the accent disc, so it uses ink for contrast. */}
      <button
        type="button"
        onClick={handleSave}
        aria-label={wished ? t("product.removeWishlist") : t("product.wishlist")}
        aria-pressed={wished}
        className={cn(
          "press absolute end-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300",
          wished ? "border-ink bg-ink text-bone" : "border-ink/25 bg-ink/10 text-ink hover:bg-ink hover:text-bone"
        )}
      >
        <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
      </button>

      {/* Bottle — centred, then lifts to the top on hover. */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={l(product.name)}
        className="absolute top-1/2 z-20 block h-[230px] w-full -translate-y-1/2 transition-all duration-500 ease-out group-hover/card:top-[10px] group-hover/card:translate-y-0 touch:top-[10px] touch:translate-y-0"
      >
        <img
          src={image}
          alt={l(product.name)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={() => setCutoutFailed(true)}
          style={{ "--tilt": `${tilt.idle}deg`, "--tilt-open": `${tilt.open}deg` } as CSSProperties}
          className="absolute start-1/2 top-1/2 h-[252px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 rotate-(--tilt) object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover/card:rotate-(--tilt-open) group-hover/card:scale-[0.74] touch:rotate-(--tilt-open) touch:scale-[0.74] rtl:translate-x-1/2"
        />
      </Link>

      {/* Content panel — grows on hover to reveal the details. */}
      <div className="absolute bottom-0 z-20 h-[108px] w-full text-center transition-[height] duration-700 ease-out group-hover/card:h-[238px] touch:h-[238px]">
        <div className="flex h-full flex-col items-center justify-start px-4 pt-3">
          <h3 className="font-display w-full shrink-0 truncate text-[20px] leading-tight tracking-tight text-bone">
            {l(product.name)}
          </h3>
          <p className="mt-0.5 flex shrink-0 items-baseline justify-center gap-1.5">
            <span className="text-[15px] font-extrabold text-bone">
              {formatPrice(selected?.price ?? product.price, lang)}
            </span>
            {product.compareAt && (
              <span className="text-[11px] text-bone/40 line-through">{formatPrice(product.compareAt, lang)}</span>
            )}
          </p>

          {/* Sizes */}
          <div className="invisible flex shrink-0 items-center justify-center gap-2 pt-3 opacity-0 transition-opacity duration-500 group-hover/card:visible group-hover/card:opacity-100 group-hover/card:delay-[400ms] touch:visible touch:opacity-100">
            <span className="text-[11px] font-light uppercase tracking-[0.14em] text-bone/70">
              {t("product.size")}
            </span>
            {product.sizes.map((size) => (
              <button
                key={size.ml}
                type="button"
                onClick={() => setMl(size.ml)}
                aria-pressed={ml === size.ml}
                className={cn(
                  "h-7 min-w-8 rounded-[5px] px-1.5 text-[12px] font-bold leading-7 transition-colors duration-300",
                  ml === size.ml ? "bg-ink text-bone" : "bg-bone text-ink hover:bg-acid"
                )}
              >
                {size.ml}
              </button>
            ))}
          </div>

          {/* Note swatches */}
          <div className="invisible flex shrink-0 items-center justify-center gap-2 pt-2.5 opacity-0 transition-opacity duration-500 group-hover/card:visible group-hover/card:opacity-100 group-hover/card:delay-[520ms] touch:visible touch:opacity-100">
            <span className="text-[11px] font-light uppercase tracking-[0.14em] text-bone/70">
              {t("product.notesShort")}
            </span>
            {swatches.map((swatch, index) => (
              <span
                key={index}
                title={swatch.note ? l(swatch.note) : undefined}
                className="h-[18px] w-[18px] rounded-full ring-1 ring-inset ring-black/15"
                style={{ background: swatch.tone }}
              />
            ))}
          </div>

          {/* Buy */}
          <button
            type="button"
            onClick={addToBag}
            className={cn(
              "mt-3.5 inline-flex shrink-0 translate-y-10 items-center gap-1.5 rounded-[6px] px-5 py-2.5 text-[12px] font-bold opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-hover/card:delay-[640ms] touch:translate-y-0 touch:opacity-100",
              added ? "bg-acid text-ink" : "bg-bone text-ink hover:bg-acid"
            )}
          >
            {added && <Check className="anim-check h-3.5 w-3.5" />}
            {added ? t("product.added") : t("product.addToBag")}
          </button>
        </div>
      </div>

      {/* Quick view only mounts when opened. */}
      {quickOpen && <QuickView product={product} open onClose={() => setQuickOpen(false)} />}
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
