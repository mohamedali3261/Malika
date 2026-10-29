import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";

export function ProductNotes({ product }: { product: Product }) {
  const { t, l, x } = useLang();
  const columns = [
    { key: "top" as const, label: t("product.top"), index: "01", notes: product.notes.top },
    { key: "heart" as const, label: t("product.heart"), index: "02", notes: product.notes.heart },
    { key: "base" as const, label: t("product.base"), index: "03", notes: product.notes.base },
  ];

  return (
    <Reveal>
      <div className="grain relative overflow-hidden rounded-[1.8rem] bg-plum p-6 text-bone sm:rounded-[2.2rem] sm:p-9 lg:p-11">
        <div
          className="pointer-events-none absolute -end-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-[80px]"
          style={{ background: product.accent }}
        />
        <div className="relative grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.26em] text-acid">
              <span className="h-1.5 w-1.5 rounded-full bg-acid" /> {t("product.notes")}
            </span>
            <h2 className="hd-section font-display mt-3 leading-[1]">
              {x("The scent trail.", "الرحلة العطرية.")}
            </h2>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-bone/50">
              {x("Three stages unfolding on your skin over the hours. Each one tells part of the story.", "ثلاث مراحل تتكشف على بشرتك خلال ساعات. كل مرحلة تحكي جزءاً من الحكاية.")}
            </p>
            <div className="mt-6 flex gap-1.5">
              {product.notes.heart.slice(0, 3).map((note, index) => (
                <span
                  key={note.en}
                  className="grid h-12 w-12 place-items-center rounded-full border border-bone/15 text-[8px] font-semibold uppercase leading-tight text-bone/60"
                  style={{ transform: `translateY(${index * -3}px)` }}
                >
                  {l(note).split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {columns.map((column, index) => (
              <div key={column.key} className="relative border-t border-bone/15 pt-4">
                <span className="absolute -top-2 end-0 bg-plum px-1 font-mono text-[9px] tracking-[0.16em] text-bone/35">
                  {column.index}
                </span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-acid">{column.label}</h3>
                <ul className="mt-3 space-y-2.5">
                  {column.notes.map((note, noteIndex) => (
                    <li key={note.en} className="flex items-start gap-2 text-[12px] text-bone/75">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: noteIndex === 0 ? product.accent : "rgba(243,239,231,0.25)" }} />
                      {l(note)}
                    </li>
                  ))}
                </ul>
                {index < 2 && <span className="absolute -end-3 top-1/2 hidden h-4 w-px -translate-y-1/2 bg-bone/10 sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
