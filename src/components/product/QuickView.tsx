import { Badge, Portal, SmartImage, Stars } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Check, Whatsapp, X } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useBodyLock } from "@/hooks/useUi";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice, discountPercent } from "@/lib/format";
import { openChannel, productMessage, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { lang, t, l } = useLang();
  const { add, open: openCart } = useCart();
  const { settings } = useStore();
  const { push } = useToast();
  const [ml, setMl] = useState(() => {
    const fifty = product.sizes.find((size) => size.ml === 50);
    return fifty?.ml ?? product.sizes[0]?.ml ?? 50;
  });
  useBodyLock(open);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const fifty = product.sizes.find((size) => size.ml === 50);
    setMl(fifty?.ml ?? product.sizes[0]?.ml ?? 50);
  }, [open, product]);

  const selected = product.sizes.find((size) => size.ml === ml) ?? product.sizes[0];
  const discount = discountPercent(product.price, product.compareAt);
  const noteChips = [...product.notes.top, ...product.notes.heart].slice(0, 5);

  const addToBag = () => {
    add(product, selected.ml, selected.price);
    push(`${l(product.name)} · ${t("product.added")}`);
    onClose();
    openCart();
  };

  if (!open) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div onClick={onClose} className="anim-fade absolute inset-0 bg-ink/55 backdrop-blur-sm" />
      <div className="anim-pop relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-t-[2rem] bg-bone shadow-2xl sm:rounded-[2rem] sm:overflow-hidden">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-bone/90 text-ink shadow-md backdrop-blur transition hover:bg-ink hover:text-bone"
          aria-label={t("nav.close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative p-4 sm:p-5" style={{ background: `linear-gradient(160deg, ${product.accent}4D, #efe9dd)` }}>
            <SmartImage
              src={product.images[0]}
              alt={l(product.name)}
              priority
              className="aspect-[4/5] w-full rounded-[1.4rem]"
            />
            <div className="absolute start-7 top-7 flex flex-col gap-1.5">
              {product.isNew && <Badge tone="ink">{t("product.new")}</Badge>}
              {discount && <Badge tone="lilac" className="dir-ltr">−{discount}%</Badge>}
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-mist">
              <span>{t(`shop.${product.category}`)}</span>
              <span className="h-1 w-1 rounded-full bg-ink/20" />
              <span>{t(`shop.${product.gender}`)}</span>
            </div>
            <h3 className="font-display mt-2 text-4xl leading-none">{l(product.name)}</h3>
            <p className="mt-1.5 text-[12px] text-mist">{l(product.tagline)}</p>
            <div className="mt-3">
              <Stars value={product.rating} reviews={product.reviews} />
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink/70">{l(product.description)}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {noteChips.map((note) => (
                <span key={note.en} className="rounded-full border border-ink/12 px-2.5 py-1 text-[10px] font-medium text-ink/70">
                  {l(note)}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist">{t("product.size")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.ml}
                    onClick={() => setMl(size.ml)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-[11px] font-bold transition-all",
                      ml === size.ml
                        ? "border-ink bg-ink text-bone"
                        : "border-ink/15 text-ink/70 hover:border-ink/50"
                    )}
                  >
                    {size.ml} ml
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-mist">{t("product.from")}</p>
                  <p className="font-display text-3xl">{formatPrice(selected.price, lang)}</p>
                </div>
                {product.compareAt && (
                  <p className="text-[12px] text-mist line-through">{formatPrice(product.compareAt, lang)}</p>
                )}
              </div>
              <div className="safe-bottom sticky bottom-0 -mx-1 mt-4 grid gap-2 rounded-t-2xl border-t border-ink/10 bg-bone/95 px-1 pb-2 pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                <Button variant="acid" full onClick={addToBag} icon={<Check className="h-4 w-4" />} iconPosition="start">
                  {t("product.addToBag")}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChannel(whatsappUrl(settings.whatsapp, productMessage(product, selected.ml, selected.price, lang)))}
                    icon={<Whatsapp className="h-3.5 w-3.5" />}
                    iconPosition="start"
                  >
                    WhatsApp
                  </Button>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink px-4 text-[12px] font-semibold text-bone transition hover:bg-plum"
                  >
                    {t("product.viewFull")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}
