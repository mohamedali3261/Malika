import { useEffect, useRef, type RefObject } from "react";
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

/** Interactive vertical progress rail — click/tap any stage to jump smoothly. */
export function PerfumeScrollProgress({
  stateRef,
  triggerRef,
}: {
  stateRef: React.RefObject<ScrollState>;
  triggerRef?: RefObject<HTMLElement | null>;
}) {
  const { l } = useLang();
  const fillRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
        order.forEach((name, idx) => {
          const [start, end] = stages[name];
          const node = dotRefs.current[name];
          if (!node) return;
          const active =
            progress >= start && (idx === order.length - 1 ? progress <= end : progress < end);
          const done = !active && progress >= end;
          node.dataset.state = active ? "active" : done ? "done" : "idle";
        });
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [stateRef]);

  const jumpToStage = (name: StageName) => {
    const el = triggerRef?.current;
    if (!el || typeof window === "undefined") return;
    const [start, end] = stages[name];
    const target =
      name === "heroReveal"
        ? 0.02
        : name === "finalReveal"
          ? 0.96
          : (start + end) * 0.5;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const distance = Math.max(1, el.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + distance * target, behavior: "smooth" });
  };

  return (
    <div className="perfume-progress">
      <span ref={valueRef} className="perfume-progress__value">
        00
      </span>
      <span className="perfume-progress__rail" aria-hidden="true">
        <span ref={fillRef} className="perfume-progress__fill" />
      </span>
      <span className="perfume-progress__stages">
        {order.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => jumpToStage(name)}
            aria-label={l(stageLabels[name])}
            ref={(node) => {
              dotRefs.current[name] = node;
            }}
            className="perfume-progress__stage pcard-chip"
            data-state="idle"
          >
            <span className="perfume-progress__dot" />
            <span className="perfume-progress__label">{l(stageLabels[name])}</span>
          </button>
        ))}
      </span>
    </div>
  );
}
