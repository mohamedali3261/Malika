import { QuickView } from "@/components/product/QuickView";
import { Check, Heart } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAsset } from "@/lib/assets";
import { discountPercent, formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { memo, useMemo, useState, type CSSProperties } from "react";
import "@/styles/product-card.css";

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

function ProductCardBase({ product, priority, className }: ProductCardProps) {
  const { lang, t, l } = useLang();
  const { add, open } = useCart();
  const { toggleWishlist, isWished } = useStore();
  const { push } = useToast();

  const [quickOpen, setQuickOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);

  const wished = isWished(product.id);
  const selected = product.sizes.find((size) => size.ml === ml) ?? initial;
  const discount = discountPercent(selected?.price ?? product.price, product.compareAt);
  const [cutoutFailed, setCutoutFailed] = useState(false);
  // A broken cut-out path falls back to the product photograph instead of a hole.
  const image = resolveAsset(cutoutFailed || !product.cutout ? product.images[0] : product.cutout);

  /** Stable per-product tilt, derived from the slug. */
  const tilt = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.slug.length; i += 1) {
      hash = (hash * 31 + product.slug.charCodeAt(i)) % 1000;
    }
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
      className={cn("pc-card", className)}
      style={{ "--pc-accent": product.accent } as CSSProperties}
    >
      {/* Accent disc — expands out of the corner on hover (always open on touch). */}
      <span aria-hidden="true" className="pc-disc" />

      {/* Oversized watermark of the scent's own name. */}
      <span aria-hidden="true" className="pc-watermark">
        {watermark}
      </span>

      {/* Badges */}
      <div className="pc-badges">
        {product.isNew && <span className="pc-badge pc-badge--dark">{t("product.new")}</span>}
        {product.bestseller && <span className="pc-badge pc-badge--light">{t("product.bestseller")}</span>}
        {discount && (
          <span dir="ltr" className="pc-badge pc-badge--dark pc-badge--discount">
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
        className={cn("pc-wish", wished && "pc-wish--active")}
      >
        <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
      </button>

      {/* Bottle — centred, then lifts to the top on hover. */}
      <Link to={`/product/${product.slug}`} aria-label={l(product.name)} className="pc-bottle-link">
        <img
          src={image}
          alt={l(product.name)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={() => setCutoutFailed(true)}
          style={{ "--tilt": `${tilt.idle}deg`, "--tilt-open": `${tilt.open}deg` } as CSSProperties}
          className="pc-bottle-img"
        />
      </Link>

      {/* Content panel — grows on hover to reveal the details. */}
      <div className="pc-panel">
        <div className="pc-panel-inner">
          <h3 className="pc-title font-display">{l(product.name)}</h3>
          <p className="pc-price-row">
            <span className="pc-price">{formatPrice(selected?.price ?? product.price, lang)}</span>
            {product.compareAt && product.compareAt > (selected?.price ?? product.price) && (
              <span className="pc-compare">{formatPrice(product.compareAt, lang)}</span>
            )}
          </p>

          {/* Sizes */}
          <div className="pc-sizes">
            <span className="pc-row-label">{t("product.size")}</span>
            {product.sizes.map((size) => (
              <button
                key={size.ml}
                type="button"
                onClick={() => setMl(size.ml)}
                aria-pressed={ml === size.ml}
                className={cn("pc-size-btn", ml === size.ml && "pc-size-btn--active")}
              >
                {size.ml}
              </button>
            ))}
          </div>

          {/* Buy */}
          <button
            type="button"
            onClick={addToBag}
            className={cn("pc-buy-btn", added && "pc-buy-btn--added")}
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
