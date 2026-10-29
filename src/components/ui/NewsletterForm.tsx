import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";

export function NewsletterForm({ dark, compact }: { dark?: boolean; compact?: boolean }) {
  const { t } = useLang();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      push(t("news.invalid"), "error");
      return;
    }
    setDone(true);
    setEmail("");
    push(t("news.success"));
  };

  return (
    <form onSubmit={submit} className={cn("flex w-full gap-2", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("news.placeholder")}
          aria-label={t("news.placeholder")}
          className={cn("field h-12 pe-4", dark && "field-dark")}
          required
        />
      </div>
      <button
        type="submit"
        className={cn(
          "group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[0.9rem] px-6 text-[12px] font-bold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98]",
          done
            ? "bg-acid text-ink"
            : dark
              ? "bg-acid text-ink hover:bg-acid-deep"
              : "bg-ink text-bone hover:bg-plum"
        )}
      >
        {done ? (
          <>
            <Check className="h-4 w-4" /> {t("news.button")}
          </>
        ) : (
          <>
            {t("news.button")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
