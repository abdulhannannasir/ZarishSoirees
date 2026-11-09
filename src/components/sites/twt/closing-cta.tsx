import { ArrowRight } from "lucide-react";
import { CLOSING, type ClosingContent } from "./content";
import { SiteLink } from "./site-link";

/**
 * The deep-green call to action that ends the portfolio, about and service pages. The words come
 * from CLOSING unless a page passes its own.
 */
export function ClosingCta({ content = CLOSING }: { content?: ClosingContent }) {
  return (
    <section aria-labelledby="closing-heading" className="bg-forest text-cream">
      <div className="mx-auto flex max-w-[1760px] flex-col items-center px-5 py-20 text-center sm:px-8 lg:px-[6.56vw] lg:py-28">
        <p className="text-[13px] leading-none font-medium tracking-[0.28em] text-cream/70 uppercase">
          {content.eyebrow}
        </p>
        <h2
          id="closing-heading"
          className="mt-4 text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.08] font-normal italic"
        >
          {content.headline}
        </h2>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.4] text-cream/85">{content.body}</p>
        <SiteLink
          href={content.button.href}
          className="group mt-9 inline-flex h-11 items-center gap-2.5 bg-cream px-[30px] text-[15px] leading-none tracking-[0.02em] text-ink transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
        >
          {content.button.label}
          <ArrowRight
            className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </SiteLink>
        <div className="flex flex-col items-center sm:flex-row sm:gap-x-8">
          {content.secondary.map((link) => (
            // A full 44px box so neighbouring links are easy to tell apart with a thumb; the
            // underline is on the text inside.
            <SiteLink
              key={link.href}
              href={link.href}
              className="group inline-flex min-h-11 items-center text-[15px] leading-none text-cream/85 transition-colors duration-300 outline-none hover:text-cream focus-visible:text-cream"
            >
              <span className="border-b border-cream/50 pb-[3px] transition-colors duration-300 group-hover:border-cream group-focus-visible:border-cream">
                {link.label}
              </span>
            </SiteLink>
          ))}
        </div>
      </div>
    </section>
  );
}
