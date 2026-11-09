import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { PORTFOLIO_BROWSE } from "./home-content";
import { PortfolioGallery } from "./portfolio-gallery";
import { GALLERY_ITEMS } from "./portfolio-gallery-data";
import { SiteLink } from "./site-link";

/** The portfolio page's gallery: every picture on the site, filterable, each one openable full screen. */
export function PortfolioBrowse() {
  const { kicker, headline, intro, back } = PORTFOLIO_BROWSE;
  return (
    <section
      aria-labelledby="browse-heading"
      className="border-t border-line bg-ivory px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
    >
      <div className="mx-auto max-w-[1760px]">
        <Reveal className="mb-10">
          <p className="font-ui text-[11px] leading-none font-medium tracking-[0.3em] text-ink-soft uppercase">
            {kicker}
          </p>
          <h2
            id="browse-heading"
            className="mt-5 font-serif text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.04] font-normal text-ink"
          >
            <span className="block">{headline[0]}</span>
            <span className="block italic">{headline[1]}</span>
          </h2>
          <p className="mt-5 max-w-[34rem] font-ui text-[16px] leading-[1.65] font-light text-ink-soft">
            {intro}
          </p>
        </Reveal>

        <PortfolioGallery
          items={GALLERY_ITEMS}
          filters
          footer={
            <SiteLink
              href={back.href}
              className="inline-flex min-h-12 items-center gap-3 font-ui text-[12.5px] font-medium tracking-[0.16em] text-ink-soft uppercase underline-offset-8 outline-none hover:text-ink hover:underline focus-visible:text-ink focus-visible:underline"
            >
              <ArrowLeft className="size-[14px]" strokeWidth={1.4} aria-hidden="true" />
              {back.label}
            </SiteLink>
          }
        />
      </div>
    </section>
  );
}
