import { ContactCTA } from "@/pages/Home/ContactCTA";
import { Featured } from "@/pages/Home/Featured";
import { Hero } from "@/pages/Home/Hero";
import { Pillars } from "@/pages/Home/Pillars";
import { RunwayLookbook } from "@/pages/Home/RunwayLookbook";
import { Showcase } from "@/pages/Home/Showcase";
import { StorySection } from "@/pages/Home/StorySection";
import { Testimonials } from "@/pages/Home/Testimonials";
import { useContent } from "@/hooks/useContent";
import { Suspense, lazy } from "react";

const PerfumeExperience = lazy(() =>
  import("@/components/perfume/PerfumeExperience").then((mod) => ({ default: mod.PerfumeExperience }))
);

export function HomePage() {
  const { c } = useContent();

  return (
    <div key="home" className="anim-page">
      <Hero />
      {c.sections.runwayLookbook && <RunwayLookbook />}
      {c.sections.showcase && <Showcase />}
      {c.sections.featured && <Featured />}
      {c.sections.perfume3d && (
        <Suspense fallback={<div className="min-h-[420px] bg-ink" aria-hidden="true" />}>
          <PerfumeExperience />
        </Suspense>
      )}
      {c.sections.story && <StorySection />}
      {c.sections.pillars && <Pillars />}
      {c.sections.testimonials && <Testimonials />}
      {c.sections.contactCta && <ContactCTA />}
    </div>
  );
}
