import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Stars } from "@/components/ui/Primitives";
import { Quote, Check } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";

export function Testimonials() {
  const { t, l } = useLang();
  const { c, lc } = useContent();

  return (
    <section className="cv-auto relative overflow-hidden bg-bone sec-y">
      <div className="pointer-events-none absolute -start-20 top-1/4 h-72 w-72 rounded-full bg-lilac/20 blur-[90px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow={lc(c.testimonials.eyebrow)}
            title={lc(c.testimonials.title)}
            lead={lc(c.testimonials.lead)}
            align="between"
            action={
              <div className="flex flex-col items-start gap-2 rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 md:items-end">
                <Stars value={4.9} size={14} />
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-mist">
                  {t("stat.clients")} · 12k+
                </p>
              </div>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {c.testimonials.items.slice(0, 3).map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 90} className="h-full">
              <figure className="group relative flex h-full flex-col rounded-[1.75rem] border border-ink/10 bg-white/45 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ink/20 hover:bg-white/80 hover:shadow-[0_24px_50px_-30px_rgba(20,16,25,0.4)] sm:p-7">
                <div className="flex items-center justify-between">
                  <Quote className="h-7 w-7" style={{ color: testimonial.accent }} />
                  <Stars value={testimonial.rating} size={11} />
                </div>
                <blockquote className="mt-5 flex-1 text-[13.5px] leading-relaxed text-ink/75">
                  “{l(testimonial.quote)}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-4">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-extrabold text-ink"
                    style={{ backgroundColor: testimonial.accent }}
                  >
                    {testimonial.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold">{l(testimonial.name)}</p>
                    <p className="text-[10px] text-mist">{l(testimonial.city)}</p>
                  </div>
                  <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-bone-2 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-mist">
                    <Check className="h-2.5 w-2.5" />
                    {l({ en: "Verified", ar: "موثّق" })}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100} className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[9px] font-bold uppercase tracking-[0.22em] text-mist/70">
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
