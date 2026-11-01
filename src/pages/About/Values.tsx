import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Flask, Globe, Leaf } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";

export function Values() {
  const { t, x } = useLang();
  const values = [
    { icon: Flask, title: t("about.v1"), body: t("about.v1b"), tone: "bg-ink text-bone", accent: "text-acid" },
    { icon: Leaf, title: t("about.v2"), body: t("about.v2b"), tone: "bg-lilac-soft text-ink", accent: "text-plum" },
    { icon: Globe, title: t("about.v3"), body: t("about.v3b"), tone: "bg-acid text-ink", accent: "text-ink/60" },
  ];

  return (
    <section className="bg-bone-2/50 sec-y-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal variant="m-blur-rise">
          <SectionHeading
            eyebrow={t("pillars.eyebrow")}
            title={t("about.valuesTitle")}
            align="between"
            action={
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-bone px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-mist">
                <span className="m-pulse-beacon h-1.5 w-1.5 rounded-full bg-acid-deep" />
                {x("how we work", "ممارساتنا اليومية")}
              </span>
            }
          />
        </Reveal>
        <div className="mt-7 grid gap-3.5 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} variant="m-3d-flip-x-up" delay={index * 75} className="h-full">
              <div className={`sheen m-hover-lift-md relative h-full overflow-hidden rounded-[1.35rem] p-5 ${value.tone}`}>
                <span aria-hidden="true" className="sheen-bar" />
                <value.icon className={`h-5 w-5 ${value.accent}`} />
                <h3 className="font-display mt-4 text-xl sm:text-[1.35rem]">{value.title}</h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed opacity-65">{value.body}</p>
                <span className="absolute end-4 top-4 font-mono text-[9.5px] opacity-30">0{index + 1}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
