"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PROVENANCE_LABEL, type GalleryItem } from "./portfolio-gallery-data";

interface PortfolioLightboxProps {
  items: readonly GalleryItem[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

/** How far, in pixels, a swipe must travel to turn the page. */
const SWIPE = 48;

/**
 * A picture shown full screen, in the browser's own modal `<dialog>`: it traps focus, closes on
 * Escape and hands focus back to the picture that opened it. Previous and next buttons, the arrow
 * keys and a swipe all move between pictures; every control is at least 44px.
 *
 * It is only mounted while open (see PortfolioGallery), so closed it costs nothing.
 */
export function PortfolioLightbox({ items, index, onClose, onChange }: PortfolioLightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const item = items[index];
  const label = PROVENANCE_LABEL[item.provenance];
  const step = (direction: 1 | -1) => onChange((index + direction + items.length) % items.length);

  useEffect(() => {
    const element = dialog.current;
    // The picture's button gets focus back when the lightbox goes.
    const opener = document.activeElement as HTMLElement | null;
    if (element && !element.open) element.showModal();
    return () => opener?.focus?.();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
  };
  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.isPrimary ? event.clientX : null;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) > SWIPE) step(distance < 0 ? 1 : -1);
  };

  const button =
    "inline-flex size-11 items-center justify-center rounded-full border border-champagne-light/35 text-champagne-light transition-colors outline-none hover:bg-champagne-light hover:text-charcoal focus-visible:bg-champagne-light focus-visible:text-charcoal focus-visible:ring-2 focus-visible:ring-champagne-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:opacity-80";

  return (
    <dialog
      ref={dialog}
      aria-label={`${item.title}, picture ${index + 1} of ${items.length}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={onKeyDown}
      className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 bg-charcoal/97 p-0 text-champagne-light backdrop:bg-charcoal"
    >
      <div className="flex h-full flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[12px] tracking-[0.2em] uppercase" aria-hidden="true">
            {index + 1} / {items.length}
          </p>
          <button type="button" onClick={onClose} aria-label="Close full-screen view" className={button}>
            <X className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </div>

        {/* The picture. Clicking the dark space around it closes the view, like the backdrop it is. */}
        <div
          onClick={(event) => event.target === event.currentTarget && onClose()}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
          className="relative my-3 min-h-0 flex-1 touch-pan-y"
        >
          <figure key={item.id} className="absolute inset-0 motion-safe:animate-fade">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="100vw"
              quality={75}
              priority
              draggable={false}
              className="pointer-events-none object-contain select-none"
            />
          </figure>
        </div>

        <div className="flex items-end justify-between gap-4">
          <button type="button" onClick={() => step(-1)} aria-label="Previous picture" className={button}>
            <ChevronLeft className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-serif text-[clamp(1.2rem,2.4vw,1.6rem)] leading-tight italic">{item.title}</p>
            <p className="mt-1.5 font-ui text-[11.5px] leading-[1.5] tracking-[0.16em] text-champagne-light/75 uppercase">
              {[item.eventType, item.location, label].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button type="button" onClick={() => step(1)} aria-label="Next picture" className={button}>
            <ChevronRight className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The neighbours, fetched ahead so turning the page is instant. */}
      <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
        {[-1, 1].map((direction) => {
          const next = items[(index + direction + items.length) % items.length];
          return (
            <Image key={next.id} src={next.src} alt="" width={next.width} height={next.height} sizes="100vw" />
          );
        })}
      </div>
    </dialog>
  );
}
