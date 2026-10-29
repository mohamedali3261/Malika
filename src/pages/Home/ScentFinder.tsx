import { Reveal } from "@/components/ui/Reveal";
import { Badge, SmartImage } from "@/components/ui/Primitives";
import { ArrowUpRight, Sparkle } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import type { Mood } from "@/types";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";

const moodOptions: { key: Mood; label: "finder.fresh" | "finder.warm" | "finder.bold" | "finder.floral"; hint: { en: string; ar: string }; glyph: string }[] = [
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
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-plum p-6 text-bone sm:rounded-[2.5rem] sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-lilac/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-28 start-1/4 h-72 w-72 rounded-full bg-acid/10 blur-[80px]" />
            <div className="pointer-events-none absolute end-10 top-10 hidden lg:block">
              <div className="anim-spin-slow grid h-28 w-28 place-items-center rounded-full border border-dashed border-bone/20 text-center">
                <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-bone/50">
                  <Sparkle className="mx-auto mb-1 h-4 w-4 text-acid" />
                  {x("choose a feeling", "اختر إحساسك")}
                </div>
              </div>
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-acid">
                  <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                  {lc(c.finder.eyebrow)} · 30s
                </span>
                <h2 className="hd-section font-display mt-3 leading-[1] tracking-tight">
                  {lc(c.finder.title)}
                </h2>
                <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-bone/55">{lc(c.finder.lead)}</p>

                <div className="mt-7 grid grid-cols-2 gap-2.5">
                  {moodOptions.map((option) => {
                    const active = mood === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => setMood(option.key)}
                        aria-pressed={active}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border p-3.5 text-start transition-all duration-300",
                          active
                            ? "border-acid bg-acid text-ink shadow-lg shadow-acid/10"
                            : "border-bone/15 bg-bone/[0.03] text-bone hover:border-bone/35 hover:bg-bone/[0.07]"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold">{t(option.label)}</span>
                          <span className={cn("text-base", active ? "text-ink" : "text-acid/70")}>{option.glyph}</span>
                        </div>
                        <p className={cn("mt-1 text-[9.5px]", active ? "text-ink/60" : "text-bone/35")}>
                          {l(option.hint)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <Link
                  to="/shop"
                  className="link-underline mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bone/60 transition hover:text-acid"
                >
                  {t("finder.shopAll")} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div>
                <p className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.22em] text-bone/35">
                  <span>{t("finder.result")}</span>
                  <span>0{matches.length}</span>
                </p>
                <div key={mood} className="mt-4 space-y-2.5">
                  {matches.length === 0 && (
                    <p className="rounded-2xl border border-bone/10 p-6 text-sm text-bone/50">{t("product.noResults")}</p>
                  )}
                  {matches.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="anim-pop group flex items-center gap-4 rounded-2xl border border-bone/10 bg-bone/[0.035] p-3 transition-all duration-300 hover:border-acid/40 hover:bg-bone/[0.08]"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <SmartImage
                        src={product.images[0]}
                        alt={l(product.name)}
                        className="h-[86px] w-[70px] shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[14px] font-bold text-bone">{l(product.name)}</h3>
                          {product.isNew && <Badge tone="acid" className="px-1.5 py-0.5 text-[8px]">{t("product.new")}</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-bone/45">{l(product.tagline)}</p>
                        <p className="mt-1.5 text-[11px] font-bold text-acid">{formatPrice(product.price, lang)}</p>
                      </div>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bone/15 text-bone/60 transition group-hover:border-acid group-hover:bg-acid group-hover:text-ink">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-bone/30">
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
