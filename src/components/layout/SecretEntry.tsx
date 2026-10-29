import { navigate } from "@/lib/router";
import { cn } from "@/utils/cn";
import { useCallback, useEffect, useState } from "react";

const TARGET = "/studio";

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/**
 * Product-studio entrance: a small solid-black circle at the very bottom of
 * the footer.
 *
 * It is deliberately quiet — black on the near-black footer, no label, no
 * tooltip, no underline — so visitors read it as a design detail while the
 * owner knows exactly where to tap. A single click opens the studio, which
 * always lands on the password screen first.
 *
 * It stays out of the keyboard tab order and is hidden from screen readers so
 * nobody reaches it by accident.
 */
export function StudioDot({ className }: { className?: string }) {
  const [pressed, setPressed] = useState(false);

  const go = useCallback(() => {
    buzz([10, 35, 14]);
    setPressed(true);
    window.setTimeout(() => setPressed(false), 260);
    navigate(TARGET);
  }, []);

  return (
    <button
      type="button"
      onClick={go}
      onContextMenu={(event) => event.preventDefault()}
      aria-hidden="true"
      tabIndex={-1}
      className={cn(
        "group relative grid h-5 w-5 shrink-0 place-items-center rounded-full",
        "bg-black ring-1 ring-inset ring-white/10",
        "transition-all duration-300 hover:ring-acid/50 active:scale-90",
        className
      )}
      style={{ touchAction: "manipulation", WebkitTouchCallout: "none" }}
    >
      {/* Inner gloss so the circle reads as an intentional object, not a hole. */}
      <span className="pointer-events-none absolute inset-[3px] rounded-full bg-gradient-to-b from-white/12 to-transparent" />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full ring-2 ring-acid/60 transition-all duration-300",
          pressed ? "scale-150 opacity-0" : "scale-100 opacity-0"
        )}
      />
      {/* Generous invisible hit area for thumbs. */}
      <span className="absolute -inset-2.5" />
    </button>
  );
}

/**
 * Secondary way in: type the word "studio" anywhere on the site (outside a
 * text field). Convenient on a laptop.
 */
export function useSecretKeyword(word = "studio") {
  useEffect(() => {
    let buffer = "";
    let last = 0;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.key.length !== 1) return;

      const now = Date.now();
      if (now - last > 1500) buffer = "";
      last = now;

      buffer = (buffer + event.key.toLowerCase()).slice(-word.length);
      if (buffer === word) {
        buffer = "";
        navigate(TARGET);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [word]);
}
