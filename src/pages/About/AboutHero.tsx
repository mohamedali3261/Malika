import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/Primitives";
import { Sparkle } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useLang } from "@/i18n/LanguageContext";

export function AboutHero() {
  const { t, x } = useLang();

  return (
    <section className="relative overflow-hidden bg-bone page-pad">
      <div className="pointer-events-none absolute -end-20 top-0 h-80 w-80 rounded-full bg-lilac/25 blur-[100px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-plum" />
              {t("about.eyebrow")}
            </span>
            <h1 className="hd-page font-display mt-3 max-w-3xl leading-[0.95] tracking-[-0.03em]">
              {t("about.title1")}{" "}
              <span className="relative inline-block text-plum">
                {t("about.title2")}
                <svg viewBox="0 0 240 12" className="absolute -bottom-2 start-0 h-2.5 w-full text-acid" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M4 8c50-5 150-7 232-2" />
                </svg>
              </span>
            </h1>
            <p className="lead-copy mt-4 max-w-xl text-mist">{t("about.lead")}</p>
          </Reveal>

          <Reveal delay={140} className="relative">
            <div className="flex items-end justify-end gap-3">
              <div className="w-[40%] -rotate-6 overflow-hidden rounded-[1.3rem] border border-ink/10 bg-bone-2 p-1.5 shadow-lg">
                <SmartImage src={IMG.atelier} alt={x("The atelier", "الورشة")} className="aspect-[3/4] rounded-[0.9rem]" />
              </div>
              <div className="w-[48%] rotate-3 overflow-hidden rounded-[1.3rem] border border-ink/10 bg-bone-2 p-1.5 shadow-xl">
                <SmartImage src={IMG.anemone} alt={x("Iris still life", "زهرة السوسن")} className="aspect-[4/5] rounded-[0.9rem]" priority />
              </div>
            </div>
            <div className="absolute -start-2 bottom-10 flex items-center gap-2 rounded-full bg-acid px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink shadow-lg">
              <Sparkle className="h-3.5 w-3.5" /> {x("7 people · one house", "٧ أفراد · فريق واحد")}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
