import { Button } from "@/components/ui/Button";
import { Check, Download, Github, Refresh } from "@/components/ui/icons";
import { usePublisher } from "@/context/PublisherContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { downloadJson } from "@/lib/format";
import { isRemembered } from "@/lib/githubAuth";
import { ConnectionForm } from "@/pages/Admin/ConnectionForm";
import { GithubConnection } from "@/pages/Admin/GithubConnection";
import type { Product, SiteSettings } from "@/types";
import type { SiteContent } from "@/types/content";
import { cn } from "@/utils/cn";

/**
 * Connection settings and status. Publishing itself is the Publish button that
 * floats on every studio tab; this page is where it is set up and inspected.
 */
export function GithubPanel({ products, settings, content }: { products: Product[]; settings: SiteSettings; content: SiteContent }) {
  const { x, lang } = useLang();
  const { push } = useToast();
  const { dirty, lastPublishedAt } = useStore();
  const p = usePublisher();

  const when = lastPublishedAt ? new Date(lastPublishedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB") : null;
  const working = p.phase === "working";

  const exportCatalogue = () => {
    downloadJson("catalog.json", { generatedAt: new Date().toISOString(), settings, content, products });
    push(x("Catalogue exported.", "تم تصدير الكتالوج."), "info");
  };

  return (
    <div className="space-y-4">
      {/* status */}
      <div className={cn("rounded-2xl border p-4", p.ready ? (dirty || p.pendingDrafts > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50") : "border-ink/10 bg-white/50")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-bone">
              <Github className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              {p.ready ? (
                <>
                  <p className="truncate text-[13px] font-bold" dir="ltr">
                    {p.config.owner}/{p.config.repo} <span className="font-normal text-mist">· {p.config.branch}</span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink/65">
                    {dirty || p.pendingDrafts > 0
                      ? x("You have changes that are not published yet.", "لديك تعديلات لم تُنشر بعد.")
                      : x("Everything is published.", "كل شيء منشور.")}
                    {when && <span className="text-mist"> · {x("Last publish", "آخر نشر")}: {when}</span>}
                  </p>
                  <p className="mt-1 text-[11px] text-mist">
                    {x("Token is kept ", "التوكن محفوظ ")}
                    {isRemembered() ? x("on this device.", "على هذا الجهاز.") : x("for this tab only.", "لهذه النافذة فقط.")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-bold">{x("Not connected yet", "غير مربوط بعد")}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink/65">
                    {x("Connect once below. After that, the Publish button (bottom corner of every studio page) does it all in one press.", "اربط مرة واحدة بالأسفل. بعد ذلك يفعل زر النشر (في ركن كل صفحة بالاستوديو) كل شيء بضغطة واحدة.")}
                  </p>
                </>
              )}
            </div>
          </div>

          {p.ready && (
            <div className="flex flex-wrap gap-2">
              <Button variant="acid" onClick={() => void p.publish()} disabled={working} icon={working ? <Refresh className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} iconPosition="start">
                {x("Publish now", "انشر الآن")}
              </Button>
              <Button variant="outline" size="sm" onClick={p.disconnect}>
                {x("Disconnect", "قطع الاتصال")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <details open={!p.ready} className="group rounded-2xl border border-ink/10 bg-white/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 text-[13px] font-bold">
          {p.ready ? x("Change repository or token", "تغيير المستودع أو التوكن") : x("Connect a repository", "ربط مستودع")}
          <span className="text-mist transition-transform group-open:rotate-45">＋</span>
        </summary>
        <div className="border-t border-ink/10 p-4">
          <div className="max-w-xl">
            <ConnectionForm submitLabel={p.ready ? x("Save", "حفظ") : x("Save & publish", "حفظ ونشر")} onConnected={() => void p.publish()} />
          </div>
        </div>
      </details>

      <details className="group rounded-2xl border border-ink/10 bg-white/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 text-[13px] font-bold">
          {x("Advanced", "إعدادات متقدمة")}
          <span className="text-mist transition-transform group-open:rotate-45">＋</span>
        </summary>
        <div className="space-y-4 border-t border-ink/10 p-4">
          <label className="block max-w-xl">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-mist">{x("File to write", "الملف المراد الكتابة فيه")}</span>
            <input value={p.config.path} onChange={(event) => p.updateConfig({ path: event.target.value })} className="field" dir="ltr" />
            <span className="mt-1 block text-[11px] text-mist">{x("Leave as is unless you know why you are changing it. It must end in .json.", "اتركه كما هو إلا لو كنت تعرف لماذا تغيّره. يجب أن ينتهي بـ .json.")}</span>
          </label>

          {/* Offered while not connected, or to show an OAuth session. With a token
              connection it would only repeat the Disconnect button above. */}
          {(!p.session || p.session.method === "oauth") && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-mist">{x("Sign in with GitHub OAuth instead of a token", "الدخول عبر GitHub OAuth بدل التوكن")}</p>
              <GithubConnection session={p.session} onChange={p.setSession} />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={exportCatalogue} icon={<Download className="h-3.5 w-3.5" />} iconPosition="start">
            {x("Export catalog.json", "تصدير catalog.json")}
          </Button>
        </div>
      </details>
    </div>
  );
}
