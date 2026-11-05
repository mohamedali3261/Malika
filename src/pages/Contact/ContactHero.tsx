import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/Primitives";
import { Clock, Globe } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";

export function ContactHero() {
  const { t, l, x } = useLang();
  const { settings } = useStore();

  return (
    <section className="relative overflow-hidden bg-bone page-pad">
      <div className="pointer-events-none absolute -top-28 end-1/4 h-[420px] w-[420px] rounded-full bg-lilac/15 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 start-1/3 h-64 w-64 rounded-full bg-plum/10 blur-[70px]" />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-mist backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> {t("contact.eyebrow")}
          </span>
          <h1 className="hd-page font-display mt-4 leading-[0.9] tracking-[-0.04em]">
            {t("contact.title")}
          </h1>
          <p className="lead-copy mt-4 max-w-xl text-mist">{t("contact.lead")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-acid px-3 py-1.5 font-bold text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
              {x("online — reply in minutes", "متصلون الآن — نرد خلال دقائق")}
            </span>
            <span className="text-mist">{x("Daily 11:00–22:00 · Online", "أونلاين · يومياً ١١:٠٠–٢٢:٠٠")}</span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative overflow-hidden rounded-[1.6rem] border border-ink/10 bg-white/70 p-4 shadow-[0_20px_60px_rgba(16,16,16,0.08)] backdrop-blur sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-lilac/10 via-transparent to-acid/10" />
            <div className="relative flex gap-4">
              <SmartImage src={IMG.glass} alt={x("VLOR — online boutique", "ڨلور — متجر أونلاين")} className="h-28 w-24 shrink-0 rounded-2xl border border-ink/5 sm:h-32 sm:w-28" />
              <div className="flex flex-1 flex-col justify-center gap-3">
                <div className="flex items-start gap-2.5 rounded-xl bg-bone-2/60 px-3 py-2.5">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{x("Where we are", "أين نحن")}</p>
                    <p className="mt-0.5 text-[12px] font-semibold leading-snug text-ink">{l(settings.address)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl bg-bone-2/60 px-3 py-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{x("Support hours", "ساعات الدعم")}</p>
                    <p className="mt-0.5 text-[12px] font-semibold leading-snug text-ink">{l(settings.hours)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative mt-3 flex items-center justify-between rounded-full bg-ink px-4 py-2.5 text-bone">
              <span className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-acid animate-pulse" /> {x("We usually reply within an hour", "نرد عادةً خلال ساعة")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-bone/60">Online</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
