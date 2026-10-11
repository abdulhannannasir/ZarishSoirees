import type { CSSProperties } from "react";
import { Cluster } from "./art";
import { FOREGROUND_BLOOMS, type Section } from "./content";
import { Photo } from "./photo";

/**
 * One full-screen showpiece: photo, legibility gradient, floating blooms, and the copy block.
 * The wrapper that fades/zooms between sections and owns the scroll variable `--p` lives in
 * `wonderland.tsx`; the parallax that reads `--p` lives in `wonderland.css`.
 */
export function ShowpieceScene({
  section,
  index,
  total,
  priority,
}: {
  section: Section;
  index: number;
  total: number;
  /** True for the first section only: it is the one visitors see first, so load it eagerly. */
  priority: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");
  const step = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <>
      {/* PHOTO: landscape 16:9 (min 2880x1620), optional portrait 3:5 for phones. See content.ts. */}
      <div className="wl-photo absolute inset-0">
        <Photo photo={section.photo} priority={priority} />
      </div>

      {/* Darkens the bottom and top edges so white type stays readable on any photo. */}
      <div className="wl-scrim pointer-events-none absolute inset-0" />

      {FOREGROUND_BLOOMS && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Sits below the header row so it never hides the Home button. */}
          <div className="wl-fg absolute -left-[5%] top-[14%] aspect-square w-[clamp(90px,12vw,170px)]">
            <Cluster seed={section.bloomSeed} blooms={2} />
          </div>
          <div className="wl-fg wl-fg-deep absolute -bottom-[6%] -right-[4%] aspect-square w-[clamp(130px,19vw,260px)]">
            <Cluster seed={section.bloomSeed + 1} blooms={3} />
          </div>
        </div>
      )}

      {/* Copy: bottom-left. Each line rises in turn when the section becomes active. */}
      <div className="wl-copy absolute bottom-[clamp(96px,17vh,180px)] left-[clamp(20px,5vw,72px)] right-[clamp(20px,5vw,72px)] max-w-2xl [text-shadow:0_2px_28px_rgba(0,0,0,0.5)]">
        <p
          className="font-label text-[12px] font-normal uppercase tracking-[0.22em] text-white/85"
          style={step(0)}
        >
          {number}
          <span className="text-white/50"> / {String(total).padStart(2, "0")}</span>
          <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-white/60" />
          {section.kicker}
        </p>
        <h2
          className="mt-4 font-display text-[clamp(2.4rem,6.2vw,5.25rem)] font-medium leading-[0.96] tracking-[-0.02em]"
          style={step(1)}
        >
          {section.title}
        </h2>
        <p
          className="mt-5 max-w-md font-label text-[clamp(0.95rem,1.4vw,1.15rem)] font-light leading-relaxed text-white/90"
          style={step(2)}
        >
          {section.body}
        </p>
      </div>
    </>
  );
}
