import { useEffect, useRef } from "react";
import { Sparkle } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { fadeWindow } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

interface Props {
  stateRef: React.RefObject<ScrollState>;
}

/**
 * Narrative copy blocks keyed to the 3D bottle scroll stages.
 */
export function PerfumeProductInfo({ stateRef }: Props) {
  const { x } = useLang();
  const { c, lc } = useContent();

  const heroRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const apply = (node: HTMLDivElement | null, opacity: number, shift: number) => {
      if (!node) return;
      node.style.opacity = opacity.toFixed(3);
      node.style.setProperty("--p-shift", `${shift.toFixed(2)}px`);
      node.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      node.setAttribute("aria-hidden", opacity < 0.1 ? "true" : "false");
    };

    let last = -1;
    const tick = () => {
      const progress = stateRef.current?.progress ?? 0;
      if (progress === last) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      last = progress;

      const hero = fadeWindow(progress, 0, 0.14, 0.06);
      const craft = fadeWindow(progress, 0.42, 0.6, 0.07);

      apply(heroRef.current, hero, (1 - hero) * 24);
      apply(craftRef.current, craft, (1 - craft) * 24);

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [stateRef]);

  return (
    <div className="perfume-overlay">
      {/* STAGE 1 — hero reveal */}
      <div ref={heroRef} className="perfume-block perfume-block--hero" style={{ opacity: 0 }}>
        <span className="perfume-eyebrow">
          <span className="perfume-eyebrow__dot" />
          {lc(c.perfume3d.collection)}
        </span>
        <h2 className="perfume-title font-display">{lc(c.perfume3d.name)}</h2>
        <p className="perfume-tagline">{lc(c.perfume3d.tagline)}</p>
        <p className="perfume-meta">{lc(c.perfume3d.heroLine)}</p>
      </div>

      {/* STAGE 3 — craftsmanship story */}
      <div ref={craftRef} className="perfume-block perfume-block--craft" style={{ opacity: 0 }}>
        <span className="perfume-eyebrow">
          <Sparkle className="h-3 w-3" />
          {x("Ten precision parts", "عشرة أجزاء دقيقة")}
        </span>
        <h3 className="perfume-subtitle font-display">{lc(c.perfume3d.craftTitle)}</h3>
        <p className="perfume-body">{lc(c.perfume3d.craftBody)}</p>
      </div>
    </div>
  );
}
