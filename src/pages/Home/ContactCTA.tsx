import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/Primitives";
import { ArrowUpRight, Messenger, Sparkle, Whatsapp } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { openChannel, messengerUrl, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";

export function ContactCTA() {
  const { t, x } = useLang();
  const { c, lc } = useContent();
  const { settings } = useStore();
  const greeting = x("Hello MALIKA, help me pick a scent 🌿", "مرحباً مليكة، أرغب في مساعدتي لاختيار عطر 🌿");

  return (
    <section className="cv-auto relative bg-bone sec-pb">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-bone sm:rounded-[2.5rem] sm:px-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -start-20 bottom-0 h-80 w-80 rounded-full bg-plum blur-[90px]" />
            <div className="pointer-events-none absolute end-0 top-0 h-72 w-72 rounded-full bg-lilac/20 blur-[100px]" />

            <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-acid">
                  <Sparkle className="h-3.5 w-3.5" /> {lc(c.cta.eyebrow)}
                </span>
                <h2 className="hd-section font-display mt-3 max-w-xl leading-[1] tracking-tight">
                  {lc(c.cta.title)}
                </h2>
                <p className="lead-copy mt-3 max-w-md text-bone/55">{lc(c.cta.lead)}</p>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => openChannel(whatsappUrl(settings.whatsapp, greeting))}
                    className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-acid px-6 text-[12px] font-bold text-ink transition hover:bg-acid-deep"
                  >
                    <Whatsapp className="h-4 w-4" />
                    {t("cta.whatsapp")}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => openChannel(messengerUrl(settings.messenger))}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full border border-bone/20 px-6 text-[12px] font-bold text-bone transition hover:border-bone/50 hover:bg-bone/5"
                  >
                    <Messenger className="h-4 w-4" />
                    {t("cta.messenger")}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/35">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-acid opacity-70" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-acid" />
                    </span>
                    {x("Online now · replies in ~9 min", "متصلون الآن · رد خلال ٩ دقائق")}
                  </span>
                  <span>·</span>
                  <span>{x("No online payment — every order confirmed personally", "لا دفع إلكتروني — نؤكد كل طلب شخصياً")}</span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[330px]">
                <div className="absolute inset-4 rounded-full bg-lilac/25 blur-2xl" />
                <SmartImage
                  src={IMG.bottleEditorial}
                  alt={x("Malika perfume", "عطر مليكة")}
                  className="aspect-[4/5] w-full rotate-2 rounded-[1.8rem] border border-bone/15"
                />
                <div className="absolute -bottom-4 -start-3 flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-bone px-3.5 py-2.5 text-ink shadow-xl">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-acid">
                    <Sparkle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-mist">
                      {x("Gift with every order", "هدية مع كل طلب")}
                    </p>
                    <p className="text-[11px] font-bold">{x("Two free samples", "عينتان مجانيتان")}</p>
                  </div>
                </div>
                <Link
                  to="/shop"
                  className="absolute -end-3 top-5 grid h-20 w-20 -rotate-6 place-items-center rounded-full bg-lilac text-center text-ink shadow-lg transition hover:rotate-0"
                >
                  <div>
                    <p className="font-display text-base leading-none">{x("find", "اكتشف")}</p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em]">{x("your scent", "عطرك")}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
