/**
 * "FIND YOUR WED THEORY": everything the quiz and its four results say and show.
 *
 * A visitor answers six questions. Four of them (the room, the light, the florals, the palette) shape
 * the result: each answer gives points to one or more of the four theories below, and the theory with
 * the most points wins (a tie goes to the theory the room answer points to, then to the order of
 * THEME_IDS). The other two (the kind of celebration, the number of guests) do not change the result;
 * they go into the brief that is sent to the studio.
 *
 * To reword or add a question, edit QUIZ_STEPS. To add a result, add an id to THEME_IDS and an entry to
 * THEMES, then give some answers points for it. If a result's name, tagline, palette or photo changes,
 * re-run scripts/generate-brand-assets.py so its share card matches.
 */

export const THEME_IDS = [
  "candlelit-classic",
  "serene-romantic",
  "garden-in-bloom",
  "radiant-evening",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const STEP_IDS = ["event", "room", "light", "florals", "palette", "guests"] as const;
export type StepId = (typeof STEP_IDS)[number];

export type Photo = { src: string; alt: string; focus: string };

export interface QuizOption {
  /** Short and URL-safe: it travels in the result page's address. */
  id: string;
  label: string;
  /** A line under the label, for list-style questions. */
  hint?: string;
  /** A picture, for photo-style questions. */
  photo?: Photo;
  /** Points this answer gives each theory. Questions that do not shape the look have none. */
  scores?: Partial<Record<ThemeId, number>>;
}

export interface QuizStep {
  id: StepId;
  /** The question. */
  title: string;
  help?: string;
  /** How the options look: big photo cards, or text cards. */
  layout: "photos" | "list";
  /** The short name this answer goes by in the message and the enquiry form. */
  summary: string;
  options: readonly QuizOption[];
}

export const THEORY = {
  eyebrow: "Find your Wed Theory",
  headline: ["Six questions.", "One theory."],
  intro:
    "Tell us what feels like you. We’ll show you the look, light and florals that fit, then turn your answers into a brief you can send us in one tap.",
  progress: (current: number, total: number) => `Question ${current} of ${total}`,
  back: "Back",
  next: "Next",
  finish: "See my theory",
  /** Shown while the result page opens. */
  opening: "Opening your theory…",
} as const;

export const QUIZ_STEPS: readonly QuizStep[] = [
  {
    id: "event",
    title: "What are we celebrating?",
    layout: "list",
    summary: "Event",
    // These labels must match the options of the enquiry form (ENQUIRY.eventTypes in src/config/business.ts).
    options: [
      { id: "wedding", label: "Wedding", hint: "Your big day, or the days around it" },
      { id: "birthday", label: "Birthday", hint: "A first, a milestone or a surprise" },
      {
        id: "social",
        label: "Social event",
        hint: "Engagements, anniversaries, showers and gatherings",
      },
      {
        id: "corporate",
        label: "Corporate event",
        hint: "Launches, dinners, galas and conferences",
      },
      { id: "other", label: "Something else", hint: "Tell us more when we talk" },
    ],
  },
  {
    id: "room",
    title: "Which room feels like yours?",
    help: "Go with your first instinct.",
    layout: "photos",
    summary: "Room",
    options: [
      {
        id: "hall",
        label: "A candlelit hall",
        photo: {
          src: "/images/custom-table.jpg",
          alt: "A long candlelit table with tall tapers, white roses and gold-rimmed plates",
          focus: "66% 58%",
        },
        scores: { "candlelit-classic": 3 },
      },
      {
        id: "silk",
        label: "Silk and soft daylight",
        photo: {
          src: "/images/hero-drapes.jpg",
          alt: "Sheer ivory silk drapery falling in soft daylight",
          focus: "18% 40%",
        },
        scores: { "serene-romantic": 3 },
      },
      {
        id: "garden",
        label: "A garden in bloom",
        photo: {
          src: "/images/floral-architecture.jpg",
          alt: "A hanging cloud of white roses and greenery above candlelit tables",
          focus: "50% 35%",
        },
        scores: { "garden-in-bloom": 3 },
      },
      {
        id: "ballroom",
        label: "A glittering ballroom",
        photo: {
          src: "/images/lighting-ambience.jpg",
          alt: "A crystal chandelier and a canopy of fairy lights above banquet tables",
          focus: "50% 25%",
        },
        scores: { "radiant-evening": 3 },
      },
    ],
  },
  {
    id: "light",
    title: "How should the light feel?",
    layout: "list",
    summary: "Light",
    options: [
      {
        id: "candle",
        label: "Warm candle glow",
        hint: "Low, golden and flattering",
        scores: { "candlelit-classic": 2, "radiant-evening": 1 },
      },
      {
        id: "day",
        label: "Soft and natural",
        hint: "Daylight, diffused through silk",
        scores: { "serene-romantic": 2, "garden-in-bloom": 1 },
      },
      {
        id: "sparkle",
        label: "A canopy of sparkle",
        hint: "Fairy lights, crystal and shimmer",
        scores: { "radiant-evening": 2, "candlelit-classic": 1 },
      },
      {
        id: "dusk",
        label: "Golden, like a garden at dusk",
        hint: "Dappled, warm and a little wild",
        scores: { "garden-in-bloom": 2, "candlelit-classic": 1 },
      },
    ],
  },
  {
    id: "florals",
    title: "And the flowers?",
    layout: "list",
    summary: "Florals",
    options: [
      {
        id: "lush",
        label: "Lush and overflowing",
        hint: "Arches, cascades and clouds of blooms",
        scores: { "garden-in-bloom": 2, "candlelit-classic": 1 },
      },
      {
        id: "soft",
        label: "Soft and sparse",
        hint: "A few perfect stems, lots of air",
        scores: { "serene-romantic": 2 },
      },
      {
        id: "garden",
        label: "Loose garden roses",
        hint: "Gathered, romantic and natural",
        scores: { "candlelit-classic": 2, "garden-in-bloom": 1 },
      },
      {
        id: "sculpt",
        label: "Bold and sculptural",
        hint: "Statement pieces that frame the room",
        scores: { "radiant-evening": 2, "garden-in-bloom": 1 },
      },
    ],
  },
  {
    id: "palette",
    title: "Pick a palette.",
    layout: "list",
    summary: "Palette",
    options: [
      {
        id: "gold",
        label: "Ivory and antique gold",
        hint: "Warm, classic and rich",
        scores: { "candlelit-classic": 2, "radiant-evening": 1 },
      },
      {
        id: "pearl",
        label: "Cream and pearl",
        hint: "Quiet, pale and luminous",
        scores: { "serene-romantic": 2 },
      },
      {
        id: "sage",
        label: "Sage and rose white",
        hint: "Fresh, leafy and natural",
        scores: { "garden-in-bloom": 2, "serene-romantic": 1 },
      },
      {
        id: "champagne",
        label: "Champagne and crystal",
        hint: "Glowing, glamorous and bright",
        scores: { "radiant-evening": 2, "candlelit-classic": 1 },
      },
    ],
  },
  {
    id: "guests",
    title: "How many guests?",
    help: "A rough idea is plenty.",
    layout: "list",
    summary: "Guests",
    options: [
      { id: "s", label: "Up to 50", hint: "Intimate" },
      { id: "m", label: "50 to 150", hint: "A warm gathering" },
      { id: "l", label: "150 to 400", hint: "A grand celebration" },
      { id: "xl", label: "400 or more", hint: "A very large celebration" },
    ],
  },
];

export interface Theme {
  id: ThemeId;
  /** The result's name, as a sentence. */
  name: string;
  /** The same name over two lines, for the big heading. */
  title: readonly [string, string];
  tagline: string;
  /** Two sentences about the look. */
  theory: string;
  palette: readonly { name: string; hex: string }[];
  /** The four things this theory is made of. */
  elements: readonly { label: string; text: string }[];
  photo: Photo;
  /** Three close-ups that suit the theory (from public/images/details). */
  details: readonly Photo[];
  /** The share card, made by scripts/generate-brand-assets.py. */
  card: { src: string; alt: string };
}

export const THEMES: Record<ThemeId, Theme> = {
  "candlelit-classic": {
    id: "candlelit-classic",
    name: "The Candlelit Classic",
    title: ["The Candlelit", "Classic."],
    tagline: "Warm, timeless and unhurried.",
    theory:
      "Your celebration glows. Tall tapers in glass, ivory linen, garden roses and gilded rims, all lit low and warm, so the room feels like a held breath and every face looks its best.",
    palette: [
      { name: "Candlelight ivory", hex: "#f3e8d2" },
      { name: "Champagne", hex: "#e3cfa5" },
      { name: "Antique gold", hex: "#b48a45" },
      { name: "Umber", hex: "#3b2b1c" },
    ],
    elements: [
      { label: "Lighting", text: "Tapers in glass and candelabras, lit low and warm" },
      { label: "Florals", text: "Garden roses and baby’s breath, loosely gathered" },
      { label: "Table", text: "Long banquet tables in ivory linen with gold-rimmed plates" },
      { label: "Entrance", text: "A candlelit aisle that ends in a warm glow" },
    ],
    photo: {
      src: "/images/custom-table.jpg",
      alt: "A long candlelit table with tall tapers, white roses and gold-rimmed plates",
      focus: "66% 58%",
    },
    details: [
      {
        src: "/images/details/taper-and-roses.jpg",
        alt: "A tall taper candle in glass beside a centrepiece of garden roses",
        focus: "50% 50%",
      },
      {
        src: "/images/details/candelabra.jpg",
        alt: "A tall brass candelabra with lit tapers beside a long candlelit table",
        focus: "50% 50%",
      },
      {
        src: "/images/details/place-setting.jpg",
        alt: "A gold-rimmed plate with a folded napkin and gold cutlery on ivory linen",
        focus: "50% 50%",
      },
    ],
    card: {
      src: "/share/candlelit-classic.jpg",
      alt: "My Wed Theory is The Candlelit Classic: warm, timeless and unhurried",
    },
  },
  "serene-romantic": {
    id: "serene-romantic",
    name: "The Serene Romantic",
    title: ["The Serene", "Romantic."],
    tagline: "Soft, airy and effortless.",
    theory:
      "Daylight through silk. Sheer ivory drapery, a few perfect blooms and room to breathe, so nothing competes with the people in the room and the whole day feels easy.",
    palette: [
      { name: "Silk ivory", hex: "#f4eee2" },
      { name: "Pearl", hex: "#e6dfcf" },
      { name: "Sage mist", hex: "#bfc6ae" },
      { name: "Soft stone", hex: "#cbc2af" },
    ],
    elements: [
      { label: "Lighting", text: "Natural light and a soft, diffused glow" },
      { label: "Florals", text: "A few perfect blooms and trailing greenery" },
      { label: "Backdrop", text: "Floor-length sheer drapery" },
      { label: "Table", text: "Fine linen and simple, low settings" },
    ],
    photo: {
      src: "/images/hero-drapes.jpg",
      alt: "Sheer ivory silk drapery falling in soft daylight",
      focus: "18% 40%",
    },
    details: [
      {
        src: "/images/details/sheer-drapery.jpg",
        alt: "Soft folds of sheer ivory silk falling in warm light",
        focus: "50% 50%",
      },
      {
        src: "/images/details/arch-garland.jpg",
        alt: "A garland of white roses over an archway with silk drapes",
        focus: "50% 50%",
      },
      {
        src: "/images/details/aisle-blooms.jpg",
        alt: "White roses and baby’s breath beside a lit taper in a tall glass",
        focus: "50% 50%",
      },
    ],
    card: {
      src: "/share/serene-romantic.jpg",
      alt: "My Wed Theory is The Serene Romantic: soft, airy and effortless",
    },
  },
  "garden-in-bloom": {
    id: "garden-in-bloom",
    name: "The Garden in Bloom",
    title: ["The Garden", "in Bloom."],
    tagline: "Lush, abundant and alive.",
    theory:
      "Arches of white roses, cascades from above and greenery wherever you look. Your venue becomes a garden that was always there, and every corner is worth a photograph.",
    palette: [
      { name: "Rose white", hex: "#f6f1e6" },
      { name: "Cream", hex: "#ece3d0" },
      { name: "Sage leaf", hex: "#93a082" },
      { name: "Eucalyptus", hex: "#5f7260" },
    ],
    elements: [
      { label: "Florals", text: "Hanging cascades and clouds of white roses" },
      { label: "Backdrop", text: "A sculpted floral arch against soft drapery" },
      { label: "Entrance", text: "An aisle lined with blooms and baby’s breath" },
      { label: "Table", text: "Low, lush garden centrepieces" },
    ],
    photo: {
      src: "/images/floral-architecture.jpg",
      alt: "A hanging cloud of white roses and greenery above candlelit tables",
      focus: "50% 35%",
    },
    details: [
      {
        src: "/images/details/floral-cascade.jpg",
        alt: "A hanging cloud of white roses, baby’s breath and sage foliage",
        focus: "50% 50%",
      },
      {
        src: "/images/details/floral-arch.jpg",
        alt: "The side of a tall arch covered in white roses and greenery",
        focus: "50% 50%",
      },
      {
        src: "/images/details/aisle-blooms.jpg",
        alt: "White roses and baby’s breath beside a lit taper in a tall glass",
        focus: "50% 50%",
      },
    ],
    card: {
      src: "/share/garden-in-bloom.jpg",
      alt: "My Wed Theory is The Garden in Bloom: lush, abundant and alive",
    },
  },
  "radiant-evening": {
    id: "radiant-evening",
    name: "The Radiant Evening",
    title: ["The Radiant", "Evening."],
    tagline: "Grand, glittering and unforgettable.",
    theory:
      "Crystal, candelabras and a canopy of light. Your night is staged like an occasion, warm and dazzling from the first step to the last dance.",
    palette: [
      { name: "Champagne", hex: "#e6d4aa" },
      { name: "Burnished gold", hex: "#b8923f" },
      { name: "Crystal", hex: "#f4efe3" },
      { name: "Midnight umber", hex: "#1f160d" },
    ],
    elements: [
      { label: "Lighting", text: "Chandeliers and a canopy of fairy lights" },
      { label: "Table", text: "Candelabras along long banquet tables" },
      { label: "Backdrop", text: "A shimmering wall of light" },
      { label: "Entrance", text: "A glowing doorway that frames your arrival" },
    ],
    photo: {
      src: "/images/lighting-ambience.jpg",
      alt: "A crystal chandelier and a canopy of fairy lights above banquet tables",
      focus: "50% 25%",
    },
    details: [
      {
        src: "/images/details/chandelier.jpg",
        alt: "A crystal chandelier with lit candles beneath a canopy of fairy lights",
        focus: "50% 50%",
      },
      {
        src: "/images/details/candelabra.jpg",
        alt: "A tall brass candelabra with lit tapers beside a long candlelit table",
        focus: "50% 50%",
      },
      {
        src: "/images/details/arch-garland.jpg",
        alt: "A garland of white roses over an archway with a glow of fairy lights beyond",
        focus: "50% 50%",
      },
    ],
    card: {
      src: "/share/radiant-evening.jpg",
      alt: "My Wed Theory is The Radiant Evening: grand, glittering and unforgettable",
    },
  },
};

/** The page that introduces the quiz, and the banner that points to it. */
export const THEORY_PAGE = {
  path: "/theory",
  title: "Find your Wed Theory",
  description:
    "Six quick questions about the room, the light, the flowers and the palette. Discover your Wed Theory and send us a brief in one tap.",
  card: { src: "/share/quiz.jpg", alt: "Find your Wed Theory: six questions, one theory" },
  banner: {
    kicker: "Find your Wed Theory",
    title: "Which of these is yours?",
    body: "Answer six quick questions and discover the look, light and florals that fit your celebration, then send us the brief in one tap.",
    button: "Take the quiz",
    themesLabel: "The four theories",
  },
  /** On the contact page, under the ways to reach us. */
  contactNote: {
    kicker: "Not sure where to start?",
    body: "Answer six quick questions and we’ll show you the look that fits. Your answers come with you to this form.",
    link: "Find your Wed Theory",
  },
  /** On a result page. */
  result: {
    eyebrow: "Your Wed Theory",
    theoryKicker: "The theory",
    paletteKicker: "Palette",
    elementsKicker: "Made of",
    detailsKicker: "In detail",
    othersKicker: "The other theories",
    actions: {
      kicker: "Make it yours",
      title: "Plan this with us",
      body: "We’ll turn your theory into a plan. Your answers are already in the message, so you can send it as it is.",
      whatsapp: "Plan this on WhatsApp",
      form: "Or use the enquiry form",
      share: "Share my theory",
      shareWhatsapp: "Share on WhatsApp",
      copy: "Copy link",
      copied: "Link copied",
      copyFailed: "Couldn’t copy the link. You can copy it from your address bar.",
      retake: "Take the quiz again",
    },
  },
} as const;
