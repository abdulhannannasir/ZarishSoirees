import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import {
  SERVICE_PAGES,
  SERVICE_SLUGS,
  SERVICES_PAGE,
  serviceHref,
  type Photo,
  type ServicePageContent,
  type ServiceSlug,
} from "./services-content";

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const sectionTitle = "mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink";

/** The photo beside a service's introduction, cropped into an arch; it eases into its frame on load. */
export function ServiceHeroPhoto({ photo }: { photo: Photo }) {
  return (
    <div className="lg:col-span-5">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-t-[999px] bg-cream lg:max-w-none">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          preload
          sizes="(min-width: 1024px) 38vw, 90vw"
          style={{ objectPosition: photo.focus }}
          className="object-cover motion-safe:animate-settle"
        />
      </div>
    </div>
  );
}

/** What we plan: a heading beside a two-column list, each item rising in after the one before. */
export function ServiceOffer({ page }: { page: ServicePageContent }) {
  const { offer } = page;
  return (
    <section
      aria-labelledby="offer-heading"
      className="mx-auto grid max-w-[1760px] gap-10 border-t border-line px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-[6.56vw] lg:py-24"
    >
      <Reveal className="lg:col-span-4">
        <p className={kicker}>{offer.kicker}</p>
        <h2 id="offer-heading" className={sectionTitle}>
          {offer.title}
        </h2>
      </Reveal>
      <ul className="grid gap-x-12 border-b border-line sm:grid-cols-2 lg:col-span-8">
        {offer.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={(index % 2) * 110 + Math.floor(index / 2) * 60}
            className="border-t border-line py-6"
          >
            <h3 className="text-[22px] leading-[1.15] font-normal text-ink italic">{item.title}</h3>
            <p className="mt-2.5 max-w-[26rem] text-[16px] leading-[1.45] text-ink-soft">
              {item.body}
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/** Three large photographs, each beside a few words, alternating sides; photos zoom gently on hover. */
export function ServiceFeatures({ page }: { page: ServicePageContent }) {
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto flex max-w-[1760px] flex-col gap-16 border-t border-line px-5 py-16 sm:px-8 lg:gap-28 lg:px-[6.56vw] lg:py-24"
    >
      <h2 id="features-heading" className="sr-only">
        {page.name}: highlights
      </h2>
      {page.features.map((feature, index) => {
        const flipped = index % 2 === 1;
        return (
          <article
            key={feature.title}
            className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16"
          >
            <Reveal className={cn("group lg:col-span-7", flipped && "lg:order-2")}>
              <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                <Image
                  src={feature.photo.src}
                  alt={feature.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  style={{ objectPosition: feature.photo.focus }}
                  className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.04]"
                />
              </div>
            </Reveal>
            <Reveal
              delay={160}
              className={cn(
                "lg:col-span-4",
                flipped ? "lg:order-1 lg:col-start-2" : "lg:col-start-9",
              )}
            >
              <span className="text-[12px] leading-none tracking-[0.2em] text-ink-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className={cn(kicker, "mt-5")}>{feature.kicker}</p>
              <h3 className="mt-3 text-[clamp(1.5rem,2.2vw,2.125rem)] leading-[1.12] font-normal text-ink">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-[28rem] text-[16.5px] leading-[1.5] text-ink-soft">
                {feature.body}
              </p>
            </Reveal>
          </article>
        );
      })}
    </section>
  );
}

/**
 * The services as photo cards that link to their pages: all four on the services page, or the other
 * three at the foot of a service page.
 */
export function ServiceCards({ exclude }: { exclude?: ServiceSlug }) {
  const slugs = SERVICE_SLUGS.filter((slug) => slug !== exclude);
  const compact = Boolean(exclude);
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-12",
        compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {slugs.map((slug, index) => {
        const page = SERVICE_PAGES[slug];
        return (
          // The first card is on screen when the page opens, so it rises in with CSS, not with the scroll-reveal.
          <Reveal as="li" key={slug} delay={index * 120} immediate={!compact && index === 0}>
            <Link
              href={serviceHref(slug)}
              className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <span
                className={cn(
                  "relative block overflow-hidden bg-cream",
                  compact ? "aspect-[4/3]" : "aspect-[4/5]",
                )}
              >
                <Image
                  src={page.hero.src}
                  alt={page.hero.alt}
                  fill
                  // On the services page the first card is what a phone shows first: load it first.
                  preload={!compact && index === 0}
                  sizes={
                    compact
                      ? "(min-width: 640px) 30vw, 100vw"
                      : "(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                  }
                  style={{ objectPosition: page.hero.focus }}
                  className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.05]"
                />
              </span>
              <span className="mt-5 block text-[clamp(1.5rem,2vw,1.875rem)] leading-[1.1] text-ink italic">
                {page.name}
              </span>
              <span className="mt-2 block max-w-[22rem] text-[15.5px] leading-[1.4] text-ink-soft">
                {page.summary}
              </span>
              <span className="mt-auto inline-flex items-center gap-2 self-start pt-4 text-[10px] leading-none font-medium tracking-[0.2em] text-ink-soft uppercase">
                <span className="border-b border-ink-soft/70 pb-[3px] transition-colors duration-300 group-hover:border-ink group-hover:text-ink">
                  {SERVICES_PAGE.cardLink}
                </span>
                <ArrowRight
                  className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** "More ways we can help": the other three services, and a link to all of them. */
export function ServiceOthers({ slug }: { slug: ServiceSlug }) {
  const { others } = SERVICES_PAGE;
  return (
    <section
      aria-labelledby="others-heading"
      className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <p className={kicker}>{others.kicker}</p>
          <h2 id="others-heading" className={sectionTitle}>
            {others.title}
          </h2>
        </div>
        <Link
          href={SERVICES_PAGE.path}
          className="group tap-target inline-flex items-center gap-2.5 border-b border-ink-soft/70 pb-[3px] text-[15px] leading-none text-ink transition-colors duration-300 outline-none hover:border-ink focus-visible:border-ink"
        >
          {others.all}
          <ArrowRight
            className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </Link>
      </div>
      <div className="mt-10">
        <ServiceCards exclude={slug} />
      </div>
    </section>
  );
}
