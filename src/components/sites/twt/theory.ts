import { whatsapp } from "./content";
import {
  QUIZ_STEPS,
  STEP_IDS,
  THEMES,
  THEME_IDS,
  type QuizStep,
  type StepId,
  type ThemeId,
} from "./theory-content";

/**
 * The quiz's logic: scoring, and turning answers into an address, a message and a pre-filled
 * enquiry. Plain functions with no React in them, so the quiz page, the result pages and the contact
 * form can all share them. The content they work on is in theory-content.ts.
 */

export type Answers = Partial<Record<StepId, string>>;

/** The short query-string key each question's answer travels under: /theory/<result>?e=wedding&r=hall */
const PARAM_KEYS: Record<StepId, string> = {
  event: "e",
  room: "r",
  light: "l",
  florals: "f",
  palette: "p",
  guests: "g",
};

/** The query-string key that carries the result itself, used on the enquiry form's address. */
export const THEME_PARAM = "t";

const stepById = (id: StepId): QuizStep => QUIZ_STEPS.find((step) => step.id === id) as QuizStep;

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);

/** The theory that fits the answers best. A tie goes to the room answer's theory, then to the order of THEME_IDS. */
export function scoreTheme(answers: Answers): ThemeId {
  const totals = Object.fromEntries(THEME_IDS.map((id) => [id, 0])) as Record<ThemeId, number>;
  for (const step of QUIZ_STEPS) {
    const option = step.options.find((candidate) => candidate.id === answers[step.id]);
    for (const [id, points] of Object.entries(option?.scores ?? {}))
      totals[id as ThemeId] += points;
  }

  const roomPick = stepById("room").options.find((o) => o.id === answers.room);
  const roomTheme = THEME_IDS.find((id) => roomPick?.scores?.[id]);

  return [...THEME_IDS].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a];
    if (a === roomTheme) return -1;
    if (b === roomTheme) return 1;
    return THEME_IDS.indexOf(a) - THEME_IDS.indexOf(b);
  })[0];
}

export function answersToParams(answers: Answers): URLSearchParams {
  const params = new URLSearchParams();
  for (const id of STEP_IDS) {
    const value = answers[id];
    if (value) params.set(PARAM_KEYS[id], value);
  }
  return params;
}

/** Reads answers back from an address. Anything that is not a real option is ignored, never trusted. */
export function paramsToAnswers(params: { get(key: string): string | null }): Answers {
  const answers: Answers = {};
  for (const step of QUIZ_STEPS) {
    const value = params.get(PARAM_KEYS[step.id]);
    if (value && step.options.some((option) => option.id === value)) answers[step.id] = value;
  }
  return answers;
}

const labelOf = (step: QuizStep, answerId: string | undefined) =>
  step.options.find((option) => option.id === answerId)?.label;

/** "Room: A candlelit hall" and so on, for each question that was answered, in the quiz's order. */
export function describeAnswers(answers: Answers, skip: StepId[] = []): string[] {
  return QUIZ_STEPS.filter((step) => !skip.includes(step.id)).flatMap((step) => {
    const label = labelOf(step, answers[step.id]);
    return label ? [`${step.summary}: ${label}`] : [];
  });
}

/** The WhatsApp message a result sends: who they are, what they got and what they chose. */
export function theoryMessage(themeId: ThemeId, answers: Answers): string {
  const lines = describeAnswers(answers);
  return [
    `Hello The Wed Theory, I took your Wed Theory quiz and my result is ${THEMES[themeId].name}.`,
    ...(lines.length ? ["", ...lines] : []),
    "",
    "I’d love to talk about planning this.",
  ].join("\n");
}

export const theoryWhatsappLink = (themeId: ThemeId, answers: Answers) =>
  whatsapp(theoryMessage(themeId, answers));

/** The enquiry form's address with the result and answers attached, so the form can pre-fill itself. */
export function contactLink(themeId: ThemeId, answers: Answers): string {
  const params = answersToParams(answers);
  params.set(THEME_PARAM, themeId);
  return `/contact?${params.toString()}#enquire`;
}

export interface TheoryPrefill {
  themeId: ThemeId;
  /** The result's name, for the note above the form. */
  themeName: string;
  /** The label of the form's event type option, when the visitor said what they are celebrating. */
  eventType?: string;
  /** Text for the form's "anything else" box. */
  details: string;
}

/** What the enquiry form should pre-fill from its address (a query string), or nothing. */
export function readTheoryPrefill(search: string): TheoryPrefill | undefined {
  const params = new URLSearchParams(search);
  const themeId = params.get(THEME_PARAM);
  if (!isThemeId(themeId)) return undefined;

  const answers = paramsToAnswers(params);
  const lines = describeAnswers(answers, ["event"]);
  return {
    themeId,
    themeName: THEMES[themeId].name,
    eventType: labelOf(stepById("event"), answers.event),
    details: [`My Wed Theory: ${THEMES[themeId].name}`, ...lines].join("\n"),
  };
}
