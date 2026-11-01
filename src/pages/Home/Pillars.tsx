import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Flask, Gift, Leaf, Plus } from "@/components/ui/icons";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
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
        <Reveal variant="m-blur-rise">
          <SectionHeading
            eyebrow={lc(c.pillars.eyebrow)}
            title={lc(c.pillars.title)}
            align="between"
            action={
              <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-bone px-3.5 py-1.5">
                <span className="m-pulse-beacon h-1.5 w-1.5 rounded-full bg-acid-deep" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-mist">
                  {x("Cruelty-free · Vegan", "خالٍ من القسوة · نباتي")}
                </span>
              </div>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-3.5 md:grid-cols-3 lg:mt-11">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} variant="m-3d-flip-x-up" delay={index * 75} className="h-full">
              <div
                className={cn(
                  "sheen m-hover-lift-md group relative flex h-full min-h-[184px] flex-col justify-between overflow-hidden rounded-[1.35rem] border p-5",
                  pillar.className
                )}
              >
                <span aria-hidden="true" className="sheen-bar" />
                <div className="flex items-start justify-between">
                  <span className="grid h-9.5 w-9.5 place-items-center rounded-full border border-current/20 bg-white/10 transition-transform duration-300 group-hover:scale-105">
                    <pillar.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className={cn("font-mono text-[10px] tracking-[0.2em]", pillar.accent)}>0{index + 1}</span>
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-xl leading-tight sm:text-[1.35rem]">{pillar.title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed opacity-70">{pillar.body}</p>
                </div>
                <span className="m-hover-icon-spin90 absolute -bottom-4 -end-4 grid h-13 w-13 place-items-center rounded-full border border-current/15 opacity-30">
                  <Plus className="h-4 w-4" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
