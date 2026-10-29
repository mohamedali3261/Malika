import { Check, Heart } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { discountPercent, formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import { LongevityRing } from "@/pages/Shop/LongevityRing";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useState, type CSSProperties } from "react";

interface Props {
  product: Product;
  index: number;
  total: number;
  active: boolean;
}

/** Staggered entrance: each block rises in, one after another, once its slide is active. */
const REVEAL =
  "translate-y-9 opacity-0 transition-[opacity,translate] duration-500 ease-out group-data-[on=true]/slide:translate-y-0 group-data-[on=true]/slide:opacity-100";

const GROUP_TITLE = "mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone/65";

export function ShopSlide({ product, index, total, active }: Props) {
  const { lang, t, l, x } = useLang();
  const { add, open } = useCart();
  const { toggleWishlist, isWished } = useStore();
  const { push } = useToast();

  const initial = product.sizes.find((size) => size.ml === 50) ?? product.sizes[0];
  const [ml, setMl] = useState(initial?.ml ?? 50);
  const [added, setAdded] = useState(false);
  const [sparks, setSparks] = useState(0);

  const selected = product.sizes.find((size) => size.ml === ml) ?? initial;
  const price = selected?.price ?? product.price;
  const wished = isWished(product.id);
  const discount = discountPercent(product.price, product.compareAt);
  const unit = x("ml", "مل");

  const notes = [product.notes.top[0], product.notes.heart[0], product.notes.base[0]].filter(Boolean);

  const delay = (step: number): CSSProperties => ({ transitionDelay: active ? `${step * 110 + 170}ms` : "0ms" });

  const addToBag = () => {
    if (!selected) return;
    add(product, selected.ml, selected.price);
    setAdded(true);
    push(`${l(product.name)} · ${t("product.added")}`);
    open();
    window.setTimeout(() => setAdded(false), 1700);
  };

  const toggleHeart = () => {
    const nowSaved = toggleWishlist(product.id);
    if (nowSaved) setSparks((value) => value + 1);
    push(nowSaved ? t("product.saved") : t("product.unsaved"), nowSaved ? "success" : "info");
  };

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total} — ${l(product.name)}`}
      aria-hidden={!active}
      inert={!active}
      data-on={active}
      className={cn(
        "group/slide transition-opacity duration-500 [grid-area:1/1]",
        active ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="relative flex h-full items-start overflow-hidden rounded-[22px] lg:items-center lg:rounded-[30px]">
        {/* cover: ink → plum, lit from the corner by this scent's accent */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 110% at 100% 0%, var(--acc-soft), transparent 62%), radial-gradient(70% 80% at 0% 100%, color-mix(in srgb, var(--color-lilac) 14%, transparent), transparent 60%), linear-gradient(140deg, var(--color-ink) 0%, var(--color-plum-2) 100%)",
          }}
        />
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute -bottom-6 end-4 select-none whitespace-nowrap text-[7rem] italic leading-none text-bone/[0.04] lg:text-[9rem]"
        >
          {(lang === "ar" ? product.name.ar : product.name.en).split(" ")[0]}
        </span>

        <div className="relative z-10 w-full px-5 pb-5 pt-(--st-pt-m) text-center text-bone sm:px-9 lg:pb-0 lg:ps-(--st-ps) lg:pe-9 lg:pt-0 lg:text-start">
          <div className={REVEAL} style={delay(0)}>
            <Link to={`/product/${product.slug}`} className="group/title inline-block">
              <h2 className="hd-sub font-display leading-[1.06] tracking-tight transition-colors group-hover/title:text-[var(--acc)]">
                {l(product.name)}
              </h2>
            </Link>
            <p className="mt-1 text-[12.5px] leading-snug text-bone/55">{l(product.tagline)}</p>
          </div>

          <div className={cn("mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 lg:justify-start", REVEAL)} style={delay(1)}>
            <span className="hd-sub font-display leading-none">{formatPrice(price, lang)}</span>
            {product.compareAt && (
              <span className="text-[12px] text-bone/40 line-through">{formatPrice(product.compareAt, lang)}</span>
            )}
            {discount && (
              <bdi dir="ltr" className="rounded-full bg-[var(--acc)] px-2 py-0.5 text-[10px] font-extrabold text-ink">
                −{discount}%
              </bdi>
            )}
          </div>

          <div
            className={cn("mt-3 flex flex-col items-center gap-3 lg:mt-4 lg:min-h-[100px] lg:flex-row lg:gap-0", REVEAL)}
            style={delay(2)}
          >
            <div className="w-full lg:w-auto">
              <div className={GROUP_TITLE}>
                {t("product.size")} · {unit}
              </div>
              <div className="mb-2 flex flex-wrap justify-center gap-1 sm:mb-3 lg:justify-start">
                {product.sizes.map((size) => (
                  <label key={size.ml} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`size-${product.id}`}
                      checked={ml === size.ml}
                      onChange={() => setMl(size.ml)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full border-2 border-transparent px-3.5 py-1.5 text-[13px] font-bold tracking-wide text-bone/60 transition-colors peer-checked:border-[var(--acc)] peer-checked:text-bone peer-focus-visible:ring-2 peer-focus-visible:ring-bone/60">
                      <bdi dir="ltr">{size.ml}</bdi>
                    </span>
                  </label>
                ))}
              </div>

              {notes.length > 0 && (
                <div className="max-sm:hidden">
                  <div className={GROUP_TITLE}>{t("product.notesShort")}</div>
                  <div className="flex flex-wrap justify-center gap-1.5 lg:justify-start">
                    {notes.map((note) => (
                      <span
                        key={note.en}
                        className="rounded-full border border-bone/20 px-3 py-1 text-[12px] font-medium text-bone/80"
                      >
                        {l(note)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="h-px w-full bg-bone/15 lg:mx-8 lg:h-auto lg:w-px lg:self-stretch lg:bg-bone/25" aria-hidden="true" />

            <LongevityRing longevity={product.longevity} sillage={l(product.sillage)} />
          </div>

          <div
            className={cn("mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 lg:mt-4 lg:justify-start", REVEAL)}
            style={delay(3)}
          >
            <button
              type="button"
              onClick={addToBag}
              className="press inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--acc)] px-6 text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink shadow-[0_8px_36px_-10px_var(--acc)] transition-[filter,box-shadow] duration-300 hover:brightness-105 hover:shadow-[0_12px_40px_-8px_var(--acc)]"
            >
              {added && <Check className="anim-check h-4 w-4" />}
              {added ? t("product.added") : t("product.addToBag")}
            </button>

            <button
              type="button"
              onClick={toggleHeart}
              aria-pressed={wished}
              className="press relative inline-flex min-h-[46px] items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-bone/60 transition-colors hover:text-bone"
            >
              <span key={wished ? "on" : "off"} className={cn("relative grid h-6 w-6 place-items-center", wished && "heart-pop")}>
                <Heart className="h-5 w-5" fill={wished ? "var(--acc)" : "none"} style={{ color: wished ? "var(--acc)" : undefined }} />
                {sparks > 0 && wished && (
                  <span key={sparks} aria-hidden="true">
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <i key={angle} className="heart-spark" style={{ "--a": `${angle}deg` } as CSSProperties} />
                    ))}
                  </span>
                )}
              </span>
              {wished ? t("shop.slider.saved") : t("shop.slider.wishlist")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
