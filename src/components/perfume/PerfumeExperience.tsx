import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

const PerfumeScene = lazy(loadScene);

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
  const { x, dir } = useLang();
  const triggerRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ScrollState>({ progress: 0, velocity: 0 });
  const userYawRef = useRef({ target: 0, current: 0 });
  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    startYaw: number;
  }>({ active: false, pointerId: -1, startX: 0, startY: 0, startYaw: 0 });

  const [capability, setCapability] = useState<Capability>("pending");
  const [quality, setQuality] = useState<keyof typeof qualityProfiles>("low");
  const [mountScene, setMountScene] = useState(false);
  const [active, setActive] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [ready, setReady] = useState(false);
  const [warm, setWarm] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [length, setLength] = useState<number>(scrollLength.desktop);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 768;
    if (!supportsWebGL() || reduced || saveData || (coarse && narrow && (mem <= 4 || cores <= 4))) {
      setCapability("fallback");
      return;
    }
    setQuality(detectQuality());
    setCapability("webgl");
  }, []);

  useEffect(() => {
    if (capability !== "webgl") return;
    return whenIdle(() => {
      void loadScene();
      setMountScene(true);
    });
  }, [capability]);

  // Keep WebGL frame loop active whenever ANY part of the 3D section is near/inside the viewport.
  useEffect(() => {
    const el = triggerRef.current;
    if (!el || capability !== "webgl" || typeof IntersectionObserver === "undefined") {
      setInViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setInViewport(entry.isIntersecting);
          if (entry.isIntersecting) setMountScene(true);
        }
      },
      { rootMargin: "320px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [capability]);

  const handleReady = useCallback(() => {
    setReady(true);
    window.setTimeout(() => setWarm(false), 1600);
  }, []);

  useEffect(() => {
    let timer = 0;
    const measure = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const width = window.innerWidth;
        const landscapePhone = window.innerHeight < 520;
        if (width < 768 || landscapePhone) setLength(scrollLength.mobile);
        else if (width < 1280) setLength(scrollLength.tablet);
        else setLength(scrollLength.desktop);
        const nextQuality = detectQuality();
        setQuality((prev) => (prev === nextQuality ? prev : nextQuality));
      }, 180);
    };
    // Initial sync
    {
      const width = window.innerWidth;
      const landscapePhone = window.innerHeight < 520;
      if (width < 768 || landscapePhone) setLength(scrollLength.mobile);
      else if (width < 1280) setLength(scrollLength.tablet);
      else setLength(scrollLength.desktop);
      setQuality(detectQuality());
    }
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastProgress = -1;
    let factor = 0;

    const measure = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      factor = height < 520 ? 0 : width < 768 ? 1 : width < 1024 ? 0.8 : 0;
      lastProgress = -1;
    };

    const tick = () => {
      // Pause when off-screen or tab hidden — saves battery/CPU
      if (!inViewport || document.hidden) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      const progress = stateRef.current?.progress ?? 0;
      if (progress !== lastProgress) {
        lastProgress = progress;
        if (hintRef.current)
          hintRef.current.style.opacity = String(Math.max(0, 1 - progress / 0.08));
        if (canvasRef.current) {
          const shift = factor === 0 ? 0 : mobileStageShift(progress) * factor * 100;
          canvasRef.current.style.transform =
            shift === 0 ? "" : `translate3d(0, ${shift.toFixed(2)}%, 0)`;
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
  }, [inViewport]);

  usePerfumeScrollAnimation({
    pinRef,
    triggerRef,
    stateRef,
    scrollLength: length,
    enabled: capability === "webgl",
    onActiveChange: setActive,
  });

  const profile = useMemo(() => qualityProfiles[quality], [quality]);
  // Only keep GPU busy while pinned or during warm-up; pause entirely when off-screen
  const liveLoop = (active && inViewport) || warm;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("a, button")) return;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startYaw: userYawRef.current.target,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      setDragging(true);
    }
    if (Math.abs(dx) > Math.abs(dy) * 0.75) {
      const sensitivity = e.currentTarget.clientWidth < 640 ? 0.011 : 0.0075;
      userYawRef.current.target = drag.startYaw + dx * sensitivity;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === e.pointerId) {
      dragRef.current.active = false;
      setDragging(false);
    }
  };

  if (capability === "fallback") {
    return <PerfumeFallback />;
  }

  return (
    <section
      ref={triggerRef}
      className="perfume-experience"
      style={{ height: `calc(100svh + ${length}vh)` }}
      aria-label={x("3D bottle experience", "تجربة الزجاجة ثلاثية الأبعاد")}
    >
      <div
        ref={pinRef}
        className={cn("perfume-stage", dragging && "is-dragging")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="perfume-stage__backdrop" />
        <div className="perfume-stage__grain" />

        <div ref={canvasRef} className={cn("perfume-stage__canvas", ready && "is-ready")}>
          {mountScene && (
            <Suspense fallback={null}>
              <PerfumeScene
                stateRef={stateRef}
                quality={profile}
                active={liveLoop}
                rtl={dir === "rtl"}
                userYawRef={userYawRef}
                onReady={handleReady}
              />
            </Suspense>
          )}
        </div>

        <PerfumeProductInfo stateRef={stateRef} />
        <PerfumeScrollProgress stateRef={stateRef} triggerRef={triggerRef} />

        <div ref={hintRef} className="perfume-stage__hint" aria-hidden="true">
          <span className="perfume-stage__hint-line" />
          {x("Scroll to disassemble · Drag to rotate", "مرّر للتفكيك · اسحب للتدوير")}
        </div>
      </div>
    </section>
  );
}

export default PerfumeExperience;
