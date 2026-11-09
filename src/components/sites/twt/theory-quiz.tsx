"use client";

import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { answersToParams, scoreTheme, type Answers } from "./theory";
import { QUIZ_STEPS, THEORY, type QuizOption, type QuizStep } from "./theory-content";

/** How long a chosen card stays in view before the quiz moves on, so the choice is seen. */
const ADVANCE_MS = 260;

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const ring =
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ivory";

type OptionProps = {
  step: QuizStep;
  option: QuizOption;
  checked: boolean;
  onChoose: (event: ChangeEvent<HTMLInputElement>) => void;
  onPick: (event: MouseEvent<HTMLInputElement>) => void;
};

function Radio({ step, option, checked, onChoose, onPick }: OptionProps) {
  return (
    <input
      type="radio"
      name={`quiz-${step.id}`}
      value={option.id}
      checked={checked}
      onChange={onChoose}
      onClick={onPick}
      className="peer sr-only"
    />
  );
}

/** A big photo with its name underneath: the way to answer a question about how a room feels. */
function PhotoOption(props: OptionProps) {
  const { option, checked } = props;
  return (
    <label
      className={cn(
        "group relative block cursor-pointer overflow-hidden border bg-cream/40 transition-colors duration-300 can-hover:hover:border-ink-soft",
        checked ? "border-forest" : "border-line",
        ring,
      )}
    >
      <Radio {...props} />
      <span className="relative block aspect-[5/4] overflow-hidden bg-cream">
        {option.photo && (
          <Image
            src={option.photo.src}
            alt={option.photo.alt}
            fill
            sizes="(min-width: 1024px) 22vw, 46vw"
            style={{ objectPosition: option.photo.focus }}
            className="object-cover transition-transform duration-700 ease-out can-hover:group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        )}
      </span>
      <span className="flex items-center justify-between gap-3 px-3.5 py-3.5 text-[17px] leading-[1.2] text-ink sm:px-4">
        {option.label}
        <Check
          className={cn(
            "size-4 shrink-0 text-forest transition-opacity duration-300",
            checked ? "opacity-100" : "opacity-0",
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
    </label>
  );
}

/** A line of text with a small hint under it, for questions with no picture to show. */
function ListOption(props: OptionProps) {
  const { option, checked } = props;
  return (
    <label
      className={cn(
        "relative flex min-h-[4.25rem] cursor-pointer items-center gap-4 border bg-cream/40 px-4 py-3.5 transition-colors duration-300 can-hover:hover:border-ink-soft sm:px-5",
        checked ? "border-forest bg-cream" : "border-line",
        ring,
      )}
    >
      <Radio {...props} />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors duration-300",
          checked ? "border-forest" : "border-ink-soft/60",
        )}
      >
        <span
          className={cn(
            "size-2 rounded-full bg-forest transition-transform duration-300",
            checked ? "scale-100" : "scale-0",
          )}
        />
      </span>
      <span className="block">
        <span className="block text-[18px] leading-[1.2] text-ink">{option.label}</span>
        {option.hint && (
          <span className="mt-1 block text-[14.5px] leading-[1.3] text-ink-soft">
            {option.hint}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * The quiz: one question at a time, six in all. Choosing a card with a mouse or finger moves on after
 * a moment; with the keyboard, arrow keys change the choice and Next moves on. At the end the answers
 * are scored and the visitor lands on their result, with the answers in the address so the result's
 * buttons can carry them into a message or the enquiry form.
 */
export function TheoryQuiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [missing, setMissing] = useState(false);
  const [opening, setOpening] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Set once the visitor has moved between questions, so the first one does not steal focus on load. */
  const moved = useRef(false);

  const step = QUIZ_STEPS[index];
  const isLast = index === QUIZ_STEPS.length - 1;
  const chosen = answers[step.id];

  // After each move, bring the whole question into view (its choices sit below the heading, and the
  // page above is tall) and put keyboard and screen reader focus on its heading.
  useEffect(() => {
    if (!moved.current) return;
    sectionRef.current?.scrollIntoView({ block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  function goTo(next: number) {
    clearTimeout(advanceTimer.current);
    moved.current = true;
    setMissing(false);
    setIndex(next);
  }

  function finish(final: Answers) {
    setOpening(true);
    const params = answersToParams(final);
    router.push(`/theory/${scoreTheme(final)}?${params.toString()}`);
  }

  function choose(event: ChangeEvent<HTMLInputElement>) {
    setAnswers((current) => ({ ...current, [step.id]: event.target.value }));
    setMissing(false);
  }

  /**
   * A mouse or finger moves on by itself, except from the last question, which has a button of its own.
   * A keyboard "click" (arrow keys, space) has a detail of 0 and never moves on, so people can look around.
   */
  function pick(event: MouseEvent<HTMLInputElement>) {
    if (event.detail === 0 || isLast) return;
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(index + 1), ADVANCE_MS);
  }

  function next() {
    if (!chosen) {
      setMissing(true);
      document.querySelector<HTMLInputElement>(`input[name="quiz-${step.id}"]`)?.focus();
      return;
    }
    if (isLast) finish(answers);
    else goTo(index + 1);
  }

  const Option = step.layout === "photos" ? PhotoOption : ListOption;

  return (
    <section
      ref={sectionRef}
      aria-label={THEORY.eyebrow}
      className="mx-auto max-w-[1760px] scroll-mt-2 border-t border-line px-5 pt-10 pb-14 sm:px-8 lg:px-[6.56vw] lg:pt-14 lg:pb-20"
    >
      <div className="mx-auto max-w-[62rem]">
        <div className="flex items-center justify-between gap-6">
          <p className={kicker} aria-live="polite">
            {THEORY.progress(index + 1, QUIZ_STEPS.length)}
          </p>
          {index > 0 && !opening && (
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="tap-target inline-flex items-center gap-2 text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase transition-colors duration-300 outline-none hover:text-ink focus-visible:text-ink focus-visible:underline focus-visible:underline-offset-4"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.3} aria-hidden="true" />
              {THEORY.back}
            </button>
          )}
        </div>

        <div aria-hidden="true" className="mt-4 flex gap-1.5">
          {QUIZ_STEPS.map((item, position) => (
            <span
              key={item.id}
              className={cn(
                "h-px flex-1 transition-colors duration-500",
                position <= index ? "bg-forest" : "bg-line",
              )}
            />
          ))}
        </div>

        <div key={step.id} className="mt-10 motion-safe:animate-rise lg:mt-14">
          <h2
            id="quiz-question"
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-28 text-[clamp(1.875rem,3.4vw,3.25rem)] leading-[1.1] font-normal text-ink outline-none"
          >
            {step.title}
          </h2>
          {step.help && <p className="mt-3 text-[17px] leading-[1.4] text-ink-soft">{step.help}</p>}

          <div
            role="radiogroup"
            aria-labelledby="quiz-question"
            aria-describedby={missing ? "quiz-missing" : undefined}
            className={cn(
              "mt-8 grid gap-3 sm:gap-4",
              step.layout === "photos" ? "grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2",
            )}
          >
            {step.options.map((option) => (
              <Option
                key={option.id}
                step={step}
                option={option}
                checked={chosen === option.id}
                onChoose={choose}
                onPick={pick}
              />
            ))}
          </div>

          <p
            id="quiz-missing"
            role="alert"
            className={cn("text-[13.5px] leading-[1.3] text-clay", missing && "mt-4")}
          >
            {missing ? "Please choose one to continue." : ""}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-5">
          <button
            type="button"
            onClick={next}
            disabled={opening}
            className="group inline-flex h-[46px] items-center gap-2.5 bg-forest px-[30px] text-[15px] leading-none tracking-[0.02em] text-cream transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-70"
          >
            {opening ? THEORY.opening : isLast ? THEORY.finish : THEORY.next}
            {!opening && (
              <ArrowRight
                className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.3}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
