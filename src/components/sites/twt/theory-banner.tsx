import { ArrowRight } from "lucide-react";
import { SiteLink } from "./site-link";
import { ThemeCards } from "./theme-cards";
import { THEORY_PAGE } from "./theory-content";

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";

/** Points portfolio visitors to the quiz: the four theories on show, and a button to find theirs. */
export function TheoryBanner() {
  const { banner } = THEORY_PAGE;
  return (
    <section
      aria-labelledby="theory-banner-heading"
      className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
    >
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-6">
          <p className={kicker}>{banner.kicker}</p>
          <h2
            id="theory-banner-heading"
            className="mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink"
          >
            {banner.title}
          </h2>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="max-w-[28rem] text-[17px] leading-[1.45] text-ink-soft">{banner.body}</p>
          <SiteLink
            href={THEORY_PAGE.path}
            className="group mt-6 inline-flex h-[46px] items-center gap-2.5 bg-forest px-[30px] text-[15px] leading-none tracking-[0.02em] text-cream transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            {banner.button}
            <ArrowRight
              className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </SiteLink>
        </div>
      </div>
      <div className="mt-10 lg:mt-14">
        <ThemeCards />
      </div>
    </section>
  );
}
