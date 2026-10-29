import { Button } from "@/components/ui/Button";
import { Eye, KeyRound, Lock, Refresh, Shield } from "@/components/ui/icons";
import { PublisherProvider } from "@/context/PublisherContext";
import { useLang } from "@/i18n/LanguageContext";
import { AdminPage } from "@/pages/Admin/AdminPage";
import { Orders } from "@/pages/Admin/Orders";
import { PublishDock } from "@/pages/Admin/PublishDock";
import { Security } from "@/pages/Admin/Security";
import { StudioLock } from "@/pages/Admin/StudioLock";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

function FirstPasswordSetup({ onDone, onLogout }: { onDone: () => void; onLogout: () => void }) {
  const { lang } = useLang();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (newPassword.length < 8) {
      setError(
        lang === "ar"
          ? "كلمة المرور الجديدة يجب أن تكون ٨ أحرف أو أرقام على الأقل."
          : "New password must be at least 8 characters.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(lang === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        setError(
          lang === "ar"
            ? body?.error?.includes("different")
              ? "اختر كلمة مرور جديدة مختلفة عن كلمة المرور المؤقتة."
              : "تعذر حفظ كلمة المرور الجديدة."
            : body?.error || "Could not save new password.",
        );
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      onDone();
    } catch {
      setError(lang === "ar" ? "تعذر الاتصال بالسيرفر." : "Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-page relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-ink px-4 py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="anim-drift absolute -start-20 top-10 h-72 w-72 rounded-full bg-plum/70 blur-[100px]" />
        <div className="absolute end-0 top-1/3 h-72 w-72 rounded-full bg-lilac/20 blur-[110px]" />
        <div className="absolute bottom-0 start-1/3 h-56 w-56 rounded-full bg-acid/10 blur-[90px]" />
      </div>
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="anim-float mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-bone/15 bg-bone/5 text-acid">
            <Lock className="h-6 w-6" />
          </span>
          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-bone/40">
            {lang === "ar" ? "تأمين الدخول الأول" : "FIRST-TIME SETUP"}
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight text-bone">
            {lang === "ar" ? "اكتب الباسورد الجديدة" : "Set your new password"}
          </h1>
          <p className="mx-auto mt-2.5 max-w-xs text-[12px] leading-relaxed text-bone/55">
            {lang === "ar"
              ? "اختر كلمة مرور جديدة خاصة بك (٨ أحرف على الأقل). سيتم إلغاء الباسورد المؤقت فوراً بعد الحفظ."
              : "Choose your new private password (at least 8 characters). The temporary login will be disabled immediately."}
          </p>
        </div>

        <form onSubmit={submit} className="rounded-[1.6rem] border border-bone/12 bg-bone/[0.04] p-5 backdrop-blur-xl">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-bone/45">
              {lang === "ar" ? "كلمة المرور الجديدة" : "New password"}
            </span>
            <div className="relative">
              <input
                ref={inputRef}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type={show ? "text" : "password"}
                className="field field-dark pe-12"
                autoComplete="new-password"
                minLength={8}
                maxLength={256}
                required
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Hide password" : "Show password"}
                className="press absolute end-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-bone/45 hover:text-acid"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-bone/45">
              {lang === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm new password"}
            </span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type={show ? "text" : "password"}
              className="field field-dark"
              autoComplete="new-password"
              minLength={8}
              maxLength={256}
              required
              dir="ltr"
            />
          </label>

          {error && (
            <p className="anim-rise mt-3 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-200">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rose-400 text-[9px] font-black text-ink">
                !
              </span>
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="acid"
            full
            size="lg"
            className="mt-4"
            disabled={busy || !newPassword || !confirmPassword}
            icon={busy ? <Refresh className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            iconPosition="start"
          >
            {busy
              ? lang === "ar"
                ? "جاري الحفظ…"
                : "Saving…"
              : lang === "ar"
                ? "حفظ الباسورد والدخول"
                : "Save password & enter"}
          </Button>

          <div className="mt-4 border-t border-bone/10 pt-3">
            <p className="flex items-start gap-2 text-[9.5px] leading-relaxed text-bone/35">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid/70" />
              {lang === "ar"
                ? "تُشفّر كلمة المرور في قاعدة البيانات ولا يمكن استخدام كلمة المرور المؤقتة مرة أخرى."
                : "Encrypted with PBKDF2 in D1; the temporary password can never be used again."}
            </p>
          </div>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onLogout}
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-bone/35 transition hover:text-acid"
          >
            {lang === "ar" ? "تسجيل الخروج" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudioGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState<"owner" | "orders">("orders");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/session")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        setRole(data.role);
        setMustChangePassword(Boolean(data.mustChangePassword));
        setUnlocked(true);
      })
      .catch(() => {
        setUnlocked(false);
        setMustChangePassword(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    checkSession();
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [checkSession]);

  const signOut = () => {
    fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      setUnlocked(false);
      setMustChangePassword(false);
    });
  };

  if (loading) return <p className="p-10">Loading…</p>;
  if (!unlocked) return <StudioLock onUnlocked={checkSession} />;
  if (mustChangePassword) return <FirstPasswordSetup onDone={() => setMustChangePassword(false)} onLogout={signOut} />;
  if (role === "orders") {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <button className="mb-6 underline" onClick={signOut}>
          Log out / تسجيل الخروج
        </button>
        <Orders />
        <div className="mt-8">
          <Security />
        </div>
      </div>
    );
  }
  return (
    <PublisherProvider>
      <AdminPage />
      <PublishDock onLock={signOut} />
    </PublisherProvider>
  );
}
