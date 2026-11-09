"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Menus, picture viewers and anything marked data-lenis-prevent keep their own native scrolling. */
const KEEP_NATIVE = "dialog, [role='dialog'], [data-lenis-prevent]";

/**
 * Scroll polish for the inner pages, switched off for visitors who prefer reduced motion:
 *
 * - smooth, inertial scrolling for the mouse wheel and trackpad (Lenis). Touch screens keep their
 *   own native scrolling, which is already smooth;
 * - a reading-progress hairline: the element marked `data-scroll-progress` is scaled across the
 *   top of the screen as the visitor moves down the page;
 * - parallax: any element marked `data-parallax` (a layer inside a photo frame that clips it)
 *   drifts a little against the scroll, so photos seem to sit behind the page. The value is the
 *   share of the frame's height it travels, 0.08 by default.
 *
 * It renders nothing.
 */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      anchors: true,
      prevent: (node) => node instanceof Element && node.closest(KEEP_NATIVE) !== null,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // Parallax. Re-run on every page, since each one brings its own photos.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(element);
          else visible.delete(element);
        }
        schedule();
      },
      { rootMargin: "15% 0px" },
    );
    const watch = () =>
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => observer.observe(element));

    let raf = 0;
    const update = () => {
      raf = 0;
      const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
      if (bar) {
        const room = document.documentElement.scrollHeight - window.innerHeight;
        const done = room > 0 ? Math.min(1, Math.max(0, window.scrollY / room)) : 0;
        bar.style.transform = `scaleX(${done.toFixed(4)})`;
      }
      const half = window.innerHeight / 2;
      for (const element of visible) {
        const frame = (element.parentElement ?? element).getBoundingClientRect();
        // -1 when the frame's centre is a screen below the middle, 1 when it is a screen above.
        const progress = Math.max(-1, Math.min(1, (half - (frame.top + frame.height / 2)) / (half + frame.height / 2)));
        const amount = Number(element.dataset.parallax) || 0.08;
        const shift = progress * amount * frame.height;
        element.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${(1 + amount * 2).toFixed(3)})`;
      }
    };
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }

    watch();
    schedule();
    // Pictures that arrive later (a filtered gallery, a section that loads after the page) join in.
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return null;
}
