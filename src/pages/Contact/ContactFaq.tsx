import { Reveal } from "@/components/ui/Reveal";
import { Accordion, SectionHeading } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { whatsappUrl } from "@/lib/messaging";

export function ContactFaq() {
  const { t, x } = useLang();
  const { c, lc } = useContent();
  const { settings } = useStore();

  return (
    <section className="bg-bone-2/50 sec-y-sm">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow={t("footer.faq")} title={t("faq.title")} lead={x("Everything you need to know before the first spray.", "كل ما تحتاج معرفته قبل أول رشّة.")} />
          <Button
            href={whatsappUrl(settings.whatsapp, x("Hello MALIKA, I have a question", "مرحباً مليكة، لدي سؤال"))}
            variant="outline"
            className="mt-6"
            icon={<Whatsapp className="h-4 w-4" />}
            iconPosition="start"
          >
            {t("cta.whatsapp")}
          </Button>
        </Reveal>
        <Reveal delay={100}>
          <Accordion
            items={c.faq.map((item) => ({ title: lc(item.question), body: lc(item.answer) }))}
          />
        </Reveal>
      </div>
    </section>
  );
}
