"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  LazyMotion,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InteractiveCardStack: a pile of cards you can drag aside (or tap, or step through with the keys)
 * to bring the next one forward.
 *
 * - The FIRST card in `cards` starts on top. Sending a card "to the back" slides it under the others
 *   and the next card comes forward. After the last card the pile starts over.
 * - Drag the top card further than `sensitivity` pixels in any direction (sideways only on a touch
 *   screen, so the page can still scroll) and it goes to the back; a shorter drag springs it home.
 * - The pile fills its parent, so size the parent (for example `w-80 h-[450px]`). The previous / next
 *   buttons sit in the bottom 44px of that space, under a 20px gap.
 * - Keyboard: focus the pile, then the arrow keys, Enter or Space step through the cards. Cards other
 *   than the top one are hidden from screen readers and cannot be focused.
 * - Autoplay pauses on hover (if `pauseOnHover`), while focus is inside, while dragging, while the pile
 *   is off screen, and for visitors who prefer reduced motion (who also get no tilt or spring). When it
 *   is on, a pause button is shown.
 * - The animation code (framer-motion's drag and tap features) is loaded after the page, not with it.
 */
export interface InteractiveCardStackProps {
  /** The cards: any React nodes. The first one starts on top. */
  cards: ReactNode[];
  /** Tilt each card a little by its own amount, for a looser pile. */
  randomRotation?: boolean;
  /** How far, in pixels, a card must be dragged to go to the back. */
  sensitivity?: number;
  /** Clicking or tapping the top card sends it to the back. */
  sendToBackOnClick?: boolean;
  /** Cycle through the cards by themselves. */
  autoplay?: boolean;
  /** Milliseconds between automatic moves. */
  autoplayDelay?: number;
  /** Pause autoplay while a mouse is over the pile. */
  pauseOnHover?: boolean;
  /** The spring the cards settle with. */
  animationConfig?: { stiffness: number; damping: number };
  /** On a touch screen, turn dragging off: a tap on the top card cycles instead. */
  mobileClickOnly?: boolean;
  /** What a screen reader calls the pile. */
  label?: string;
  /** Show the previous / next (and pause) buttons under the pile. */
  showControls?: boolean;
  className?: string;
  /** Classes for each card's frame; the default is a rounded, bordered, shadowed card. */
  cardClassName?: string;
}

const loadFeatures = () => import("./card-stack-features").then((module) => module.default);

/** Cards deeper than this in the pile are drawn like the last visible one, then hidden. */
const VISIBLE_DEPTH = 4;

const subscribeCoarsePointer = (onChange: () => void) => {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;

/** A steady pseudo-random number between -1 and 1 for a card, so server and browser agree. */
function jitter(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

/** The pile as card numbers from the back to the front, with card 0 in front. */
const initialOrder = (count: number) => Array.from({ length: count }, (_, i) => count - 1 - i);

type StackCardProps = {
  depth: number;
  zIndex: number;
  isTop: boolean;
  dragAxis: "x" | true | false;
  sensitivity: number;
  spring: { stiffness: number; damping: number };
  rotation: number;
  reduceMotion: boolean;
  clickToCycle: boolean;
  cardClassName?: string;
  onSendToBack: () => void;
  onDragging: (dragging: boolean) => void;
  children: ReactNode;
};

function StackCard({
  depth,
  zIndex,
  isTop,
  dragAxis,
  sensitivity,
  spring,
  rotation,
  reduceMotion,
  clickToCycle,
  cardClassName,
  onSendToBack,
  onDragging,
  children,
}: StackCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // A drag ends with a release over the same card, which the tap detector would also count.
  const wasDragged = useRef(false);
  const tiltX = useTransform(y, [-100, 100], [40, -40]);
  const tiltY = useTransform(x, [-100, 100], [-40, 40]);
  const shown = Math.min(depth, VISIBLE_DEPTH);
  const draggable = isTop && dragAxis !== false;

  function handleDragEnd(_event: unknown, info: PanInfo) {
    onDragging(false);
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    }
  }

  return (
    <m.div
      // Only the top card can be reached, read or grabbed.
      inert={!isTop}
      aria-hidden={isTop ? undefined : true}
      className={cn("absolute inset-0", !isTop && "pointer-events-none")}
      style={{
        x,
        y,
        rotateX: reduceMotion ? 0 : tiltX,
        rotateY: reduceMotion ? 0 : tiltY,
        transformPerspective: 900,
        zIndex,
        cursor: draggable ? "grab" : clickToCycle && isTop ? "pointer" : "default",
        // Lets the page still scroll vertically when the cards only move sideways.
        touchAction: dragAxis === "x" ? "pan-y" : dragAxis === true ? "none" : undefined,
      }}
      drag={draggable ? dragAxis : false}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileDrag={{ cursor: "grabbing" }}
      onTapStart={() => {
        wasDragged.current = false;
      }}
      onDragStart={() => {
        wasDragged.current = true;
        onDragging(true);
      }}
      onDragEnd={handleDragEnd}
      onTap={
        isTop && clickToCycle
          ? () => {
              if (!wasDragged.current) onSendToBack();
            }
          : undefined
      }
      // A picture inside must not start the browser's own drag-and-drop.
      onDragStartCapture={(event) => event.preventDefault()}
    >
      <m.div
        initial={false}
        animate={{
          rotateZ: shown * 4 + rotation,
          scale: 1 - shown * 0.05,
          opacity: depth > VISIBLE_DEPTH ? 0 : 1,
        }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", ...spring }}
        style={{ transformOrigin: "90% 90%" }}
        className={cn(
          "size-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl select-none",
          cardClassName,
        )}
      >
        {children}
      </m.div>
    </m.div>
  );
}

export function InteractiveCardStack({
  cards,
  randomRotation = false,
  sensitivity = 180,
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  animationConfig = { stiffness: 260, damping: 20 },
  mobileClickOnly = false,
  label = "Card stack",
  showControls = true,
  className,
  cardClassName,
}: InteractiveCardStackProps) {
  const count = cards.length;
  const reduceMotion = useReducedMotion() ?? false;
  const coarse = useSyncExternalStore(subscribeCoarsePointer, isCoarsePointer, () => false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const [order, setOrder] = useState(() => initialOrder(count));
  const [hovering, setHovering] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // If the number of cards changes, start the pile over rather than show a stale order.
  const current = order.length === count ? order : initialOrder(count);
  const topIndex = current[count - 1];

  const sendToBack = useCallback(
    (index: number) => {
      setOrder((previous) => {
        const base = previous.length === count ? previous : initialOrder(count);
        return [index, ...base.filter((candidate) => candidate !== index)];
      });
    },
    [count],
  );

  const next = useCallback(() => {
    setOrder((previous) => {
      const base = previous.length === count ? previous : initialOrder(count);
      return count < 2 ? base : [base[count - 1], ...base.slice(0, -1)];
    });
  }, [count]);

  const previous = useCallback(() => {
    setOrder((previousOrder) => {
      const base = previousOrder.length === count ? previousOrder : initialOrder(count);
      return count < 2 ? base : [...base.slice(1), base[0]];
    });
  }, [count]);

  const running =
    autoplay &&
    count > 1 &&
    inView &&
    !reduceMotion &&
    !userPaused &&
    !dragging &&
    !focusInside &&
    !(pauseOnHover && hovering);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(next, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [running, autoplayDelay, next]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Only when the pile itself has focus, so keys inside a card (a link, a button) keep working.
    if (event.target !== event.currentTarget) return;
    if (["ArrowRight", "ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      next();
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      previous();
    }
  }

  if (count === 0) return null;

  const dragEnabled = !(mobileClickOnly && coarse);
  const dragAxis = dragEnabled ? (coarse ? "x" : true) : false;
  const clickToCycle = sendToBackOnClick || (mobileClickOnly && coarse);
  const controlButton =
    "inline-flex size-11 items-center justify-center text-ink-soft transition-colors duration-300 outline-none hover:text-ink focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-forest/50";

  return (
    <LazyMotion features={loadFeatures} strict>
      <div
        ref={rootRef}
        className={cn("flex size-full flex-col gap-5", className)}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        // Only keyboard focus pauses autoplay: after a mouse click on a button, focus stays on it.
        onFocus={(event) => setFocusInside(event.target.matches(":focus-visible"))}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
        }}
      >
        <div
          role="group"
          aria-roledescription="card stack"
          aria-label={label}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative min-h-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-8 focus-visible:ring-offset-ivory"
        >
          {cards.map((card, index) => {
            const depth = count - 1 - current.indexOf(index);
            return (
              <StackCard
                key={index}
                depth={depth}
                zIndex={count - depth}
                isTop={index === topIndex}
                dragAxis={dragAxis}
                sensitivity={sensitivity}
                spring={animationConfig}
                rotation={randomRotation ? jitter(index) * 5 : 0}
                reduceMotion={reduceMotion}
                clickToCycle={clickToCycle}
                cardClassName={cardClassName}
                onSendToBack={() => sendToBack(index)}
                onDragging={setDragging}
              >
                {card}
              </StackCard>
            );
          })}
        </div>

        <p aria-live="polite" className="sr-only">
          {`Card ${topIndex + 1} of ${count}`}
        </p>

        {showControls && count > 1 && (
          <div className="flex h-11 shrink-0 items-center justify-center gap-3">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous card"
              className={controlButton}
            >
              <ChevronLeft className="size-5" strokeWidth={1.3} aria-hidden="true" />
            </button>
            <span
              aria-hidden="true"
              className="min-w-14 text-center text-[12px] leading-none tracking-[0.2em] text-ink-soft tabular-nums"
            >
              {topIndex + 1} / {count}
            </span>
            <button type="button" onClick={next} aria-label="Next card" className={controlButton}>
              <ChevronRight className="size-5" strokeWidth={1.3} aria-hidden="true" />
            </button>
            {autoplay && (
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={userPaused ? "Start cycling automatically" : "Pause automatic cycling"}
                className={cn(controlButton, "ml-2")}
              >
                {userPaused ? (
                  <Play className="size-4" strokeWidth={1.3} aria-hidden="true" />
                ) : (
                  <Pause className="size-4" strokeWidth={1.3} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </LazyMotion>
  );
}
