import { Check, Github, Lock, Refresh, X } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { usePublisher } from "@/context/PublisherContext";
import { useLang } from "@/i18n/LanguageContext";
import { GithubError, explainError } from "@/lib/github";
import { ConnectionForm } from "@/pages/Admin/ConnectionForm";
import { cn } from "@/utils/cn";
import { useEffect, type ReactNode } from "react";

const SIZE_WARNING_BYTES = 1_500_000;

function Line({ done, active, children }: { done?: boolean; active?: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-[12.5px]">
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full",
          done ? "bg-emerald-500 text-white" : active ? "bg-ink text-bone" : "bg-ink/10 text-ink/30"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : active ? <Refresh className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <span className={cn(!done && !active && "text-mist")}>{children}</span>
    </li>
  );
}

/**
 * The independent Publish button. One press: finish saving anything still in an
 * editor, commit the catalogue to GitHub, then watch the site until the new
 * version is actually live.
 */
export function PublishDock({ onLock }: { onLock: () => void }) {
  const { x, lang } = useLang();
  const { dirty } = useStore();
  const p = usePublisher();

  const working = p.phase === "working";
  const deploying = p.phase === "deploying";
  const hasChanges = dirty || p.pendingDrafts > 0;

  // Esc closes the panel, except while an upload is in flight.
  useEffect(() => {
    if (p.panel === "closed") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !working) p.closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p, working]);

  const repoUrl = p.config.owner && p.config.repo ? `https://github.com/${p.config.owner}/${p.config.repo}` : "";
  const fmt = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US");

  const label = working
    ? p.step === "saving"
      ? x("Saving…", "جارٍ الحفظ…")
      : x("Publishing…", "جارٍ النشر…")
    : deploying
      ? x("Going live…", "جارٍ الإظهار…")
      : hasChanges
        ? x("Publish changes", "نشر التعديلات")
        : x("Published", "تم النشر");

  const error = p.phase === "error" ? p.error : null;
  const errorKind = error instanceof GithubError ? error.kind : "unknown";
  const fixInSettings = ["auth", "forbidden", "notfound"].includes(errorKind);
  const explained = error ? explainError(error, x) : null;
  const kb = p.outcome ? Math.max(1, Math.round(p.outcome.bytes / 1024)) : 0;

  return (
    <div className="fixed bottom-4 end-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {p.panel !== "closed" && (
        <section
          role="region"
          aria-label={x("Publish to GitHub", "النشر على GitHub")}
          aria-live="polite"
          className="anim-pop w-[min(calc(100vw-2rem),25rem)] overflow-y-auto rounded-3xl border border-ink/10 bg-bone p-4 shadow-[0_30px_80px_-30px_rgba(20,16,25,0.65)] max-h-[min(72vh,38rem)]"
        >
          <header className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">GitHub</p>
              <h2 className="font-display mt-0.5 text-[1.35rem] leading-tight">
                {p.panel === "setup"
                  ? p.ready
                    ? x("Update the connection", "تحديث الاتصال")
                    : x("Connect once, publish forever", "اربط مرة واحدة وانشر دائماً")
                  : working
                    ? x("Publishing…", "جارٍ النشر…")
                    : deploying
                      ? x("Saved to GitHub", "حُفظ على GitHub")
                      : p.phase === "live"
                        ? x("It's live", "الموقع محدَّث")
                        : p.phase === "uptodate"
                          ? x("Nothing new", "لا جديد")
                          : p.phase === "unconfirmed"
                            ? x("Saved, not confirmed yet", "حُفظ ولم يُؤكَّد بعد")
                            : explained?.title ?? x("Publish", "نشر")}
              </h2>
            </div>
            {!working && (
              <button onClick={p.closePanel} aria-label={x("Close", "إغلاق")} className="press grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 hover:bg-ink hover:text-bone">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </header>

          {p.panel === "setup" && (
            <>
              {error != null && explained && (
                <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-[12px] leading-snug text-rose-900">
                  <b>{explained.title}.</b> {explained.fix}
                </p>
              )}
              {!p.ready && (
                <p className="mb-3 text-[12.5px] leading-relaxed text-ink/65">
                  {x(
                    "Tell the studio which repository to publish to and give it a token that may write there. After this, the Publish button does everything in one press.",
                    "حدّد للاستوديو المستودع الذي سينشر عليه وأعطه توكن يستطيع الكتابة فيه. بعد ذلك يفعل زر النشر كل شيء بضغطة واحدة."
                  )}
                </p>
              )}
              <ConnectionForm
                submitLabel={p.ready ? x("Save", "حفظ") : x("Save & publish", "حفظ ونشر")}
                onConnected={() => void p.publish()}
              />
            </>
          )}

          {p.panel === "status" && (
            <div className="space-y-3">
              {working && (
                <ul className="space-y-2.5">
                  <Line done={p.step === "uploading"} active={p.step === "saving"}>
                    {x("Saving your edits", "حفظ تعديلاتك")}
                  </Line>
                  <Line active={p.step === "uploading"}>{x("Uploading to GitHub", "الرفع إلى GitHub")}</Line>
                  <Line>{x("Waiting for the site to rebuild", "انتظار إعادة بناء الموقع")}</Line>
                </ul>
              )}

              {(deploying || p.phase === "live" || p.phase === "unconfirmed") && p.outcome && (
                <>
                  <ul className="space-y-2.5">
                    <Line done>{x("Edits saved", "حُفظت التعديلات")}</Line>
                    <Line done>
                      {x(`Committed to GitHub — ${fmt.format(p.outcome.productCount)} products, ${fmt.format(kb)} KB`, `رُفع إلى GitHub — ${fmt.format(p.outcome.productCount)} منتجاً، ${fmt.format(kb)} ك.ب`)}
                    </Line>
                    <Line done={p.phase === "live"} active={deploying}>
                      {p.phase === "live"
                        ? x("The site is serving the new version", "الموقع يعرض النسخة الجديدة")
                        : p.phase === "unconfirmed"
                          ? x("No rebuild seen yet", "لم نرَ إعادة بناء بعد")
                          : x("Waiting for your host to rebuild…", "بانتظار إعادة بناء الاستضافة…")}
                    </Line>
                  </ul>

                  {deploying && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900">
                      {x(
                        "Please don't edit until it's live. Edits made now are replaced when the new version loads.",
                        "من فضلك لا تعدّل حتى يصبح الموقع محدَّثاً. التعديلات الآن تُستبدل عند تحميل النسخة الجديدة."
                      )}
                    </p>
                  )}

                  {p.phase === "live" && (
                    <button
                      onClick={() => window.location.reload()}
                      className="press flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[12px] font-bold text-bone hover:bg-plum"
                    >
                      <Refresh className="h-3.5 w-3.5" /> {x("Reload to see it", "حدّث الصفحة لرؤيته")}
                    </button>
                  )}

                  {p.phase === "unconfirmed" && (
                    <div className="space-y-2 text-[11.5px] leading-snug text-ink/70">
                      <p>
                        {x(
                          "The commit is on GitHub, but this page did not change in 6 minutes. Usually the host is not connected to the repository, or its build is still running or failed.",
                          "الكوميت موجود على GitHub لكن هذه الصفحة لم تتغير خلال ٦ دقائق. غالباً الاستضافة غير مربوطة بالمستودع، أو أن البناء ما زال يعمل أو فشل."
                        )}
                      </p>
                    </div>
                  )}

                  {p.phase !== "live" && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-bold">
                      {p.outcome.commitUrl && (
                        <a href={p.outcome.commitUrl} target="_blank" rel="noopener noreferrer" className="text-plum underline decoration-acid decoration-2 underline-offset-4">
                          {x("View the commit ↗", "عرض الكوميت ↗")}
                        </a>
                      )}
                      {repoUrl && (
                        <a href={`${repoUrl}/actions`} target="_blank" rel="noopener noreferrer" className="text-plum underline decoration-acid decoration-2 underline-offset-4">
                          {x("Build status ↗", "حالة البناء ↗")}
                        </a>
                      )}
                    </div>
                  )}

                  {p.outcome.bytes > SIZE_WARNING_BYTES && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900">
                      {x(
                        "The catalogue is large. Uploaded images are shipped to every visitor — image links keep the site fast.",
                        "الكتالوج كبير. الصور المرفوعة تُحمَّل لكل زائر — روابط الصور تُبقي الموقع سريعاً."
                      )}
                    </p>
                  )}
                </>
              )}

              {p.phase === "uptodate" && (
                <>
                  <p className="text-[12.5px] leading-relaxed text-ink/65">
                    {x(
                      "Everything is the same as the last publish from this browser, so no new commit (and no rebuild) was made.",
                      "كل شيء مطابق لآخر نشر من هذا المتصفح، لذلك لم يُنشأ كوميت جديد ولا إعادة بناء."
                    )}
                  </p>
                  <button
                    onClick={() => void p.publish({ force: true })}
                    className="press flex h-10 w-full items-center justify-center rounded-full border border-ink/20 text-[12px] font-bold hover:bg-ink hover:text-bone"
                  >
                    {x("Publish anyway", "انشر على أي حال")}
                  </button>
                </>
              )}

              {error != null && explained && (
                <>
                  <p className="text-[12.5px] leading-relaxed text-ink/70" role="alert">
                    {explained.fix}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void p.publish()} className="press inline-flex h-10 flex-1 items-center justify-center rounded-full bg-acid px-4 text-[12px] font-bold text-ink hover:bg-acid-deep">
                      {x("Try again", "حاول مجدداً")}
                    </button>
                    {fixInSettings && (
                      <button onClick={() => p.openPanel("setup")} className="press inline-flex h-10 items-center justify-center rounded-full border border-ink/20 px-4 text-[12px] font-bold hover:bg-ink hover:text-bone">
                        {x("Fix connection", "إصلاح الاتصال")}
                      </button>
                    )}
                  </div>
                </>
              )}

              {p.ready && !working && (
                <p className="flex items-center justify-between gap-2 border-t border-ink/10 pt-2.5 text-[10.5px] text-mist">
                  <span dir="ltr" className="truncate">{p.config.owner}/{p.config.repo} · {p.config.branch}</span>
                  <button onClick={() => p.openPanel("setup")} className="shrink-0 font-bold text-ink/70 underline underline-offset-4">
                    {x("Change", "تغيير")}
                  </button>
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onLock}
          aria-label={x("Lock studio", "قفل الاستوديو")}
          className="press inline-flex h-12 items-center gap-2 rounded-full border border-ink/10 bg-ink px-3.5 text-[11px] font-bold text-bone shadow-xl shadow-ink/20 hover:bg-plum"
        >
          <Lock className="h-4 w-4 text-acid" />
          <span className="max-sm:hidden">{x("Lock studio", "قفل الاستوديو")}</span>
        </button>

        <button
          onClick={() => void p.publish()}
          disabled={working}
          title={p.pendingDrafts > 0 ? x("Includes edits you haven't saved yet", "يشمل تعديلات لم تحفظها بعد") : undefined}
          className={cn(
            "press relative inline-flex h-12 items-center gap-2.5 rounded-full px-5 text-[12.5px] font-extrabold shadow-xl transition-colors disabled:cursor-wait",
            hasChanges || working || deploying
              ? "bg-acid text-ink shadow-acid/30 hover:bg-acid-deep"
              : "border border-ink/15 bg-bone text-ink/70 shadow-ink/10 hover:border-ink/40"
          )}
        >
          {working ? (
            <Refresh className="h-4 w-4 animate-spin" />
          ) : deploying ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ink" />
            </span>
          ) : hasChanges ? (
            <Github className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4 text-emerald-600" />
          )}
          {label}
          {hasChanges && !working && !deploying && (
            <span className="absolute -end-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-bone bg-amber-500" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
