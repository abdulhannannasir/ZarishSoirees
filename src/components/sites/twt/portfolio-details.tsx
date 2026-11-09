import { MasonryGallery, type MasonryItem } from "@/components/ui/masonry-gallery";
import { PORTFOLIO_DETAILS } from "./content";

type DetailsContent = {
  kicker: string;
  title: string;
  intro: string;
  items: readonly MasonryItem[];
};

/**
 * The close-up gallery under the portfolio's five collections: a heading, then a masonry whose
 * tiles glide in as they scroll into view. Captions show on hover (mouse) or always (touch). The
 * service pages reuse it with their own pictures.
 */
export function PortfolioDetails({ details = PORTFOLIO_DETAILS }: { details?: DetailsContent }) {
  const { kicker, title, intro, items } = details;
  return (
    <section
      aria-labelledby="details-heading"
      className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
    >
      <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-6">
          <p className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
            {kicker}
          </p>
          <h2
            id="details-heading"
            className="mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink"
          >
            {title}
          </h2>
        </div>
        <p className="max-w-[28rem] text-[17px] leading-[1.45] text-ink-soft lg:col-span-5 lg:col-start-8">
          {intro}
        </p>
      </div>

      <MasonryGallery
        items={items}
        animateFrom="bottom"
        blurToFocus
        stagger={0.08}
        scaleOnHover
        hoverScale={0.97}
        className="mt-10 lg:mt-14"
      />
    </section>
  );
}
