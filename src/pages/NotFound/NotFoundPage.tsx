import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Sparkle } from "@/components/ui/icons";

export function NotFoundPage() {
  const { x } = useLang();

  return (
    <div className="anim-page flex min-h-[65vh] flex-col items-center justify-center bg-bone px-6 py-20 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-lilac-soft">
        <Sparkle className="h-7 w-7 text-plum" />
      </span>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-mist">404 — off the map</p>
      <h1 className="font-display mt-2 text-4xl sm:text-6xl">
        {x("This page has drifted away.", "هذه الصفحة تلاشت.")}
      </h1>
      <p className="mt-3 max-w-md text-sm text-mist">
        {x("The link may be old. The scent that suits you is still in the shop.", "ربما الرابط قديم. لكن العطر الذي يليق بك ما زال في المتجر.")}
      </p>
      <Button to="/shop" className="mt-6" icon={<ArrowUpRight className="h-4 w-4" />}>
        {x("Browse the collection", "تصفّح المجموعة")}
      </Button>
    </div>
  );
}
