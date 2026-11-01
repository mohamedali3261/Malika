import { CardBottleStage } from "@/components/product/card/CardBottleStage";
import { CardDetailsTray } from "@/components/product/card/CardDetailsTray";
import { CardTopBar } from "@/components/product/card/CardTopBar";
import { buildSwatches, computeBottleTilt } from "@/components/product/card/colorUtils";
import { QuickView } from "@/components/product/QuickView";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAsset } from "@/lib/assets";
import { discountPercent } from "@/lib/format";
import { emitBagPulse, useCardTilt3D } from "@/motion";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { memo, useMemo, useState } from "react";

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  /** Extra-compact density mode used in high-density 5-column shop grids. */
  dense?: boolean;
  className?: string;
}

function ProductCardBase({ product, priority, dense, className }: ProductCardProps) {
  const { lang, t, l } = useLang();
  const { add, open } = useCart();
  const { toggleWishlist, isWished } = useStore();
  const { push } = useToast();
  const { ref, onPointerMove, onPointerLeave } = useCardTilt3D<HTMLElement>(4.5);

  const [quickOpen, setQuickOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  const [cutoutFailed, setCutoutFailed] = useState(false);

  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);

  const wished = isWished(product.id);
  const discount = discountPercent(product.price, product.compareAt);
  const selected = product.sizes.find((size) => size.ml === ml) ?? initial;
  const image = resolveAsset(cutoutFailed || !product.cutout ? product.images[0] : product.cutout);

  const swatches = useMemo(() => buildSwatches(product), [product]);
  const tilt = useMemo(() => computeBottleTilt(product.slug), [product.slug]);
  const watermark = (lang === "ar" ? product.name.ar : product.name.en).split(" ")[0];

  const addToBag = () => {
    if (!selected) return;
    add(product, selected.ml, selected.price);
    emitBagPulse();
    setAdded(true);
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleSave = () => {
    const saved = toggleWishlist(product.id);
    setHeartBurst((count) => count + 1);
    push(saved ? t("product.saved") : t("product.unsaved"), saved ? "success" : "info");
  };

  return (
    <article
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "card-lazy m-tilt-3d-surface group/card relative mx-auto w-full overflow-hidden rounded-[18px] border border-bone/[0.08] bg-plum shadow-[0_14px_36px_-22px_rgba(20,16,25,0.85)] hover:border-bone/20 hover:shadow-[0_26px_54px_-24px_rgba(20,16,25,0.98)]",
        dense
          ? "h-[288px] max-w-[244px] sm:h-[312px]"
          : "h-[304px] max-w-[272px] sm:h-[340px]",
        className
      )}
    >
      <CardBottleStage
        product={product}
        image={image}
        watermark={watermark}
        tilt={tilt}
        priority={priority}
        dense={dense}
        onImageError={() => setCutoutFailed(true)}
      />

      <CardTopBar
        product={product}
        discount={discount}
        wished={wished}
        heartBurst={heartBurst}
        onToggleWishlist={handleSave}
        onQuickView={() => setQuickOpen(true)}
      />

      <CardDetailsTray
        product={product}
        ml={ml}
        selectedPrice={selected?.price ?? product.price}
        swatches={swatches}
        added={added}
        dense={dense}
        onSelectMl={setMl}
        onAddToBag={addToBag}
      />

      {quickOpen && <QuickView product={product} open onClose={() => setQuickOpen(false)} />}
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
