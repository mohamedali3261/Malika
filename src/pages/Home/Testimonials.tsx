import { SectionHeading, Stars } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Check, Quote } from "@/components/ui/icons";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";

export function Testimonials() {
  const { t, l } = useLang();
  const { c, lc } = useContent();

  return (
    <section className="cv-auto relative overflow-hidden bg-bone sec-y">
      <div className="m-drift-mist-b pointer-events-none absolute -start-20 top-1/4 h-64 w-64 rounded-full bg-lilac/20 blur-[90px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal variant="m-blur-rise">
          <SectionHeading
            eyebrow={lc(c.testimonials.eyebrow)}
            title={lc(c.testimonials.title)}
            lead={lc(c.testimonials.lead)}
            align="between"
            action={
              <div className="flex flex-col items-start gap-1.5 rounded-2xl border border-ink/10 bg-white/50 px-3.5 py-2.5 md:items-end">
                <Stars value={4.9} size={13} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-mist">
                  {t("stat.clients")} · 12k+
                </p>
              </div>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-3.5 md:grid-cols-2 lg:mt-11 lg:grid-cols-3">
          {c.testimonials.items.slice(0, 3).map((testimonial, index) => (
            <Reveal key={testimonial.id} variant="m-spring-soft" delay={index * 75} className="h-full">
              <figure className="m-hover-lift-md group relative flex h-full flex-col rounded-[1.35rem] border border-ink/10 bg-white/50 p-5 hover:border-ink/20 hover:bg-white/85">
                <div className="flex items-center justify-between">
                  <Quote className="m-quote-float h-5.5 w-5.5" style={{ color: testimonial.accent }} />
                  <Stars value={testimonial.rating} size={10} />
                </div>
                <blockquote className="mt-3.5 flex-1 text-[12.5px] leading-relaxed text-ink/75">
                  “{l(testimonial.quote)}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-ink/10 pt-3.5">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full text-[9.5px] font-extrabold text-ink transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: testimonial.accent }}
                  >
                    {testimonial.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold">{l(testimonial.name)}</p>
                    <p className="text-[9.5px] text-mist">{l(testimonial.city)}</p>
                  </div>
                  <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-bone-2 px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-mist">
                    <Check className="h-2.5 w-2.5" />
                    {l({ en: "Verified", ar: "موثّق" })}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal variant="m-rise-soft" delay={90} className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-[9px] font-bold uppercase tracking-[0.22em] text-mist/70">
          <span>VOGUE ARABIA</span>
          <span className="h-1 w-1 rounded-full bg-mist/40" />
          <span>CAIROSCENE</span>
          <span className="h-1 w-1 rounded-full bg-mist/40" />
          <span>ELITE DAILY</span>
          <span className="h-1 w-1 rounded-full bg-mist/40" />
          <span>MOBILY</span>
        </Reveal>
      </div>
    </section>
  );
}
