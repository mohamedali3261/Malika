import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const BAG_PULSE_EVENT = "malika:bag-pulse";

export function emitBagPulse() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BAG_PULSE_EVENT));
  }
}

export function useBagPulse(durationMs = 580) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onPulse = () => {
      setPulsing(false);
      window.requestAnimationFrame(() => {
        setPulsing(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setPulsing(false), durationMs);
      });
    };
    window.addEventListener(BAG_PULSE_EVENT, onPulse);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(BAG_PULSE_EVENT, onPulse);
    };
  }, [durationMs]);

  return pulsing;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * Real-time pointer 3D perspective tilt + specular glare coordinates.
 * Writes CSS custom properties directly on the DOM node via rAF — zero React re-renders.
 */
export function useCardTilt3D<T extends HTMLElement = HTMLElement>(maxDeg = 5.5) {
  const ref = useRef<T | null>(null);
  const frameRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (reduced || event.pointerType !== "mouse") return;
      const node = ref.current;
      if (!node) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
        const rx = ((0.5 - py) * maxDeg * 2).toFixed(2);
        const ry = ((px - 0.5) * maxDeg * 2).toFixed(2);
        node.style.setProperty("--rx", `${rx}deg`);
        node.style.setProperty("--ry", `${ry}deg`);
        node.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        node.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        node.style.setProperty("--glare-o", "1");
      });
    },
    [maxDeg, reduced]
  );

  const onPointerLeave = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--glare-o", "0");
  }, []);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  return { ref, onPointerMove, onPointerLeave } as const;
}

/**
 * Subtle luxury magnetic pull (--mx, --my) for CTAs and floating medallions.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 7) {
  const ref = useRef<T | null>(null);
  const frameRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (reduced || event.pointerType !== "mouse") return;
      const node = ref.current;
      if (!node) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const dx = ((clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1)) * strength * 2;
        const dy = ((clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1)) * strength * 2;
        node.style.setProperty("--mx", `${dx.toFixed(1)}px`);
        node.style.setProperty("--my", `${dy.toFixed(1)}px`);
      });
    },
    [reduced, strength]
  );

  const onPointerLeave = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  }, []);

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  return { ref, onPointerMove, onPointerLeave } as const;
}
