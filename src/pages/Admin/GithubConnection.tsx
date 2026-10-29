import { Button } from "@/components/ui/Button";
import {
  Check,
  Copy,
  Github,
  KeyRound,
  Lock,
  Refresh,
  Shield,
  Sparkle,
  X,
} from "@/components/ui/icons";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import {
  clearSession,
  connectWithToken,
  defaultOAuthSettings,
  getRedirectUri,
  loadOAuthSettings,
  saveOAuthSettings,
  startOAuth,
} from "@/lib/githubAuth";
import type { GitHubSession, OAuthScope, OAuthSettings } from "@/types";
import { useState } from "react";

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[9px] leading-relaxed text-mist/80">{hint}</span>}
    </label>
  );
}

export function GithubConnection({
  session,
  onChange,
}: {
  session: GitHubSession | null;
  onChange: (session: GitHubSession | null) => void;
}) {
  const { t, lang } = useLang();
  const { push } = useToast();
  const [settings, setSettings] = useState<OAuthSettings>(() => loadOAuthSettings());
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const redirectUri = typeof window === "undefined" ? "" : getRedirectUri();

  const update = <K extends keyof OAuthSettings>(key: K, value: OAuthSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveOAuthSettings(next);
  };

  const connect = () => {
    if (!settings.clientId.trim() || !settings.relayUrl.trim()) {
      push(t("gh.oauthMissing"), "error");
      return;
    }
    try {
      startOAuth(settings);
    } catch (error) {
      push(error instanceof Error ? error.message : t("gh.oauthFailed"), "error");
    }
  };

  const connectToken = async () => {
    setBusy(true);
    try {
      const next = await connectWithToken(token);
      saveOAuthSettings(settings);
      onChange(next);
      setToken("");
      push(`${t("gh.oauthDone")} · @${next.login}`);
    } catch (error) {
      push(error instanceof Error ? error.message : t("gh.oauthFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      push(t("gh.copied"), "info");
    } catch {
      push(redirectUri, "info");
    }
  };

  const disconnect = () => {
    clearSession();
    onChange(null);
    push(t("gh.disconnected"), "info");
  };

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="rounded-2xl border border-ink/10 bg-white/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[13px] font-bold">
              <Github className="h-4 w-4" /> {t("gh.authTitle")}
            </h3>
            <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-mist">{t("gh.authLead")}</p>
          </div>
          {session ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t("gh.connected")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bone-2 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-mist">
              <Lock className="h-3 w-3" /> {t("gh.needAuth")}
            </span>
          )}
        </div>

        {session ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink/10 bg-bone/70 p-3">
            {session.avatar ? (
              <img src={session.avatar} alt="" className="h-10 w-10 rounded-full border border-ink/10 object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-[11px] font-bold text-acid">
                {session.login.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("gh.connectedAs")}</p>
              <p className="truncate text-[12px] font-bold" dir="ltr">
                @{session.login}
              </p>
            </div>
            <span className="rounded-full bg-lilac-soft px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-plum">
              {session.method === "oauth" ? t("gh.oauthBadge") : t("gh.tokenBadge")}
            </span>
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1.5 text-[9px] font-bold text-mist transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="h-3 w-3" /> {t("gh.disconnect")}
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Row label={t("gh.clientId")} hint={t("gh.clientIdHint")}>
              <input
                value={settings.clientId}
                onChange={(event) => update("clientId", event.target.value)}
                className="field"
                dir="ltr"
                placeholder="Ov23li…"
                autoComplete="off"
              />
            </Row>
            <Row label={t("gh.relay")} hint={t("gh.relayHint")}>
              <input
                value={settings.relayUrl}
                onChange={(event) => update("relayUrl", event.target.value)}
                className="field"
                dir="ltr"
                placeholder={defaultOAuthSettings.relayUrl}
              />
            </Row>
            <Row label={t("gh.scope")} hint={t("gh.scopeHint")}>
              <select
                value={settings.scope}
                onChange={(event) => update("scope", event.target.value as OAuthScope)}
                className="field"
              >
                <option value="public_repo">public_repo</option>
                <option value="repo">repo</option>
              </select>
            </Row>
            <Row label={t("gh.callback")} hint={lang === "ar" ? "ألصق نفس الرابط في GitHub ← OAuth App ← Authorization callback URL." : "Paste the same URL in GitHub → OAuth App → Authorization callback URL."}>
              <div className="flex gap-1.5">
                <input value={redirectUri} readOnly className="field text-[10.5px]" dir="ltr" />
                <button
                  type="button"
                  onClick={copyCallback}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink/15 text-ink transition hover:bg-ink hover:text-bone"
                  aria-label={t("gh.copy")}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </Row>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <Button onClick={connect} variant="primary" icon={<Github className="h-4 w-4" />} iconPosition="start">
                {t("gh.connect")}
              </Button>
              <button
                onClick={() => setShowToken((value) => !value)}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-[11px] font-bold text-ink/65 transition hover:border-ink/40 hover:text-ink"
              >
                <KeyRound className="h-3.5 w-3.5" /> {t("gh.tokenTitle")}
              </button>
            </div>
          </div>
        )}

        {!session && showToken && (
          <div className="mt-4 rounded-xl border border-dashed border-ink/20 bg-bone-2/40 p-3">
            <p className="text-[10px] leading-relaxed text-mist">{t("gh.tokenLead")}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="field h-10 flex-1"
                dir="ltr"
                placeholder="github_pat_…"
                autoComplete="off"
              />
              <Button onClick={connectToken} disabled={busy || !token.trim()} size="md" variant="acid" icon={busy ? <Refresh className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} iconPosition="start">
                {t("gh.connectToken")}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-bone-2/60 px-3 py-2.5 text-[9.5px] leading-relaxed text-mist">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" /> {t("gh.securityNote")}
        </p>
      </div>

      {/* OAuth app setup */}
      <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-bone">
        <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-acid">
          <Sparkle className="h-3.5 w-3.5" /> {lang === "ar" ? "إعداد OAuth في ٤ خطوات" : "OAuth in four steps"}
        </h4>
        <ol className="mt-3 space-y-2.5">
          {[t("gh.os1"), t("gh.os2"), t("gh.os3"), t("gh.os4")].map((step, index) => (
            <li key={step} className="flex gap-2.5 text-[10.5px] leading-relaxed text-bone/60">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bone/10 text-[9px] font-bold text-acid">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-[9.5px] leading-relaxed text-bone/45" dir="ltr">
          GITHUB_CLIENT_ID · GITHUB_CLIENT_SECRET · ALLOWED_ORIGIN
        </p>
      </div>
    </div>
  );
}
