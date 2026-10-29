import { Channels } from "@/pages/Contact/Channels";
import { ContactFaq } from "@/pages/Contact/ContactFaq";
import { ContactForm } from "@/pages/Contact/ContactForm";
import { ContactHero } from "@/pages/Contact/ContactHero";

export function ContactPage() {
  return (
    <div className="anim-page bg-bone">
      <ContactHero />
      <Channels />
      <ContactForm />
      <ContactFaq />
    </div>
  );
}
