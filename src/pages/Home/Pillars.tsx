import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Primitives";
import { Flask, Gift, Leaf, Plus } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/utils/cn";

export function Pillars() {
  const { x } = useLang();
  const { c, lc } = useContent();

  const icons = [Flask, Leaf, Gift];
  const tones = [
    { className: "bg-ink text-bone border-ink", accent: "text-acid" },
    { className: "bg-acid text-ink border-acid", accent: "text-ink/60" },
    { className: "bg-lilac-soft text-ink border-ink/10", accent: "text-plum" },
  ];
  const pillars = c.pillars.items.map((item, index) => ({
    icon: icons[index % icons.length],
    title: lc(item.title),
    body: lc(item.body),
    ...tones[index % tones.length],
  }));


  return (
    <section className="cv-auto relative bg-bone-2/50 sec-y">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow={lc(c.pillars.eyebrow)}
            title={lc(c.pillars.title)}
            align="between"
            action={
              <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-bone px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-acid-deep" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-mist">
                  {x("Cruelty-free · Vegan", "خالٍ من القسوة · نباتي")}
                </span>
              </div>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-14">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 90} className="h-full">
              <div
                className={cn(
                  "group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[1.75rem] border p-6 transition-transform duration-500 hover:-translate-y-1.5",
                  pillar.className
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-current/20 bg-white/10">
                    <pillar.icon className="h-5 w-5" />
                  </span>
                  <span className={cn("font-mono text-[10px] tracking-[0.2em]", pillar.accent)}>0{index + 1}</span>
                </div>
                <div className="mt-8">
                  <h3 className="font-display text-2xl leading-tight">{pillar.title}</h3>
                  <p className="mt-2.5 text-[12px] leading-relaxed opacity-70">{pillar.body}</p>
                </div>
                <span className="absolute -bottom-5 -end-5 grid h-16 w-16 place-items-center rounded-full border border-current/15 opacity-30 transition-transform duration-500 group-hover:rotate-90">
                  <Plus className="h-5 w-5" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
