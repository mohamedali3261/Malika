import { ContactCTA } from "@/pages/Home/ContactCTA";
import { Featured } from "@/pages/Home/Featured";
import { Hero } from "@/pages/Home/Hero";
import { NotesMarquee } from "@/pages/Home/NotesMarquee";
import { Pillars } from "@/pages/Home/Pillars";
import { ScentFinder } from "@/pages/Home/ScentFinder";
import { Showcase } from "@/pages/Home/Showcase";
import { StorySection } from "@/pages/Home/StorySection";
import { Testimonials } from "@/pages/Home/Testimonials";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { Suspense, lazy } from "react";

const PerfumeExperience = lazy(() =>
  import("@/components/perfume/PerfumeExperience").then((mod) => ({ default: mod.PerfumeExperience }))
);

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
      {c.sections.perfume3d && (
        <Suspense fallback={<div className="min-h-[420px] bg-ink" aria-hidden="true" />}>
          <PerfumeExperience />
        </Suspense>
      )}
      {c.sections.scentFinder && <ScentFinder />}
      {c.sections.story && <StorySection />}
      {c.sections.pillars && <Pillars />}
      {c.sections.testimonials && <Testimonials />}
      {c.sections.contactCta && <ContactCTA />}
    </div>
  );
}
