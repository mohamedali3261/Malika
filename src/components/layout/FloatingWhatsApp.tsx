import { Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/lib/messaging";
import { useRoute } from "@/lib/router";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

export function FloatingWhatsApp() {
  const { settings } = useStore();
  const { x } = useLang();
  const { path } = useRoute();
  const [overFooter, setOverFooter] = useState(false);

  /**
   * The button is fixed to the bottom of the viewport, so once the footer
   * scrolls in it covers the copyright line. Fade it out while the footer is
   * on screen — the footer has its own contact links anyway.
   */
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setOverFooter(entry.isIntersecting)),
      { rootMargin: "0px 0px -40px 0px", threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [path]);

  // private studio + pages with their own mobile ordering bar
  if (path === "/studio" || path === "/admin" || path.startsWith("/product/")) return null;

  return (
    <a
      href={whatsappUrl(
        settings.whatsapp,
        x("Hello MALIKA, I'd love help choosing a scent 🌿", "مرحباً مليكة، أحتاج مساعدة في اختيار عطر 🌿")
      )}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group fixed bottom-5 start-5 z-[70] hidden items-center gap-2 rounded-full border border-ink/10 bg-ink py-2.5 pe-4 ps-2.5 text-bone shadow-xl shadow-ink/20 transition-all duration-300 hover:bg-plum lg:flex",
        overFooter ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      )}
      aria-hidden={overFooter}
      tabIndex={overFooter ? -1 : undefined}
      aria-label={x("Chat on WhatsApp", "تواصل على واتساب")}
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-acid text-ink">
        <span className="absolute inset-0 animate-ping rounded-full bg-acid/50" />
        <Whatsapp className="relative h-4 w-4" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] opacity-0 transition-all duration-400 group-hover:max-w-[130px] group-hover:opacity-100">
        {x("Talk to us", "تحدث معنا")}
      </span>
    </a>
  );
}
