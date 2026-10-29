import { cn } from "@/utils/cn";
import { useLang } from "@/i18n/LanguageContext";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

interface MarqueeProps {
  children: ReactNode;
  /** Pixels per second. Constant across every screen size. */
  speed?: number;
  /** Literal on-screen travel direction (not mirrored in RTL). */
  direction?: "left" | "right";
  /** Pause while the pointer is over the strip (desktop only). */
  pauseOnHover?: boolean;
  /** Allow touch/mouse dragging to scrub the strip. */
  draggable?: boolean;
  className?: string;
  trackClassName?: string;
  /** Fade the strip edges with a mask. */
  fade?: boolean;
}

/**
 * Continuous marquee driven by requestAnimationFrame.
 *
 * Why not a CSS keyframe animation:
 *  - A fixed duration means the strip crawls on a phone and races on a
 *    desktop. Here speed is px/second, so it reads identically everywhere.
 *  - The content is measured and repeated until it covers twice the
 *    container, so there is never a visible gap on very wide or very narrow
 *    screens.
 *  - rAF can be paused when off-screen or when the tab is hidden, which keeps
 *    low-end phones from burning battery on an invisible animation.
 *  - It allows swipe-to-scrub on touch devices, which a CSS animation cannot.
 */
export function Marquee({
  children,
  speed = 60,
  direction = "left",
  pauseOnHover = true,
  draggable = true,
  className,
  trackClassName,
  fade = true,
}: MarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const [copies, setCopies] = useState(2);
  const [reduced, setReduced] = useState(false);
  const { dir: textDir } = useLang();

  // Mutable animation state — never triggers a React render.
  const state = useRef({
    offset: 0,
    groupWidth: 0,
    paused: false,
    visible: true,
    dragging: false,
    lastPointerX: 0,
    velocity: 0,
  });

  // Geometry is ALWAYS laid out left-to-right. In an RTL document an
  // overflowing track anchors to the right edge, so translating it leftwards
  // exposes blank space — that is what made the strips vanish in Arabic.
  // Only the text inside each group follows the reading direction.

  /* Measure one group and decide how many copies are needed. */
  const measure = useCallback(() => {
    const group = groupRef.current;
    const viewport = viewportRef.current;
    if (!group || !viewport) return;

    const groupWidth = group.scrollWidth;
    if (groupWidth <= 0) return;

    state.current.groupWidth = groupWidth;

    // Enough copies to cover the viewport twice, so the seam is never visible.
    const needed = Math.max(2, Math.ceil((viewport.offsetWidth * 2) / groupWidth) + 1);
    setCopies((current) => (current === needed ? current : needed));
  }, []);

  useLayoutEffect(() => {
    measure();
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    if (group) observer.observe(group);
    return () => observer.disconnect();
  }, [measure, children]);

  /* Honour the OS reduced-motion preference. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /* Only animate while actually on screen. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { state.current.visible = entry.isIntersecting; }),
      // Start well before the strip scrolls into view, so it is already in
      // motion the moment the visitor reaches it (never "waking up" on screen).
      { rootMargin: "150% 0px 150% 0px" }
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  /* Stop when the tab is hidden. */
  useEffect(() => {
    let onScreen = true;
    const onVisibility = () => {
      // Hidden tab → stop. Returning to the tab → the IntersectionObserver
      // re-reports the real on-screen state on its next callback.
      if (document.hidden) {
        onScreen = state.current.visible;
        state.current.visible = false;
      } else {
        state.current.visible = onScreen;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* The loop. */
  useEffect(() => {
    if (reduced) {
      if (trackRef.current) trackRef.current.style.transform = "translate3d(0,0,0)";
      return;
    }

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05); // clamp after a stall
      previous = now;
      const current = state.current;
      const track = trackRef.current;

      if (track && current.groupWidth > 0 && current.visible) {
        if (current.dragging) {
          // While dragging the pointer owns the offset.
          current.velocity *= 0.9;
        } else if (!current.paused) {
          // `direction` is the literal on-screen direction, in every language:
          // "left" travels left, "right" travels right. That is what the studio
          // promises, and what lets neighbouring strips run against each other.
          const sign = direction === "left" ? -1 : 1;
          current.offset += sign * speed * delta;
          // Carry any residual flick momentum.
          if (Math.abs(current.velocity) > 0.5) {
            current.offset += current.velocity * delta;
            current.velocity *= 0.94;
          }
        }

        // Wrap into a single group width — the seam is invisible because the
        // content is identical.
        const width = current.groupWidth;
        current.offset = ((current.offset % width) + width) % width;
        track.style.transform = `translate3d(${current.offset - width}px, 0, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, direction, reduced]);

  /* Drag / swipe to scrub. */
  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggable || reduced) return;
      // Let real links and buttons keep their click.
      state.current.dragging = true;
      state.current.lastPointerX = event.clientX;
      state.current.velocity = 0;
    },
    [draggable, reduced]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const current = state.current;
      if (!current.dragging) return;
      const delta = event.clientX - current.lastPointerX;
      current.lastPointerX = event.clientX;
      current.offset += delta;
      current.velocity = delta * 12;
    },
    []
  );

  const endDrag = useCallback(() => {
    state.current.dragging = false;
  }, []);

  // Soft edges so items enter and leave instead of being hard-cropped.
  const maskStyle = fade
    ? {
        maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
      }
    : undefined;

  return (
    <div
      ref={viewportRef}
      dir="ltr"
      className={cn(
        "relative w-full overflow-hidden",
        draggable && !reduced && "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{ ...maskStyle, touchAction: "pan-y" }}
      onMouseEnter={pauseOnHover ? () => { state.current.paused = true; } : undefined}
      onMouseLeave={pauseOnHover ? () => { state.current.paused = false; } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        ref={trackRef}
        className={cn("flex w-max items-center will-change-transform", trackClassName)}
        style={{ touchAction: "pan-y" }}
      >
        {Array.from({ length: copies }).map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? groupRef : undefined}
            className="flex shrink-0 items-center"
            dir={textDir}
            aria-hidden={index > 0}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
