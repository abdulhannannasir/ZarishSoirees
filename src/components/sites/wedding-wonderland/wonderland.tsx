"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ChevronLeft, LayoutGrid, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import "./wonderland.css";
import { Cluster, HangingVine } from "./art";
import { ConsultationModal } from "./consultation-modal";
import { BRAND, FINALE, HERO, SCENES, SECTIONS, UI, sceneIndexFromHash } from "./content";
import { FinaleScene } from "./finale-scene";
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
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

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

  // In-scene scroll: wheel, touch, and keys feed a target; a rAF loop eases toward it.
  useEffect(() => {
    if (stage !== 1) return;

    let raf = 0;
    let lastY = 0;

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
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastY;
      if (!modalOpen) bump((lastY - y) / (window.innerHeight * 0.9));
      lastY = y;
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
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage, modalOpen, goToSection, setProgress]);

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
      className="wl relative h-dvh w-full select-none overflow-clip bg-black text-white"
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

      {/* Intro cut-outs. Outer wrapper handles the exit; inner wrapper handles the idle float. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CUTOUTS.map((c) => (
          <div
            key={c.id}
            className={`wl-cutout absolute ${c.className}`}
            style={{ "--fx": c.fx, "--fy": c.fy, "--enter-delay": c.enter } as CSSProperties}
          >
            <div
              className="wl-float h-full w-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
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
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      >
        <p
          className="wl-intro-item wl-fade font-label text-[13px] font-light uppercase tracking-[0.1em]"
          style={{ "--d": "0.5s" } as CSSProperties}
        >
          {HERO.eyebrow}
        </p>
        <h1
          className="wl-intro-item wl-title mt-4 font-display text-[clamp(2.2rem,8.2vw,5.75rem)] font-medium uppercase leading-[0.95] tracking-[-0.01em]"
          style={{ "--d": "0.7s" } as CSSProperties}
        >
          {HERO.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p
          className="wl-intro-item wl-fade mt-3 max-w-[32ch] font-display text-[clamp(1.05rem,2.2vw,1.5rem)] italic sm:max-w-none"
          style={{ "--d": "0.9s" } as CSSProperties}
        >
          {HERO.tagline}
        </p>
        <button
          type="button"
          onClick={enter}
          className="wl-intro-item wl-fade mt-6 rounded-full bg-white px-7 py-[7px] font-label text-[13px] text-black transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{ "--d": "1.1s" } as CSSProperties}
        >
          {HERO.enterLabel}
        </button>
        <p
          className="wl-intro-item wl-fade mt-3 flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.14em]"
          style={{ "--d": "1.3s" } as CSSProperties}
        >
          <Sparkles className="size-3" aria-hidden="true" />
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
        <span className="pointer-events-none absolute left-1/2 top-[clamp(18px,3.2vw,30px)] -translate-x-1/2 whitespace-nowrap font-label text-sm font-light tracking-[0.32em] [text-shadow:0_1px_14px_rgba(0,0,0,0.6)] max-sm:top-7 sm:text-base sm:tracking-[0.45em]">
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
            className="wl-dot focus-visible:outline-2 focus-visible:outline-white"
          />
        ))}
      </nav>

      {/* Scroll hint: leads from scene to scene, and steps aside for the finale's own buttons. */}
      <button
        type="button"
        onClick={nextSection}
        inert={stage !== 1 || hintHidden}
        data-end={hintHidden}
        className="wl-ui wl-hint absolute bottom-[clamp(20px,4vw,48px)] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 whitespace-nowrap font-label text-[clamp(0.9rem,1.4vw,1rem)] tracking-[-0.01em] [text-shadow:0_1px_14px_rgba(0,0,0,0.95)]"
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
        className="absolute bottom-5 left-5 z-30 grid size-[47px] place-items-center rounded-full bg-[#1f1f1f] text-white transition-colors hover:bg-[#2c2c2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <SoundIcon className="size-[18px]" aria-hidden="true" />
      </button>

      {/* Moodboard: the current scene's palette */}
      {boardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={UI.moodboard}
          className="absolute inset-0 z-40 grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setBoardOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b10] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-2xl font-medium">{UI.moodboard}</h3>
              <button
                type="button"
                autoFocus
                onClick={() => setBoardOpen(false)}
                aria-label={UI.moodboardClose}
                className="grid size-8 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mb-4 font-label text-xs uppercase tracking-[0.14em] text-white/50">
              {SCENES[current].title}
            </p>
            <ul className="grid grid-cols-3 gap-4 font-label text-xs">
              {SCENES[current].swatches.map((s) => (
                <li key={`${s.name}-${s.value}`} className="flex flex-col gap-2">
                  <span
                    className="block aspect-square rounded-full border border-white/20"
                    style={{ backgroundColor: s.value }}
                  />
                  <span>{s.name}</span>
                  <span className="uppercase text-white/50">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Consultation form: rendered here, outside the scenes, so their transforms can't clip it. */}
      <ConsultationModal open={consultOpen} onClose={closeConsultation} minDate={minDate} />
    </main>
  );
}
