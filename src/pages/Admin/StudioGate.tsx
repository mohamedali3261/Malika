import { PublisherProvider } from "@/context/PublisherContext";
import { AdminPage } from "@/pages/Admin/AdminPage";
import { PublishDock } from "@/pages/Admin/PublishDock";
import { StudioLock } from "@/pages/Admin/StudioLock";
import { isUnlocked, lock, touchSession } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { navigate } from "@/lib/router";
import { useCallback, useEffect, useState } from "react";

/**
 * Wraps the studio. Keeps the session alive while the admin works, drops it on
 * idle/expiry, and strips the page from search engines.
 */
export function StudioGate() {
  const { t } = useLang();
  const { push } = useToast();
  const [unlocked, setUnlocked] = useState(() => isUnlocked());

  // never index the studio
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = "Studio · MALIKA";
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  // refresh the idle timer on real activity, and re-check expiry periodically
  useEffect(() => {
    if (!unlocked) return;
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll"];
    const onActivity = () => touchSession();
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const timer = window.setInterval(() => {
      if (!isUnlocked()) {
        setUnlocked(false);
        push(t("lock.signedOut"), "info");
      }
    }, 30_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(timer);
    };
  }, [unlocked, push, t]);

  const signOut = useCallback(() => {
    lock();
    setUnlocked(false);
    push(t("lock.signedOut"), "info");
    navigate("/");
  }, [push, t]);

  if (!unlocked) {
    return <StudioLock onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <PublisherProvider>
      <AdminPage />
      <PublishDock onLock={signOut} />
    </PublisherProvider>
  );
}
