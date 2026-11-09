import type { Metadata } from "next";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { ThemeCards } from "@/components/sites/twt/theme-cards";
import { TheoryQuiz } from "@/components/sites/twt/theory-quiz";
import { THEORY, THEORY_PAGE } from "@/components/sites/twt/theory-content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: THEORY_PAGE.title,
  description: THEORY_PAGE.description,
  path: THEORY_PAGE.path,
  image: { url: THEORY_PAGE.card.src, alt: THEORY_PAGE.card.alt },
});

export default function TheoryPage() {
  return (
    <>
      <PageIntro eyebrow={THEORY.eyebrow} headline={THEORY.headline} intro={THEORY.intro} />
      <TheoryQuiz />
      <section
        aria-labelledby="theories-heading"
        className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
      >
        <h2
          id="theories-heading"
          className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase"
        >
          {THEORY_PAGE.banner.themesLabel}
        </h2>
        <div className="mt-8">
          <ThemeCards />
        </div>
      </section>
    </>
  );
}
