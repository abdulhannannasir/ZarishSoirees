import type { Metadata } from "next";
import { AboutProcess } from "@/components/sites/twt/about-sections";
import { ClosingCta } from "@/components/sites/twt/closing-cta";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { ServiceCards } from "@/components/sites/twt/service-sections";
import { SERVICES_PAGE } from "@/components/sites/twt/services-content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: SERVICES_PAGE.title,
  description: SERVICES_PAGE.metaDescription,
  path: SERVICES_PAGE.path,
  image: { url: SERVICES_PAGE.card.src, alt: SERVICES_PAGE.card.alt },
});

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow={SERVICES_PAGE.eyebrow}
        headline={SERVICES_PAGE.headline}
        intro={SERVICES_PAGE.intro}
      />
      <section
        aria-label={SERVICES_PAGE.eyebrow}
        className="mx-auto max-w-[1760px] px-5 pb-20 sm:px-8 lg:px-[6.56vw] lg:pb-28"
      >
        <ServiceCards />
      </section>
      <AboutProcess />
      <ClosingCta />
    </>
  );
}
