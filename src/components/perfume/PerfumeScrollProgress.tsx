import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { stages, type StageName } from "@/config/perfumeModelConfig";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

const stageLabels: Record<StageName, { en: string; ar: string }> = {
  heroReveal: { en: "Reveal", ar: "الظهور" },
  separation: { en: "Separation", ar: "التفكيك" },
  showcase: { en: "Components", ar: "المكوّنات" },
  reassembly: { en: "Assembly", ar: "التجميع" },
  finalReveal: { en: "The bottle", ar: "الزجاجة" },
};

const order = Object.keys(stages) as StageName[];

/** Minimal vertical progress rail. Updated via refs, never via state. */
export function PerfumeScrollProgress({ stateRef }: { stateRef: React.RefObject<ScrollState> }) {
  const { l } = useLang();
  const fillRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    let frame = 0;
    let lastPercent = -1;

    let lastProgress = -1;
    const tick = () => {
      const progress = stateRef.current?.progress ?? 0;
      if (progress === lastProgress) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      lastProgress = progress;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;

      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        if (valueRef.current) valueRef.current.textContent = String(percent).padStart(2, "0");
        order.forEach((name) => {
          const [start, end] = stages[name];
          const node = dotRefs.current[name];
          if (!node) return;
          const active = progress >= start && progress < end;
          const done = progress >= end;
          node.dataset.state = active ? "active" : done ? "done" : "idle";
        });
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [stateRef]);

  return (
    <div className="perfume-progress" aria-hidden="true">
      <span ref={valueRef} className="perfume-progress__value">00</span>
      <span className="perfume-progress__rail">
        <span ref={fillRef} className="perfume-progress__fill" />
      </span>
      <span className="perfume-progress__stages">
        {order.map((name) => (
          <span
            key={name}
            ref={(node) => {
              dotRefs.current[name] = node;
            }}
            className="perfume-progress__stage"
            data-state="idle"
          >
            <span className="perfume-progress__dot" />
            <span className="perfume-progress__label">{l(stageLabels[name])}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
