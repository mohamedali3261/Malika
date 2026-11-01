import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentStage } from "@/utils/perfumeTransforms";
import type { StageName } from "@/config/perfumeModelConfig";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export interface ScrollState {
  /** Master progress 0 → 1 across the pinned section. */
  progress: number;
  /** Scroll velocity, used for subtle motion lag. */
  velocity: number;
}

interface Options {
  pinRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  stateRef: RefObject<ScrollState>;
  onStageChange?: (stage: StageName) => void;
  onActiveChange?: (active: boolean) => void;
  scrollLength: number;
  enabled: boolean;
}

/**
 * One master ScrollTrigger drives one master timeline, plus a debounced body
 * ResizeObserver so async catalogue hydration above never leaves stale trigger bounds.
 */
export function usePerfumeScrollAnimation({
  pinRef,
  triggerRef,
  stateRef,
  onStageChange,
  onActiveChange,
  scrollLength,
  enabled,
}: Options) {
  const stageRef = useRef<StageName | null>(null);
  const stageChangeRef = useRef(onStageChange);
  const activeChangeRef = useRef(onActiveChange);

  stageChangeRef.current = onStageChange;
  activeChangeRef.current = onActiveChange;

  useEffect(() => {
    const trigger = triggerRef.current;
    const pin = pinRef.current;
    if (!trigger || !pin || !enabled) return;

    const ctx = gsap.context(() => {
      const proxy = { progress: 0 };

      const scrollTrigger = ScrollTrigger.create({
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onToggle: (self) => activeChangeRef.current?.(self.isActive),
        onUpdate: (self) => {
          const state = stateRef.current;
          if (state) {
            state.progress = self.progress;
            state.velocity = self.getVelocity();
          }
          const stage = currentStage(self.progress);
          if (stage !== stageRef.current) {
            stageRef.current = stage;
            stageChangeRef.current?.(stage);
          }
        },
      });

      gsap.timeline({ scrollTrigger }).to(proxy, { progress: 1, ease: "none" });
    }, trigger);

    let debounceTimer = 0;
    const refresh = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };

    const raf = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    const timeout = window.setTimeout(() => ScrollTrigger.refresh(), 650);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      let lastH = document.body.offsetHeight;
      ro = new ResizeObserver(() => {
        const nextH = document.body.offsetHeight;
        if (Math.abs(nextH - lastH) > 8) {
          lastH = nextH;
          refresh();
        }
      });
      ro.observe(document.body);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.clearTimeout(debounceTimer);
      window.removeEventListener("load", refresh);
      ro?.disconnect();
      ctx.revert();
    };
  }, [pinRef, triggerRef, stateRef, scrollLength, enabled]);
}

export { ScrollTrigger };
