import { PerfumeExperience } from "@/components/perfume/PerfumeExperience";
import { ContactCTA } from "@/pages/Home/ContactCTA";
import { Showcase } from "@/pages/Home/Showcase";
import { Featured } from "@/pages/Home/Featured";
import { Hero } from "@/pages/Home/Hero";
import { NotesMarquee } from "@/pages/Home/NotesMarquee";
import { Pillars } from "@/pages/Home/Pillars";
import { ScentFinder } from "@/pages/Home/ScentFinder";
import { StorySection } from "@/pages/Home/StorySection";
import { Testimonials } from "@/pages/Home/Testimonials";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";

export function HomePage() {
  const { products } = useStore();
  const { c } = useContent();
  const signature =
    products.find((product) => product.slug === "malika-noir") ??
    products.find((product) => product.featured) ??
    products[0];

  return (
    <div key="home" className="anim-page">
      <Hero signature={signature} />
      {c.sections.marquee && <NotesMarquee />}
      {c.sections.showcase && <Showcase />}
      {c.sections.featured && <Featured />}
      {c.sections.perfume3d && <PerfumeExperience />}
      {c.sections.scentFinder && <ScentFinder />}
      {c.sections.story && <StorySection />}
      {c.sections.pillars && <Pillars />}
      {c.sections.testimonials && <Testimonials />}
      {c.sections.contactCta && <ContactCTA />}
    </div>
  );
}
