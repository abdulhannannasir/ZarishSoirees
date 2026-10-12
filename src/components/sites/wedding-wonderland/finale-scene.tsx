import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { Cluster } from "./art";
import { FOREGROUND_BLOOMS, type Finale } from "./content";
import { Photo } from "./photo";

/**
 * The finale: the founder's portrait, a headline, and two ways to start the conversation.
 *
 * Phones: the portrait is a full-bleed background and the copy sits over its darkened lower half,
 * like every showpiece section. From 768px up the portrait moves into an arch frame beside the
 * copy. The wrapper that zooms/fades between scenes and owns `--p` lives in `wonderland.tsx`. The
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
  const { founder, whatsapp, consultation } = finale;
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
        {/* PORTRAIT: phones use the 3:5 crop full-bleed; larger screens frame the 4:5 one in an arch. */}
        <div className="absolute inset-0 md:relative md:inset-auto md:aspect-[4/5] md:h-[min(72vh,calc(34vw*1.25),36rem)] md:shrink-0">
          <div
            className="pointer-events-none absolute -inset-3 hidden rounded-t-full border border-[#d9a441]/30 md:block"
            aria-hidden="true"
          />
          <div className="absolute inset-0 overflow-hidden md:rounded-t-full md:border md:border-[#d9a441]/50 md:shadow-[0_30px_90px_-30px_rgba(217,164,65,0.4)]">
            <div className="wl-portrait-photo absolute inset-0">
              <Photo photo={founder.portrait} sizes="(min-width: 768px) 34vw, 100vw" />
            </div>
            {/* Phones only: darkens the lower half so the copy and buttons stay readable. */}
            <div className="wl-scrim-finale pointer-events-none absolute inset-0 md:hidden" />
          </div>
        </div>

        {/* COPY: bottom of the screen on phones (above the sound button), beside the arch on desktop. */}
        <div className="wl-copy absolute inset-x-0 bottom-0 pb-[84px] pl-[clamp(20px,5vw,72px)] pr-[clamp(44px,12vw,72px)] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)] md:static md:inset-auto md:min-w-0 md:max-w-[34rem] md:flex-1 md:p-0">
          <p
            className="font-label text-[12px] font-normal uppercase tracking-[0.24em] text-[#e9c97a]"
            style={step(0)}
          >
            {number}
            <span className="text-[#e9c97a]/55"> / {String(total).padStart(2, "0")}</span>
            <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-[#e9c97a]/60" />
            {finale.eyebrow}
          </p>

          <h2
            className="mt-2 font-display text-[clamp(2.05rem,8.6vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] md:text-[clamp(2.6rem,4.4vw,4.4rem)]"
            style={step(1)}
          >
            {finale.headline}
          </h2>

          <div className="mt-4" style={step(2)}>
            <p className="font-label text-[10px] uppercase tracking-[0.22em] text-white/55">
              {founder.label}
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-display text-[1.65rem] italic leading-none">{founder.name}</span>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-white/60">
                {founder.role}
              </span>
            </p>
          </div>

          <p
            className="mt-3 max-w-md font-label text-[0.88rem] font-light leading-[1.55] text-white/85 md:text-[1.02rem] md:leading-relaxed [@media(max-height:700px)_and_(max-width:767px)]:line-clamp-3"
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
              className="wl-gold inline-flex h-12 items-center sm:h-[3.1rem] justify-center gap-2.5 rounded-full px-7 font-label text-[0.95rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dfb6]"
            >
              <MessageCircle className="size-[1.15rem]" aria-hidden="true" />
              {whatsapp.label}
              <span className="sr-only"> {whatsapp.newTabNote}</span>
            </a>
            <button
              type="button"
              onClick={onConsult}
              className="inline-flex h-11 items-center justify-center rounded-full border sm:h-[3.1rem] border-white/30 bg-white/[0.06] px-7 font-label text-[0.95rem] text-white backdrop-blur-sm transition-colors [text-shadow:none] hover:border-[#d9a441]/80 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {consultation.buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
