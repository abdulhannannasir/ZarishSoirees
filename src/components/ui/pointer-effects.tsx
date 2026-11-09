"use client";

import { useEffect } from "react";

/** Things the cursor ring grows over: anything a visitor can click, tap or type in. */
const INTERACTIVE = "a[href], button, [role='button'], summary, label[for], select, input, textarea, [data-cursor]";

/** How far, at most, a magnetic button leans toward the pointer, in pixels. */
const MAGNET_LIMIT = 9;
/** How much of the pointer's distance from the button's centre the button follows. */
const MAGNET_PULL = 0.26;

/**
 * Desktop pointer polish, switched on only for a real mouse (no hover on touch screens) and never
 * for visitors who prefer reduced motion:
 *
 * - a thin ring that trails the pointer and swells over anything clickable. The normal cursor is
 *   never hidden or replaced, the ring ignores clicks, and it blends with whatever is beneath it, so
 *   it can never cover text or get in the way;
 * - buttons marked `data-magnetic` lean a few pixels toward the pointer.
 *
 * It renders nothing: it adds and removes its own element, listeners and styles.
 */
export function PointerEffects() {
  useEffect(() => {
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mouse.matches || reduced.matches) return;

    const ring = document.createElement("div");
    ring.className = "twt-cursor";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    let targetX = -100;
    let targetY = -100;
    let x = targetX;
    let y = targetY;
    let rafId = 0;
    let magnet: HTMLElement | null = null;

    const frame = () => {
      rafId = 0;
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      // Keep going until the ring has caught up with the pointer.
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) rafId = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!rafId) rafId = requestAnimationFrame(frame);
    };

    const release = (element: HTMLElement) => {
      element.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
      element.style.transform = "";
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      ring.dataset.visible = "";
      wake();
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) * MAGNET_PULL;
        const dy = (event.clientY - (box.top + box.height / 2)) * MAGNET_PULL;
        const limit = (value: number) => Math.max(-MAGNET_LIMIT, Math.min(MAGNET_LIMIT, value));
        magnet.style.transition = "transform 0.12s ease-out";
        magnet.style.transform = `translate3d(${limit(dx)}px, ${limit(dy)}px, 0)`;
      }
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as HTMLElement;
      if (target.closest(INTERACTIVE)) ring.dataset.active = "";
      const next = target.closest<HTMLElement>("[data-magnetic]");
      if (next !== magnet) {
        if (magnet) release(magnet);
        magnet = next;
      }
    };
    const onOut = (event: PointerEvent) => {
      const related = event.relatedTarget as HTMLElement | null;
      if (!related?.closest?.(INTERACTIVE)) delete ring.dataset.active;
      if (magnet && !related?.closest?.("[data-magnetic]")) {
        release(magnet);
        magnet = null;
      }
    };
    const onLeaveWindow = () => delete ring.dataset.visible;
    const onDown = () => (ring.dataset.pressed = "");
    const onUp = () => delete ring.dataset.pressed;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (magnet) release(magnet);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      ring.remove();
    };
  }, []);

  return null;
}
