import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { currentStage } from "@/utils/perfumeTransforms";
import type { StageName } from "@/config/perfumeModelConfig";

gsap.registerPlugin(ScrollTrigger);
// Mobile browsers fire `resize` as the URL bar collapses mid-scroll. Without
// this, ScrollTrigger re-measures every time and the scene visibly stutters.
ScrollTrigger.config({ ignoreMobileResize: true });

export interface ScrollState {
  /** Master progress 0 → 1 across the pinned section. */
  progress: number;
  /** Scroll velocity, used for subtle motion lag. */
  velocity: number;
}

interface Options {
  /** The sticky viewport. Kept for readiness checks and future layering. */
  pinRef: RefObject<HTMLElement | null>;
  /** Outer wrapper whose height defines the scroll distance. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Written every tick — read it inside useFrame, never in render. */
  stateRef: RefObject<ScrollState>;
  /** Fires only when the narrative stage changes (cheap, not per frame). */
  onStageChange?: (stage: StageName) => void;
  /** Fires when the section enters/leaves the viewport, for lazy work. */
  onActiveChange?: (active: boolean) => void;
  /** Scroll distance in vh (drives the section height, see PerfumeExperience). */
  scrollLength: number;
  /** Disable pinning + scrubbing entirely (reduced motion / no WebGL). */
  enabled: boolean;
}

/**
 * One master ScrollTrigger drives one master timeline. Every 3D transform
 * reads `stateRef.current.progress`, so there is exactly one source of truth
 * and no competing triggers animating the same properties.
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

    // gsap.context scopes every tween/trigger created inside it, so a single
    // revert() cleans up correctly — including React 19 StrictMode remounts.
    const ctx = gsap.context(() => {
      const proxy = { progress: 0 };

      const scrollTrigger = ScrollTrigger.create({
        trigger,
        // The stage is held in place by CSS `position: sticky`, not by a GSAP
        // pin. ScrollTrigger therefore only has to report progress, which
        // removes pin-spacer layout maths entirely — no double padding, no
        // transform/containing-block pitfalls, and smoother mobile scrolling.
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

      // The master timeline exists so future DOM layers (labels, lighting
      // rigs, overlays) can be attached to the very same scrub source.
      gsap.timeline({ scrollTrigger }).to(proxy, { progress: 1, ease: "none" });
    }, trigger);

    // Fonts and the WebGL canvas settle after mount; measuring again avoids
    // a wrong pin height on first paint.
    const refresh = () => ScrollTrigger.refresh();
    const raf = window.requestAnimationFrame(refresh);
    const timeout = window.setTimeout(refresh, 600);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [pinRef, triggerRef, stateRef, scrollLength, enabled]);
}

export { ScrollTrigger };
