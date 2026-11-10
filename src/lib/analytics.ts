const VISITOR_STORAGE_KEY = "vlor.analytics.visitor.v1";
const VISITOR_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let fallbackVisitorId: string | null = null;

function createVisitorId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getVisitorId(): string {
  try {
    const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (stored && VISITOR_ID_PATTERN.test(stored)) return stored;

    const next = createVisitorId();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, next);
    return next;
  } catch {
    // Keep the page usable when storage is disabled; the identifier is session-only in this case.
    fallbackVisitorId ??= createVisitorId();
    return fallbackVisitorId;
  }
}

/** Keep routes compact and avoid sending private tracking tokens or studio routes. */
function normalizePagePath(path: string): string | null {
  const pathname = path.split("?")[0].split("#")[0] || "/";
  if (/^\/(studio|admin)(\/|$)/i.test(pathname)) return null;
  if (/^\/track(?:\/|$)/i.test(pathname)) return "/track";
  if (pathname === "/favorites" || pathname === "/saved") return "/wishlist";
  if (/^\/product\/[a-z0-9-]{1,100}$/i.test(pathname)) return pathname.toLowerCase();
  if (["/", "/shop", "/wishlist", "/contact"].includes(pathname)) return pathname;
  return "/404";
}

type AnalyticsEvent =
  | { type: "page_view"; pagePath: string }
  | { type: "product_click"; pagePath: string; productSlug: string };

function send(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const pagePath = normalizePagePath(event.pagePath);
  if (!pagePath) return;

  const body = { ...event, pagePath, visitorId: getVisitorId() };
  try {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort and must never interrupt shopping.
    });
  } catch {
    // Ignore browser/network failures.
  }
}

export function trackPageView(pagePath: string): void {
  send({ type: "page_view", pagePath });
}

export function trackProductClick(productSlug: string, pagePath: string): void {
  if (!/^[a-z0-9-]{1,100}$/.test(productSlug)) return;
  send({ type: "product_click", pagePath, productSlug });
}
