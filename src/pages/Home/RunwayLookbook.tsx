import { useBrand } from "@/hooks/useBrand";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { resolveAsset } from "@/lib/assets";
import { formatPrice } from "@/lib/format";
import { Link } from "@/lib/router";
import { emitBagPulse } from "@/motion";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import "@/styles/runway-lookbook.css";

// Exact 7-stop depth table from d = -1 (leaving past rail) to d = 5 (arriving from haze)
const KX = [1.2, 0.744, 0.496, 0.346, 0.235, 0.15, 0.085] as const;
const KF = [1.14, 0.89, 0.777, 0.704, 0.651, 0.616, 0.59] as const;
const KH = [1.18, 0.832, 0.574, 0.436, 0.334, 0.258, 0.19] as const;
const KB = [0, 0, 1.5, 4, 8, 12, 17] as const;
const KO = [1, 1, 1, 1, 0.86, 0.5, 0] as const;

const LOOK_COUNT = 6;
const BOTTLE_ASPECT = 0.54;

const wrap = (x: number, n: number) => ((x % n) + n) % n;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

interface RailEntry {
  key: string;
  product: Product;
  image: string;
  ml: number;
  price: number;
  badge: string;
}

export function RunwayLookbook() {
  const { wordmark } = useBrand();
  const { lang, l, t, x, dir } = useLang();
  const { products, wishlist, toggleWishlist, isWished } = useStore();
  const { count: cartCount, add, open: openCart } = useCart();
  const { push } = useToast();

  // Select 6 signature flacons for the receding runway line + pair remaining catalogue scents in the 12-card rail
  const { lookProducts, railItems } = useMemo(() => {
    if (products.length === 0) {
      return { lookProducts: [] as Product[], railItems: [] as RailEntry[] };
    }

    const sorted = [...products].sort(
      (a, b) =>
        Number(Boolean(b.cutout)) - Number(Boolean(a.cutout)) ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        b.rating - a.rating
    );

    const primary: Product[] = [];
    for (let i = 0; i < LOOK_COUNT; i++) {
      primary.push(sorted[i % sorted.length]);
    }

    const secondaryPool = sorted.slice(LOOK_COUNT);
    const entries: RailEntry[] = [];

    for (let i = 0; i < LOOK_COUNT; i++) {
      const lead = primary[i];
      const leadSize = lead.sizes.find((s) => s.ml === 50) ?? lead.sizes[0] ?? { ml: 50, price: lead.price };
      entries.push({
        key: `lead-${i}-${lead.id}-${leadSize.ml}`,
        product: lead,
        image: resolveAsset(lead.cutout || lead.images[0]),
        ml: leadSize.ml,
        price: leadSize.price,
        badge: `${leadSize.ml} ${lang === "ar" ? "مل" : "ml"}`,
      });

      const paired = secondaryPool[i];
      if (paired && paired.id !== lead.id) {
        const pairSize =
          paired.sizes.find((s) => s.ml === 50) ?? paired.sizes[0] ?? { ml: 50, price: paired.price };
        entries.push({
          key: `pair-${i}-${paired.id}-${pairSize.ml}`,
          product: paired,
          image: resolveAsset(paired.cutout || paired.images[0]),
          ml: pairSize.ml,
          price: pairSize.price,
          badge: `${pairSize.ml} ${lang === "ar" ? "مل" : "ml"}`,
        });
      } else {
        const altSize =
          lead.sizes[lead.sizes.length - 1] ?? lead.sizes[0] ?? { ml: 100, price: lead.price };
        entries.push({
          key: `alt-${i}-${lead.id}-${altSize.ml}`,
          product: lead,
          image: resolveAsset(lead.cutout || lead.images[0]),
          ml: altSize.ml,
          price: altSize.price,
          badge: `${altSize.ml} ${lang === "ar" ? "مل" : "ml"}`,
        });
      }
    }

    return { lookProducts: primary, railItems: entries };
  }, [products, lang]);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<HTMLSpanElement>(null);
  const modelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  const [decoded, setDecoded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  // Single float `p` & animation refs (never trigger React renders per frame)
  const animRef = useRef({
    W: 0,
    H: 0,
    base: 0,
    cardS: 0,
    side: false,
    dirty: true,
    p: 0,
    target: 0,
    last: 0,
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    down: false,
    pointerId: -1,
    sx: 0,
    st: 0,
    moved: 0,
    wheelTimer: 0,
    inView: true,
    calm: false,
    filterCache: Array(LOOK_COUNT).fill(""),
    opacityCache: Array(LOOK_COUNT).fill(""),
  });

  // Pre-decode real bottle images before lifting the section veil
  useEffect(() => {
    if (lookProducts.length === 0) return;
    let cancelled = false;
    const urls = Array.from(
      new Set([
        ...lookProducts.map((p) => resolveAsset(p.cutout || p.images[0])),
        ...railItems.map((r) => r.image),
      ])
    );

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setDecoded(true);
    }, 1200);

    Promise.all(
      urls.map((u) => {
        const img = new Image();
        img.src = u;
        return typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve();
      })
    ).then(() => {
      if (!cancelled) {
        window.clearTimeout(fallbackTimer);
        animRef.current.dirty = true;
        setDecoded(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [lookProducts, railItems]);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!stage || !rail) return;

    const s = animRef.current;
    s.W = stage.clientWidth;
    s.H = stage.clientHeight;
    s.base = s.H * 1.2;
    s.side = window.innerWidth <= 820;

    for (let i = 0; i < LOOK_COUNT; i++) {
      const el = modelRefs.current[i];
      if (!el) continue;
      el.style.width = `${(s.base * BOTTLE_ASPECT).toFixed(1)}px`;
      el.style.height = `${s.base.toFixed(1)}px`;
    }

    s.cardS = s.side ? 160 : rail.clientHeight / 3;
    for (let i = 0; i < cardRefs.current.length; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      card.style.height = s.side ? "100%" : `${s.cardS.toFixed(2)}px`;
    }

    s.dirty = true;
  }, []);

  const paint = useCallback(() => {
    const s = animRef.current;
    const N = LOOK_COUNT;
    if (s.W === 0 || s.H === 0) return;

    for (let i = 0; i < N; i++) {
      const el = modelRefs.current[i];
      if (!el) continue;

      let d = wrap(i - s.p, N);
      if (d > N - 1) d -= N;

      const k = clamp(d + 1, 0, 6);
      const a = Math.floor(k);
      const b = Math.min(6, a + 1);
      const tMix = k - a;
      const mix = (arr: readonly number[]) => arr[a] + (arr[b] - arr[a]) * tMix;

      const h = mix(KH) * s.H;
      const scale = h / Math.max(1, s.base);
      const w = h * BOTTLE_ASPECT;
      const px = mix(KX) * s.W - w / 2;
      const py = mix(KF) * s.H - h;

      el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) scale(${scale.toFixed(4)})`;

      const blurVal = mix(KB) / Math.max(0.05, scale);
      const filterStr = blurVal < 0.2 ? "none" : `blur(${blurVal.toFixed(1)}px)`;
      const opacityStr = mix(KO).toFixed(3);

      if (filterStr !== s.filterCache[i]) {
        s.filterCache[i] = filterStr;
        el.style.filter = filterStr;
      }
      if (opacityStr !== s.opacityCache[i]) {
        s.opacityCache[i] = opacityStr;
        el.style.opacity = opacityStr;
      }
      el.style.zIndex = String(100 - Math.round(d * 10));
    }

    const itemCount = cardRefs.current.length;
    if (itemCount > 0 && s.cardS > 0) {
      const all = s.cardS * itemCount;
      for (let i = 0; i < itemCount; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        let pos = wrap(i * s.cardS - s.p * 2 * s.cardS, all);
        if (pos > all - s.cardS) pos -= all;
        card.style.transform = s.side
          ? `translate3d(${pos.toFixed(1)}px,0,0)`
          : `translate3d(0,${pos.toFixed(1)}px,0)`;
      }
    }

    const roll = rollRef.current;
    const firstRow = roll?.firstElementChild as HTMLElement | null;
    if (roll && firstRow) {
      const rowH = firstRow.offsetHeight || 38;
      roll.style.transform = `translate3d(0,${(-wrap(s.p, N) * rowH).toFixed(1)}px,0)`;
    }

    const nextIdx = Math.round(wrap(s.p, N)) % N;
    if (nextIdx !== activeIdxRef.current) {
      activeIdxRef.current = nextIdx;
      setActiveIdx(nextIdx);
    }
  }, []);

  // Viewport observer + rAF loop + resize listener
  useEffect(() => {
    const s = animRef.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.calm = mq.matches;
    const onMq = () => {
      s.calm = mq.matches;
    };
    mq.addEventListener("change", onMq);

    measure();
    paint();

    window.addEventListener("resize", measure);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && sectionRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(sectionRef.current);
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && sectionRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          s.inView = entries.some((e) => e.isIntersecting);
        },
        { rootMargin: "200px 0px" }
      );
      io.observe(sectionRef.current);
    }

    let raf = 0;
    const loop = (now: number) => {
      if (s.inView) {
        const dt = Math.min(50, now - s.last) || 16;
        s.last = now;
        const was = s.p;
        if (s.calm) s.p = s.target;
        else s.p += (s.target - s.p) * (1 - Math.exp(-dt * 0.0072));
        if (Math.abs(s.target - s.p) < 0.0004) s.p = s.target;
        if (s.p !== was || s.dirty) {
          s.dirty = false;
          paint();
        }
        s.cx += (s.mx - s.cx) * 0.32;
        s.cy += (s.my - s.cy) * 0.32;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${s.cx.toFixed(1)}px,${s.cy.toFixed(1)}px,0)`;
        }
      } else {
        s.last = now;
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(s.wheelTimer);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", onMq);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [measure, paint, lookProducts.length]);

  // Wheel handlers: rail loops infinitely; stage walks looks 1..6 and yields smoothly at boundaries so page scroll never traps
  useEffect(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    if (!stage || !rail) return;
    const s = animRef.current;

    const snapSoon = () => {
      window.clearTimeout(s.wheelTimer);
      s.wheelTimer = window.setTimeout(() => {
        s.target = Math.round(s.target);
      }, 150);
    };

    const onStageWheel = (e: WheelEvent) => {
      const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horiz) {
        if (e.deltaY > 0 && s.target >= LOOK_COUNT - 1) return;
        if (e.deltaY < 0 && s.target <= 0) return;
      }
      e.preventDefault();
      s.target += clamp(e.deltaY + e.deltaX, -120, 120) / 420;
      snapSoon();
    };

    const onRailWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.target += clamp(e.deltaY + e.deltaX, -120, 120) / 420;
      snapSoon();
    };

    stage.addEventListener("wheel", onStageWheel, { passive: false });
    rail.addEventListener("wheel", onRailWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onStageWheel);
      rail.removeEventListener("wheel", onRailWheel);
    };
  }, [lookProducts.length]);

  const stepBy = (delta: number) => {
    animRef.current.target = Math.round(animRef.current.target) + delta;
  };

  const onStagePointerEnter = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") ringRef.current?.classList.add("is-show");
  };

  const onStagePointerLeave = () => {
    ringRef.current?.classList.remove("is-show");
  };

  const onStagePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest("a, button")) return;
    const s = animRef.current;
    s.down = true;
    s.pointerId = e.pointerId;
    s.sx = e.clientX;
    s.st = s.target;
    s.moved = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    ringRef.current?.classList.add("is-drag");
  };

  const onStagePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const s = animRef.current;
    const r = e.currentTarget.getBoundingClientRect();
    s.mx = e.clientX - r.left;
    s.my = e.clientY - r.top;
    if (!s.down || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.sx;
    s.moved = Math.max(s.moved, Math.abs(dx));
    const pull = Math.max(150, s.W * 0.2);
    s.target = s.st + dx / pull;
  };

  const onStagePointerRelease = (e: ReactPointerEvent<HTMLElement>) => {
    const s = animRef.current;
    if (!s.down || s.pointerId !== e.pointerId) return;
    s.down = false;
    ringRef.current?.classList.remove("is-drag");

    if (s.moved < 6) {
      const hit = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((node) => node.classList?.contains("rl-m")) as HTMLElement | undefined;
      if (hit && hit.dataset.i !== undefined) {
        let d = wrap(Number(hit.dataset.i) - s.target, LOOK_COUNT);
        d = Math.round(d);
        if (d > 0 && d < LOOK_COUNT) {
          s.target = Math.round(s.target) + d;
        }
      }
    } else {
      s.target = Math.round(s.target);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      stepBy(-1);
    }
  };

  const handleToggleFav = (product: Product) => {
    const saved = toggleWishlist(product.id);
    push(saved ? t("product.saved") : t("product.unsaved"), saved ? "success" : "info");
  };

  const handleAddToCart = (entry: RailEntry) => {
    add(entry.product, entry.ml, entry.price, 1);
    emitBagPulse();
    push(`${l(entry.product.name)} (${entry.badge}) · ${t("product.added")}`);
  };

  if (lookProducts.length === 0) return null;

  const activeProduct = lookProducts[activeIdx] ?? lookProducts[0];

  return (
    <section
      ref={sectionRef}
      id="runway-lookbook"
      className="rl-section"
      aria-label={x("Runway Depth Lookbook", "منصّة العرض العميق لعطور مليكة")}
    >
      {/* Editorial Runway Header */}
      <div className="rl-header">
        <div className="rl-r1">
          <Link to="/shop" className="rl-brand rl-wide rl-wide-i18n">
            {wordmark}
          </Link>

          <nav className="rl-tabs rl-wide rl-wide-i18n" aria-label={x("Runway navigation", "تنقّل المنصّة")}>
            <span className="is-on">{x("Runway", "منصّة العرض")}</span>
            <Link to="/about">{x("The Maison", "الدار")}</Link>
            <Link to="/wishlist">{x("Saved", "المفضلة")}</Link>
            <Link to="/shop">{x("Shop", "المتجر")}</Link>
          </nav>

          <div className="rl-acct rl-wide rl-wide-i18n">
            <Link to="/shop" className="rl-acct-icon rl-acct-hide-sm" aria-label={x("Search scents", "بحث")}>
              <svg viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m15.5 15.5 5 5" />
              </svg>
            </Link>

            <Link
              to="/wishlist"
              className="rl-acct-icon pcard-chip"
              aria-label={x("Saved scents", "صفحة المفضلة")}
            >
              <svg
                viewBox="0 0 24 24"
                style={
                  wishlist.length > 0
                    ? { fill: "#d8a7a0", stroke: "#b98179" }
                    : undefined
                }
              >
                <path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z" />
              </svg>
              {wishlist.length > 0 && <span className="rl-acct-badge">{wishlist.length}</span>}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="rl-acct-icon rl-acct-hide-sm pcard-chip"
              aria-label={t("nav.cart")}
            >
              <svg viewBox="0 0 24 24">
                <path d="M5 8h14l1 13H4Z" />
                <path d="M9 10V6a3 3 0 0 1 6 0v4" />
              </svg>
            </button>

            <button
              type="button"
              onClick={openCart}
              className="pcard-chip pcard-keep"
            >
              {x("Cart", "السلة")} (<span dir="ltr">{cartCount}</span>)
            </button>
          </div>
        </div>

        <nav className="rl-r2 rl-wide rl-wide-i18n" aria-label={x("Fragrance families", "العائلات العطرية")}>
          <Link to="/shop">{x("All Extraits", "كل الإصدارات")}</Link>
          <Link to="/shop?category=woody">{t("shop.woody")}</Link>
          <Link to="/shop?category=oriental">{t("shop.oriental")}</Link>
          <Link to="/shop?category=floral">{t("shop.floral")}</Link>
          <Link to="/shop?category=fresh">{t("shop.fresh")}</Link>
          <Link to="/wishlist">{x("Saved List", "قائمة المفضلة")}</Link>
        </nav>
      </div>

      {/* Runway Stage + Infinite Synchronized Product Rail */}
      <div className="rl-main">
        <section
          ref={stageRef}
          className="rl-stage"
          tabIndex={0}
          aria-label={x(
            "Runway bottles. Drag, scroll or use the arrow keys to change scent.",
            "قوارير العرض. اسحب أو مرّر أو استخدم الأسهم لتغيير العطر."
          )}
          onKeyDown={onKeyDown}
          onPointerEnter={onStagePointerEnter}
          onPointerLeave={onStagePointerLeave}
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerRelease}
          onPointerCancel={onStagePointerRelease}
        >
          <div className="rl-line">
            {lookProducts.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                ref={(el) => {
                  modelRefs.current[i] = el;
                }}
                data-i={i}
                className="rl-m"
              >
                <img
                  src={resolveAsset(product.cutout || product.images[0])}
                  alt={l(product.name)}
                  draggable={false}
                  decoding="async"
                  className="rl-m-img"
                />
              </div>
            ))}
          </div>

          <div className="rl-intro" dir={dir}>
            <h2 className="rl-wide rl-wide-i18n">
              {x("Signature Collection", "مجموعة التوقيع الملكية")}
            </h2>
            <p>
              {x(
                "A study in sillage and presence. Six signature extraits from MALIKA stand in one receding line — drag, scroll or tap any flacon in the distance to bring its story forward.",
                "دراسة في الثبات والحضور. ستّ قوارير من إكستريه مليكة تقف في صفٍّ يمتدّ في العمق — اسحب أو مرّر أو اضغط على أي قارورة لتتقدّم بتفاصيلها إلى الواجهة."
              )}
            </p>
          </div>

          <div className="rl-tag" dir={dir}>
            <div className="rl-look rl-wide rl-wide-i18n" aria-live="polite" dir="ltr">
              <span>{x("Look", "إصدار")}</span>
              <span className="rl-win">
                <span ref={rollRef} className="rl-roll">
                  {Array.from({ length: LOOK_COUNT + 1 }).map((_, idx) => (
                    <b key={idx}>{String((idx % LOOK_COUNT) + 1).padStart(2, "0")}</b>
                  ))}
                </span>
              </span>
            </div>

            {activeProduct && (
              <div className="rl-active-scent">
                <p className="rl-active-name">{l(activeProduct.name)}</p>
                <p className="rl-active-notes">
                  {l(activeProduct.tagline)} · {formatPrice(activeProduct.price, lang)}
                </p>
              </div>
            )}

            <div className="rl-actions-row">
              <Link
                to={activeProduct ? `/product/${activeProduct.slug}` : "/shop"}
                className="rl-shop rl-wide rl-wide-i18n"
              >
                {x("Shop the scent", "تسوّق هذا العطر")}
              </Link>

              <div className="rl-step-btns" dir="ltr">
                <button
                  type="button"
                  onClick={() => stepBy(-1)}
                  className="rl-step-btn pcard-chip"
                  aria-label={x("Previous scent", "العطر السابق")}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => stepBy(1)}
                  className="rl-step-btn pcard-chip"
                  aria-label={x("Next scent", "العطر التالي")}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div ref={ringRef} className="rl-ring" />
        </section>

        {/* Synchronized Wrapping 12-Card Product Rail */}
        <aside
          ref={railRef}
          className="rl-rail"
          aria-label={x("Scents in this edition", "عطور هذا الإصدار")}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement | null)?.closest("a, button")) return;
            const s = animRef.current;
            s.down = true;
            s.pointerId = e.pointerId;
            s.sx = animRef.current.side ? e.clientX : e.clientY;
            s.st = s.target;
            s.moved = 0;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const s = animRef.current;
            if (!s.down || s.pointerId !== e.pointerId) return;
            const cur = s.side ? e.clientX : e.clientY;
            const delta = s.sx - cur;
            s.moved = Math.max(s.moved, Math.abs(delta));
            s.target = s.st + delta / Math.max(120, s.cardS * 2);
          }}
          onPointerUp={(e) => {
            const s = animRef.current;
            if (!s.down || s.pointerId !== e.pointerId) return;
            s.down = false;
            if (s.moved >= 6) s.target = Math.round(s.target);
          }}
          onPointerCancel={(e) => {
            const s = animRef.current;
            if (s.pointerId === e.pointerId) {
              s.down = false;
              s.target = Math.round(s.target);
            }
          }}
        >
          {railItems.map((entry, idx) => {
            const wished = isWished(entry.product.id);
            return (
              <article
                key={entry.key}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={cn("rl-card", idx % 2 === 1 && "is-alt")}
              >
                <button
                  type="button"
                  onClick={() => handleToggleFav(entry.product)}
                  aria-pressed={wished}
                  aria-label={`${x("Save", "حفظ")} ${l(entry.product.name)}`}
                  className="rl-fav pcard-chip"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z" />
                  </svg>
                </button>

                <Link
                  to={`/product/${entry.product.slug}`}
                  className="rl-shot"
                  aria-label={l(entry.product.name)}
                >
                  <img
                    src={entry.image}
                    alt={l(entry.product.name)}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </Link>

                <div className="rl-meta" dir={dir}>
                  <Link to={`/product/${entry.product.slug}`}>
                    <h3 className="rl-wide rl-wide-i18n pcard-keep">{l(entry.product.name)}</h3>
                  </Link>
                  <span className="rl-meta-sub pcard-keep">
                    {formatPrice(entry.price, lang)} · {entry.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(entry)}
                    aria-label={`${x("Add to bag", "أضف إلى السلة")} ${l(entry.product.name)}`}
                    className="rl-add pcard-chip"
                  />
                </div>
              </article>
            );
          })}
        </aside>
      </div>

      <div className={cn("rl-wait", decoded && "is-gone")} aria-hidden="true" />
    </section>
  );
}
