import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
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
        <Reveal variant="m-blur-rise">
          <SectionHeading eyebrow={t("story.eyebrow")} title={t("about.process")} align="between" />
        </Reveal>

        <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-linear-to-r from-transparent via-ink/15 to-transparent lg:block" />
          {steps.map((step, index) => (
            <Reveal key={step.title} variant="m-pedestal-lift" delay={index * 70}>
              <div className="m-hover-lift-md group relative h-full rounded-[1.3rem] border border-ink/10 bg-white/45 p-4.5 hover:bg-white/80">
                <div className="flex items-center justify-between">
                  <span className="grid h-8.5 w-8.5 place-items-center rounded-full bg-bone-2 text-[10.5px] font-extrabold text-ink transition group-hover:bg-ink group-hover:text-acid">
                    0{index + 1}
                  </span>
                  <Sparkle className="m-twinkle-star h-3.5 w-3.5 text-plum/35" />
                </div>
                <h3 className="mt-3.5 text-[13.5px] font-bold">{step.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-mist">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="m-clip-capsule" delay={110} className="mt-5">
          <div className="relative overflow-hidden rounded-[1.45rem] bg-acid px-5 py-5 text-ink sm:px-8 sm:py-6">
            <div className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full border border-ink/10" />
            <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: formatNumber(atelierStats.trials, lang), label: t("stat.trials") },
                { value: `${formatNumber(atelierStats.hours, lang)}h`, label: t("stat.hours") },
                { value: `${formatNumber(atelierStats.clients / 1000, lang)}k`, label: t("stat.clients") },
                { value: "4.9/5", label: t("stat.rating") },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl leading-none sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-ink/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
