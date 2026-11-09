import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { InteractiveCardStack } from "@/components/ui/interactive-card-stack";
import { ABOUT, PORTFOLIO } from "./content";

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";

/**
 * A pile of the portfolio's photographs on the About page. Drag a card aside (sideways on a phone,
 * so the page still scrolls), tap it, or use the arrows or keys, to bring the next one forward.
 */
export function AboutMoments() {
  const { moments } = ABOUT;
  const cards = PORTFOLIO.items.map((item) => (
    <figure key={item.id} className="relative size-full">
      <Image
        src={item.photo.src}
        alt={item.photo.alt}
        fill
        draggable={false}
        sizes="(min-width: 640px) 336px, 74vw"
        style={{ objectPosition: item.photo.focus }}
        className="object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#1d150c]/88 via-[#1d150c]/45 to-transparent px-5 pt-16 pb-5 text-[#fff6e8]">
        <span className="block text-[10px] leading-none font-medium tracking-[0.22em] uppercase opacity-85">
          {item.kicker}
        </span>
        <span className="mt-2 block text-[24px] leading-[1.1] italic">{item.title}</span>
      </figcaption>
    </figure>
  ));

  return (
    <section aria-labelledby="moments-heading" className="overflow-x-clip border-t border-line">
      <div className="mx-auto grid max-w-[1760px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-[6.56vw] lg:py-24">
        <Reveal className="lg:col-span-5">
          <p className={kicker}>{moments.kicker}</p>
          <h2
            id="moments-heading"
            className="mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink"
          >
            {moments.title}
          </h2>
          <p className="mt-5 max-w-[26rem] text-[17px] leading-[1.45] text-ink-soft">
            {moments.body}
          </p>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
          <div className="mx-auto h-[calc(min(74vw,21rem)*1.25+4rem)] w-[min(74vw,21rem)]">
            <InteractiveCardStack
              cards={cards}
              label={moments.stackLabel}
              randomRotation
              sendToBackOnClick
              cardClassName="rounded-none border-cream/80 bg-cream shadow-[0_22px_48px_rgb(53_52_42/0.28)]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
