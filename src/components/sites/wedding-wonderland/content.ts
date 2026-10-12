/**
 * Everything the visitor reads or sees lives in this file: brand, hero copy, UI labels, the five
 * showpiece sections, the finale (founder profile, WhatsApp link and consultation form), their
 * photos and their moodboard palettes. To reskin or translate the site, edit this file only. No
 * component needs to change.
 *
 * PHOTO RULES THAT APPLY TO EVERY SECTION
 * - Each section is a full-bleed background. It is cover-cropped to the screen, so the edges of
 *   the photo will be cut on screens with a different shape than the photo.
 * - While the visitor scrolls, the photo slowly zooms from 1.08x to 1.22x. Export large:
 *   at least 2880 x 1620 px (16:9) so it stays sharp at the maximum zoom. JPG, quality 80-85.
 * - Copy sits in the BOTTOM-LEFT, over a dark gradient. Keep the bottom-left of the photo
 *   calm and not too bright: avoid faces and important detail there.
 * - Keep the subject inside the middle 60% of the width. `focus` (CSS object-position) moves the
 *   crop if the subject is off-centre, e.g. "30% 50%" favours the left of the photo.
 * - Phones are portrait, so a landscape photo is cropped to a narrow slice. For the best result
 *   supply `mobileSrc`: a portrait crop, 3:5, at least 1200 x 2000 px. Delete the `mobileSrc`
 *   line to reuse the landscape photo on phones.
 * - Drop the files in /public/placeholders (or anywhere under /public and update `src`).
 *   `npm run placeholders` creates any labelled placeholder that is missing. It never overwrites a
 *   file that exists, so your real photos are safe; add `-- --force` to regenerate on purpose.
 *
 * FINALE PORTRAIT (FINALE.founder.portrait)
 * - A portrait photo of the founder, not a landscape scene. Phones show `mobileSrc` full-bleed
 *   (3:5, at least 1200 x 2000 px) with the text over its lower half, so keep the head and
 *   shoulders in the upper-middle of the frame and the lower half calm and dark.
 * - Larger screens frame `src` in an arch beside the text (4:5, at least 1600 x 2000 px): keep the
 *   face well inside the arch, away from its curved top corners.
 */

export type Photo = {
  /** Landscape, 16:9, min 2880 x 1620 px. Path under /public. */
  src: string;
  /** Optional portrait crop for phones, 3:5, min 1200 x 2000 px. */
  mobileSrc?: string;
  alt: string;
  /** CSS object-position: where the crop is anchored. "50% 50%" is the centre. */
  focus: string;
  /** Used by the placeholder generator and as a note to yourself. Not shown to visitors. */
  brief: string;
  /**
   * Shape of the placeholder the generator draws for `src`. "landscape" (the default) is the 16:9
   * section background; "portrait" is the 4:5 arch-framed portrait used by the finale.
   */
  desktopShape?: "landscape" | "portrait";
};

export type Swatch = { name: string; value: string };

export type Section = {
  /** URL hash that selects this section (/#grand-entrances). Lowercase, no spaces. */
  id: string;
  /** Small line above the title. */
  kicker: string;
  title: string;
  /** Two or three short sentences. Keep it under ~150 characters so it reads in one glance. */
  body: string;
  photo: Photo;
  /** Palette shown in the moodboard panel while this section is open. */
  swatches: readonly Swatch[];
  /** Changes the shape of the foreground blooms. Any whole number. */
  bloomSeed: number;
};

export const BRAND = {
  name: "Zarish Soirées",
  /** Shown top-centre. Lowercase looks best with the wide letter-spacing. */
  wordmark: "zarish soirées",
} as const;

export const HERO = {
  eyebrow: `${BRAND.name} presents`,
  /** Two display lines. Keep each short enough to fit one line on a phone. */
  headline: ["Step into the", "Extraordinary."],
  tagline: "Your perfect day, reimagined as a masterpiece.",
  /** The button label. */
  enterLabel: "Enter",
  /** Small line under the button (replaces the "Sound on" label). */
  greeting: "Enter the Wonderland",
} as const;

export const UI = {
  scrollCta: "Scroll to explore the magic",
  home: "Home",
  moodboard: "Moodboard",
  moodboardClose: "Close moodboard",
  sectionNavLabel: "Sections",
  soundOn: "Turn sound on",
  soundOff: "Mute sound",
} as const;

/** Whether the original cut-out blooms float over each photo. Set to false for photos only. */
export const FOREGROUND_BLOOMS = true;

export const SECTIONS: readonly Section[] = [
  {
    id: "grand-entrances",
    kicker: "The first hello",
    title: "Grand Entrances",
    body: "Arrive inside a bloom. Archways erupt in colour, walkways glow underfoot, and the first step becomes a procession nobody forgets.",
    photo: {
      // Wide and symmetrical: a vanishing-point aisle or an archway centred in frame.
      // Keep the floor/aisle in the lower third, but leave the bottom-left calm for the text.
      src: "/placeholders/grand-entrance-vibrant.jpg",
      // Portrait crop: archway centred, full height of the arch visible.
      mobileSrc: "/placeholders/grand-entrance-vibrant-mobile.jpg",
      alt: "Vibrant floral archway entrance",
      focus: "50% 55%",
      brief: "Vibrant floral archway + aisle, symmetrical, arch centred",
    },
    swatches: [
      { name: "Peony", value: "#e8457b" },
      { name: "Marigold", value: "#f6a821" },
      { name: "Fern", value: "#2f8f5b" },
      { name: "Blush", value: "#f8c9d4" },
      { name: "Plum", value: "#5a1a4a" },
      { name: "Ivory", value: "#fff4e3" },
    ],
    bloomSeed: 101,
  },
  {
    id: "bespoke-stage-backdrop",
    kicker: "Where every eye lands",
    title: "Bespoke Stage & Backdrop Design",
    body: "We build the focal point from nothing: sculpted arches, mirrored horizons, skies painted just for you. Your vows, spoken inside a work of art.",
    photo: {
      // The stage fills the middle of a wide frame. Leave the top third relatively clear:
      // the header and the section dots sit there.
      src: "/placeholders/bespoke-stage-backdrop.jpg",
      // Portrait crop: the backdrop's centre piece, as tall as possible.
      mobileSrc: "/placeholders/bespoke-stage-backdrop-mobile.jpg",
      alt: "Bespoke wedding stage with a sculptural, colourful backdrop",
      focus: "50% 45%",
      brief: "Custom stage / backdrop, architectural focal point, centred",
    },
    swatches: [
      { name: "Midnight", value: "#14123a" },
      { name: "Gilt", value: "#d9a441" },
      { name: "Rose Quartz", value: "#f2a7b8" },
      { name: "Jade", value: "#1f8a70" },
      { name: "Ember", value: "#e2683f" },
      { name: "Pearl", value: "#f4efe6" },
    ],
    bloomSeed: 202,
  },
  {
    id: "floral-architecture",
    kicker: "Blooms that forgot gravity",
    title: "Floral Architecture",
    body: "Cascades pour from the ceiling. Clouds of petals hang in mid-air. The whole room feels like it is still unfolding.",
    photo: {
      // Tall hanging installations suit a 3:2 frame cropped to 16:9: shoot a little wider than you
      // need, with the installation's lowest point near the vertical centre.
      src: "/placeholders/floral-architecture-hanging.jpg",
      // Portrait crop: this is the section that benefits most. Show the installation top to bottom.
      mobileSrc: "/placeholders/floral-architecture-hanging-mobile.jpg",
      alt: "Hanging floral installation suspended above the aisle",
      focus: "50% 40%",
      brief: "Hanging floral installation, blooms suspended mid-air",
    },
    swatches: [
      { name: "Delphinium", value: "#4d5bd1" },
      { name: "Coral", value: "#ff7a5c" },
      { name: "Lime", value: "#a9d65c" },
      { name: "Orchid", value: "#c35bd1" },
      { name: "Sunbeam", value: "#ffd23f" },
      { name: "Moss", value: "#2f6b3c" },
    ],
    bloomSeed: 303,
  },
  {
    id: "custom-table-settings",
    kicker: "Luxury, up close",
    title: "Custom Table Settings",
    body: "Linen that falls like silk. Centrepieces that burst with colour. Candlelight pooling on gilded rims, a hundred small wonders within reach.",
    photo: {
      // A close, shallow-depth-of-field shot reads best: one table, one centrepiece, candles
      // glowing. Place the centrepiece slightly right of centre so the text has room on the left.
      src: "/placeholders/custom-table-setting.jpg",
      // Portrait crop: the centrepiece in the upper half, the place setting below it.
      mobileSrc: "/placeholders/custom-table-setting-mobile.jpg",
      alt: "Luxury table setting with vibrant centrepiece and glowing candles",
      focus: "60% 50%",
      brief: "Close-up luxury table: linen, centrepiece, candles, glassware",
    },
    swatches: [
      { name: "Burgundy", value: "#7a1f35" },
      { name: "Champagne", value: "#f3dfb6" },
      { name: "Candle", value: "#ffd98a" },
      { name: "Teal", value: "#12766f" },
      { name: "Fuchsia", value: "#d6336c" },
      { name: "Linen", value: "#f7f1e6" },
    ],
    bloomSeed: 404,
  },
  {
    id: "lighting-ambience",
    kicker: "The room, in a mood",
    title: "Lighting & Ambience",
    body: "Fairy-light canopies shimmer overhead. Spotlights carve drama from the dark. Colour washes the night in rose, saffron and midnight blue.",
    photo: {
      // Dark, moody and wide. Light sources can be in the top half: the dark lower part keeps the
      // text readable without any extra darkening.
      src: "/placeholders/lighting-ambience-canopy.jpg",
      // Portrait crop: the canopy of lights across the top two thirds.
      mobileSrc: "/placeholders/lighting-ambience-canopy-mobile.jpg",
      alt: "Fairy-light canopy and colour-washed reception hall",
      focus: "50% 35%",
      brief: "Fairy-light canopy, spotlights, coloured wash over the reception hall",
    },
    swatches: [
      { name: "Dusk", value: "#241a4f" },
      { name: "Saffron", value: "#ffb02e" },
      { name: "Rose", value: "#ff5d8f" },
      { name: "Aqua", value: "#2ec4c6" },
      { name: "Indigo", value: "#3b36c9" },
      { name: "Starlight", value: "#fff6d6" },
    ],
    bloomSeed: 505,
  },
];

/* ---------------------------------------------------------------------------------------------
 * THE FINALE (scene 6): meet the founder, then start the conversation
 * ------------------------------------------------------------------------------------------- */

export type ConsultationField = {
  label: string;
  placeholder: string;
  /** Set to false to make the field optional. */
  required: boolean;
  /** Shown under the field when it is required and empty (or, for guests, not a whole number). */
  error: string;
};

export type Finale = {
  /** URL hash that selects the finale (/#meet-the-founder). Lowercase, no spaces. */
  id: string;
  /** Used by the section dots, screen readers and the moodboard. Not drawn on the page itself. */
  title: string;
  /** Small line above the headline. */
  eyebrow: string;
  headline: string;
  founder: {
    /** Tiny label above the name. */
    label: string;
    name: string;
    role: string;
    /** Two or three sentences. Keep it under ~260 characters so it fits a phone screen. */
    bio: string;
    portrait: Photo;
  };
  whatsapp: {
    /** https://wa.me/<country code + number, digits only>. Opens a chat with that number. */
    url: string;
    label: string;
    /** Read out to screen readers after the label. */
    newTabNote: string;
  };
  consultation: {
    /** Label on the button that opens the form. */
    buttonLabel: string;
    /** Heading inside the form. */
    title: string;
    intro: string;
    closeLabel: string;
    submitLabel: string;
    /** First line of the WhatsApp message the form prepares for the visitor to send. */
    messageGreeting: string;
    privacyNote: string;
    /** Shown after the visitor sends the form. */
    sent: { title: string; body: string; linkLabel: string };
    fields: {
      name: ConsultationField;
      date: ConsultationField & { pastError: string };
      venue: ConsultationField;
      guests: ConsultationField;
      services: { label: string; options: readonly string[] };
    };
  };
  /** Palette shown in the moodboard panel while the finale is open. */
  swatches: readonly Swatch[];
  /** Changes the shape of the foreground blooms. Any whole number. */
  bloomSeed: number;
};

export const FINALE: Finale = {
  id: "meet-the-founder",
  title: "Meet the Founder & Book a Consultation",
  eyebrow: "Begin the Journey",
  headline: "Let’s create your extraordinary.",
  founder: {
    label: "Meet the founder",
    // PLACEHOLDERS: replace the name, role and bio with the founder's own details and words.
    name: "Zarish",
    role: `Founder, ${BRAND.name}`,
    bio: `${BRAND.name} was founded on a simple belief: a wedding should feel like stepping into the most beautiful room you have ever imagined. Every arch, bloom and candle is chosen with intention, so your day feels unmistakably yours.`,
    portrait: {
      // The founder, head and shoulders in the upper-middle of the frame. Phones show `mobileSrc`
      // full-bleed with the text over its lower half; larger screens frame `src` in an arch.
      src: "/placeholders/founder-portrait.jpg",
      mobileSrc: "/placeholders/founder-portrait-mobile.jpg",
      alt: "The founder of Zarish Soirées, seen from behind, looking out over a city at night",
      focus: "50% 38%",
      brief: "Founder portrait: head and shoulders, upper-middle of the frame",
      desktopShape: "portrait",
    },
  },
  whatsapp: {
    url: "https://wa.me/923137027761",
    label: "Chat on WhatsApp",
    newTabNote: "(opens in a new tab)",
  },
  consultation: {
    buttonLabel: "Schedule a Private Consultation",
    title: "Schedule a Private Consultation",
    intro: "Tell us a little about your day and we’ll pick up the conversation on WhatsApp.",
    closeLabel: "Close",
    submitLabel: "Send via WhatsApp",
    messageGreeting: `Hello ${BRAND.name}, I would like to schedule a private consultation.`,
    privacyNote: "Your details open in WhatsApp as a message. Nothing is stored on this website.",
    sent: {
      title: "Your request is ready",
      body: "WhatsApp should have opened with your details. If it didn’t, use the button below.",
      linkLabel: "Open WhatsApp",
    },
    fields: {
      name: {
        label: "Your name",
        placeholder: "Full name",
        required: true,
        error: "Please tell us your name.",
      },
      date: {
        label: "Event date",
        placeholder: "",
        required: true,
        error: "Please choose your event date.",
        pastError: "Please choose a date from today onwards.",
      },
      venue: {
        label: "Venue",
        placeholder: "Venue or city, or “still deciding”",
        required: false,
        error: "Please tell us the venue.",
      },
      guests: {
        label: "Guest count",
        placeholder: "e.g. 250",
        required: false,
        error: "Please enter the number of guests as a whole number.",
      },
      services: {
        label: "Services needed",
        // The five showpieces, so the list follows any rename, plus the whole-event option.
        options: [...SECTIONS.map((s) => s.title), "Full event management"],
      },
    },
  },
  swatches: [
    { name: "Noir", value: "#050508" },
    { name: "Champagne", value: "#d9a441" },
    { name: "Ivory", value: "#fff4e3" },
    { name: "Rose", value: "#e8457b" },
    { name: "Plum", value: "#5a1a4a" },
    { name: "Jade", value: "#1f8a70" },
  ],
  bloomSeed: 606,
};

/** What every scene (the five showpieces and the finale) offers to navigation and the moodboard. */
export type SceneMeta = { id: string; title: string; swatches: readonly Swatch[] };

/** Every scene in scroll order. The finale is always last. */
export const SCENES: readonly SceneMeta[] = [...SECTIONS, FINALE];

/** Index of the scene named by a URL hash (with or without the leading #), or -1. */
export function sceneIndexFromHash(hash: string): number {
  const id = hash.replace(/^#/, "");
  return SCENES.findIndex((s) => s.id === id);
}
