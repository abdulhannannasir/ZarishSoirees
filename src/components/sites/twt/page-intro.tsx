import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow: string;
  /** Two lines; the second one is set in italic, like the front page. */
  headline: readonly [string, string];
  intro: string;
  /** Optional picture or other aside, shown beside the text from `lg` up. */
  children?: ReactNode;
};

/**
 * The top of an inner page. The header floats over it on the page's ivory background, so the text
 * starts below the logo.
 */
export function PageIntro({ eyebrow, headline, intro, children }: PageIntroProps) {
  return (
    <section
      aria-labelledby="page-heading"
      className="mx-auto grid max-w-[1760px] gap-12 px-5 pt-32 pb-14 sm:px-8 sm:pt-36 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-[6.56vw] lg:pt-[11.5rem] lg:pb-20"
    >
      <div className={cn(children ? "lg:col-span-7" : "lg:col-span-12")}>
        <p className="text-[13px] leading-none font-medium tracking-[0.28em] text-ink-soft uppercase motion-safe:animate-rise">
          {eyebrow}
        </p>
        <h1
          id="page-heading"
          className="mt-3.5 text-[clamp(2.25rem,4.3vw,4.5rem)] leading-[1.04] font-normal text-ink motion-safe:animate-rise motion-safe:[animation-delay:120ms]"
        >
          <span className="block">{headline[0]}</span>
          <span className="block text-[1.035em] tracking-[0.015em] italic">{headline[1]}</span>
        </h1>
        <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.4] text-ink motion-safe:animate-rise motion-safe:[animation-delay:240ms]">
          {intro}
        </p>
      </div>
      {children}
    </section>
  );
}
