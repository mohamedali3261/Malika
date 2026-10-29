import { useEffect, useRef } from "react";

/**
 * Thin reading-progress line. Written straight to the DOM from a
 * rAF-throttled scroll listener, so scrolling never triggers a React render.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let queued = false;

    const paint = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px]" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left bg-linear-to-r from-plum via-lilac to-acid will-change-transform rtl:origin-right"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
