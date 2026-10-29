import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber, formatPrice } from "@/lib/format";
import { resolveAsset } from "@/lib/assets";
import { MAX_SHOWCASE_IMAGES } from "@/types/content";
import { cn } from "@/utils/cn";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import "@/styles/showcase.css";

const SLIDE_MS = 5500;

/**
 * One card, up to five product images. Swipe, tap a thumbnail, use the arrows
 * or the keyboard. It advances by itself, and stops while the card is off
 * screen, being touched/hovered, or when the visitor prefers reduced motion.
 */
export function Showcase() {
  const { lang, l, t, dir, x } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();
  const rtl = dir === "rtl";

  const items = useMemo(
    () =>
      c.showcase.images
        .filter((image) => image.src.trim().length > 0)
        .slice(0, MAX_SHOWCASE_IMAGES)
        .map((image) => {
          const product = products.find((item) => item.slug === image.productSlug);
          return { ...image, src: resolveAsset(image.src), product, title: lc(image.caption).trim() || (product ? l(product.name) : "") };
        }),
    [c.showcase.images, products, lc, l]
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const count = items.length;
  const active = count === 0 ? 0 : Math.min(index, count - 1);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (count < 2) return;
      setIndex((current) => (Math.min(current, count - 1) + direction + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => setVisible(entries.some((e) => e.isIntersecting)), {
      threshold: 0.25,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return null;

  const playing = visible && !held && !reduced && count > 1;
  const current = items[active];
  const product = current.product;
  const accent = product?.accent ?? c.theme.accent;
  const price = product ? Math.min(product.price, ...product.sizes.map((size) => size.price)) : undefined;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY };
    if (event.pointerType !== "mouse") setHeld(true);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (event.pointerType !== "mouse") setHeld(false);
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    // Swiping toward the start of the reading direction goes forward.
    go((dx < 0) !== rtl ? 1 : -1);
  };
  const onPointerCancel = () => {
    drag.current = null;
    setHeld(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    go((event.key === "ArrowRight") !== rtl ? 1 : -1);
  };

  return (
    <section id="showcase" className="relative overflow-hidden bg-bone sec-y">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow={lc(c.showcase.eyebrow)} title={lc(c.showcase.title)} lead={lc(c.showcase.lead)} />
        </Reveal>

        <Reveal delay={90} className="mt-10 lg:mt-12">
          <div
            ref={cardRef}
            role="group"
            aria-roledescription="carousel"
            aria-label={lc(c.showcase.title)}
            className="grid overflow-hidden rounded-[2rem] bg-ink text-bone shadow-[0_40px_80px_-48px_rgba(20,16,25,0.9)] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[2.4rem]"
            // Pointer events, not mouse events: touch browsers synthesise a
            // mouseenter after every tap and never send the matching leave, which
            // would freeze autoplay for good. Only a real mouse pauses on hover.
            onPointerEnter={(event) => event.pointerType === "mouse" && setHeld(true)}
            onPointerLeave={(event) => event.pointerType === "mouse" && setHeld(false)}
            // Likewise only keyboard focus pauses; focus left behind by a click
            // or tap on a thumbnail must not.
            onFocus={(event) => event.target.matches(":focus-visible") && setHeld(true)}
            onBlur={() => setHeld(false)}
          >
            {/* ───────── stage ───────── */}
            <div
              className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden outline-none sm:aspect-[5/4] lg:aspect-auto lg:min-h-[620px]"
              tabIndex={0}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              style={{ touchAction: "pan-y" }}
            >
              {items.map((item, position) => {
                const isActive = position === active;
                const tone = item.product?.accent ?? c.theme.accent;
                return (
                  <div
                    key={item.id}
                    aria-hidden={!isActive}
                    className={cn(
                      "absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isActive ? "scale-100 opacity-100" : "pointer-events-none scale-[1.06] opacity-0"
                    )}
                    style={{
                      background: `radial-gradient(75% 60% at 50% 40%, ${tone}66, transparent 72%), radial-gradient(60% 40% at 50% 100%, ${tone}33, transparent 70%)`,
                    }}
                  >
                    {item.fit === "contain" ? (
                      <div className="absolute inset-0 p-8 pb-24 sm:p-10 sm:pb-24 lg:p-14 lg:pb-28">
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className={cn(
                            "h-full w-full object-contain drop-shadow-[0_28px_30px_rgba(0,0,0,0.5)]",
                            isActive && !reduced && "sc-float"
                          )}
                        />
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                );
              })}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/70 to-transparent" />

              <span className="absolute start-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-bone">
                <bdi dir="ltr">
                  {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </bdi>
              </span>

              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={x("Previous", "السابقة")}
                    className="press absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-bone/90 text-ink shadow-lg transition hover:bg-acid"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={x("Next", "التالية")}
                    className="press absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-bone/90 text-ink shadow-lg transition hover:bg-acid"
                  >
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </>
              )}

              {/* thumbnails sit on the stage so the card never gets taller */}
              {count > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-4 sm:bottom-4">
                  {items.map((item, position) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIndex(position)}
                      aria-label={`${position + 1}: ${item.title}`}
                      aria-current={position === active}
                      className={cn(
                        "relative h-12 w-10 overflow-hidden rounded-lg border bg-ink/60 transition-all duration-300 sm:h-14 sm:w-11",
                        position === active ? "border-bone" : "border-bone/25 opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={item.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={cn("h-full w-full", item.fit === "contain" ? "object-contain p-0.5" : "object-cover")}
                      />
                      {position === active && !reduced && (
                        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-bone/25">
                          <span
                            key={`${active}-${count}`}
                            className="sc-progress block h-full w-full bg-acid"
                            style={
                              {
                                "--sc-duration": `${SLIDE_MS}ms`,
                                animationPlayState: playing ? "running" : "paused",
                              } as CSSProperties
                            }
                            onAnimationEnd={(event) => {
                              if (event.target === event.currentTarget) go(1);
                            }}
                          />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ───────── details ───────── */}
            <div className="relative flex flex-col justify-between gap-8 p-6 sm:p-9 lg:p-12">
              <div
                className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: accent }}
              />

              <div className="relative">
                <p className="font-display text-[4.2rem] leading-none text-bone/15 sm:text-[5.5rem]">
                  <bdi dir="ltr">{String(active + 1).padStart(2, "0")}</bdi>
                </p>

                <div aria-live="polite" key={current.id} className="anim-rise">
                  {product && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bone/50">
                      {t(`shop.${product.category}`)} · {t(`shop.${product.gender}`)}
                    </p>
                  )}
                  <h3 className="font-display mt-3 text-[2.3rem] leading-[1.02] tracking-tight sm:text-5xl">
                    {current.title}
                  </h3>
                  {product && <p className="mt-2 text-[14px] text-bone/60">{l(product.tagline)}</p>}

                  {product && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {[...product.notes.top, ...product.notes.heart].slice(0, 4).map((note) => (
                        <span
                          key={note.en}
                          className="rounded-full border border-bone/20 px-3 py-1 text-[12px] font-medium text-bone/75"
                        >
                          {l(note)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-wrap items-end justify-between gap-4">
                {price !== undefined && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bone/45">{t("product.from")}</p>
                    <p className="font-display text-[2rem] leading-tight">{formatPrice(price, lang)}</p>
                  </div>
                )}
                {product && (
                  <Button to={`/product/${product.slug}`} variant="acid" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
                    {x("Discover the scent", "اكتشف العطر")}
                  </Button>
                )}
                {!product && (
                  <p className="text-[12px] text-bone/45" dir="ltr">
                    {formatNumber(count, lang)} / {formatNumber(MAX_SHOWCASE_IMAGES, lang)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
