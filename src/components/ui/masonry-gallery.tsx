"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * MasonryGallery: a responsive masonry layout whose tiles glide into place with GSAP.
 *
 * - Each tile animates in as it scrolls into view, once its picture has loaded, with a short
 *   stagger between tiles that arrive together. Resizing the window glides the tiles to their new
 *   places.
 * - Pictures are `next/image`, so they get alt text, lazy loading and the right size for the screen.
 * - Visitors who prefer reduced motion get no animation at all. Hover effects only run for a mouse;
 *   on touch screens captions are always visible, since there is no hover.
 * - A tile with a `url` is a real link (keyboard focusable); a tile without one is just a figure.
 */

/** Columns from the widest screens down: 5, 4, 3, 2, and a single column below the last query. */
const COLUMN_QUERIES = [
  "(min-width: 1500px)",
  "(min-width: 1024px)",
  "(min-width: 700px)",
  "(min-width: 340px)",
] as const;
const COLUMN_COUNTS = [5, 4, 3, 2] as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** How far, in pixels, a tile travels in from its `animateFrom` side. */
const ENTER_DISTANCE = 120;

const DEFAULT_SIZES =
  "(min-width: 1500px) 20vw, (min-width: 1024px) 25vw, (min-width: 700px) 33vw, 50vw";

export interface MasonryItem {
  id: string;
  /** Path or URL of the picture. */
  img: string;
  /**
   * The tile's height relative to its width, on a scale where 400 is a square: 520 is a portrait
   * about 4:5, 300 a landscape about 4:3, 200 a wide 2:1. It should match the picture's shape.
   */
  height: number;
  /** Alt text for the picture. Falls back to the title, then to an empty (decorative) alt. */
  alt?: string;
  title?: string;
  /** A small line above the title. */
  kicker?: string;
  /** Makes the tile a link that opens in a new tab. */
  url?: string;
  /** CSS object-position of the crop, for when the subject is off-centre. */
  focus?: string;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MasonryGalleryProps {
  items: readonly MasonryItem[];
  /** GSAP easing for the entrance and for layout changes. */
  ease?: string;
  /** Seconds a tile takes to glide to its new place when the layout changes. */
  duration?: number;
  /** Seconds between tiles that arrive together. */
  stagger?: number;
  /** The side tiles travel in from. */
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  /** Shrink a tile slightly while the mouse is over it. */
  scaleOnHover?: boolean;
  /** The scale a hovered tile shrinks to. */
  hoverScale?: number;
  /** Tiles start blurred and come into focus as they arrive. */
  blurToFocus?: boolean;
  /** Wash a tile with the primary-to-accent gradient while the mouse is over it. */
  colorShiftOnHover?: boolean;
  /** Space between tiles, in pixels. Phones with two columns use 60% of it. */
  gap?: number;
  /** The `sizes` attribute for the pictures. The default matches the column counts above. */
  sizes?: string;
  className?: string;
  /** Extra classes for each tile, for example `rounded-xl`. Tiles are square-cornered by default. */
  itemClassName?: string;
}

/** The number of columns that fits the screen. 1 on the server, then the real value after mount. */
function useColumns(): number {
  return useSyncExternalStore(
    (onChange) => {
      const lists = COLUMN_QUERIES.map((query) => window.matchMedia(query));
      lists.forEach((list) => list.addEventListener("change", onChange));
      return () => lists.forEach((list) => list.removeEventListener("change", onChange));
    },
    () => {
      const index = COLUMN_QUERIES.findIndex((query) => window.matchMedia(query).matches);
      return index === -1 ? 1 : COLUMN_COUNTS[index];
    },
    () => 1,
  );
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(REDUCED_MOTION_QUERY);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** The element's width, kept up to date as it resizes. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/** Where a tile starts, relative to its final place, for a given entrance direction. */
function entranceOffset(direction: NonNullable<MasonryGalleryProps["animateFrom"]>) {
  const resolved =
    direction === "random"
      ? (["top", "bottom", "left", "right"] as const)[Math.floor(Math.random() * 4)]
      : direction;
  switch (resolved) {
    case "top":
      return { x: 0, y: -ENTER_DISTANCE, scale: 1 };
    case "left":
      return { x: -ENTER_DISTANCE, y: 0, scale: 1 };
    case "right":
      return { x: ENTER_DISTANCE, y: 0, scale: 1 };
    case "center":
      return { x: 0, y: 0, scale: 0.85 };
    default:
      return { x: 0, y: ENTER_DISTANCE, scale: 1 };
  }
}

export function MasonryGallery({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  gap = 20,
  sizes = DEFAULT_SIZES,
  className,
  itemClassName,
}: MasonryGalleryProps) {
  const columns = useColumns();
  const reduceMotion = usePrefersReducedMotion();
  const [listRef, width] = useWidth<HTMLUListElement>();

  const tiles = useRef(new Map<string, HTMLElement>());
  const placements = useRef(new Map<string, GridItem>());
  const progress = useRef({
    inView: new Set<string>(),
    loaded: new Set<string>(),
    shown: new Set<string>(),
    arrivals: 0,
    arrivalTimer: 0,
  });
  // The latest settings, read by callbacks that must not change identity between renders.
  const settings = useRef({ ease, duration, stagger, animateFrom, blurToFocus, reduceMotion });

  const { grid, height: totalHeight } = useMemo(() => {
    if (!width) return { grid: [] as GridItem[], height: 0 };

    const space = columns <= 2 ? Math.round(gap * 0.6) : gap;
    const columnWidth = (width - (columns - 1) * space) / columns;
    const bottoms = new Array<number>(columns).fill(0);

    const placed = items.map((item) => {
      const column = bottoms.indexOf(Math.min(...bottoms));
      const h = (item.height / 400) * columnWidth;
      const placement: GridItem = {
        ...item,
        x: column * (columnWidth + space),
        y: bottoms[column],
        w: columnWidth,
        h,
      };
      bottoms[column] += h + space;
      return placement;
    });

    return { grid: placed, height: Math.max(0, Math.max(...bottoms) - space) };
  }, [columns, gap, items, width]);

  /** Brings a tile in, once it is on screen and its picture has loaded. */
  const show = useCallback((id: string) => {
    const state = progress.current;
    if (state.shown.has(id) || !state.inView.has(id) || !state.loaded.has(id)) return;
    const element = tiles.current.get(id);
    const place = placements.current.get(id);
    if (!element || !place) return;
    state.shown.add(id);

    const options = settings.current;
    if (options.reduceMotion) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    // Tiles that arrive within a moment of each other are staggered; a lone tile has no delay.
    const delay = state.arrivals++ * options.stagger;
    window.clearTimeout(state.arrivalTimer);
    state.arrivalTimer = window.setTimeout(() => (state.arrivals = 0), 150);

    const from = entranceOffset(options.animateFrom);
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: place.x + from.x,
        y: place.y + from.y,
        scale: from.scale,
        ...(options.blurToFocus && { filter: "blur(16px)" }),
      },
      {
        opacity: 1,
        x: place.x,
        y: place.y,
        scale: 1,
        ...(options.blurToFocus && { filter: "blur(0px)" }),
        duration: 1.2,
        ease: options.ease,
        delay,
        // A finished blur(0px) still costs a compositing layer, so drop it.
        onComplete: () => {
          gsap.set(element, { clearProps: "filter" });
        },
      },
    );
  }, []);

  // Put every tile at its place. New tiles wait there, invisible, until they are shown.
  useLayoutEffect(() => {
    settings.current = { ease, duration, stagger, animateFrom, blurToFocus, reduceMotion };
    placements.current = new Map(grid.map((place) => [place.id, place]));

    grid.forEach((place) => {
      const element = tiles.current.get(place.id);
      if (!element) return;
      const frame = { x: place.x, y: place.y, width: place.w, height: place.h };
      if (!progress.current.shown.has(place.id)) {
        gsap.set(element, { ...frame, opacity: 0 });
      } else if (reduceMotion) {
        gsap.set(element, frame);
      } else {
        gsap.to(element, { ...frame, duration, ease, overwrite: "auto" });
      }
    });
  }, [grid, ease, duration, stagger, animateFrom, blurToFocus, reduceMotion]);

  // Watch for tiles scrolling into view.
  const hasGrid = grid.length > 0;
  useEffect(() => {
    if (!hasGrid) return;
    const state = progress.current;
    const fallbacks = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.id;
          if (!entry.isIntersecting || !id) return;
          state.inView.add(id);
          observer.unobserve(entry.target);
          show(id);
          // If a picture never reports back, show its tile anyway rather than leave a hole.
          if (!state.loaded.has(id)) {
            const timer = window.setTimeout(() => {
              state.loaded.add(id);
              show(id);
            }, 4000);
            fallbacks.add(timer);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    tiles.current.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      fallbacks.forEach((timer) => window.clearTimeout(timer));
    };
  }, [hasGrid, items, show]);

  // Stop any animation still running when the gallery goes away.
  useEffect(() => {
    const elements = tiles.current;
    const state = progress.current;
    return () => {
      gsap.killTweensOf(Array.from(elements.values()));
      window.clearTimeout(state.arrivalTimer);
    };
  }, []);

  const markLoaded = (id: string) => {
    progress.current.loaded.add(id);
    show(id);
  };

  const canHover = (event: PointerEvent<HTMLElement>) =>
    event.pointerType === "mouse" && !settings.current.reduceMotion;

  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!canHover(event)) return;
    const tile = event.currentTarget;
    if (scaleOnHover) {
      gsap.to(tile, { scale: hoverScale, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    }
    if (colorShiftOnHover) {
      gsap.to(tile.querySelectorAll(".color-overlay"), { opacity: 0.3, duration: 0.4 });
    }
  };

  const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (!canHover(event)) return;
    const tile = event.currentTarget;
    if (scaleOnHover) {
      gsap.to(tile, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    }
    if (colorShiftOnHover) {
      gsap.to(tile.querySelectorAll(".color-overlay"), { opacity: 0, duration: 0.4 });
    }
  };

  return (
    <ul
      ref={listRef}
      className={cn("relative w-full", className)}
      style={{ height: totalHeight || undefined, minHeight: 320 }}
    >
      {grid.map((item) => {
        const caption = (item.kicker || item.title) && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 block bg-linear-to-t from-[#1d150c]/88 via-[#1d150c]/40 to-transparent px-4 pt-12 pb-4 text-left text-[#fff6e8] transition-opacity duration-300 can-hover:opacity-0 can-hover:group-focus-within:opacity-100 can-hover:group-hover:opacity-100">
            {item.kicker && (
              <span className="block text-[9px] leading-none font-medium tracking-[0.22em] text-[#fff3df]/80 uppercase">
                {item.kicker}
              </span>
            )}
            {item.title && (
              <span className="mt-1.5 block text-[17px] leading-[1.15] font-normal">
                {item.title}
              </span>
            )}
          </span>
        );

        const content = (
          <>
            <Image
              src={item.img}
              alt={item.alt ?? item.title ?? ""}
              fill
              sizes={sizes}
              style={{ objectPosition: item.focus }}
              className="object-cover"
              onLoad={() => markLoaded(item.id)}
              onError={() => markLoaded(item.id)}
            />
            {colorShiftOnHover && (
              <span className="color-overlay pointer-events-none absolute inset-0 bg-linear-to-tr from-primary/40 to-accent/40 opacity-0" />
            )}
            {caption}
          </>
        );

        return (
          <li
            key={item.id}
            ref={(element) => {
              if (element) tiles.current.set(item.id, element);
              else tiles.current.delete(item.id);
            }}
            data-id={item.id}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            style={{ willChange: "transform, opacity" }}
            className={cn("group absolute top-0 left-0 overflow-hidden bg-cream", itemClassName)}
          >
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block size-full outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset"
              >
                {content}
              </a>
            ) : (
              <figure className="relative block size-full">{content}</figure>
            )}
          </li>
        );
      })}
    </ul>
  );
}
