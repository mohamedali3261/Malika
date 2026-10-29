import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { openChannel, productMessage, whatsappUrl } from "@/lib/messaging";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { Bag, Whatsapp } from "@/components/ui/icons";

/**
 * Mobile-only sticky purchase bar. Always one tap from buying, whatever the
 * scroll position, with comfortable 48px touch targets and safe-area padding.
 */
export function PurchaseBar({ product }: { product: Product }) {
  const { lang, t, l } = useLang();
  const { add, open } = useCart();
  const { settings } = useStore();
  const { push } = useToast();
  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);
  const selected = product.sizes.find((size) => size.ml === ml) ?? product.sizes[0];

  const addToBag = () => {
    if (!selected) return;
    add(product, selected.ml, selected.price);
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
  };

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-bone/95 px-3 pt-2.5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold leading-tight">{l(product.name)}</p>
          <p className="mt-0.5 text-[13px] font-extrabold leading-tight">{formatPrice(selected?.price ?? product.price, lang)}</p>
        </div>
        <div className="flex shrink-0 gap-1" role="group" aria-label={t("product.chooseSize")}>
          {product.sizes.map((size) => (
            <button
              key={size.ml}
              onClick={() => setMl(size.ml)}
              aria-pressed={ml === size.ml}
              className={cn(
                "h-11 min-w-11 rounded-xl border px-2 text-[12px] font-bold transition",
                ml === size.ml ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/70"
              )}
            >
              {size.ml}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-2 grid max-w-xl grid-cols-[1.15fr_1fr_auto] gap-2">
        <button
          onClick={addToBag}
          className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-ink text-[12px] font-bold text-bone active:scale-[0.98]"
        >
          <Bag className="h-4 w-4" /> {t("product.stickyAdd")}
        </button>
        <button
          onClick={() =>
            openChannel(
              whatsappUrl(
                settings.whatsapp,
                productMessage(product, selected?.ml ?? 50, selected?.price ?? product.price, lang)
              )
            )
          }
          className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-acid text-[12px] font-bold text-ink active:scale-[0.98]"
        >
          <Whatsapp className="h-4 w-4" /> {t("product.stickyOrder")}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 text-ink"
          aria-label={t("product.viewFull")}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V5M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
