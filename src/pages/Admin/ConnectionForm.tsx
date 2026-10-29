import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Check, Refresh, X } from "@/components/ui/icons";
import { usePublisher } from "@/context/PublisherContext";
import { useLang } from "@/i18n/LanguageContext";
import { checkAccess, explainError, parseRepo, tokenCreationUrl, type AccessReport } from "@/lib/github";
import { isRemembered } from "@/lib/githubAuth";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";

/**
 * One-time connection: which repository, and a token that may write to it.
 * Used inside the Publish panel and on the GitHub tab.
 */
export function ConnectionForm({
  submitLabel,
  onConnected,
  autoOpenSteps = true,
}: {
  submitLabel?: string;
  onConnected?: () => void;
  autoOpenSteps?: boolean;
}) {
  const { x } = useLang();
  const { config, connect, session } = usePublisher();

  const [repo, setRepo] = useState(config.owner && config.repo ? `${config.owner}/${config.repo}` : "");
  const [branch, setBranch] = useState(config.branch || "main");
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(() => (session ? isRemembered() : true));
  const [busy, setBusy] = useState<"test" | "save" | null>(null);
  const [report, setReport] = useState<AccessReport | null>(null);
  const [error, setError] = useState<unknown>(null);

  const parsed = useMemo(() => parseRepo(repo), [repo]);
  const problem = repo.trim() && !parsed ? x("Write it as owner/name, or paste the repository link.", "اكتبه بصيغة owner/name أو الصق رابط المستودع.") : "";
  const canTry = Boolean(parsed) && token.trim().length > 8;

  const test = async () => {
    if (!parsed) return;
    setBusy("test");
    setError(null);
    setReport(null);
    try {
      setReport(await checkAccess({ owner: parsed.owner, repo: parsed.repo, branch }, token.trim()));
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy("save");
    setError(null);
    try {
      await connect({ repo, branch, token, remember });
      setToken("");
      onConnected?.();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(null);
    }
  };

  const explained = error ? explainError(error, x) : null;
  const row = "flex items-start gap-2 text-[12px] leading-snug";

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{x("Repository", "المستودع")}</span>
        <input
          value={repo}
          onChange={(event) => {
            setRepo(event.target.value);
            setReport(null);
          }}
          className="field"
          dir="ltr"
          placeholder="owner/malika-store"
          autoComplete="off"
          spellCheck={false}
        />
        {problem && <span className="mt-1 block text-[11px] text-rose-600">{problem}</span>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{x("Branch", "الفرع")}</span>
        <input value={branch} onChange={(event) => setBranch(event.target.value)} className="field" dir="ltr" placeholder="main" autoComplete="off" />
      </label>

      <details open={autoOpenSteps && !session} className="group rounded-2xl border border-ink/10 bg-white/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-3 text-[12px] font-bold">
          {x("Need a token? 2 minutes, once.", "تحتاج توكن؟ دقيقتان وتتم مرة واحدة.")}
          <span className="text-mist transition-transform group-open:rotate-45">＋</span>
        </summary>
        <ol className="space-y-2.5 border-t border-ink/10 px-3.5 py-3 text-[12px] leading-relaxed text-ink/70">
          <li>
            <a
              href={tokenCreationUrl(parsed?.owner)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-plum underline decoration-acid decoration-2 underline-offset-4"
            >
              {x("Open GitHub's token page", "افتح صفحة التوكن في GitHub")} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <span className="block text-mist">{x("The name, 90-day expiry and “Contents: write” are already filled in.", "الاسم ومدة ٩٠ يوماً وصلاحية «Contents: write» معبّأة مسبقاً.")}</span>
          </li>
          <li>
            {x("Under ", "تحت ")}
            <b>Repository access</b>
            {x(" choose ", " اختر ")}
            <b>Only select repositories</b>
            {x(" and pick this one repository.", " ثم هذا المستودع وحده.")}
          </li>
          <li>{x("Press Generate token, copy it, and paste it below.", "اضغط Generate token وانسخه والصقه بالأسفل.")}</li>
        </ol>
      </details>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{x("Token", "التوكن")}</span>
        <input
          type="password"
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setReport(null);
          }}
          className="field"
          dir="ltr"
          placeholder={session ? x("•••• saved — paste a new one to replace it", "•••• محفوظ — الصق توكن جديد لاستبداله") : "github_pat_…"}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-bone-2/60 px-3 py-2.5">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ink)]" />
        <span className="text-[11.5px] leading-snug text-ink/70">
          <b className="text-ink">{x("Remember on this device", "تذكّر على هذا الجهاز")}</b>
          <span className="block text-mist">
            {remember
              ? x("Publishing stays one click. Anyone using this browser profile could publish — use it only on your own device.", "يبقى النشر بضغطة واحدة. أي شخص يستخدم هذا المتصفح يستطيع النشر — استخدمها على جهازك الخاص فقط.")
              : x("Kept for this tab only; you will paste it again next time.", "يُحفظ لهذه النافذة فقط وستلصقه مجدداً في المرة القادمة.")}
          </span>
        </span>
      </label>

      {report && (
        <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-900">
          <p className={row}>
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span dir="ltr" className="font-semibold">{report.owner}/{report.repo}</span>
            <span>· {report.isPrivate ? x("private", "خاص") : x("public", "عام")}</span>
          </p>
          <p className={cn(row, !report.branchOk && "text-rose-700")}>
            {report.branchOk ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            <span>
              {report.branchOk
                ? x(`Branch “${report.branch}” exists`, `الفرع «${report.branch}» موجود`)
                : x(`Branch “${report.branch}” not found — the default branch is “${report.defaultBranch}”`, `الفرع «${report.branch}» غير موجود — الفرع الافتراضي «${report.defaultBranch}»`)}
            </span>
          </p>
          <p className="text-[11px] leading-snug text-emerald-800/80">
            {x("Whether the token may write is confirmed on your first publish.", "صلاحية الكتابة للتوكن تتأكد عند أول نشر.")}
          </p>
        </div>
      )}

      {explained && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-900" role="alert">
          <p className="text-[12px] font-bold">{explained.title}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug">{explained.fix}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={test}
          disabled={!canTry || busy !== null}
          icon={busy === "test" ? <Refresh className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          iconPosition="start"
        >
          {x("Test", "اختبار")}
        </Button>
        <Button
          type="button"
          variant="acid"
          className="flex-1"
          onClick={save}
          disabled={!canTry || busy !== null}
          icon={busy === "save" ? <Refresh className="h-3.5 w-3.5 animate-spin" /> : undefined}
        >
          {submitLabel ?? x("Save connection", "حفظ الاتصال")}
        </Button>
      </div>
    </div>
  );
}
