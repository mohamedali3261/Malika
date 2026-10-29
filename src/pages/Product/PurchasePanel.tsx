import { Button } from "@/components/ui/Button";
import { Badge, Stars } from "@/components/ui/Primitives";
import { Check, Gift, Heart, Leaf, Messenger, Minus, Plus, Share, Shield, Truck, Whatsapp } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { discountPercent, formatPrice } from "@/lib/format";
import { copyText, messengerUrl, openChannel, productMessage, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useState } from "react";

export function PurchasePanel({ product }: { product: Product }) {
  const { t, lang, l, x } = useLang();
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
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/product/${product.slug}`;
    const text =
      lang === "ar"
        ? `${l(product.name)} من مليكة — ${l(product.tagline)}`
        : `${product.name.en} by MALIKA — ${product.tagline.en}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: l(product.name), text, url });
        return;
      } catch {
        // user cancelled or unsupported — fall back to clipboard
      }
    }
    const ok = await copyText(`${text}\n${url}`);
    push(ok ? t("product.linkCopied") : t("product.share"), ok ? "success" : "error");
  };

  const handleSave = () => {
    const saved = toggleWishlist(product.id);
    push(saved ? t("product.saved") : t("product.unsaved"), saved ? "success" : "info");
  };

  return (
    <div>
      <nav className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-mist lg:flex" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-ink">{t("nav.home")}</Link>
        <span>/</span>
        <Link to="/shop" className="transition hover:text-ink">{t("nav.shop")}</Link>
        <span>/</span>
        <span className="truncate text-ink/60">{l(product.name)}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {product.isNew && <Badge tone="ink">{t("product.new")}</Badge>}
        {product.bestseller && <Badge tone="acid">{t("product.bestseller")}</Badge>}
        {discount && <Badge tone="lilac"><span dir="ltr">−{discount}%</span> {t("product.sale")}</Badge>}
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-mist">
          {t(`shop.${product.category}`)} · {t(`shop.${product.gender}`)}
        </span>
      </div>

      <h1 className="hd-page font-display mt-3 leading-[0.98] tracking-tight">
        {l(product.name)}
      </h1>
      <p className="mt-2 text-[13px] text-mist">{l(product.tagline)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Stars value={product.rating} reviews={product.reviews} size={13} />
        <span className="h-3 w-px bg-ink/15" />
        <span className="text-[10px] font-semibold text-mist">{t("product.inStock")}</span>
      </div>

      <p className="mt-5 max-w-lg text-[13px] leading-relaxed text-ink/70">{l(product.description)}</p>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <p className="font-display whitespace-nowrap text-[1.9rem] leading-none sm:text-[2.1rem]">
          {formatPrice(selected?.price ?? product.price, lang)}
        </p>
        {product.compareAt && (
          <p className="whitespace-nowrap text-[12px] text-mist line-through">{formatPrice(product.compareAt, lang)}</p>
        )}
        <span className="whitespace-nowrap text-[10px] font-medium text-mist">
          / {selected?.ml ?? 50} ml
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">{t("product.size")}</p>
          <p className="text-[9px] text-mist">{x("extrait · 30% concentration", "إكستريه · ٣٠٪ تركيز")}</p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {product.sizes.map((size) => (
            <button
              key={size.ml}
              onClick={() => setMl(size.ml)}
              className={cn(
                "group relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-start transition-all duration-300",
                ml === size.ml
                  ? "border-ink bg-ink text-bone shadow-md"
                  : "border-ink/12 bg-white/40 text-ink hover:border-ink/40"
              )}
            >
              <span className="text-[12px] font-bold">{size.ml} ml</span>
              <span className={cn("text-[9.5px]", ml === size.ml ? "text-bone/55" : "text-mist")}>
                <span className="whitespace-nowrap">{formatPrice(size.price, lang)}</span>
              </span>
              {ml === size.ml && <Check className="absolute end-2 top-2 h-3 w-3 text-acid" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="flex h-12 items-center rounded-full border border-ink/15 bg-white/40">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-10 place-items-center rounded-full transition hover:bg-ink/5" aria-label="decrease">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-[12px] font-bold">{qty}</span>
          <button onClick={() => setQty(Math.min(20, qty + 1))} className="grid h-11 w-10 place-items-center rounded-full transition hover:bg-ink/5" aria-label="increase">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleAdd} icon={<Plus className="h-4 w-4" />} iconPosition="start">
          {t("product.addToBag")}
        </Button>
        <button
          onClick={handleSave}
          aria-label={wished ? t("product.removeWishlist") : t("product.wishlist")}
          className={cn(
            "grid h-12 w-12 place-items-center rounded-full border transition-all",
            wished ? "border-ink bg-ink text-acid" : "border-ink/15 bg-white/40 text-ink hover:border-ink"
          )}
        >
          <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        <Button
          variant="acid"
          href={whatsappUrl(settings.whatsapp, productMessage(product, selected?.ml ?? 50, selected?.price ?? product.price, lang))}
          icon={<Whatsapp className="h-4 w-4" />}
          iconPosition="start"
        >
          {t("product.buyWhatsapp")}
        </Button>
        <Button
          variant="outline"
          onClick={() => openChannel(messengerUrl(settings.messenger))}
          icon={<Messenger className="h-4 w-4" />}
          iconPosition="start"
        >
          {t("product.orderMessenger")}
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-mist">
        <button onClick={share} className="inline-flex min-h-8 items-center gap-1.5 font-semibold transition hover:text-ink">
          <Share className="h-3.5 w-3.5" /> {t("product.share")}
        </button>
        <span className="inline-flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5 text-plum" /> {t("product.giftNote")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-ink/10 rounded-2xl border border-ink/10 bg-white/35 py-3.5 rtl:divide-x-reverse">
        {[
          { icon: Truck, label: x("1–4 day delivery", "توصيل ١–٤ أيام") },
          { icon: Shield, label: x("cash on delivery", "دفع عند الاستلام") },
          { icon: Leaf, label: x("cruelty-free", "خالٍ من القسوة") },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 px-2 text-center">
            <Icon className="h-4 w-4 text-plum" />
            <span className="text-[8.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-mist">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-mist">
        <span>{t("product.longevity")}: <strong className="text-ink">{product.longevity}</strong></span>
        <span>{t("product.sillage")}: <strong className="text-ink">{l(product.sillage)}</strong></span>
      </div>
    </div>
  );
}
