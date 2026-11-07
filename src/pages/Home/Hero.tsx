import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDown, ArrowUpRight, Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useBrand } from "@/hooks/useBrand";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { openChannel, whatsappUrl } from "@/lib/messaging";
import { useMagnetic } from "@/motion";
import "@/styles/home-scroll.css";

export function Hero() {
  const { t, x } = useLang();
  const { c, lc } = useContent();
  const { settings } = useStore();
  const { wordmark } = useBrand();
  const magneticCta = useMagnetic<HTMLDivElement>(6);

  const greeting = x("Hello VLOR, help me find my scent", "مرحباً ڨلور، أرغب في مساعدتي لاختيار عطر");

  return (
    <section className="grain relative overflow-hidden bg-ink text-bone">
      {/* Ambient art direction */}
      <div className="pointer-events-none absolute inset-0">
        <div className="m-drift-mist-a absolute -start-24 top-10 h-[340px] w-[340px] rounded-full bg-plum-2/80 blur-[100px]" />
        <div className="m-drift-mist-b absolute end-1/4 top-1/3 h-[280px] w-[280px] rounded-full bg-lilac/25 blur-[110px]" />
        <div className="m-breathe-aura absolute bottom-0 start-1/3 h-52 w-52 rounded-full bg-acid/10 blur-[100px]" />
        <p
          dir="ltr"
          className="m-watermark-drift font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[26vw] leading-none tracking-tight text-bone/[0.03] lg:text-[16vw]"
        >
          {wordmark}
        </p>
      </div>

      <div className="relative mx-auto flex max-w-[920px] flex-col items-center hero-pad px-4 text-center sm:px-6 lg:px-10">
        <Reveal variant="m-blur-rise">
          <h1 className="font-display hd-hero leading-[0.94] tracking-[-0.03em]">
            <span className="block overflow-hidden py-0.5">
              <span className="m-text-mask-up block">{lc(c.hero.titleLine1)}</span>
            </span>
            <span className="relative mt-1 inline-block text-acid">
              {lc(c.hero.titleLine2)}
              <svg
                viewBox="0 0 240 14"
                className="pointer-events-none absolute -bottom-3.5 left-1/2 h-2.5 w-[78%] -translate-x-1/2 text-lilac/65"
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

        <Reveal variant="m-rise-soft" delay={110}>
          <p className="lead-copy mt-6 max-w-xl text-bone/60">{lc(c.hero.lead)}</p>
        </Reveal>

        <Reveal variant="m-spring-soft" delay={180}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div
              ref={magneticCta.ref}
              onPointerMove={magneticCta.onPointerMove}
              onPointerLeave={magneticCta.onPointerLeave}
              className="m-magnetic-surface"
            >
              <Button
                to="/shop"
                variant="acid"
                size="lg"
                className="m-hover-glow-acid min-w-[160px]"
                icon={<ArrowUpRight className="h-4 w-4" />}
              >
                {lc(c.hero.primaryCta)}
              </Button>
            </div>
            <Button
              to="/contact"
              variant="dark"
              size="lg"
              className="min-w-[132px] border-bone/20"
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

        <a
          href="#runway-lookbook"
          className="home-scroll-cue mt-8 inline-flex flex-col items-center gap-2 text-bone/45 transition-colors hover:text-acid"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.22em]">{t("hero.scroll")}</span>
          <span className="grid h-8 w-6 place-items-center rounded-full border border-bone/20">
            <ArrowDown className="h-3.5 w-3.5 text-acid" />
          </span>
        </a>
      </div>
    </section>
  );
}
