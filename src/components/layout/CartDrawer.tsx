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
import { useEffect, useMemo } from "react";

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

  const quickMessage = cartMessage(lines, lang, settings);
  const freeThreshold = settings.freeShippingThreshold;
  const progress = useMemo(() => Math.min(100, Math.round((subtotal / freeThreshold) * 100)), [subtotal, freeThreshold]);
  const remaining = Math.max(0, freeThreshold - subtotal);

  return (
    <Portal>
    <div className={cn("fixed inset-0 z-[100]", isOpen ? "pointer-events-auto" : "pointer-events-none", sheetOpen && "invisible")} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity duration-400",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-[420px] flex-col bg-bone shadow-[-16px_0_64px_-20px_rgba(20,16,25,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label={t("cart.title")}
      >
        {/* Premium header */}
        <div className="relative overflow-hidden border-b border-ink/10 bg-ink px-5 py-4 text-bone">
          <div className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-lilac/20 blur-2xl" />
          <div className="pointer-events-none absolute -start-10 -bottom-10 h-24 w-24 rounded-full bg-acid/15 blur-xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-bone text-ink">
                <Bag className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">{t("cart.title")}</h2>
                <p className="text-[10px] text-bone/60">{count === 0 ? t("cart.empty") : lang === "ar" ? `${count} منتجات` : `${count} items`}</p>
              </div>
              {count > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-acid px-2 text-[11px] font-bold text-[#141019]">
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-full bg-bone/10 text-bone backdrop-blur transition hover:bg-bone hover:text-ink"
              aria-label={t("nav.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-12 text-center">
            <div className="relative">
              <span className="grid h-24 w-24 place-items-center rounded-[1.5rem] bg-surface shadow-[0_12px_32px_-16px_rgba(20,16,25,0.18)] ring-1 ring-ink/5">
                <Bag className="h-9 w-9 text-ink/30" />
              </span>
              <span className="absolute -end-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] text-bone">0</span>
            </div>
            <div>
              <p className="font-display text-3xl leading-none">{t("cart.empty")}</p>
              <p className="mx-auto mt-2 max-w-[22ch] text-sm leading-relaxed text-mist">{t("cart.emptyLead")}</p>
            </div>
            <Button to="/shop" onClick={close} variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
              {t("cart.browse")}
            </Button>
            <p className="flex items-center gap-1.5 text-[10px] text-mist">
              <Sparkle className="h-3 w-3" /> {lang === "ar" ? "توصيل خلال ١–٤ أيام لكل المحافظات" : "Delivery 1–4 days across Egypt"}
            </p>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-ink/5 bg-surface px-5 py-3">
              {subtotal >= freeThreshold ? (
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> {lang === "ar" ? "مبروك — توصيل مجاني!" : "You’ve unlocked free shipping!"}
                </p>
              ) : (
                <div>
                  <p className="text-[11px] font-medium text-ink/70">
                    {lang === "ar"
                      ? `أضف ${formatPrice(remaining, lang)} للوصول للشحن المجاني`
                      : `Add ${formatPrice(remaining, lang)} for free shipping`}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8">
                    <div className="h-full rounded-full bg-acid transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-bone-2/40 p-3">
              {lines.map((line) => (
                <div key={line.key} className="flex gap-3 rounded-2xl border border-ink/6 bg-surface p-3 shadow-[0_8px_24px_-16px_rgba(20,16,25,0.15)]">
                  <Link to={`/product/${line.slug}`} onClick={close} className="w-[84px] shrink-0 overflow-hidden rounded-xl bg-bone-2/60">
                    <SmartImage src={line.image} alt={line.name[lang]} className="aspect-[3/4] w-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${line.slug}`} onClick={close} className="line-clamp-2 text-[13px] font-bold leading-tight hover:underline">
                        {line.name[lang]}
                      </Link>
                      <button onClick={() => remove(line.key)} className="grid h-7 w-7 place-items-center rounded-full bg-ink/5 text-mist transition hover:bg-rose-50 hover:text-rose-500" aria-label={t("cart.remove")}>
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-[11px] text-mist">{line.ml} ml · <span dir="ltr">{formatPrice(line.price, lang)}</span></p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-ink/10 bg-bone-2/50 p-0.5">
                        <button onClick={() => setQty(line.key, line.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-surface shadow-sm transition hover:bg-ink hover:text-bone">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-[12px] font-bold">{line.qty}</span>
                        <button onClick={() => setQty(line.key, line.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-surface shadow-sm transition hover:bg-ink hover:text-bone">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-display text-[15px] font-semibold">{formatPrice(line.price * line.qty, lang)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="safe-bottom border-t border-ink/10 bg-surface px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-mist">{t("cart.subtotal")}</span>
                <span className="font-display text-2xl">{formatPrice(subtotal, lang)}</span>
              </div>
              <p className="mt-1 text-[10px] text-mist">{lang === "ar" ? "الشحن يُحسب حسب المحافظة عند إتمام الطلب" : "Shipping calculated at checkout by governorate"}</p>

              <Button variant="acid" full size="lg" className="mt-4 shadow-md" onClick={openCheckout} icon={<ArrowRight className="h-4 w-4" />}>
                {t("cart.detailsTitle")}
              </Button>
              <a
                href={whatsappUrl(settings.whatsapp, quickMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex h-11 items-center justify-center gap-2 rounded-full border border-ink/12 bg-surface text-[11px] font-bold text-ink/70 transition hover:border-ink/30 hover:text-ink"
              >
                <Whatsapp className="h-4 w-4" /> {t("cart.quickSend")}
              </a>
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-acid/20 px-3 py-2 text-[10px] font-semibold text-[#141019]">
                <Check className="h-3.5 w-3.5" /> {t("cart.cod")}
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
    </Portal>
  );
}
