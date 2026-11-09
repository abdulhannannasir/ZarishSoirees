import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { ABOUT, SERVICES } from "./content";
import { ServiceGlyph } from "./icons";

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const sectionTitle = "mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink";

/** The photo beside the about intro, cropped into an arch. */
export function AboutPhoto() {
  return (
    <div className="lg:col-span-5">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-t-[999px] bg-cream lg:max-w-none">
        <Image
          src={ABOUT.photo.src}
          alt={ABOUT.photo.alt}
          fill
          preload
          sizes="(min-width: 1024px) 38vw, 90vw"
          style={{ objectPosition: ABOUT.photo.focus }}
          className="object-cover"
        />
      </div>
    </div>
  );
}

/** Our approach: a short statement of belief, in two paragraphs. */
export function AboutApproach() {
  return (
    <section
      aria-labelledby="approach-heading"
      className="mx-auto grid max-w-[1760px] gap-6 border-t border-line px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-[6.56vw] lg:py-24"
    >
      <h2 id="approach-heading" className={`${kicker} lg:col-span-4`}>
        {ABOUT.approach.kicker}
      </h2>
      <div className="flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
        {ABOUT.approach.paragraphs.map((paragraph, index) => (
          <p
            key={paragraph}
            className={
              index === 0
                ? "text-[clamp(1.375rem,2vw,1.875rem)] leading-[1.35] font-normal text-ink"
                : "max-w-[34rem] text-[17px] leading-[1.5] text-ink-soft"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

type ProcessContent = {
  kicker: string;
  title: string;
  steps: readonly { title: string; body: string }[];
};

/**
 * How we work: four numbered steps split by hairlines, like the services strip on the front page.
 * The service pages pass their own steps; the steps rise in one after another as they scroll into view.
 */
export function AboutProcess({ process = ABOUT.process }: { process?: ProcessContent }) {
  return (
    <section aria-labelledby="process-heading" className="border-t border-line">
      <div className="mx-auto max-w-[1760px] px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24">
        <p className={kicker}>{process.kicker}</p>
        <h2 id="process-heading" className={sectionTitle}>
          {process.title}
        </h2>
        <ol className="mt-12 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.title}
              delay={index * 110}
              className="border-t border-line py-7 sm:px-6 sm:first:pl-0 lg:border-t-0 lg:border-l lg:py-1 lg:first:border-l-0"
            >
              <span className="text-[12px] leading-none tracking-[0.2em] text-ink-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-[24px] leading-none font-normal text-ink italic">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[18rem] text-[15.5px] leading-[1.45] text-ink-soft">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** What we plan: the three services from the front page, with their icons. */
export function AboutServices() {
  const { services } = ABOUT;
  return (
    <section
      aria-labelledby="services-about-heading"
      className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
    >
      <p className={kicker}>{services.kicker}</p>
      <h2 id="services-about-heading" className={sectionTitle}>
        {services.title}
      </h2>
      <ul className="mt-12 grid gap-0 sm:grid-cols-3">
        {SERVICES.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col items-center border-t border-line px-3 py-8 text-center first:border-t-0 sm:border-t-0 sm:border-l sm:py-2 sm:first:border-l-0"
          >
            <ServiceGlyph name={item.icon} className="size-8 text-ink" />
            <h3 className="mt-4 text-[20px] leading-none font-medium text-ink">{item.title}</h3>
            <p className="mt-3 text-[15px] leading-[1.45] text-ink-soft">
              {item.blurb.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
