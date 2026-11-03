import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { SmartImage, Stars } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDown, ArrowUpRight, Sparkle, Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useBrand } from "@/hooks/useBrand";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { openChannel, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import { useCardTilt3D, useMagnetic } from "@/motion";
import type { Product } from "@/types";

export function Hero({ signature }: { signature?: Product }) {
  const { t, lang, l, x } = useLang();
  const { c, lc } = useContent();
  const { settings } = useStore();
  const { wordmark } = useBrand();
  const heroTilt = useCardTilt3D<HTMLDivElement>(4);
  const magneticCta = useMagnetic<HTMLDivElement>(6);

  const greeting = x("Hello VLOR, help me find my scent", "مرحباً VLOR، أرغب في مساعدتي لاختيار عطر");

  return (
    <section className="grain relative overflow-hidden bg-ink text-bone">
      {/* Ambient art direction */}
      <div className="pointer-events-none absolute inset-0">
        <div className="m-drift-mist-a absolute -start-24 top-10 h-[340px] w-[340px] rounded-full bg-plum-2/80 blur-[100px]" />
        <div className="m-drift-mist-b absolute end-1/4 top-1/3 h-[280px] w-[280px] rounded-full bg-lilac/25 blur-[110px]" />
        <div className="m-breathe-aura absolute bottom-0 start-1/3 h-52 w-52 rounded-full bg-acid/10 blur-[100px]" />
        <p dir="ltr" className="m-watermark-drift font-display absolute -end-6 top-16 select-none text-[24vw] leading-none tracking-tight text-bone/[0.035] lg:text-[15vw]">
          {wordmark}
        </p>
      </div>

      <div className="relative mx-auto grid max-w-[1400px] hero-pad gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-11 lg:px-10">
        <div>
          <Reveal variant="m-drop-silk">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-bone/[0.04] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-bone/65">
              <span className="relative flex h-1.5 w-1.5">
                <span className="m-pulse-beacon absolute inline-flex h-full w-full rounded-full bg-acid opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acid" />
              </span>
              {lc(c.hero.eyebrow)}
            </span>
          </Reveal>

          <Reveal variant="m-blur-rise" delay={70}>
            <h1 className="mt-4 font-display hd-hero leading-[0.92] tracking-[-0.03em]">
              <span className="block overflow-hidden py-0.5">
                <span className="m-text-mask-up block">{lc(c.hero.titleLine1)}</span>
              </span>
              <span className="relative mt-1 block text-acid">
                {lc(c.hero.titleLine2)}
                <svg
                  viewBox="0 0 240 14"
                  className="absolute -bottom-4 start-0 h-2.5 w-[46%] text-lilac/65 rtl:start-auto rtl:end-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 10C50 4 140 2 237 7" className="m-svg-stroke-draw" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal variant="m-rise-soft" delay={140}>
            <p className="lead-copy mt-6 max-w-md text-bone/60">{lc(c.hero.lead)}</p>
          </Reveal>

          <Reveal variant="m-spring-soft" delay={210}>
            <div className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div
                ref={magneticCta.ref}
                onPointerMove={magneticCta.onPointerMove}
                onPointerLeave={magneticCta.onPointerLeave}
                className="m-magnetic-surface flex-1 sm:flex-none"
              >
                <Button
                  to="/shop"
                  variant="acid"
                  size="lg"
                  className="m-hover-glow-acid w-full min-w-[148px]"
                  icon={<ArrowUpRight className="h-4 w-4" />}
                >
                  {lc(c.hero.primaryCta)}
                </Button>
              </div>
              <Button
                to="/about"
                variant="dark"
                size="lg"
                className="min-w-[126px] flex-1 border-bone/20 sm:flex-none"
              >
                {lc(c.hero.secondaryCta)}
              </Button>
              <button
                onClick={() => openChannel(whatsappUrl(settings.whatsapp, greeting))}
                className="m-press-spring grid h-12 w-12 shrink-0 place-items-center rounded-full border border-bone/15 text-bone/70 transition hover:border-acid hover:text-acid"
                aria-label={t("nav.order")}
              >
                <Whatsapp className="h-5 w-5" />
              </button>
            </div>
          </Reveal>

          {c.hero.stats.length > 0 && (
            <Reveal variant="m-rise-soft" delay={280}>
              <div
                className="mt-8 grid max-w-lg divide-x divide-bone/10 border-t border-bone/10 pt-4 rtl:divide-x-reverse"
                style={{ gridTemplateColumns: `repeat(${c.hero.stats.length}, minmax(0, 1fr))` }}
              >
                {c.hero.stats.map((stat, idx) => (
                  <div key={stat.id} className="px-3 first:ps-0">
                    <p
                      className="m-counter-roll-up font-display text-2xl text-bone sm:text-3xl"
                      style={{ animationDelay: `${300 + idx * 70}ms` }}
                    >
                      {stat.value}
                      <span className="text-[13px] text-acid">{stat.suffix}</span>
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-bone/40">
                      {lc(stat.label)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* Compact 3D-interactive Hero Flacon Still-Life */}
        <Reveal variant="m-3d-bottle-bow" delay={150} className="relative">
          <div className="relative mx-auto w-full max-w-[356px]">
            <div
              className="m-breathe-aura absolute inset-6 rounded-full opacity-45 blur-3xl"
              style={{ background: signature?.accent ?? "#C9B5F7" }}
            />
            <div
              ref={heroTilt.ref}
              onPointerMove={heroTilt.onPointerMove}
              onPointerLeave={heroTilt.onPointerLeave}
              className="m-tilt-3d-surface sheen relative rotate-[-2deg] overflow-hidden rounded-[1.85rem] border border-bone/15 bg-plum p-2 shadow-2xl shadow-black/40 sm:rounded-[2.2rem] sm:p-2.5"
            >
              <span aria-hidden="true" className="sheen-bar" />
              <span aria-hidden="true" className="m-tilt-3d-glare absolute inset-0 z-10 rounded-[inherit]" />
              <SmartImage
                src={signature?.images[0] ?? ""}
                alt={signature ? `${signature.name.en} bottle` : "VLOR perfume"}
                priority
                className="aspect-[4/4.7] w-full rounded-[1.45rem] bg-plum-2 sm:rounded-[1.8rem]"
              />
              <div className="pointer-events-none absolute inset-2 rounded-[1.45rem] bg-linear-to-t from-ink/80 via-transparent to-ink/15 sm:inset-2.5 sm:rounded-[1.8rem]" />
              <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-acid">
                    {t("hero.featured")} · N°01
                  </p>
                  <p className="font-display mt-0.5 text-2xl leading-none text-bone sm:text-[1.75rem]">
                    {signature ? l(signature.name) : "VLOR Noir"}
                  </p>
                  <p className="mt-1 text-[10px] text-bone/60">{signature ? l(signature.tagline) : ""}</p>
                </div>
                {signature && (
                  <Link
                    to={`/product/${signature.slug}`}
                    className="m-press-spring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-acid text-ink transition-transform duration-300 hover:rotate-45"
                    aria-label={l(signature.name)}
                  >
                    <ArrowUpRight className="h-4.5 w-4.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Rotating atelier wax stamp */}
            <div className="absolute -end-2.5 -top-3.5 sm:-end-5 sm:-top-5">
              <div className="m-spin-seal-cw grid h-[82px] w-[82px] place-items-center rounded-full border border-dashed border-ink/30 bg-acid text-center text-ink shadow-xl sm:h-[98px] sm:w-[98px]">
                <div className="-rotate-6">
                  <Sparkle className="mx-auto h-3.5 w-3.5" />
                  <p className="mt-0.5 text-[7.5px] font-extrabold uppercase leading-tight tracking-[0.12em]">
                    {x("Extrait", "إكستريه")}
                    <br />
                    {x("30% · Cairo", "٣٠٪ · القاهرة")}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact floating price chip */}
            {signature && (
              <div className="m-float-feather absolute -bottom-3 start-2 rounded-2xl border border-ink/10 bg-bone px-3 py-2 text-ink shadow-xl sm:-start-5 sm:bottom-auto sm:top-7 sm:px-3.5 sm:py-2.5">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-mist">{t("product.from")}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <p className="font-display text-lg sm:text-xl">{formatPrice(signature.price, lang)}</p>
                  <Stars value={signature.rating} size={9} />
                </div>
              </div>
            )}
          </div>

          <p className="mt-7 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.24em] text-bone/35">
            <ArrowDown className="m-float-feather h-3.5 w-3.5" /> {t("hero.scroll")}
          </p>
        </Reveal>
      </div>

      {c.strips.hero.enabled && c.strips.hero.items.length > 0 && (
        <div className="relative border-t border-bone/10 py-3">
          <Marquee speed={c.strips.hero.speed} direction={c.strips.hero.direction} trackClassName="items-center">
            {c.strips.hero.items.map((note, index) => (
              <span
                key={`${note.en}-${index}`}
                className="flex shrink-0 items-center gap-6 px-6 text-[10px] font-bold uppercase tracking-[0.35em] text-bone/30"
              >
                {lc(note)}
                <Sparkle className="m-twinkle-star h-2.5 w-2.5 text-lilac/50" />
              </span>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
