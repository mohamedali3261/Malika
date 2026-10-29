import { AboutHero } from "@/pages/About/AboutHero";
import { HouseStory } from "@/pages/About/HouseStory";
import { Process } from "@/pages/About/Process";
import { Values } from "@/pages/About/Values";
import { ContactCTA } from "@/pages/Home/ContactCTA";

export function AboutPage() {
  return (
    <div className="anim-page bg-bone">
      <AboutHero />
      <HouseStory />
      <Values />
      <Process />
      <ContactCTA />
    </div>
  );
}
