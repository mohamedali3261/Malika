import { Button } from "@/components/ui/Button";
import { Badge, Stars } from "@/components/ui/Primitives";
import { Check, Heart, Minus, Plus, Whatsapp } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { discountPercent, formatPrice } from "@/lib/format";
import { productMessage, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import { emitBagPulse } from "@/motion";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useState } from "react";

export function PurchasePanel({ product }: { product: Product }) {
  const { t, lang, l } = useLang();
  const { add, open } = useCart();
  const { settings, toggleWishlist, isWished } = useStore();
  const { push } = useToast();
  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);
  const [qty, setQty] = useState(1);

  const selected = product.sizes.find((size) => size.ml === ml) ?? product.sizes[0];
  const discount = discountPercent(product.price, product.compareAt);
  const wished = isWished(product.id);

  const handleAdd = () => {
    if (!selected) return;
    add(product, selected.ml, selected.price, qty);
    emitBagPulse();
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
  };

  const handleSave = () => {
    const saved = toggleWishlist(product.id);
    push(saved ? t("product.saved") : t("product.unsaved"), saved ? "success" : "info");
  };

  return (
    <div className="space-y-4">
      <nav className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-mist lg:flex" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">{t("nav.home")}</Link>
        <span>/</span>
        <Link to="/shop" className="transition hover:text-ink">{t("nav.shop")}</Link>
        <span>/</span>
        <span className="truncate text-ink/50">{l(product.name)}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-1.5">
        {product.isNew && <Badge tone="ink">{t("product.new")}</Badge>}
        {product.bestseller && <Badge tone="acid">{t("product.bestseller")}</Badge>}
        {discount && <Badge tone="lilac"><span dir="ltr">−{discount}%</span></Badge>}
      </div>

      <div>
        <h1 className="hd-page font-display leading-[0.98] tracking-tight">
          {l(product.name)}
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-mist">{l(product.tagline)}</p>
        <div className="mt-2.5">
          <Stars value={product.rating} reviews={product.reviews} size={13} />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <p className="font-display text-[1.9rem] leading-none sm:text-[2rem]">
          {formatPrice(selected?.price ?? product.price, lang)}
        </p>
        {product.compareAt && (
          <p className="text-[11px] text-mist line-through">{formatPrice(product.compareAt, lang)}</p>
        )}
        <span className="text-[10px] font-medium text-mist">/ {selected?.ml ?? 50} ml</span>
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">{t("product.size")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {product.sizes.map((size) => (
            <button
              key={size.ml}
              onClick={() => setMl(size.ml)}
              className={cn(
                "relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-start transition",
                ml === size.ml
                  ? "border-ink bg-ink text-bone shadow-sm"
                  : "border-ink/10 bg-white/60 text-ink hover:border-ink/30"
              )}
            >
              <span className="text-[12px] font-bold">{size.ml} ml</span>
              <span className={cn("text-[10px]", ml === size.ml ? "text-bone/60" : "text-mist")}>
                {formatPrice(size.price, lang)}
              </span>
              {ml === size.ml && <Check className="absolute end-2 top-2 h-3 w-3 text-acid" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <div className="flex h-11 items-center rounded-full border border-ink/12 bg-white">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="decrease">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-7 text-center text-[12px] font-bold">{qty}</span>
          <button onClick={() => setQty(Math.min(20, qty + 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5" aria-label="increase">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleAdd}>
          {t("product.addToBag")}
        </Button>
        <button
          onClick={handleSave}
          aria-label={wished ? t("product.removeWishlist") : t("product.wishlist")}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full border transition",
            wished ? "border-ink bg-ink text-acid" : "border-ink/12 bg-white text-ink hover:border-ink/30"
          )}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <Button
        variant="outline"
        full
        href={whatsappUrl(settings.whatsapp, productMessage(product, selected?.ml ?? 50, selected?.price ?? product.price, lang))}
        icon={<Whatsapp className="h-4 w-4" />}
        iconPosition="start"
        className="border-ink/12"
      >
        {t("product.buyWhatsapp")}
      </Button>

      <p className="text-center text-[10px] leading-relaxed text-mist">
        {lang === "ar" ? "الدفع عند الاستلام · توصيل لكل المحافظات" : "Cash on delivery · Delivery across Egypt"}
      </p>
    </div>
  );
}
