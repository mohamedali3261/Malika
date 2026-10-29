import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Primitives";
import { Sparkle } from "@/components/ui/icons";
import { atelierStats } from "@/data/site";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";

export function Process() {
  const { t, lang } = useLang();
  const steps = [
    { title: t("about.p1"), body: t("about.p1b") },
    { title: t("about.p2"), body: t("about.p2b") },
    { title: t("about.p3"), body: t("about.p3b") },
    { title: t("about.p4"), body: t("about.p4b") },
  ];

  return (
    <section className="bg-bone sec-y-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow={t("story.eyebrow")} title={t("about.process")} align="between" />
        </Reveal>

        <div className="relative mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-0 top-9 hidden h-px bg-linear-to-r from-transparent via-ink/15 to-transparent lg:block" />
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 80}>
              <div className="group relative h-full rounded-[1.5rem] border border-ink/10 bg-white/40 p-5 transition hover:-translate-y-1 hover:bg-white/70">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-bone-2 text-[11px] font-extrabold text-ink transition group-hover:bg-ink group-hover:text-acid">
                    0{index + 1}
                  </span>
                  <Sparkle className="h-4 w-4 text-plum/30" />
                </div>
                <h3 className="mt-5 text-[14px] font-bold">{step.title}</h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-6">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-acid px-6 py-7 text-ink sm:px-9">
            <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full border border-ink/10" />
            <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4">
              {[
                { value: formatNumber(atelierStats.trials, lang), label: t("stat.trials") },
                { value: `${formatNumber(atelierStats.hours, lang)}h`, label: t("stat.hours") },
                { value: `${formatNumber(atelierStats.clients / 1000, lang)}k`, label: t("stat.clients") },
                { value: "4.9/5", label: t("stat.rating") },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl leading-none sm:text-4xl">{stat.value}</p>
                  <p className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-ink/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
