import { ArrowUp } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { useRoute } from "@/lib/router";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 18;

/**
 * Compact circular scroll-to-top button with a real-time SVG progress ring.
 * Appears smoothly after scrolling down and hides near the top or inside Studio.
 */
export function BackToTop() {
  const { x } = useLang();
  const { path } = useRoute();
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const scrollY = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / max));
      setVisible(scrollY > 480);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = `${(CIRCUMFERENCE * (1 - progress)).toFixed(2)}`;
      }
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [path]);

  if (path === "/studio" || path === "/admin" || path.startsWith("/product/")) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={x("Back to top", "العودة للأعلى")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "m-press-spring fixed bottom-22 end-4 z-[65] grid h-10.5 w-10.5 place-items-center rounded-full bg-ink/90 text-bone shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-plum lg:bottom-5 lg:end-5",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <svg viewBox="0 0 42 42" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="21" cy="21" r="18" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" />
        <circle
          ref={ringRef}
          cx="21"
          cy="21"
          r="18"
          fill="none"
          stroke="#ddf25c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
