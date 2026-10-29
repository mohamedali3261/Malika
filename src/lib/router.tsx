import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", emit);
  window.addEventListener("popstate", emit);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return typeof window === "undefined" ? "/" : window.location.hash.replace(/^#/, "") || "/";
}

/** Re-read the URL after a history.replaceState (which does not fire hashchange). */
export function refreshRoute() {
  emit();
}

export function navigate(to: string, options?: { keepScroll?: boolean }) {
  const target = to.startsWith("/") ? to : `/${to}`;
  if (snapshot() === target) {
    emit();
  } else {
    window.location.hash = target;
  }
  if (!options?.keepScroll) {
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10);
  }
}

export function useRoute() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "/");
  return useMemo(() => {
    const [pathname, search = ""] = raw.split("?");
    const path = pathname.replace(/\/+$/, "") || "/";
    const segments = path.split("/").filter(Boolean);
    const query = new URLSearchParams(search);
    return { path, segments, query, raw };
  }, [raw]);
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(to);
    },
    [onClick, to]
  );

  return (
    <a href={`#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
