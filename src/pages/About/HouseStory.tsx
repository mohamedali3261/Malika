import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/Primitives";
import { Quote } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useLang } from "@/i18n/LanguageContext";

export function HouseStory() {
  const { t, x } = useLang();

  return (
    <section className="relative bg-bone sec-y-sm">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:px-10">
        <Reveal>
          <div className="relative">
            <SmartImage
              src={IMG.atelierHands}
              alt={x("Perfume preparation", "تحضير العطر")}
              className="aspect-[5/4] w-full rounded-[2rem]"
            />
            <div className="absolute -bottom-6 -end-3 max-w-[220px] rounded-2xl border border-ink/10 bg-bone p-4 shadow-xl sm:-end-6">
              <Quote className="h-5 w-5 text-plum" />
              <p className="font-display mt-2 text-lg leading-snug">{t("story.quote")}</p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("story.quoteBy")}</p>
            </div>
            <div className="absolute -start-3 -top-3 rotate-[-8deg] rounded-full border border-ink/15 bg-bone px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-mist">
              {x("214 trials", "٢١٤ محاولة")}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-plum" /> {t("about.storyEyebrow")}
          </span>
          <h2 className="hd-section font-display mt-3 max-w-xl leading-[1.02] tracking-tight">
            {t("about.storyTitle")}
          </h2>
          <div className="mt-5 space-y-4 text-[13.5px] leading-relaxed text-mist sm:text-[14.5px]">
            <p>{t("about.story1")}</p>
            <p>{t("about.story2")}</p>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-[11px] font-bold text-acid">YS</span>
            <div>
              <p className="text-[12px] font-bold">{x("Yara Selim", "يارا سليم")}</p>
              <p className="text-[10px] text-mist">{x("Founder & perfumer", "المؤسسة والعطّارة")}</p>
            </div>
            <span className="ms-auto font-display text-2xl italic text-plum/40">Yara</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
