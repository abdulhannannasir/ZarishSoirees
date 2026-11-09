"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import {
  GALLERY_CATEGORIES,
  GALLERY_NOTICE,
  PROVENANCE_LABEL,
  type GalleryCategory,
  type GalleryItem,
} from "./portfolio-gallery-data";

/** The full-screen viewer is only fetched the first time a picture is opened. */
const PortfolioLightbox = dynamic(() => import("./portfolio-lightbox").then((module) => module.PortfolioLightbox), {
  ssr: false,
});

interface PortfolioGalleryProps {
  items: readonly GalleryItem[];
  /** Show the category filter (All, Weddings, Social celebrations, Corporate). */
  filters?: boolean;
  /** Printed under the pictures: a link to the full portfolio, or one back to the front page. */
  footer?: ReactNode;
}

/**
 * An editorial gallery: pictures in their own proportions in flowing columns, each with a caption
 * (what kind of event, where it was when that is verified, and honestly whether it is a stand-in).
 * Tapping a picture opens it full screen with previous and next. Category filters are optional.
 *
 * Captions sit under the pictures, not over them, so nothing important appears only on hover, and
 * every picture is a real button for the keyboard. Pictures load lazily at the size the screen
 * needs and keep their proportions from the start, so nothing shifts as they arrive.
 */
export function PortfolioGallery({ items, filters = false, footer }: PortfolioGalleryProps) {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? [...items] : items.filter((item) => item.category === filter)),
    [items, filter],
  );
  const standIns = items.some((item) => item.provenance !== "studio");

  return (
    <div>
      {standIns && (
        <p className="max-w-[40rem] font-ui text-[13.5px] leading-[1.6] text-ink-soft">{GALLERY_NOTICE}</p>
      )}

      {filters && (
        <div role="group" aria-label="Filter the portfolio" className="mt-7 flex flex-wrap gap-2.5">
          {[{ id: "all" as const, label: "All" }, ...GALLERY_CATEGORIES].map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={filter === category.id}
              onClick={() => setFilter(category.id)}
              className="inline-flex min-h-11 items-center border border-ink/30 px-5 font-ui text-[12px] leading-none font-medium tracking-[0.14em] text-ink uppercase transition-colors duration-300 outline-none hover:border-ink aria-pressed:border-forest aria-pressed:bg-forest aria-pressed:text-cream focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        Showing {shown.length} pictures
      </p>

      {/* Keyed by the filter, so a new selection rises in rather than snapping. */}
      <ul
        key={filter}
        className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 lg:gap-5 xl:columns-4"
      >
        {shown.map((item, position) => {
          const label = PROVENANCE_LABEL[item.provenance];
          return (
            <li
              key={item.id}
              style={{ "--delay": `${Math.min(position, 12) * 45}ms` } as CSSProperties}
              className="mb-5 break-inside-avoid motion-safe:animate-rise motion-safe:[animation-delay:var(--delay)] sm:mb-6"
            >
              <button
                type="button"
                onClick={() => setOpen(position)}
                aria-haspopup="dialog"
                className="group block w-full text-left outline-none"
              >
                <span className="relative block overflow-hidden bg-cream group-focus-visible:ring-2 group-focus-visible:ring-forest group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ivory">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="h-auto w-full transition-transform duration-700 ease-out can-hover:group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-2 bottom-2 inline-flex size-9 items-center justify-center bg-charcoal/55 text-champagne-light transition-opacity duration-300 can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-visible:opacity-100"
                  >
                    <Maximize2 className="size-4" strokeWidth={1.4} />
                  </span>
                </span>
                <span className="mt-3 block font-serif text-[1.15rem] leading-tight text-ink">
                  {item.title}
                </span>
                <span className="mt-1 block font-ui text-[11px] leading-[1.5] tracking-[0.14em] text-ink-soft uppercase">
                  {[item.eventType, item.location, label].filter(Boolean).join(" · ")}
                </span>
                {/* Part of the button's name (which must contain the words people can see), and says what it does. */}
                <span className="sr-only">, view full screen</span>
              </button>
            </li>
          );
        })}
      </ul>

      {footer && <div className="mt-10">{footer}</div>}

      {open !== null && shown[open] && (
        <PortfolioLightbox items={shown} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
      )}
    </div>
  );
}
