import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PerfumeFallback } from "@/components/perfume/PerfumeFallback";
import { PerfumeProductInfo } from "@/components/perfume/PerfumeProductInfo";
import { PerfumeScrollProgress } from "@/components/perfume/PerfumeScrollProgress";
import { qualityProfiles, scrollLength } from "@/config/perfumeModelConfig";
import { usePerfumeScrollAnimation, type ScrollState } from "@/hooks/usePerfumeScrollAnimation";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/utils/cn";
import { detectQuality, mobileStageShift, supportsWebGL } from "@/utils/perfumeTransforms";
import "@/styles/perfume-experience.css";

const loadScene = () =>
  import("@/components/perfume/PerfumeScene").then((module) => ({ default: module.PerfumeScene }));

/** three.js is split out so it never blocks the hero's first paint. */
const PerfumeScene = lazy(loadScene);

/** Run `callback` as soon as the browser is idle after first paint. */
function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 700 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 80);
  return () => window.clearTimeout(id);
}

type Capability = "pending" | "webgl" | "fallback";

export function PerfumeExperience() {
  const { x } = useLang();
  const triggerRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ScrollState>({ progress: 0, velocity: 0 });

  const [capability, setCapability] = useState<Capability>("pending");
  const [quality, setQuality] = useState<keyof typeof qualityProfiles>("low");
  const [mountScene, setMountScene] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  // The loop runs for a short warm-up after creation so shaders compile and
  // textures upload while the visitor is still on the hero — not on arrival.
  const [warm, setWarm] = useState(true);
  const [length, setLength] = useState<number>(scrollLength.desktop);

  /* Capability + quality detection (once, on the client). */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!supportsWebGL() || reduced) {
      setCapability("fallback");
      return;
    }
    setQuality(detectQuality());
    setCapability("webgl");
  }, []);

  /* Create the scene right after first paint — at site entry, not on scroll. */
  useEffect(() => {
    if (capability !== "webgl") return;
    return whenIdle(() => {
      void loadScene();
      setMountScene(true);
    });
  }, [capability]);

  const handleReady = useCallback(() => {
    setReady(true);
    window.setTimeout(() => setWarm(false), 1800);
  }, []);

  /* Scroll distance per breakpoint. */
  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      const landscapePhone = window.innerHeight < 520;
      if (width < 768 || landscapePhone) setLength(scrollLength.mobile);
      else if (width < 1280) setLength(scrollLength.tablet);
      else setLength(scrollLength.desktop);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  /**
   * One tiny rAF loop for the two things that depend on progress but live
   * outside WebGL: the scroll hint's fade and the phone/tablet stage shift.
   * It does nothing at all unless progress actually changed.
   */
  useEffect(() => {
    let frame = 0;
    let lastProgress = -1;
    let factor = 0;

    const measure = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // 0 → copy sits beside the bottle (desktop / landscape): no shift.
      factor = height < 520 ? 0 : width < 768 ? 1 : width < 1024 ? 0.8 : 0;
      lastProgress = -1; // force a repaint at the new breakpoint
    };

    const tick = () => {
      const progress = stateRef.current?.progress ?? 0;
      if (progress !== lastProgress) {
        lastProgress = progress;
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - progress / 0.08));
        if (canvasRef.current) {
          const shift = factor === 0 ? 0 : mobileStageShift(progress) * factor * 100;
          canvasRef.current.style.transform = shift === 0 ? "" : `translate3d(0, ${shift.toFixed(2)}%, 0)`;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, []);

  usePerfumeScrollAnimation({
    pinRef,
    triggerRef,
    stateRef,
    scrollLength: length,
    enabled: capability === "webgl",
    onActiveChange: setActive,
  });

  const profile = useMemo(() => qualityProfiles[quality], [quality]);

  if (capability === "fallback") {
    return <PerfumeFallback />;
  }

  return (
    <section
      ref={triggerRef}
      className="perfume-experience"
      // 100svh of sticky viewport + `length` of actual scrub travel.
      style={{ height: `calc(100svh + ${length}vh)` }}
      aria-label={x("3D bottle experience", "تجربة الزجاجة ثلاثية الأبعاد")}
    >
      <div ref={pinRef} className="perfume-stage">
        <div className="perfume-stage__backdrop" />
        <div className="perfume-stage__grain" />

        <div ref={canvasRef} className={cn("perfume-stage__canvas", ready && "is-ready")}>
          {mountScene && (
            <Suspense fallback={null}>
              <PerfumeScene stateRef={stateRef} quality={profile} active={active || warm} onReady={handleReady} />
            </Suspense>
          )}
        </div>

        <PerfumeProductInfo stateRef={stateRef} />
        <PerfumeScrollProgress stateRef={stateRef} />

        <div ref={hintRef} className="perfume-stage__hint" aria-hidden="true">
          <span className="perfume-stage__hint-line" />
          {x("Scroll to disassemble", "مرّر للتفكيك")}
        </div>
      </div>
    </section>
  );
}

export default PerfumeExperience;
