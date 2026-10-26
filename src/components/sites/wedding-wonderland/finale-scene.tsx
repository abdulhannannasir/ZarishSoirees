import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { Cluster } from "./art";
import { FOREGROUND_BLOOMS, type Finale } from "./content";
import { Photo } from "./photo";

/** lucide-react has no brand icons, so the Instagram glyph is drawn here. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * The finale: a photo (the brand's logo photo, or the founder's portrait), a headline, and two ways
 * to start the conversation.
 *
 * Phones: the photo is a full-bleed background and the copy sits over its darkened lower half,
 * like every showpiece section. From 768px up the photo moves into an arch frame beside the copy. The wrapper that zooms/fades between scenes and owns `--p` lives in `wonderland.tsx`. The
 * consultation form is `consultation-modal.tsx`; it is rendered outside the scenes because their
 * transforms would break its fixed positioning.
 */
export function FinaleScene({
  finale,
  index,
  total,
  onConsult,
}: {
  finale: Finale;
  index: number;
  total: number;
  /** Opens the consultation form. */
  onConsult: () => void;
}) {
  const { founder, whatsapp, instagram, consultation } = finale;
  const number = String(index + 1).padStart(2, "0");
  const step = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <>
      {/* A dark stage with warm light, so the finale echoes the hero. */}
      <div className="wl-finale-stage absolute inset-0" />

      {FOREGROUND_BLOOMS && (
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          <div className="wl-fg absolute -left-[3%] top-[12%] aspect-square w-[clamp(110px,13vw,200px)]">
            <Cluster seed={finale.bloomSeed} blooms={2} />
          </div>
          <div className="wl-fg wl-fg-deep absolute -bottom-[7%] -right-[4%] aspect-square w-[clamp(150px,20vw,290px)]">
            <Cluster seed={finale.bloomSeed + 1} blooms={3} />
          </div>
        </div>
      )}

      <div className="absolute inset-0 md:flex md:items-center md:justify-center md:gap-[clamp(40px,6vw,110px)] md:px-[clamp(48px,9vw,170px)]">
        {/*
          PORTRAIT: on phones it covers the top 86% of the screen (not all of it), so a logo near the top
          of the photo stays clear of the copy below; its dark lower edge melts into the stage. Larger
          screens frame it in a 4:5 arch.
        */}
        <div className="absolute inset-x-0 top-0 h-[86%] md:relative md:inset-auto md:aspect-[4/5] md:h-[min(72vh,calc(34vw*1.25),36rem)] md:shrink-0">
          <div
            className="pointer-events-none absolute -inset-3 hidden rounded-t-full border border-[var(--wl-champagne)]/30 md:block"
            aria-hidden="true"
          />
          <div className="absolute inset-0 overflow-hidden max-md:[mask-image:linear-gradient(to_bottom,#000_74%,transparent_100%)] md:rounded-t-full md:border md:border-[var(--wl-champagne)]/50 md:shadow-[0_30px_90px_-30px_rgba(207,174,114,0.4)]">
            <div className="wl-portrait-photo absolute inset-0">
              <Photo photo={founder.portrait} sizes="(min-width: 768px) 34vw, 100vw" />
            </div>
            {/* Phones only: darkens the lower half so the copy and buttons stay readable. */}
            <div className="wl-scrim-finale pointer-events-none absolute inset-0 md:hidden" />
          </div>
        </div>

        {/* COPY: bottom of the screen on phones (above the sound button), beside the arch on desktop. */}
        <div className="wl-copy absolute inset-x-0 bottom-0 pb-[84px] pl-[clamp(20px,5vw,72px)] pr-[clamp(44px,12vw,72px)] [text-shadow:0_2px_24px_rgba(23,17,10,0.6)] md:static md:inset-auto md:min-w-0 md:max-w-[34rem] md:flex-1 md:p-0">
          <p
            className="font-label text-[12px] font-normal uppercase tracking-[0.24em] text-[var(--wl-champagne-light)]"
            style={step(0)}
          >
            {number}
            <span className="text-[var(--wl-champagne-light)]/55"> / {String(total).padStart(2, "0")}</span>
            <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-[var(--wl-champagne-light)]/60" />
            {finale.eyebrow}
          </p>

          <h2
            className="mt-2 font-display text-[clamp(2.05rem,8.6vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] md:text-[clamp(2.6rem,4.4vw,4.4rem)]"
            style={step(1)}
          >
            {finale.headline}
          </h2>

          <div className="mt-4" style={step(2)}>
            <p className="font-label text-[10px] uppercase tracking-[0.22em] text-[var(--wl-ivory)]/55">
              {founder.label}
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-script text-[2.7rem] leading-none text-[var(--wl-champagne-light)]">{founder.name}</span>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[var(--wl-ivory)]/60">
                {founder.role}
              </span>
            </p>
          </div>

          <p
            className="mt-3 max-w-md font-label text-[0.88rem] font-light leading-[1.55] text-[var(--wl-ivory)]/85 md:text-[1.02rem] md:leading-relaxed [@media(min-height:701px)_and_(max-height:790px)_and_(max-width:767px)]:line-clamp-2 [@media(max-height:700px)_and_(max-width:767px)]:hidden"
            style={step(3)}
          >
            {founder.bio}
          </p>

          <div
            className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
            style={step(4)}
          >
            <a
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="wl-gold inline-flex h-12 items-center sm:h-[3.1rem] justify-center gap-2.5 rounded-full px-7 font-label text-[0.95rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wl-champagne-light)]"
            >
              <MessageCircle className="size-[1.15rem]" aria-hidden="true" />
              {whatsapp.label}
              <span className="sr-only"> {whatsapp.newTabNote}</span>
            </a>
            <button
              type="button"
              onClick={onConsult}
              className="inline-flex h-11 items-center justify-center rounded-full border sm:h-[3.1rem] border-[var(--wl-ivory)]/30 bg-[var(--wl-ivory)]/[0.06] px-7 font-label text-[0.95rem] text-[var(--wl-ivory)] backdrop-blur-sm transition-colors [text-shadow:none] hover:border-[var(--wl-champagne)]/80 hover:bg-[var(--wl-ivory)]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wl-ivory)]"
            >
              {consultation.buttonLabel}
            </button>
          </div>

          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            style={step(5)}
            className="mt-4 inline-flex items-center gap-2 font-label text-[0.9rem] font-light tracking-[0.04em] text-[var(--wl-ivory)]/75 transition-colors hover:text-[var(--wl-champagne-light)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wl-ivory)]"
          >
            <InstagramIcon className="size-[1.05rem]" />
            <span className="sr-only">{instagram.label} </span>
            {instagram.handle}
            <span className="sr-only"> {instagram.newTabNote}</span>
          </a>
        </div>
      </div>
    </>
  );
}
