import { Badge, SmartImage } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight, Sparkle } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import type { Mood } from "@/types";
import { cn } from "@/utils/cn";
import { useMemo, useState, type CSSProperties } from "react";

const moodOptions: {
  key: Mood;
  label: "finder.fresh" | "finder.warm" | "finder.bold" | "finder.floral";
  hint: { en: string; ar: string };
  glyph: string;
}[] = [
  { key: "fresh", label: "finder.fresh", hint: { en: "citrus, salt, mornings", ar: "حمضيات، ملح، صباحات" }, glyph: "◌" },
  { key: "warm", label: "finder.warm", hint: { en: "amber, spice, evenings", ar: "عنبر، بهارات، أمسيات" }, glyph: "◐" },
  { key: "bold", label: "finder.bold", hint: { en: "oud, leather, presence", ar: "عود، جلد، حضور" }, glyph: "▲" },
  { key: "floral", label: "finder.floral", hint: { en: "jasmine, iris, softness", ar: "ياسمين، سوسن، نعومة" }, glyph: "✿" },
];

export function ScentFinder() {
  const { t, lang, l, x } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();
  const [mood, setMood] = useState<Mood>("warm");

  const matches = useMemo(
    () => products.filter((product) => product.moods.includes(mood)).slice(0, 3),
    [products, mood]
  );

  return (
    <section className="cv-auto relative bg-bone sec-pb">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal variant="m-clip-frame-in">
          <div className="grain relative overflow-hidden rounded-[1.8rem] bg-plum p-5 text-bone sm:rounded-[2.2rem] sm:p-8 lg:p-11">
            <div className="m-drift-mist-a pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-lilac/20 blur-[90px]" />
            <div className="m-breathe-aura pointer-events-none absolute -bottom-24 start-1/4 h-64 w-64 rounded-full bg-acid/10 blur-[80px]" />
            <div className="pointer-events-none absolute end-9 top-9 hidden lg:block">
              <div className="m-spin-seal-cw grid h-24 w-24 place-items-center rounded-full border border-dashed border-bone/20 text-center">
                <div className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-bone/50">
                  <Sparkle className="m-twinkle-star mx-auto mb-1 h-3.5 w-3.5 text-acid" />
                  {x("choose a feeling", "اختر إحساسك")}
                </div>
              </div>
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
              <div>
                <span className="inline-flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.28em] text-acid">
                  <span className="m-eyebrow-dot-blink h-1.5 w-1.5 rounded-full bg-acid" />
                  {lc(c.finder.eyebrow)} · 30s
                </span>
                <h2 className="hd-section font-display mt-2.5 leading-[1] tracking-tight">{lc(c.finder.title)}</h2>
                <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-bone/55">{lc(c.finder.lead)}</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {moodOptions.map((option) => {
                    const active = mood === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => setMood(option.key)}
                        aria-pressed={active}
                        className={cn(
                          "m-press-spring group relative overflow-hidden rounded-xl border p-3 text-start transition-all duration-300",
                          active
                            ? "m-elastic-pill border-acid bg-acid text-ink shadow-lg shadow-acid/10"
                            : "border-bone/15 bg-bone/[0.03] text-bone hover:border-bone/35 hover:bg-bone/[0.07]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12.5px] font-bold">{t(option.label)}</span>
                          <span className={cn("text-sm transition-transform duration-300 group-hover:scale-110", active ? "text-ink" : "text-acid/70")}>
                            {option.glyph}
                          </span>
                        </div>
                        <p className={cn("mt-0.5 text-[9px]", active ? "text-ink/60" : "text-bone/35")}>
                          {l(option.hint)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <Link
                  to="/shop"
                  className="link-underline mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bone/60 transition hover:text-acid"
                >
                  {t("finder.shopAll")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div>
                <p className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-bone/35">
                  <span>{t("finder.result")}</span>
                  <span>0{matches.length}</span>
                </p>
                <div key={mood} className="mt-3 space-y-2">
                  {matches.length === 0 && (
                    <p className="rounded-xl border border-bone/10 p-5 text-sm text-bone/50">{t("product.noResults")}</p>
                  )}
                  {matches.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="m-note-chip-cascade m-hover-lift-xs group flex items-center gap-3.5 rounded-xl border border-bone/10 bg-bone/[0.035] p-2.5 transition-colors duration-300 hover:border-acid/40 hover:bg-bone/[0.08]"
                      style={{ "--m-delay": `${index * 65}ms` } as CSSProperties}
                    >
                      <SmartImage
                        src={product.images[0]}
                        alt={l(product.name)}
                        className="h-[68px] w-[56px] shrink-0 rounded-lg bg-plum-2/80"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[13px] font-bold text-bone">{l(product.name)}</h3>
                          {product.isNew && (
                            <Badge tone="acid" className="px-1.5 py-0.5 text-[7.5px]">
                              {t("product.new")}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-bone/45">{l(product.tagline)}</p>
                        <p className="mt-1 text-[11px] font-bold text-acid">{formatPrice(product.price, lang)}</p>
                      </div>
                      <span className="grid h-7.5 w-7.5 shrink-0 place-items-center rounded-full border border-bone/15 text-bone/60 transition group-hover:border-acid group-hover:bg-acid group-hover:text-ink">
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
                <p className="mt-3.5 flex items-center gap-2 text-[8.5px] uppercase tracking-[0.18em] text-bone/30">
                  <span className="h-1 w-1 rounded-full bg-acid" />
                  {x("Every edit is reviewed by a human — no algorithms", "كل اختيار يُراجع يدوياً — لا خوارزميات")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
