import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { SIGNATURE, type WorkPicture } from "./content";

/** The wide tile spans 7 of 12 columns, the narrow one 5; the second row swaps them. */
const SPANS = [
  ["lg:col-span-7", "lg:col-span-5"],
  ["lg:col-span-5", "lg:col-span-7"],
] as const;
const SIZES = {
  "lg:col-span-7": "(min-width: 1024px) 58vw, 100vw",
  "lg:col-span-5": "(min-width: 1024px) 42vw, 100vw",
};

function Tile({
  picture,
  span,
  eager,
}: {
  picture: WorkPicture;
  span: keyof typeof SIZES;
  eager: boolean;
}) {
  return (
    <figure className={cn("group", span)}>
      <div
        className="relative aspect-(--ratio) overflow-hidden bg-cream lg:aspect-auto lg:h-[clamp(20rem,30vw,32rem)]"
        // Phones and tablets show the whole picture at its own shape; large screens share a row height.
        style={
          {
            "--ratio": `${picture.width} / ${picture.height}`,
          } as React.CSSProperties
        }
      >
        {/* The photo drifts against the scroll (data-parallax, see scroll-motion.tsx). */}
        <div data-parallax="0.07" className="absolute inset-0">
          <Image
            src={picture.src}
            alt={picture.alt}
            fill
            sizes={SIZES[span]}
            loading={eager ? "eager" : undefined}
            className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.04]"
          />
        </div>
      </div>
      <figcaption className="mt-4">
        <p className="font-ui text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
          {picture.kicker}
        </p>
        <p className="mt-2.5 text-[clamp(1.35rem,1.8vw,1.7rem)] leading-[1.1] font-normal text-ink">
          {picture.title}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * The portfolio's opening section: photographs of events the studio created (words and pictures:
 * `SIGNATURE` and `WORK` in content.ts). The concept collections and the full gallery follow it.
 */
export function SignatureWork({ withLink = false }: { withLink?: boolean }) {
  return (
    <section
      aria-labelledby="signature-heading"
      className="mx-auto max-w-[1760px] px-5 pb-20 sm:px-8 lg:px-[6.56vw] lg:pb-28"
    >
      <div className="mb-10 lg:mb-14">
        <p className="font-ui text-[11px] leading-none font-medium tracking-[0.3em] text-ink-soft uppercase">
          {SIGNATURE.eyebrow}
        </p>
        <h2
          id="signature-heading"
          className="mt-5 font-serif text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.04] font-normal text-ink"
        >
          <span className="block">{SIGNATURE.headline[0]}</span>
          <span className="block italic">{SIGNATURE.headline[1]}</span>
        </h2>
        <p className="mt-5 max-w-[34rem] font-ui text-[16px] leading-[1.65] font-light text-ink-soft">
          {SIGNATURE.intro}
        </p>
      </div>

      <div className="flex flex-col gap-y-12 lg:gap-y-16">
        {SIGNATURE.rows.map((row, rowIndex) => {
          const tiles = (
            <div className="grid grid-cols-1 gap-x-7 gap-y-12 lg:grid-cols-12">
              {row.map((picture, index) => (
                <Tile
                  key={picture.id}
                  picture={picture}
                  span={SPANS[rowIndex][index]}
                  eager={rowIndex === 0 && index === 0}
                />
              ))}
            </div>
          );
          // The first row can be on screen at load, so only the second one waits to rise in.
          return rowIndex === 0 ? (
            <div key={rowIndex}>{tiles}</div>
          ) : (
            <Reveal key={rowIndex}>{tiles}</Reveal>
          );
        })}
      </div>

      {withLink && (
        <Link
          href={SIGNATURE.more.href}
          data-magnetic
          className="group tap-target mt-12 inline-flex items-center gap-3 rounded-full border border-ink/30 px-7 py-3.5 font-ui text-[13px] tracking-[0.12em] text-ink uppercase transition-colors duration-300 outline-none hover:border-forest hover:bg-forest hover:text-cream focus-visible:ring-2 focus-visible:ring-forest/50 lg:mt-16"
        >
          {SIGNATURE.more.label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </Link>
      )}
    </section>
  );
}
