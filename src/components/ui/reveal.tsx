"use client";

import { useCallback, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: "div" | "li";
  /**
   * For a block that is already on screen when the page opens. It is never hidden waiting for
   * JavaScript (which would hold back what a phone shows first, and its largest paint); it rises in
   * with a plain CSS animation instead.
   */
  immediate?: boolean;
  /** Milliseconds to wait before the block rises, to stagger neighbours that arrive together. */
  delay?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps a block so it rises into place the first time it scrolls into view. The hiding and the
 * motion are CSS (see "Scroll reveal" in globals.css), which also covers reduced motion, no
 * JavaScript and a script that never loads; this component only flips `data-revealed` on at the
 * right moment, straight on the element, so it never causes a re-render.
 */
export function Reveal({
  as: Tag = "div",
  immediate = false,
  delay = 0,
  className,
  children,
}: RevealProps) {
  const observe = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      element.setAttribute("data-revealed", "");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.setAttribute("data-revealed", "");
        observer.disconnect();
      },
      // A little inside the bottom edge, so a block starts rising once it is clearly on screen.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (immediate) {
    return (
      <Tag
        style={delay ? { animationDelay: `${delay}ms` } : undefined}
        className={cn("motion-safe:animate-rise", className)}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={observe}
      data-reveal=""
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
