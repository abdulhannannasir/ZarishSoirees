import { SERVICE_PAGES, SERVICE_SLUGS } from "./services-content";

/** The four services, set large and italic, with a small star between them. */
function Row() {
  return (
    <span className="flex shrink-0 items-center">
      {SERVICE_SLUGS.map((slug) => (
        <span key={slug} className="flex items-center">
          <span className="px-6 font-serif text-[clamp(2rem,4.6vw,4.25rem)] leading-none font-light whitespace-nowrap italic sm:px-10">
            {SERVICE_PAGES[slug].name}
          </span>
          <span className="text-[clamp(0.9rem,1.4vw,1.25rem)] text-gold">✦</span>
        </span>
      ))}
    </span>
  );
}

/**
 * A slow band of the four services that drifts across the page just above the footer. Decorative
 * (the footer lists the same services as links), so screen readers skip it. It pauses under the
 * mouse and stands still for visitors who prefer reduced motion.
 */
export function ServicesMarquee() {
  return (
    <div aria-hidden="true" className="marquee overflow-hidden border-t border-line bg-ivory py-9 text-ink/85 lg:py-12">
      <div className="marquee-track flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
