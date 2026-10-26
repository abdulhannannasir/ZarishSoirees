"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowDown, ChevronLeft, LayoutGrid, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import "./wonderland.css";
import { Cluster, HangingVine } from "./art";
import { ConsultationModal } from "./consultation-modal";
import { BRAND, FINALE, HERO, SCENES, SECTIONS, UI, sceneIndexFromHash } from "./content";
import { FinaleScene } from "./finale-scene";
import { Photo } from "./photo";
import { ShowpieceScene } from "./showpiece-scene";
import { useAmbientSound } from "./use-ambient-sound";

type Phase = "intro" | "entering" | "scene";
/** future: waiting behind the visitor. dim: arriving during the Enter push. past: flown through. */
type SceneState = "future" | "dim" | "active" | "past";

/** Enter -> scene handoff, then scene -> settled (UI appears). Shortened under reduced motion. */
const ENTER_MS = 3400;
const SETTLE_MS = 5400;
/** After a scene switch, input is ignored this long so one flick can't skip a scene. */
const SWITCH_LOCK_MS = 2400;
/** Pixels of wheel that traverse one scene's parallax. Tune this to change the scroll pace. */
const WHEEL_RANGE = 900;
/** How far past a scene's end (in progress units, ~160px of wheel) counts as "go to the next". */
const OVERSHOOT = 0.18;
/** A touch swipe moves one scene when it covers this fraction of the screen height... */
const SWIPE_FAR = 0.12;
/** ...or is a quick flick: at least this many px, at this many px per millisecond. */
const SWIPE_FLICK_MIN = 24;
const SWIPE_FLICK_SPEED = 0.4;
/** A touch that moves less than this (px) is still a tap, so the browser is left alone. */
const TOUCH_SLOP = 4;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** The five showpieces and then the finale, in scroll order. */
const LAST = SCENES.length - 1;

type Cutout = {
  id: string;
  seed: number;
  blooms?: number;
  vine?: boolean;
  /** Position + size of the wrapper. */
  className: string;
  /** Direction the piece flies when the camera pushes in. */
  fx: string;
  fy: string;
  dur: string;
  delay: string;
  enter: string;
};

const CUTOUTS: Cutout[] = [
  { id: "tl", seed: 11, blooms: 3, className: "-left-[3%] -top-[5%] aspect-square w-[clamp(160px,28vw,340px)]", fx: "-40vw", fy: "-30vh", dur: "10s", delay: "0s", enter: "0.2s" },
  { id: "vine", seed: 23, vine: true, className: "right-[7%] -top-[3%] aspect-[160/460] w-[clamp(64px,10vw,130px)]", fx: "20vw", fy: "-50vh", dur: "8s", delay: "0s", enter: "0.5s" },
  { id: "bl", seed: 37, blooms: 3, className: "-bottom-[8%] -left-[4%] aspect-square w-[clamp(170px,30vw,360px)]", fx: "-40vw", fy: "40vh", dur: "11s", delay: "-3s", enter: "0.35s" },
  { id: "bc", seed: 41, blooms: 2, className: "-bottom-[6%] left-[28%] aspect-square w-[clamp(100px,16vw,200px)]", fx: "-10vw", fy: "40vh", dur: "9s", delay: "-5s", enter: "0.65s" },
  { id: "bcr", seed: 53, blooms: 2, className: "-bottom-[5%] left-[55%] aspect-square w-[clamp(110px,17vw,220px)]", fx: "10vw", fy: "40vh", dur: "12s", delay: "-2s", enter: "0.8s" },
  { id: "br", seed: 67, blooms: 3, className: "-bottom-[9%] -right-[4%] aspect-square w-[clamp(180px,32vw,390px)]", fx: "40vw", fy: "40vh", dur: "10s", delay: "-6s", enter: "0.45s" },
];

const pill =
  "inline-flex items-center gap-2 rounded-full border border-[var(--wl-ivory)]/25 bg-[rgba(var(--wl-umber-rgb),0.5)] px-4 py-2 text-[var(--wl-ivory)] backdrop-blur-sm transition-colors hover:bg-[rgba(var(--wl-umber-rgb),0.78)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wl-champagne)]";

/**
 * On phones the two header buttons shrink to 44px icon buttons (their text stays for screen
 * readers). That frees the middle of the header, so a longer brand name still fits between them.
 */
const iconOnlyOnPhones = "max-sm:size-11 max-sm:justify-center max-sm:px-0 max-sm:py-0";

/** Today as YYYY-MM-DD in the visitor's own time zone: the consultation form's earliest date. */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function Wonderland() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stage, setStage] = useState<0 | 1>(0);
  const [current, setCurrent] = useState(0);
  const [boardOpen, setBoardOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [minDate, setMinDate] = useState("");

  /** While any dialog is open, the page must not scroll or react to keys behind it. */
  const modalOpen = boardOpen || consultOpen;

  const sound = useAmbientSound();

  const rootRef = useRef<HTMLElement>(null);
  /** One element per scene. Each carries its own scroll variable `--p` (0..1). */
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timers = useRef<number[]>([]);
  /** Mirrors `current` for handlers and the rAF loop, which must not see a stale value. */
  const currentRef = useRef(0);
  /**
   * Target and eased progress through the *current* scene, 0..1. Kept out of state because it
   * changes every frame; the eased value is written to that scene's `--p`. Because every
   * scene owns its variable, a scene that is flying away keeps its last position.
   */
  const targetP = useRef(0);
  const easedP = useRef(0);
  /** Scroll pushed past either end of a scene, accumulated until it is enough to switch. */
  const overshoot = useRef(0);
  const lockUntil = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const setProgress = useCallback((index: number, value: number) => {
    sceneRefs.current[index]?.style.setProperty("--p", value.toFixed(4));
  }, []);

  const goToSection = useCallback(
    (next: number, direction: "forward" | "back") => {
      if (next === currentRef.current || next < 0 || next > LAST) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      lockUntil.current = performance.now() + (reduce ? 300 : SWITCH_LOCK_MS);
      currentRef.current = next;
      overshoot.current = 0;
      // Arrive at the start when going forward, at the end when going back.
      const start = direction === "forward" ? 0 : 1;
      targetP.current = start;
      easedP.current = start;
      setProgress(next, start);
      window.history.replaceState(null, "", `#${SCENES[next].id}`);
      setCurrent(next);
    },
    [setProgress],
  );

  const enter = () => {
    if (phase !== "intro") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The hash is the destination of Enter: a deep link lands in its scene, otherwise the first.
    const fromHash = sceneIndexFromHash(window.location.hash);
    const index = fromHash >= 0 ? fromHash : 0;
    currentRef.current = index;
    setCurrent(index);
    sound.start();
    window.history.replaceState(null, "", `#${SCENES[index].id}`);
    setPhase("entering");
    schedule(() => setPhase("scene"), reduce ? 300 : ENTER_MS);
    schedule(() => setStage(1), reduce ? 700 : SETTLE_MS);
  };

  const goHome = () => {
    clearTimers();
    currentRef.current = 0;
    targetP.current = 0;
    easedP.current = 0;
    overshoot.current = 0;
    lockUntil.current = 0;
    SCENES.forEach((_, i) => setProgress(i, 0));
    setBoardOpen(false);
    setConsultOpen(false);
    setCurrent(0);
    setStage(0);
    setPhase("intro");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const jumpTo = useCallback(
    (index: number) => {
      if (performance.now() < lockUntil.current) return;
      goToSection(index, index > currentRef.current ? "forward" : "back");
    },
    [goToSection],
  );

  // "Scroll to explore the magic" is also a button: it carries on to the next scene.
  const nextSection = useCallback(() => jumpTo(currentRef.current + 1), [jumpTo]);

  const openConsultation = useCallback(() => {
    setMinDate(todayIso());
    setConsultOpen(true);
  }, []);
  const closeConsultation = useCallback(() => setConsultOpen(false), []);

  // In-scene scroll: the wheel and keys feed a target that a rAF loop eases toward. Touch is a
  // swipe instead (below): scrubbing with a finger left the content wobbling up and down and took
  // about three screens of swiping to reach the next scene.
  useEffect(() => {
    if (stage !== 1) return;

    let raf = 0;

    const bump = (delta: number) => {
      if (performance.now() < lockUntil.current) return;
      const index = currentRef.current;
      const next = targetP.current + delta;
      if (next > 1) {
        targetP.current = 1;
        overshoot.current = Math.max(0, overshoot.current) + (next - 1);
        if (overshoot.current > OVERSHOOT && index < LAST) goToSection(index + 1, "forward");
      } else if (next < 0) {
        targetP.current = 0;
        overshoot.current = Math.min(0, overshoot.current) + next;
        if (overshoot.current < -OVERSHOOT && index > 0) goToSection(index - 1, "back");
      } else {
        targetP.current = next;
        overshoot.current = 0;
      }
    };
    /** Home / End move within the scene; they never switch scenes. */
    const jump = (value: number) => {
      targetP.current = value;
      overshoot.current = 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (!modalOpen) bump(e.deltaY / WHEEL_RANGE);
    };
    // Touch: while the finger is down the scene follows it a little, then settles back. A flick,
    // or a drag of about an eighth of the screen, moves to the next scene (swipe up) or the
    // previous one (swipe down) with the usual zoom. Sideways drags and pinches are ignored.
    let swipe: { x: number; y: number; at: number; rest: number } | null = null;
    const settle = () => {
      if (swipe) targetP.current = swipe.rest;
      swipe = null;
    };
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      swipe =
        modalOpen || e.touches.length !== 1 || !touch
          ? null
          : { x: touch.clientX, y: touch.clientY, at: performance.now(), rest: targetP.current };
    };
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!swipe || !touch) return;
      if (e.touches.length !== 1) return settle();
      const up = swipe.y - touch.clientY;
      if (Math.abs(up) < Math.abs(touch.clientX - swipe.x)) return;
      targetP.current = clamp01(swipe.rest + up / (window.innerHeight * 1.4));
    };
    const onTouchEnd = (e: TouchEvent) => {
      const start = swipe;
      const touch = e.changedTouches[0];
      settle();
      if (!start || !touch) return;
      const up = start.y - touch.clientY;
      const elapsed = Math.max(1, performance.now() - start.at);
      const vertical = Math.abs(up) > Math.abs(touch.clientX - start.x) * 1.2;
      const far = Math.abs(up) >= window.innerHeight * SWIPE_FAR;
      const flick = Math.abs(up) >= SWIPE_FLICK_MIN && Math.abs(up) / elapsed >= SWIPE_FLICK_SPEED;
      if (vertical && (far || flick)) jumpTo(currentRef.current + (up > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") bump(0.2);
      else if (e.key === "ArrowUp" || e.key === "PageUp") bump(-0.2);
      else if (e.key === "End") jump(1);
      else if (e.key === "Home") jump(0);
    };

    const tick = () => {
      const target = targetP.current;
      const eased = easedP.current;
      const next = Math.abs(target - eased) < 0.0004 ? target : eased + (target - eased) * 0.08;
      easedP.current = next;
      setProgress(currentRef.current, next);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", settle, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", settle);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage, modalOpen, goToSection, jumpTo, setProgress]);

  // iOS Safari pans and rubber-bands the whole page under a drag that is not cancelled (and Chrome
  // on Android pulls to refresh), so the screen bobbed up and down under the finger. Cancel
  // one-finger drags everywhere except in a dialog that scrolls (`data-touch-scroll`). The listener
  // must be explicitly non-passive: iOS makes window-level touch listeners passive, which silently
  // ignores preventDefault. Pinch zoom, and panning while zoomed in, keep their native behaviour.
  useEffect(() => {
    let x0 = 0;
    let y0 = 0;
    let native = false;
    const onStart = (e: TouchEvent) => {
      x0 = e.touches[0]?.clientX ?? 0;
      y0 = e.touches[0]?.clientY ?? 0;
      native = e.target instanceof Element && e.target.closest("[data-touch-scroll]") !== null;
    };
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (native || !touch || e.touches.length !== 1 || !e.cancelable) return;
      if ((window.visualViewport?.scale ?? 1) > 1.01) return;
      if (Math.hypot(touch.clientX - x0, touch.clientY - y0) > TOUCH_SLOP) e.preventDefault();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  // Editing the hash by hand (or following a link to another scene) switches scenes too.
  useEffect(() => {
    if (stage !== 1) return;
    const onHashChange = () => {
      const index = sceneIndexFromHash(window.location.hash);
      const from = currentRef.current;
      if (index >= 0 && index !== from) goToSection(index, index > from ? "forward" : "back");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [stage, goToSection]);

  useEffect(() => {
    if (!boardOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBoardOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [boardOpen]);

  const SoundIcon = sound.enabled ? Volume2 : VolumeX;
  /** The finale has its own buttons, so the scroll hint has nothing left to point at. */
  const hintHidden = current === LAST;

  const sceneState = (index: number): SceneState => {
    if (phase === "intro") return "future";
    if (phase === "entering") return index === current ? "dim" : "future";
    if (index === current) return "active";
    return index < current ? "past" : "future";
  };

  return (
    <main
      ref={rootRef}
      data-phase={phase}
      data-stage={stage}
      className="wl fixed inset-0 select-none overflow-clip bg-[var(--wl-umber)] text-[var(--wl-ivory)]"
    >
      {/* The scenes. Only one is "active"; the rest wait behind or have been flown past. */}
      {SCENES.map((scene, i) => {
        const state = sceneState(i);
        return (
          <div
            key={scene.id}
            ref={(el) => {
              sceneRefs.current[i] = el;
            }}
            data-state={state}
            inert={state !== "active"}
            className="wl-scene absolute inset-0 overflow-clip"
          >
            {i < SECTIONS.length ? (
              <ShowpieceScene
                section={SECTIONS[i]}
                index={i}
                total={SCENES.length}
                priority={i === 0}
              />
            ) : (
              <FinaleScene
                finale={FINALE}
                index={i}
                total={SCENES.length}
                onConsult={openConsultation}
              />
            )}
          </div>
        );
      })}

      {/* Hero backdrop: sheer ivory drapes. It covers the first scene and dissolves on Enter. */}
      <div className="wl-hero-bg pointer-events-none absolute inset-0" aria-hidden="true">
        <Photo photo={HERO.backdrop} priority />
        <div className="wl-hero-wash absolute inset-0" />
      </div>

      {/* Intro cut-outs. Outer wrapper handles the exit; inner wrapper handles the idle float. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CUTOUTS.map((c) => (
          <div
            key={c.id}
            className={`wl-cutout absolute ${c.className}`}
            style={{ "--fx": c.fx, "--fy": c.fy, "--enter-delay": c.enter } as CSSProperties}
          >
            <div
              className="wl-float h-full w-full drop-shadow-[0_12px_20px_rgba(70,48,22,0.32)]"
              style={{ "--dur": c.dur, "--delay": c.delay } as CSSProperties}
            >
              {c.vine ? <HangingVine seed={c.seed} /> : <Cluster seed={c.seed} blooms={c.blooms} />}
            </div>
          </div>
        ))}
      </div>

      {/* Hero */}
      <section
        inert={phase !== "intro"}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-[var(--wl-ink)]"
      >
        {/* The logo is the page's h1. It is as wide as the screen allows (up to 720px) but never taller
            than 46% of the screen height, so the tagline and button always fit under it. */}
        <h1
          className="wl-intro-item wl-title"
          style={{ "--d": "0.5s", "--logo-ar": HERO.logo.width / HERO.logo.height } as CSSProperties}
        >
          <Image
            src={HERO.logo.src}
            alt={HERO.logo.alt}
            width={HERO.logo.width}
            height={HERO.logo.height}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 800px) 90vw, 720px"
            className="mx-auto block h-auto w-[min(90vw,720px,calc(46vh*var(--logo-ar)))]"
          />
        </h1>
        <p
          className="wl-intro-item wl-fade mt-4 max-w-[32ch] font-display text-[clamp(1.05rem,2.2vw,1.5rem)] italic sm:max-w-none"
          style={{ "--d": "0.9s" } as CSSProperties}
        >
          {HERO.tagline}
        </p>
        <button
          type="button"
          onClick={enter}
          className="wl-intro-item wl-fade mt-6 rounded-full bg-[var(--wl-ink)] px-7 py-[7px] font-label text-[13px] text-[var(--wl-ivory)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wl-ink)]"
          style={{ "--d": "1.1s" } as CSSProperties}
        >
          {HERO.enterLabel}
        </button>
        <p
          className="wl-intro-item wl-fade mt-3 flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.14em]"
          style={{ "--d": "1.3s" } as CSSProperties}
        >
          <Sparkles className="size-3 text-[var(--wl-sage-deep)]" aria-hidden="true" />
          {HERO.greeting}
        </p>
      </section>

      <p aria-live="polite" className="sr-only">
        {phase === "scene" && stage === 1 ? SCENES[current].title : ""}
      </p>

      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-[clamp(16px,4.4vw,48px)] pt-[clamp(16px,3vw,28px)]">
        <button
          type="button"
          onClick={goHome}
          inert={stage !== 1}
          className={`wl-ui ${pill} font-label text-[11px] uppercase tracking-[0.15em] ${iconOnlyOnPhones}`}
        >
          <ChevronLeft className="size-3 max-sm:size-4" aria-hidden="true" />
          <span className="max-sm:sr-only">{UI.home}</span>
        </button>
        <span className="wl-wordmark pointer-events-none absolute left-1/2 top-[clamp(18px,3.2vw,30px)] -translate-x-1/2 whitespace-nowrap font-label text-sm font-light tracking-[0.32em] [text-shadow:0_1px_14px_rgba(23,17,10,0.6)] max-sm:top-7 sm:text-base sm:tracking-[0.45em]">
          {BRAND.wordmark}
        </span>
        <button
          type="button"
          onClick={() => setBoardOpen(true)}
          inert={stage !== 1}
          className={`wl-ui ${pill} font-label text-sm ${iconOnlyOnPhones}`}
        >
          <LayoutGrid className="size-3.5 max-sm:size-4" aria-hidden="true" />
          <span className="max-sm:sr-only">{UI.moodboard}</span>
        </button>
      </header>

      {/* Scene dots: where you are, and a way to jump. */}
      <nav
        aria-label={UI.sectionNavLabel}
        inert={stage !== 1}
        className="wl-ui absolute right-[clamp(8px,2vw,26px)] top-1/2 z-30 flex -translate-y-1/2 flex-col"
      >
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => jumpTo(i)}
            aria-label={`${i + 1}. ${scene.title}`}
            aria-current={i === current}
            className="wl-dot focus-visible:outline-2 focus-visible:outline-[var(--wl-ivory)]"
          />
        ))}
      </nav>

      {/* Scroll hint: leads from scene to scene, and steps aside for the finale's own buttons. */}
      <button
        type="button"
        onClick={nextSection}
        inert={stage !== 1 || hintHidden}
        data-end={hintHidden}
        className="wl-ui wl-hint absolute bottom-[clamp(20px,4vw,48px)] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap font-label text-[clamp(0.9rem,1.4vw,1rem)] tracking-[-0.01em] [text-shadow:0_1px_14px_rgba(23,17,10,0.95)]"
      >
        {UI.scrollCta}
        <ArrowDown className="wl-nudge size-4" aria-hidden="true" />
      </button>

      {/* Sound toggle */}
      <button
        type="button"
        onClick={sound.toggle}
        aria-pressed={sound.enabled}
        aria-label={sound.enabled ? UI.soundOff : UI.soundOn}
        className="absolute bottom-5 left-5 z-30 grid size-[47px] place-items-center rounded-full border border-[var(--wl-ivory)]/15 bg-[rgba(var(--wl-umber-rgb),0.88)] text-[var(--wl-ivory)] transition-colors hover:bg-[var(--wl-umber)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wl-champagne)]"
      >
        <SoundIcon className="size-[18px]" aria-hidden="true" />
      </button>

      {/* Moodboard: the current scene's pictures and palette. The overlay scrolls (and keeps native
          touch scrolling, see `data-touch-scroll`) because the panel can be taller than a phone. */}
      {boardOpen && (
        <div
          data-touch-scroll
          className="absolute inset-0 z-40 overflow-y-auto bg-[rgba(var(--wl-umber-rgb),0.74)] backdrop-blur-sm"
        >
          <div
            className="flex min-h-full items-center justify-center p-4 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setBoardOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={UI.moodboard}
              className="w-full max-w-lg rounded-2xl border border-[var(--wl-ivory)]/15 bg-[var(--wl-umber)] p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-2xl font-medium">{UI.moodboard}</h3>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setBoardOpen(false)}
                  aria-label={UI.moodboardClose}
                  className="grid size-8 place-items-center rounded-full hover:bg-[var(--wl-ivory)]/10 focus-visible:outline-2 focus-visible:outline-[var(--wl-ivory)]"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mb-3 font-label text-xs uppercase tracking-[0.14em] text-[var(--wl-ivory)]/50">
                {SCENES[current].title}
              </p>
              {/* The first picture is wide, the rest are squares beneath it. */}
              <ul className="mb-5 grid grid-cols-2 gap-2">
                {SCENES[current].moodboard.map((picture, i) => (
                  <li
                    key={picture.src}
                    className={`relative overflow-hidden rounded-xl bg-[var(--wl-ivory)]/10 ${
                      i === 0 ? "col-span-2 aspect-video" : "aspect-square"
                    }`}
                  >
                    <Photo
                      photo={picture}
                      sizes={i === 0 ? "(max-width: 540px) 90vw, 480px" : "(max-width: 540px) 45vw, 240px"}
                    />
                  </li>
                ))}
              </ul>
              <ul className="grid grid-cols-3 gap-4 font-label text-xs">
                {SCENES[current].swatches.map((s) => (
                  <li key={`${s.name}-${s.value}`} className="flex flex-col gap-2">
                    <span
                      className="block aspect-square rounded-full border border-[var(--wl-ivory)]/20"
                      style={{ backgroundColor: s.value }}
                    />
                    <span>{s.name}</span>
                    <span className="uppercase text-[var(--wl-ivory)]/50">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Consultation form: rendered here, outside the scenes, so their transforms can't clip it. */}
      <ConsultationModal open={consultOpen} onClose={closeConsultation} minDate={minDate} />
    </main>
  );
}
