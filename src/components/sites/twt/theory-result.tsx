import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./page-intro";
import { SiteLink } from "./site-link";
import { ThemeCards } from "./theme-cards";
import { TheoryActions } from "./theory-actions";
import { THEMES, THEORY_PAGE, type ThemeId } from "./theory-content";

const { result } = THEORY_PAGE;

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const sectionTitle = "mt-4 text-[clamp(1.75rem,2.8vw,2.75rem)] leading-[1.1] font-normal text-ink";

/** One quiz result: its name, look, palette, parts and close-ups, then the ways to act on it. */
export function TheoryResult({ themeId, shareUrl }: { themeId: ThemeId; shareUrl: string }) {
  const theme = THEMES[themeId];
  return (
    <>
      <PageIntro eyebrow={result.eyebrow} headline={theme.title} intro={theme.theory}>
        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[28rem] overflow-hidden rounded-t-[999px] bg-cream lg:max-w-none">
            <Image
              src={theme.photo.src}
              alt={theme.photo.alt}
              fill
              preload
              sizes="(min-width: 1024px) 38vw, 90vw"
              style={{ objectPosition: theme.photo.focus }}
              className="object-cover"
            />
          </div>
          <p className="mx-auto mt-5 max-w-[28rem] text-center text-[22px] leading-[1.2] text-ink italic lg:max-w-none">
            {theme.tagline}
          </p>
        </div>
      </PageIntro>

      <section
        aria-labelledby="theory-look-heading"
        className="mx-auto grid max-w-[1760px] gap-14 border-t border-line px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-[6.56vw] lg:py-24"
      >
        <div className="lg:col-span-5">
          <h2 id="theory-look-heading" className={kicker}>
            {result.paletteKicker}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7">
            {theme.palette.map((swatch) => (
              <li key={swatch.hex} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="size-14 shrink-0 rounded-full border border-ink/15"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[16px] leading-[1.25] text-ink">{swatch.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className={kicker}>{result.elementsKicker}</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {theme.elements.map((element) => (
              <div key={element.label} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="text-[22px] leading-[1.15] text-ink italic">{element.label}</dt>
                <dd className="text-[16.5px] leading-[1.4] text-ink-soft">{element.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="theory-details-heading"
        className="mx-auto max-w-[1760px] border-t border-line px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
      >
        <p className={kicker}>{result.detailsKicker}</p>
        <h2 id="theory-details-heading" className={sectionTitle}>
          {theme.name}, up close
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {theme.details.map((photo) => (
            <li key={photo.src} className="relative aspect-[4/5] overflow-hidden bg-cream">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 30vw, 90vw"
                style={{ objectPosition: photo.focus }}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </section>

      <TheoryActions themeId={themeId} shareUrl={shareUrl} />

      <section
        aria-labelledby="theory-others-heading"
        className="mx-auto max-w-[1760px] px-5 py-16 sm:px-8 lg:px-[6.56vw] lg:py-24"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <p className={kicker}>{result.othersKicker}</p>
            <h2 id="theory-others-heading" className={sectionTitle}>
              Not quite you?
            </h2>
          </div>
          <SiteLink
            href={THEORY_PAGE.path}
            className="group tap-target inline-flex items-center gap-2.5 border-b border-ink-soft/70 pb-[3px] text-[15px] leading-none text-ink transition-colors duration-300 outline-none hover:border-ink focus-visible:border-ink"
          >
            {result.actions.retake}
            <ArrowRight
              className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </SiteLink>
        </div>
        <div className="mt-10">
          <ThemeCards exclude={themeId} />
        </div>
      </section>
    </>
  );
}
