import { ClosingCta } from "./closing-cta";
import { AboutProcess } from "./about-sections";
import { PageIntro } from "./page-intro";
import { PortfolioDetails } from "./portfolio-details";
import { ServiceSchema } from "./local-business-schema";
import { ServiceFeatures, ServiceHeroPhoto, ServiceOffer, ServiceOthers } from "./service-sections";
import { SERVICE_PAGES, type ServiceSlug } from "./services-content";
import { TheoryBanner } from "./theory-banner";

/** One service's page: introduction, what we plan, highlights, how we work, gallery, then the call to action. */
export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const page = SERVICE_PAGES[slug];
  return (
    <>
      <ServiceSchema page={page} />
      <PageIntro eyebrow={page.eyebrow} headline={page.headline} intro={page.intro}>
        <ServiceHeroPhoto photo={page.hero} />
      </PageIntro>
      <ServiceOffer page={page} />
      <ServiceFeatures page={page} />
      <AboutProcess process={page.process} />
      <PortfolioDetails details={page.gallery} />
      {slug === "weddings" && <TheoryBanner />}
      <ServiceOthers slug={slug} />
      <ClosingCta content={page.closing} />
    </>
  );
}
