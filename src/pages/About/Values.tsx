import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Primitives";
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
        <Reveal>
          <SectionHeading
            eyebrow={t("pillars.eyebrow")}
            title={t("about.valuesTitle")}
            align="between"
            action={
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-bone px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-mist">
                <span className="h-1.5 w-1.5 rounded-full bg-acid-deep" />
                {x("how we work", "ممارساتنا اليومية")}
              </span>
            }
          />
        </Reveal>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 80} className="h-full">
              <div className={`relative h-full overflow-hidden rounded-[1.75rem] p-6 ${value.tone}`}>
                <value.icon className={`h-6 w-6 ${value.accent}`} />
                <h3 className="font-display mt-6 text-2xl">{value.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed opacity-65">{value.body}</p>
                <span className="absolute end-5 top-5 font-mono text-[10px] opacity-30">0{index + 1}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
