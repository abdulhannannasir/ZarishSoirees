import type { Metadata } from "next";
import { ClosingCta } from "@/components/sites/twt/closing-cta";
import { PORTFOLIO } from "@/components/sites/twt/content";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { PortfolioBrowse } from "@/components/sites/twt/portfolio-browse";
import { PortfolioGrid } from "@/components/sites/twt/portfolio-grid";
import { TheoryBanner } from "@/components/sites/twt/theory-banner";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Wedding, social celebration and corporate event portfolio: grand entrances, bespoke stages, floral architecture, tables and lighting from The Wed Theory Events, Lahore.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <PageIntro
        eyebrow={PORTFOLIO.eyebrow}
        headline={PORTFOLIO.headline}
        intro={PORTFOLIO.intro}
      />
      <PortfolioGrid />
      <PortfolioBrowse />
      <TheoryBanner />
      <ClosingCta />
    </>
  );
}
