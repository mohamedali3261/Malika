import { useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import "@/styles/home-loader.css";

type HomeLoaderProps = { onDone: () => void };

export function HomeLoader({ onDone }: HomeLoaderProps) {
  const { x } = useLang();

  useEffect(() => {
    const timer = window.setTimeout(onDone, 5000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="home-loader"
      role="status"
      aria-live="polite"
      aria-label={x("Loading VLOR", "جارٍ تحميل ڨلور")}
    >
      <div className="home-loader__content">
        <div className="home-loader__glow" />
        <img
          className="home-loader__emblem"
          src="/images/brand/vlor-emblem.webp"
          alt="VLOR"
          draggable={false}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        <div className="home-loader__track" aria-hidden="true">
          <span className="home-loader__progress" />
        </div>
      </div>
    </div>
  );
}
