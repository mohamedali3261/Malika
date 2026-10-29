import { Button } from "@/components/ui/Button";
import { Check, Eye, KeyRound, Lock, Refresh, Shield } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { authPolicy, lockRemaining, unlock } from "@/lib/auth";
import { Link } from "@/lib/router";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState, type FormEvent } from "react";

export function StudioLock({ onUnlocked }: { onUnlocked: () => void }) {
  const { t, lang } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, setWait] = useState(() => lockRemaining());
  const [shake, setShake] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  // live cooldown countdown
  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setInterval(() => {
      const left = lockRemaining();
      setWait(left);
      if (left <= 0) {
        setError("");
        window.clearInterval(id);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [wait]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || wait > 0) return;
    setBusy(true);
    setError("");

    const result = await unlock(username, password);

    if (result.ok) {
      setPassword("");
      onUnlocked();
      setBusy(false);
      return;
    }

    setPassword("");
    setShake(true);
    window.setTimeout(() => setShake(false), 500);

    if (result.reason === "locked") {
      setWait(result.waitMs);
      setError(`${t("lock.locked")} ${Math.ceil(result.waitMs / 1000)}${t("lock.seconds")}`);
    } else if (result.reason === "unsupported") {
      setError(t("lock.unsupported"));
    } else {
      setWait(lockRemaining());
      setError(t("lock.invalid"));
    }
    setBusy(false);
  };

  const seconds = Math.ceil(wait / 1000);

  return (
    <div className="anim-page relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-ink px-4 py-14">
      {/* ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="anim-drift absolute -start-20 top-10 h-72 w-72 rounded-full bg-plum/70 blur-[100px]" />
        <div className="absolute end-0 top-1/3 h-72 w-72 rounded-full bg-lilac/20 blur-[110px]" />
        <div className="absolute bottom-0 start-1/3 h-56 w-56 rounded-full bg-acid/10 blur-[90px]" />
      </div>
      <div className="grain pointer-events-none absolute inset-0" />

      <div className={cn("relative w-full max-w-sm", shake && "animate-[shake_0.45s_ease]")}>
        <div className="mb-6 text-center">
          <span className="anim-float mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-bone/15 bg-bone/5 text-acid">
            <Lock className="h-6 w-6" />
          </span>
          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-bone/40">{t("lock.eyebrow")}</p>
          <h1 className="font-display mt-2 text-4xl leading-none text-bone">{t("lock.title")}</h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[12px] leading-relaxed text-bone/50">{t("lock.lead")}</p>
        </div>

        <form onSubmit={submit} className="rounded-[1.6rem] border border-bone/12 bg-bone/[0.04] p-5 backdrop-blur-xl">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-bone/45">
              {t("lock.user")}
            </span>
            <input
              ref={userRef}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="field field-dark"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              dir="ltr"
              name="username"
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-bone/45">
              {t("lock.pass")}
            </span>
            <div className="relative">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={show ? "text" : "password"}
                className="field field-dark pe-12"
                autoComplete="current-password"
                dir="ltr"
                name="password"
                inputMode={show ? "text" : undefined}
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? t("lock.hidePass") : t("lock.showPass")}
                className="press absolute end-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-bone/45 hover:text-acid"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </label>

          {error && (
            <p className="anim-rise mt-3 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-200">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rose-400 text-[9px] font-black text-ink">
                !
              </span>
              {wait > 0 ? `${t("lock.locked")} ${seconds}${t("lock.seconds")}` : error}
            </p>
          )}

          <Button
            type="submit"
            variant="acid"
            full
            size="lg"
            className="mt-4"
            disabled={busy || wait > 0 || !username || !password}
            icon={busy ? <Refresh className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            iconPosition="start"
          >
            {busy ? t("lock.checking") : wait > 0 ? `${seconds}${t("lock.seconds")}` : t("lock.submit")}
          </Button>

          <div className="mt-4 space-y-2 border-t border-bone/10 pt-3">
            <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-bone/35">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid/70" />
              {t("lock.security")}
            </p>
            <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-bone/35">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid/70" />
              {t("lock.session")}
            </p>
          </div>
        </form>

        <div className="mt-5 text-center">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.18em] text-bone/35 transition hover:text-acid">
            ← {t("lock.back")}
          </Link>
        </div>

        <p className="mt-3 text-center text-[8.5px] uppercase tracking-[0.2em] text-bone/20">
          {lang === "ar" ? `${authPolicy.freeAttempts} محاولات ثم حظر متصاعد` : `${authPolicy.freeAttempts} attempts, then rising cooldown`}
        </p>
      </div>
    </div>
  );
}
