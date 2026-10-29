import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/Primitives";
import { ArrowUpRight, Quote } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { atelierStats } from "@/data/site";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { formatNumber } from "@/lib/format";

export function StorySection() {
  const { t, lang, x } = useLang();
  const { c, lc } = useContent();

  return (
    <section className="cv-auto relative overflow-hidden bg-bone sec-y">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-20 lg:px-10">
        <Reveal className="relative">
          <div className="relative mx-auto max-w-[540px] lg:mx-0">
            <div className="absolute -start-6 -top-6 h-24 w-24 rounded-full border border-dashed border-ink/20" />
            <SmartImage
              src={IMG.atelier}
              alt={x("Malika atelier in Cairo", "ورشة مليكة في القاهرة")}
              className="aspect-[5/4] w-full rounded-[2rem] shadow-2xl shadow-ink/10"
            />
            <div className="absolute -bottom-10 -end-2 w-[44%] rotate-3 overflow-hidden rounded-[1.5rem] border-[6px] border-bone shadow-xl sm:-end-6">
              <SmartImage
                src={IMG.atelierHands}
                alt={x("Hand blending perfume", "تركيب العطر يدوياً")}
                className="aspect-[3/4] w-full"
              />
            </div>
            <div className="absolute -start-4 bottom-16 grid h-24 w-24 -rotate-6 place-items-center rounded-full bg-acid text-center text-ink shadow-lg sm:h-28 sm:w-28">
              <div>
                <p className="font-display text-2xl leading-none">{formatNumber(atelierStats.hours, lang)}h</p>
                <p className="mx-auto mt-1 max-w-[80px] text-[8px] font-bold uppercase leading-tight tracking-[0.08em]">
                  {t("stat.hours")}
                </p>
              </div>
            </div>
            <div className="absolute -top-4 end-4 rounded-full border border-ink/10 bg-bone px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-ink/60 shadow-sm sm:end-10">
              {x("Cairo · Al-Muizz", "القاهرة · المعز")}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-plum" />
            {lc(c.story.eyebrow)}
          </span>
          <h2 className="hd-section font-display mt-3 leading-[1] tracking-tight">
            {lc(c.story.title)}
          </h2>
          <p className="lead-copy mt-4 max-w-lg text-mist">{lc(c.story.lead)}</p>

          <div className="relative mt-7 rounded-2xl border border-ink/10 bg-bone-2/50 p-5">
            <Quote className="absolute -top-3 start-5 h-7 w-7 rounded-full bg-bone p-1 text-plum" />
            <p className="font-display text-xl leading-snug text-ink sm:text-2xl">{lc(c.story.quote)}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">{lc(c.story.quoteBy)}</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-y border-ink/10 py-5">
            {[
              { value: `${formatNumber(atelierStats.trials, lang)}`, label: t("stat.trials") },
              { value: `${formatNumber(atelierStats.clients / 1000, lang)}k+`, label: t("stat.clients") },
              { value: `${atelierStats.rating}`, label: t("stat.rating"), suffix: "/5" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl sm:text-3xl">
                  {stat.value}
                  {stat.suffix && <span className="text-sm text-mist">{stat.suffix}</span>}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-mist">{stat.label}</p>
              </div>
            ))}
          </div>

          <Button to="/about" className="mt-7" variant="primary" icon={<ArrowUpRight className="h-4 w-4" />}>
            {t("story.cta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
