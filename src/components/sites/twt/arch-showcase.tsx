"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ShowcaseSlide = { src: string; alt: string; label: string; focus?: string };

const INTERVAL_MS = 5200;

/** A slowly turning seal of the brand's name around a small monogram. Decorative only. */
function Seal({ text }: { text: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -top-4 -left-4 z-10 grid size-24 place-items-center rounded-full bg-ivory/90 shadow-[0_10px_30px_-12px_rgb(53_52_42/0.45)] backdrop-blur-sm sm:size-28 lg:-top-6 lg:-left-10 lg:size-32"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full motion-safe:animate-[spin_28s_linear_infinite]">
        <defs>
          <path id="seal-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-ink-soft font-ui text-[7.4px] tracking-[0.32em] uppercase">
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <span className="font-serif text-[1.35rem] leading-none text-ink italic sm:text-[1.6rem]">TWT</span>
    </div>
  );
}

/**
 * The picture beside an inner page's title: the brand's arch, with photographs that cross-fade and
 * drift slowly, a caption that follows them, a turning seal and a fine offset outline. It stops
 * while it is off screen or the tab is hidden, and holds the first photograph for visitors who
 * prefer reduced motion.
 */
export function ArchShowcase({
  slides,
  seal = "The Wed Theory · Events · Lahore · ",
  className,
}: {
  slides: readonly ShowcaseSlide[];
  seal?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    const timer = window.setInterval(() => {
      if (onScreen && !document.hidden) setIndex((value) => (value + 1) % slides.length);
    }, INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [slides.length]);

  const current = slides[index];

  return (
    <div
      ref={root}
      className={cn(
        "relative mx-auto w-full max-w-[21rem] motion-safe:animate-settle sm:max-w-[25rem] lg:col-span-5 lg:max-w-[30rem] lg:justify-self-end",
        className,
      )}
    >
      {/* A fine outline of the same arch, offset behind the picture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] border border-ink/25 lg:translate-x-5 lg:translate-y-5"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-cream">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i !== index}
            data-active={i === index ? "" : undefined}
            className="arch-slide absolute inset-0 opacity-0 transition-opacity duration-[1600ms] ease-out data-[active]:opacity-100"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 1024px) 34vw, 90vw"
              loading={i === 0 ? "eager" : undefined}
              className="object-cover"
              style={{ objectPosition: slide.focus ?? "50% 50%" }}
            />
          </div>
        ))}
        {/* A soft vignette at the foot of the arch, where the caption sits. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(23_17_10/0.55)] to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 pb-5 text-cream sm:px-7 sm:pb-6">
          <p key={current.label} className="font-serif text-[1.35rem] leading-tight italic motion-safe:animate-rise">
            {current.label}
          </p>
          {slides.length > 1 && (
            <p aria-hidden="true" className="font-ui text-[11px] tracking-[0.2em] text-cream/80">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
      <Seal text={seal} />
    </div>
  );
}
