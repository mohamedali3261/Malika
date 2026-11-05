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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import "@/styles/showcase.css";

const SLIDE_MS = 5500;

/**
 * Compact jewel-box showcase on mobile, split salon stage on desktop.
 * Swipe, tap a thumbnail, use the arrows or the keyboard.
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
          return {
            ...image,
            src: resolveAsset(image.src),
            product,
            title: lc(image.caption).trim() || (product ? l(product.name) : ""),
          };
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
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return null;

  const playing = visible && !held && !reduced && count > 1;
  const current = items[active];
  const product = current.product;
  const accent = product?.accent ?? c.theme.accent;
  const price = product
    ? Math.min(product.price, ...product.sizes.map((size) => size.price))
    : undefined;
  const notes = product ? [...product.notes.top, ...product.notes.heart].slice(0, 4) : [];

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
    if (Math.abs(dx) < 38 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
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
          <SectionHeading
            eyebrow={lc(c.showcase.eyebrow)}
            title={lc(c.showcase.title)}
            lead={lc(c.showcase.lead)}
          />
        </Reveal>

        <Reveal delay={90} className="mt-5 sm:mt-10 lg:mt-12">
          <div
            ref={cardRef}
            role="group"
            aria-roledescription="carousel"
            aria-label={lc(c.showcase.title)}
            className="grid overflow-hidden rounded-[1.4rem] bg-ink text-bone shadow-[0_32px_68px_-42px_rgba(20,16,25,0.88)] sm:rounded-[2rem] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[2.4rem]"
            onPointerEnter={(event) => event.pointerType === "mouse" && setHeld(true)}
            onPointerLeave={(event) => event.pointerType === "mouse" && setHeld(false)}
            onFocus={(event) => event.target.matches(":focus-visible") && setHeld(true)}
            onBlur={() => setHeld(false)}
          >
            {/* ───────── stage (compact 205px on phones, gallery scale on tablet/desktop) ───────── */}
            <div
              className="relative h-[205px] touch-pan-y select-none overflow-hidden outline-none sm:h-auto sm:aspect-[5/4] lg:aspect-auto lg:min-h-[600px]"
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
                      "absolute inset-0 transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isActive
                        ? "scale-100 opacity-100"
                        : "pointer-events-none scale-[1.05] opacity-0"
                    )}
                    style={{
                      background: `radial-gradient(75% 60% at 50% 40%, ${tone}66, transparent 72%), radial-gradient(60% 40% at 50% 100%, ${tone}33, transparent 70%)`,
                    }}
                  >
                    {item.fit === "contain" ? (
                      <div className="absolute inset-0 p-3.5 pb-12 sm:p-10 sm:pb-24 lg:p-14 lg:pb-28">
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className={cn(
                            "h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.48)] sm:drop-shadow-[0_28px_30px_rgba(0,0,0,0.5)]",
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

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/75 to-transparent" />

              <span className="pcard-keep absolute start-2.5 top-2.5 rounded-full bg-ink/72 px-2.5 py-1 text-[9.5px] font-bold tracking-[0.14em] text-bone backdrop-blur-sm sm:start-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[11px]">
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
                    className="pcard-chip press absolute start-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-bone/90 text-ink shadow-md transition hover:bg-acid sm:start-3 sm:h-11 sm:w-11 sm:shadow-lg"
                  >
                    <ArrowRight className="h-3.5 w-3.5 rotate-180 rtl:rotate-0 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={x("Next", "التالية")}
                    className="pcard-chip press absolute end-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-bone/90 text-ink shadow-md transition hover:bg-acid sm:end-3 sm:h-11 sm:w-11 sm:shadow-lg"
                  >
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 sm:h-4 sm:w-4" />
                  </button>
                </>
              )}

              {/* Compact thumbnails on stage */}
              {count > 1 && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 px-3 sm:bottom-4 sm:gap-2 sm:px-4">
                  {items.map((item, position) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIndex(position)}
                      aria-label={`${position + 1}: ${item.title}`}
                      aria-current={position === active}
                      className={cn(
                        "pcard-chip relative h-8 w-6.5 overflow-hidden rounded-md border bg-ink/65 transition-all duration-300 sm:h-14 sm:w-11 sm:rounded-lg",
                        position === active
                          ? "border-bone scale-105"
                          : "border-bone/25 opacity-68 hover:opacity-100"
                      )}
                    >
                      <img
                        src={item.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={cn(
                          "h-full w-full",
                          item.fit === "contain" ? "object-contain p-0.5" : "object-cover"
                        )}
                      />
                      {position === active && !reduced && (
                        <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-bone/25 sm:h-[3px]">
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

            {/* ───────── details (compact jewel-card proportions on mobile) ───────── */}
            <div className="pcard-compact-scope relative flex flex-col justify-between gap-3.5 p-4 sm:gap-8 sm:p-9 lg:p-12">
              <div
                className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full opacity-28 blur-3xl sm:h-56 sm:w-56"
                style={{ background: accent }}
              />

              <div className="relative">
                <p className="hidden font-display leading-none text-bone/15 sm:block sm:text-[5.2rem]">
                  <bdi dir="ltr">{String(active + 1).padStart(2, "0")}</bdi>
                </p>

                <div aria-live="polite" key={current.id} className="anim-rise">
                  {product && (
                    <p className="pcard-keep text-[9.5px] font-bold uppercase tracking-[0.18em] text-bone/50 sm:mt-2 sm:text-[10px] sm:tracking-[0.2em]">
                      {t(`shop.${product.gender}`)}
                    </p>
                  )}
                  <h3 className="font-display mt-1 text-[1.45rem] leading-[1.05] tracking-tight sm:mt-3 sm:text-5xl sm:leading-[1.02]">
                    {current.title}
                  </h3>
                  {product && (
                    <p className="pcard-keep mt-1 line-clamp-1 text-[12px] text-bone/60 sm:mt-2 sm:line-clamp-none sm:text-[14px]">
                      {l(product.tagline)}
                    </p>
                  )}

                  {notes.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1 sm:mt-5 sm:gap-1.5">
                      {notes.slice(0, 3).map((note) => (
                        <span
                          key={note.en}
                          className="pcard-keep rounded-full border border-bone/20 px-2.5 py-0.5 text-[10.5px] font-medium text-bone/75 sm:px-3 sm:py-1 sm:text-[12px]"
                        >
                          {l(note)}
                        </span>
                      ))}
                      {notes[3] && (
                        <span className="pcard-keep hidden rounded-full border border-bone/20 px-3 py-1 text-[12px] font-medium text-bone/75 sm:inline-flex">
                          {l(notes[3])}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-nowrap items-center justify-between gap-3 border-t border-bone/10 pt-3 sm:flex-wrap sm:items-end sm:gap-4 sm:border-0 sm:pt-0">
                {price !== undefined && (
                  <div className="min-w-0">
                    <p className="pcard-keep text-[9px] font-bold uppercase tracking-[0.18em] text-bone/45 sm:text-[10px] sm:tracking-[0.2em]">
                      {t("product.from")}
                    </p>
                    <p className="font-display text-[1.35rem] leading-tight sm:text-[2rem]">
                      {formatPrice(price, lang)}
                    </p>
                  </div>
                )}
                {product && (
                  <Button
                    to={`/product/${product.slug}`}
                    variant="acid"
                    size="sm"
                    className="pcard-chip shrink-0 sm:h-12 sm:px-6 sm:text-[12px]"
                    icon={<ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  >
                    {x("Discover the scent", "اكتشف العطر")}
                  </Button>
                )}
                {!product && (
                  <p className="pcard-keep text-[11px] text-bone/45 sm:text-[12px]" dir="ltr">
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
