import Image from "next/image";
import { cn } from "@/lib/utils";
import { PORTFOLIO, type PortfolioItem } from "./content";

const COLUMNS: Record<PortfolioItem["layout"], { span: string; sizes: string }> = {
  feature: { span: "lg:col-span-7", sizes: "(min-width: 1024px) 58vw, 100vw" },
  side: { span: "lg:col-span-5", sizes: "(min-width: 1024px) 42vw, 100vw" },
  third: { span: "lg:col-span-4", sizes: "(min-width: 1024px) 33vw, 100vw" },
};

/**
 * Five tiles in two rows on large screens (7 + 5, then 4 + 4 + 4), one column below that. Every tile
 * in a row shares one height, so the photos are cover-cropped to fit; `focus` in content.ts moves
 * the crop.
 */
export function PortfolioGrid() {
  return (
    <section
      aria-label={PORTFOLIO.eyebrow}
      className="mx-auto max-w-[1760px] px-5 pb-20 sm:px-8 lg:px-[6.56vw] lg:pb-28"
    >
      <ul className="grid grid-cols-1 gap-x-7 gap-y-14 lg:grid-cols-12 lg:gap-y-16">
        {PORTFOLIO.items.map((item, index) => {
          const { span, sizes } = COLUMNS[item.layout];
          return (
            <li key={item.id} className={cn("group", span)}>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden bg-cream sm:aspect-[4/3] lg:aspect-auto lg:h-[clamp(22rem,33vw,36rem)]">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes={sizes}
                    // The first tile is in view on a laptop screen, so it is the page's LCP image.
                    loading={index === 0 ? "eager" : undefined}
                    style={{ objectPosition: item.photo.focus }}
                    className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-5 grid grid-cols-[auto_1fr] gap-x-5">
                  <span
                    aria-hidden="true"
                    className="pt-[9px] text-[12px] leading-none tracking-[0.2em] text-ink-soft"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
                      {item.kicker}
                    </p>
                    <h2 className="mt-2.5 text-[clamp(1.5rem,2vw,1.875rem)] leading-[1.1] font-normal text-ink">
                      {item.title}
                    </h2>
                    <p className="mt-3 max-w-[30rem] text-[15.5px] leading-[1.45] text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
