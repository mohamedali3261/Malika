import { useBrand } from "@/hooks/useBrand";
import { ArrowRight } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAsset } from "@/lib/assets";
import { ShopSlide } from "@/pages/Shop/ShopSlide";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useCallback, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "@/styles/shop-slider.css";

/** One scent's picture on the left. Cut-outs stand free; photographs get a frame. */
function Bottle({ product, active, near }: { product: Product; active: boolean; near: boolean }) {
  const { l } = useLang();
  const [failed, setFailed] = useState(false);
  const hasCutout = Boolean(product.cutout) && !failed;
  const src = resolveAsset(hasCutout ? (product.cutout as string) : product.images[0] ?? "");

  return (
    <div
      aria-hidden="true"
      className={cn(
        // flex, not grid: a grid item's percentage height resolves against an
        // auto-sized track, i.e. not at all, so tall bottles rendered at their
        // natural pixel size and spilled out of the frame.
        "absolute inset-0 flex items-center justify-center transition-[opacity,translate] duration-500",
        active
          ? "translate-x-0 opacity-100 delay-300"
          : "opacity-0 ltr:-translate-x-[110px] rtl:translate-x-[110px]"
      )}
    >
      {near && src && (
        <img
          src={src}
          alt={l(product.name)}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className={cn(
            "select-none",
            hasCutout
              ? "h-[90%] w-auto max-w-full object-contain drop-shadow-[0_26px_26px_rgba(0,0,0,0.45)]"
              : "aspect-[4/5] h-[84%] w-auto rounded-2xl object-cover shadow-[0_26px_50px_-14px_rgba(0,0,0,0.6)]",
            active && hasCutout && "shop-bottle"
          )}
        />
      )}
    </div>
  );
}

export function ShopHeroSlider() {
  const { t, l, dir } = useLang();
  const { c } = useContent();
  const { wordmark } = useBrand();
  const { products } = useStore();
  const rtl = dir === "rtl";

  const slides = useMemo(() => {
    const { scope, max } = c.shopHero;
    let pool = scope === "featured" ? products.filter((product) => product.featured) : products;
    if (pool.length === 0) pool = products; // "featured only" with nothing featured must not blank the page
    return [...pool]
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating)
      .slice(0, max);
  }, [products, c.shopHero]);

  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const count = slides.length;
  const active = count === 0 ? 0 : Math.min(index, count - 1);

  const go = useCallback(
    (to: number) => {
      if (count === 0) return;
      setIndex(Math.min(count - 1, Math.max(0, to)));
    },
    [count]
  );

  if (!c.shopHero.enabled || count === 0) return null;

  const current = slides[active];
  const accent = current.accent || c.theme.accent;
  const atStart = active === 0;
  const atEnd = active === count - 1;

  /* ----- touch & keyboard ----- */
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return; // mouse users have the arrows
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Mostly-horizontal and long enough; otherwise it is a vertical page scroll or a tap.
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(active + ((dx < 0) !== rtl ? 1 : -1));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    // A focused radio (the size chips) uses the arrows to change its own value.
    if (event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    go(active + ((event.key === "ArrowRight") !== rtl ? 1 : -1));
  };

  const navButton = "press absolute z-30 grid h-11 w-11 place-items-center rounded-full bg-bone text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-[background-color,opacity] duration-300 hover:bg-[var(--acc)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-bone lg:h-[46px] lg:w-[46px]";

  return (
    <section
      className="shop-stage relative isolate overflow-hidden bg-ink text-bone"
      data-size={c.shopHero.size}
      style={{ "--acc": accent } as CSSProperties}
      aria-roledescription="carousel"
      aria-label={t("shop.slider.region")}
    >
      {/* ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -start-24 top-1/4 h-[340px] w-[340px] rounded-full bg-[var(--acc)] opacity-[0.16] blur-[110px]" />
        <div className="absolute -end-20 bottom-0 h-[300px] w-[300px] rounded-full bg-lilac/20 blur-[110px]" />
      </div>
      <div className="grain pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-[1100px] px-4 pb-4 pt-5 sm:px-8 lg:pb-5 lg:pt-7">
        <div className="relative lg:h-(--st-h)" onKeyDown={onKeyDown}>
          {/* coloured shape + vertical wordmark */}
          <div className="absolute inset-x-[4%] top-0 h-(--st-shape-m) overflow-hidden rounded-[22px] bg-[linear-gradient(-45deg,var(--acc-deep),var(--acc))] shadow-[0_30px_120px_-30px_rgba(10,22,31,0.45)] sm:inset-x-[8%] lg:inset-x-auto lg:inset-y-0 lg:start-0 lg:h-auto lg:w-[46%] lg:rounded-[28px]">
            <span
              aria-hidden="true"
              className="font-display absolute inset-x-0 top-2 select-none text-center text-[3.6rem] leading-none tracking-[0.1em] text-ink/[0.14] lg:inset-x-auto lg:start-5 lg:top-1/2 lg:-translate-y-1/2 lg:text-start lg:text-[6.2rem] lg:[writing-mode:vertical-rl] lg:rotate-180"
            >
              {wordmark}
            </span>
            <bdi
              dir="ltr"
              className="absolute bottom-5 start-6 hidden text-[11px] font-extrabold tracking-[0.2em] text-ink/70 lg:block"
            >
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </bdi>
          </div>

          {/* bottle */}
          <div className="pointer-events-none relative z-20 mx-auto h-(--st-bottle-m-h) w-(--st-bottle-m-w) lg:absolute lg:start-[23%] lg:top-1/2 lg:mx-0 lg:h-(--st-bottle-h) lg:w-(--st-bottle-w) lg:-translate-y-1/2 lg:ltr:-translate-x-[45%] lg:rtl:translate-x-[45%]">
            {slides.map((product, position) => (
              <Bottle
                key={product.id}
                product={product}
                active={position === active}
                near={Math.abs(position - active) <= 1}
              />
            ))}
          </div>

          {/* card */}
          <div
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drag.current = null)}
            style={{ touchAction: "pan-y" }}
            className="relative z-10 mt-[calc(var(--st-overlap-m)*-1)] grid rounded-[22px] shadow-[0_28px_79px_rgba(10,22,31,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-bone/50 lg:absolute lg:end-0 lg:top-1/2 lg:mt-0 lg:h-[90%] lg:w-[77%] lg:-translate-y-1/2 lg:rounded-[30px]"
          >
            {slides.map((product, position) => (
              <ShopSlide key={product.id} product={product} index={position} total={count} active={position === active} />
            ))}
          </div>

          {/* arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(active - 1)}
                disabled={atStart}
                aria-label={t("shop.slider.prev")}
                className={cn(navButton, "start-0 top-[calc(var(--st-bottle-m-h)/2)] -translate-x-1/3 rtl:translate-x-1/3 lg:top-1/2 lg:-translate-y-1/2 lg:-translate-x-1/2 lg:rtl:translate-x-1/2")}
              >
                <ArrowRight className="h-5 w-5 rotate-180 rtl:rotate-0" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                disabled={atEnd}
                aria-label={t("shop.slider.next")}
                className={cn(navButton, "end-0 top-[calc(var(--st-bottle-m-h)/2)] translate-x-1/3 rtl:-translate-x-1/3 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-1/2 lg:rtl:-translate-x-1/2")}
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" />
              </button>
            </>
          )}
        </div>

        {/* dots */}
        {count > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 lg:mt-4" role="tablist" aria-label={t("shop.slider.region")}>
            {slides.map((product, position) => (
              <button
                key={product.id}
                type="button"
                role="tab"
                aria-selected={position === active}
                aria-label={`${t("shop.slider.goto")}: ${l(product.name)}`}
                onClick={() => go(position)}
                className="group/dot grid h-6 place-items-center px-0.5"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-500",
                    position === active ? "w-7 bg-[var(--acc)]" : "w-1.5 bg-bone/25 group-hover/dot:bg-bone/50"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
