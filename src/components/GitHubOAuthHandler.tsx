import { Check, Github, Refresh, X } from "@/components/ui/icons";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { completeOAuthCallback, hasOAuthCallback } from "@/lib/githubAuth";
import { navigate } from "@/lib/router";
import { useSyncExternalStore } from "react";
import { useEffect, useState } from "react";

/** Prevents React StrictMode from redeeming the same authorization code twice. */
let completing = false;

function subscribeNoop() {
  return () => {};
}

export function GitHubOAuthHandler() {
  const { t, lang } = useLang();
  const { push } = useToast();
  const [phase, setPhase] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const active = useSyncExternalStore(
    subscribeNoop,
    () => hasOAuthCallback(),
    () => false
  );

  useEffect(() => {
    if (!active || completing) return;
    completing = true;
    setPhase("working");

    completeOAuthCallback()
      .then((session) => {
        if (session) {
          push(`${t("gh.oauthDone")} · @${session.login}`);
          setPhase("done");
        } else {
          setPhase("idle");
        }
        navigate("/studio", { keepScroll: true });
      })
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : String(cause);
        setError(message);
        setPhase("error");
        push(`${t("gh.oauthFailed")}: ${message}`, "error");
      })
      .finally(() => {
        completing = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[130] flex justify-center px-4">
      <div
        className={`anim-toast flex max-w-lg items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
          phase === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-ink/10 bg-ink text-bone"
        }`}
        role="status"
        aria-live="polite"
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
            phase === "error" ? "bg-rose-500 text-white" : "bg-acid text-ink"
          }`}
        >
          {phase === "error" ? <X className="h-4 w-4" /> : <Refresh className="h-4 w-4 animate-spin" />}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold">
            {phase === "error" ? t("gh.oauthFailed") : t("gh.oauthWorking")}
            <Github className="h-3.5 w-3.5 opacity-60" />
          </p>
          {phase === "error" && <p className="mt-0.5 text-[10px] leading-relaxed opacity-80">{error}</p>}
          {phase !== "error" && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-60">
              <Check className="h-3 w-3" />
              {lang === "ar" ? "تبادل الكود على الخادم الوسيط — بدون أسرار في المتصفح." : "Exchanging the code on your relay — no secrets in the browser."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
