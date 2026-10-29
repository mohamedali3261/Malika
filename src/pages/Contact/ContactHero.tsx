import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/Primitives";
import { Clock, MapPin } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";

export function ContactHero() {
  const { t, l, x } = useLang();
  const { settings } = useStore();

  return (
    <section className="relative overflow-hidden bg-bone page-pad">
      <div className="pointer-events-none absolute start-1/3 top-0 h-64 w-64 rounded-full bg-lilac/20 blur-[90px]" />
      <div className="relative mx-auto grid max-w-[1400px] items-end gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-plum" /> {t("contact.eyebrow")}
          </span>
          <h1 className="hd-page font-display mt-3 leading-[0.95] tracking-[-0.03em]">
            {t("contact.title")}
          </h1>
          <p className="lead-copy mt-3 max-w-xl text-mist">{t("contact.lead")}</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/40 p-3 shadow-sm">
            <SmartImage src={IMG.glass} alt={x("Malika studio", "استوديو مليكة")} className="h-24 w-20 shrink-0 rounded-xl" />
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-[11px] leading-snug text-ink/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" /> {l(settings.address)}
              </p>
              <p className="flex items-start gap-2 text-[11px] leading-snug text-ink/70">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" /> {l(settings.hours)}
              </p>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-acid px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-ink">
                <span className="h-1 w-1 rounded-full bg-ink" />
                {x("online now", "متصلون الآن")}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
