import { useBrand } from "@/hooks/useBrand";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { SmartImage, Stars } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDown, ArrowUpRight, Sparkle, Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { openChannel, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import type { Product } from "@/types";

export function Hero({ signature }: { signature?: Product }) {
  const { t, lang, l, x } = useLang();
  const { c, lc } = useContent();
  const { settings } = useStore();
  const { wordmark } = useBrand();

  const greeting =
    x("Hello MALIKA, help me find my scent", "مرحباً مليكة، أرغب في مساعدتي لاختيار عطر");

  return (
    <section className="grain relative overflow-hidden bg-ink text-bone">
      {/* ambient art direction */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -start-24 top-10 h-[360px] w-[360px] rounded-full bg-plum-2/80 blur-[100px]" />
        <div className="absolute end-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-lilac/25 blur-[110px]" />
        <div className="absolute bottom-0 start-1/3 h-56 w-56 rounded-full bg-acid/10 blur-[100px]" />
        <p className="font-display absolute -end-6 top-16 select-none text-[24vw] leading-none tracking-tight text-bone/[0.035] lg:text-[15vw]">
          {wordmark}
        </p>
      </div>

      <div className="relative mx-auto grid max-w-[1400px] hero-pad gap-8 px-4 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-12 lg:px-10">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-bone/[0.04] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-bone/65">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acid" />
              </span>
              {lc(c.hero.eyebrow)}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-display hd-hero leading-[0.92] tracking-[-0.03em]">
              <span className="block">{lc(c.hero.titleLine1)}</span>
              <span className="relative mt-1 block text-acid">
                {lc(c.hero.titleLine2)}
                <svg
                  viewBox="0 0 240 14"
                  className="absolute -bottom-5 start-0 h-2.5 w-[46%] text-lilac/60 rtl:start-auto rtl:end-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 10C50 4 140 2 237 7" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="lead-copy mt-6 max-w-md text-bone/60">
              {lc(c.hero.lead)}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Button
                to="/shop"
                variant="acid"
                size="lg"
                className="min-w-[150px] flex-1 sm:flex-none"
                icon={<ArrowUpRight className="h-4 w-4" />}
              >
                {lc(c.hero.primaryCta)}
              </Button>
              <Button
                to="/about"
                variant="dark"
                size="lg"
                className="min-w-[130px] flex-1 border-bone/20 sm:flex-none"
              >
                {lc(c.hero.secondaryCta)}
              </Button>
              <button
                onClick={() => openChannel(whatsappUrl(settings.whatsapp, greeting))}
                className="grid h-13 w-13 shrink-0 place-items-center rounded-full border border-bone/15 text-bone/70 transition hover:border-acid hover:text-acid"
                aria-label={t("nav.order")}
              >
                <Whatsapp className="h-5 w-5" />
              </button>
            </div>
          </Reveal>

          {c.hero.stats.length > 0 && (
            <Reveal delay={320}>
              <div
                className="mt-10 grid max-w-lg divide-x divide-bone/10 border-t border-bone/10 pt-5 rtl:divide-x-reverse"
                style={{ gridTemplateColumns: `repeat(${c.hero.stats.length}, minmax(0, 1fr))` }}
              >
                {c.hero.stats.map((stat) => (
                  <div key={stat.id} className="px-3 first:ps-0">
                    <p className="font-display text-2xl text-bone sm:text-3xl">
                      {stat.value}
                      <span className="text-[13px] text-acid">{stat.suffix}</span>
                    </p>
                    <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-bone/40">
                      {lc(stat.label)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* Hero product still-life */}
        <Reveal delay={180} scale className="relative">
          <div className="relative mx-auto w-full max-w-[400px]">
            <div
              className="anim-drift absolute inset-8 rounded-full opacity-45 blur-3xl"
              style={{ background: signature?.accent ?? "#C9B5F7" }}
            />
            <div className="relative rotate-[-2deg] overflow-hidden rounded-[2rem] border border-bone/15 bg-plum p-2.5 shadow-2xl shadow-black/40 sm:rounded-[2.6rem] sm:p-3">
              <SmartImage
                src={signature?.images[0] ?? ""}
                alt={signature ? `${signature.name.en} bottle` : "Malika perfume"}
                priority
                className="aspect-[4/5] w-full rounded-[1.6rem] bg-plum-2 sm:rounded-[2.1rem]"
                imgClassName="object-cover"
              />
              <div className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] bg-linear-to-t from-ink/70 via-transparent to-ink/20 sm:rounded-[2.1rem]" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-acid">
                    {t("hero.featured")} · N°01
                  </p>
                  <p className="font-display mt-1 text-3xl leading-none text-bone">
                    {signature ? l(signature.name) : "Malika Noir"}
                  </p>
                  <p className="mt-1.5 text-[10px] text-bone/60">{signature ? l(signature.tagline) : ""}</p>
                </div>
                {signature && (
                  <Link
                    to={`/product/${signature.slug}`}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-acid text-ink transition-transform hover:rotate-45"
                    aria-label={l(signature.name)}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* rotating stamp */}
            <div className="absolute -end-3 -top-4 sm:-end-6 sm:-top-6">
              <div className="anim-spin-slow grid h-[92px] w-[92px] place-items-center rounded-full border border-dashed border-ink/30 bg-acid text-center text-ink shadow-xl sm:h-[112px] sm:w-[112px]">
                <div className="-rotate-6">
                  <Sparkle className="mx-auto h-4 w-4" />
                  <p className="mt-1 text-[8px] font-extrabold uppercase leading-tight tracking-[0.12em]">
                    {x("Extrait", "إكستريه")}
                    <br />
                    {x("30% · Cairo", "٣٠٪ · القاهرة")}
                  </p>
                </div>
              </div>
            </div>

            {/* price chip */}
            {signature && (
              <div className="absolute -bottom-3 start-2 rounded-2xl border border-ink/10 bg-bone px-3.5 py-2.5 text-ink shadow-xl sm:-start-6 sm:bottom-auto sm:top-8 sm:px-4 sm:py-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-mist">{t("product.from")}</p>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <p className="font-display text-xl">{formatPrice(signature.price, lang)}</p>
                  <Stars value={signature.rating} size={9} />
                </div>
              </div>
            )}
          </div>

          <p className="mt-9 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.24em] text-bone/35">
            <ArrowDown className="h-3.5 w-3.5" /> {t("hero.scroll")}
          </p>
        </Reveal>
      </div>

      {c.strips.hero.enabled && c.strips.hero.items.length > 0 && (
        <div className="relative border-t border-bone/10 py-3.5">
          <Marquee speed={c.strips.hero.speed} direction={c.strips.hero.direction} trackClassName="items-center">
            {c.strips.hero.items.map((note, index) => (
              <span
                key={`${note.en}-${index}`}
                className="flex shrink-0 items-center gap-6 px-6 text-[10px] font-bold uppercase tracking-[0.35em] text-bone/30"
              >
                {lc(note)}
                <Sparkle className="h-2.5 w-2.5 text-lilac/50" />
              </span>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
