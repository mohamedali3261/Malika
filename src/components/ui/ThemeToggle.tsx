import { Moon, Sun } from "@/components/ui/icons";
import { useThemeMode } from "@/context/ThemeModeContext";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/utils/cn";

interface Props {
  variant?: "navbar" | "admin" | "floating";
  className?: string;
}

export function ThemeToggle({ variant = "navbar", className }: Props) {
  const { mode, toggle } = useThemeMode();
  const { lang } = useLang();
  const isDark = mode === "dark";
  const label = lang === "ar" ? (isDark ? "الوضع النهاري" : "الوضع الليلي") : isDark ? "Day mode" : "Night mode";

  if (variant === "admin") {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-bone/15 bg-bone/5 px-3 py-2 text-[11px] font-bold text-bone/70 backdrop-blur transition hover:bg-bone/10 hover:text-bone",
          className
        )}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-bone/10 text-bone">
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span
          className={cn(
            "relative ml-1 inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
            isDark ? "bg-acid" : "bg-bone/20"
          )}
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full bg-ink shadow transition-transform",
              isDark ? "translate-x-4 bg-ink" : "translate-x-0 bg-bone"
            )}
          />
        </span>
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        title={label}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full border border-ink/12 bg-surface/80 text-ink backdrop-blur transition hover:border-ink/30 hover:bg-surface",
          isDark && "border-bone/20 bg-ink text-bone hover:bg-plum",
          className
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  // navbar variant
  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border border-ink/12 text-ink transition hover:border-ink/30 hover:bg-ink/[0.04]",
        isDark && "border-bone/15 bg-ink/40 text-bone hover:bg-bone/10",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
