import { Button } from "@/components/ui/Button";
import { Portal, SmartImage } from "@/components/ui/Primitives";
import { ArrowRight, Bag, Check, Minus, Plus, Sparkle, Trash, Whatsapp, X } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useBodyLock } from "@/hooks/useUi";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { cartMessage, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import { cn } from "@/utils/cn";
import { useEffect } from "react";

export function CartDrawer() {
  const { isOpen, close, lines, subtotal, setQty, remove, count, checkoutOpen, openCheckout } = useCart();
  const sheetOpen = checkoutOpen;
  const { settings } = useStore();
  const { t, lang } = useLang();
  useBodyLock(isOpen);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const remaining = Math.max(settings.freeShippingThreshold - subtotal, 0);
  const progress = Math.min(100, (subtotal / Math.max(settings.freeShippingThreshold, 1)) * 100);
  const quickMessage = cartMessage(lines, lang, settings);

  return (
    <Portal>
    <div className={cn("fixed inset-0 z-[100]", isOpen ? "pointer-events-auto" : "pointer-events-none", sheetOpen && "invisible")} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/45 backdrop-blur-[3px] transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-[min(430px,100vw)] flex-col bg-bone shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label={t("cart.title")}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Bag className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-[0.18em]">{t("cart.title")}</h2>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-bold text-bone">
              {count}
            </span>
          </div>
          <button
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-bone"
            aria-label={t("nav.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-ink/[0.04]">
              <Bag className="h-8 w-8 text-ink/40" />
            </span>
            <div>
              <p className="font-display text-3xl">{t("cart.empty")}</p>
              <p className="mt-2 text-sm text-mist">{t("cart.emptyLead")}</p>
            </div>
            <Button to="/shop" onClick={close} icon={<ArrowRight className="h-4 w-4" />}>
              {t("cart.browse")}
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/8 bg-bone-2/50 px-5 py-3">
              {remaining > 0 ? (
                <p className="text-[11px] font-medium text-ink/70">
                  <span className="font-bold text-ink">{formatPrice(remaining, lang)}</span>{" "}
                  {t("cart.shippingProgress")}
                </p>
              ) : (
                <p className="text-[11px] font-bold text-ink">✓ {t("cart.freeUnlocked")}</p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-plum to-acid transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              {lines.map((line) => (
                <div key={line.key} className="flex gap-3.5 border-b border-ink/8 py-4 sm:gap-4 sm:py-5">
                  <Link to={`/product/${line.slug}`} onClick={close} className="w-[76px] shrink-0 sm:w-[84px]">
                    <SmartImage src={line.image} alt={line.name[lang]} className="aspect-[3/4] rounded-xl" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/product/${line.slug}`} onClick={close} className="block truncate text-[13px] font-bold hover:underline">
                          {line.name[lang]}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-mist">{line.ml} ml</p>
                      </div>
                      <button onClick={() => remove(line.key)} className="text-mist transition hover:text-rose-500" aria-label={t("cart.remove")}>
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <div className="flex items-center rounded-full border border-ink/15">
                        <button onClick={() => setQty(line.key, line.qty - 1)} className="qty-btn grid place-items-center rounded-full transition hover:bg-ink/5">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-[12px] font-bold">{line.qty}</span>
                        <button onClick={() => setQty(line.key, line.qty + 1)} className="qty-btn grid place-items-center rounded-full transition hover:bg-ink/5">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-[13px] font-bold">{formatPrice(line.price * line.qty, lang)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="safe-bottom border-t border-ink/10 bg-bone px-4 pt-4 pb-3 sm:px-5 sm:py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mist">{t("cart.subtotal")}</span>
                <span className="font-display text-2xl">{formatPrice(subtotal, lang)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-mist">
                <span>{t("cart.shipping")}</span>
                <span>{subtotal >= settings.freeShippingThreshold ? t("cart.free") : t("cart.calc")}</span>
              </div>
              <Button
                variant="acid"
                full
                size="lg"
                className="mt-4"
                onClick={openCheckout}
                icon={<ArrowRight className="me-0 h-4 w-4" />}
              >
                {t("cart.detailsTitle")}
              </Button>
              <a
                href={whatsappUrl(settings.whatsapp, quickMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex h-10 items-center justify-center gap-2 rounded-full border border-ink/15 text-[11px] font-bold text-ink/70 transition hover:border-ink/40 hover:text-ink"
              >
                <Whatsapp className="h-4 w-4" /> {t("cart.quickSend")}
              </a>
              <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-bone-2/60 px-3 py-2 text-[10px] leading-relaxed text-mist">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" />
                {t("cart.cod")}
              </div>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] leading-relaxed text-mist">
                <Sparkle className="h-3 w-3" /> {t("cart.note")}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
    </Portal>
  );
}
