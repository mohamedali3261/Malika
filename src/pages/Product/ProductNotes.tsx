import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";
import type { CSSProperties } from "react";

export function ProductNotes({ product }: { product: Product }) {
  const { t, l, x } = useLang();
  const columns = [
    { key: "top" as const, label: t("product.top"), index: "01", notes: product.notes.top },
    { key: "heart" as const, label: t("product.heart"), index: "02", notes: product.notes.heart },
    { key: "base" as const, label: t("product.base"), index: "03", notes: product.notes.base },
  ];

  return (
    <Reveal variant="m-clip-frame-in">
      <div className="grain relative overflow-hidden rounded-[1.6rem] bg-plum p-5 text-bone sm:rounded-[2rem] sm:p-8 lg:p-9">
        <div
          className="m-breathe-aura pointer-events-none absolute -end-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-[80px]"
          style={{ background: product.accent }}
        />
        <div className="relative grid gap-6 md:grid-cols-[0.55fr_1.45fr] md:items-center md:gap-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.26em] text-acid">
              <span className="m-eyebrow-dot-blink h-1.5 w-1.5 rounded-full bg-acid" /> {t("product.notes")}
            </span>
            <h2 className="hd-section font-display mt-2 leading-[1]">
              {x("The scent trail.", "الرحلة العطرية.")}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {columns.map((column, index) => (
              <div key={column.key} className="relative border-t border-bone/15 pt-3.5">
                <span className="absolute -top-2 end-0 bg-plum px-1 font-mono text-[9px] tracking-[0.16em] text-bone/35">
                  {column.index}
                </span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-acid">{column.label}</h3>
                <ul className="mt-2.5 space-y-2">
                  {column.notes.map((note, noteIndex) => (
                    <li
                      key={note.en}
                      className="m-note-chip-cascade flex items-start gap-2 text-[12px] text-bone/75"
                      style={{ "--m-delay": `${(index * 3 + noteIndex) * 45}ms` } as CSSProperties}
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: noteIndex === 0 ? product.accent : "rgba(243,239,231,0.25)" }}
                      />
                      {l(note)}
                    </li>
                  ))}
                </ul>
                {index < 2 && (
                  <span className="absolute -end-3 top-1/2 hidden h-4 w-px -translate-y-1/2 bg-bone/10 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
