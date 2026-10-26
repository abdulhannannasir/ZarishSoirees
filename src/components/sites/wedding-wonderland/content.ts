/**
 * Everything the visitor reads or sees lives in this file: brand, hero copy, UI labels, the five
 * showpiece sections, the finale (founder profile, WhatsApp link and consultation form), their
 * photos and their moodboard pictures and palettes. To reskin or translate the site, edit this
 * file only. No component needs to change.
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
 * - A portrait photo, not a landscape scene (today the brand's logo photo; it can be a photo of
 *   the founder instead). Phones show `mobileSrc` full-bleed
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

/**
 * A picture on the moodboard. Any landscape or portrait photo under /public works; it is
 * cover-cropped, `focus` (CSS object-position) picks which part stays in frame. Tiles are small,
 * so a 1200 px wide file is plenty.
 */
export type MoodPicture = Pick<Photo, "src" | "alt" | "focus">;

export type Section = {
  /** URL hash that selects this section (/#grand-entrances). Lowercase, no spaces. */
  id: string;
  /** Small line above the title. */
  kicker: string;
  title: string;
  /** Two or three short sentences. Keep it under ~150 characters so it reads in one glance. */
  body: string;
  photo: Photo;
  /**
   * Pictures shown in the moodboard panel while this section is open. Use three: the first is
   * drawn wide (16:9), the other two as squares beneath it. Start with this section's own look.
   */
  moodboard: readonly MoodPicture[];
  /** Palette shown in the moodboard panel while this section is open. */
  swatches: readonly Swatch[];
  /** Changes the shape of the foreground blooms. Any whole number. */
  bloomSeed: number;
};

export const BRAND = {
  name: "The Wed Theory",
  /** Shown top-centre. Lowercase looks best with the wide letter-spacing. */
  wordmark: "the wed theory",
} as const;

/**
 * Sheer ivory drapes behind the hero. Keep it light and low-contrast: the type on top is dark
 * ink. It is cover-cropped, so on phones the middle of the photo is what shows.
 */
const HERO_BACKDROP: Photo = {
  src: "/images/hero-drapes.jpg",
  alt: "",
  focus: "50% 50%",
  brief: "Sheer ivory silk drapes in soft light, calm and empty in the centre",
};

export const HERO = {
  /** Set in the brand's script face, in sage, like the signature in the logo. */
  eyebrow: BRAND.name,
  /** Two display lines. Keep each short enough to fit one line on a phone (about 14 characters). */
  headline: ["Softly lit.", "Forever yours."],
  tagline: "Quiet luxury, designed around your love story.",
  /** The button label. */
  enterLabel: "Enter",
  /** Small line under the button (replaces the "Sound on" label). */
  greeting: "Step inside the theory",
  backdrop: HERO_BACKDROP,
} as const;

export const UI = {
  scrollCta: "Scroll to explore",
  home: "Home",
  moodboard: "Moodboard",
  moodboardClose: "Close moodboard",
  sectionNavLabel: "Sections",
  soundOn: "Turn sound on",
  soundOff: "Mute sound",
} as const;

/** Whether the original cut-out blooms float over each photo. Set to false for photos only. */
export const FOREGROUND_BLOOMS = true;

/**
 * The pictures the moodboards draw from, defined once so each scene below just picks three. They
 * reuse the section photos; to give a scene its own moodboard shots, add a picture here (or write
 * one inline in that scene's `moodboard`).
 */
const MOOD = {
  aisle: {
    src: "/images/grand-entrance.jpg",
    alt: "Candlelit aisle leading to an arch of white roses and baby's breath",
    focus: "50% 50%",
  },
  stage: {
    src: "/images/bespoke-stage.jpg",
    alt: "Ceremony stage with an arch of white roses and floor-length ivory drapes",
    focus: "50% 50%",
  },
  floral: {
    src: "/images/floral-architecture.jpg",
    alt: "Suspended installation of white roses, baby's breath and sage foliage above a candlelit table",
    focus: "60% 35%",
  },
  table: {
    src: "/images/custom-table.jpg",
    alt: "Long candlelit table with ivory linen, tall tapers and white rose centrepieces",
    focus: "60% 50%",
  },
  lights: {
    src: "/images/lighting-ambience.jpg",
    alt: "Reception hall with a crystal chandelier and a canopy of warm fairy lights",
    focus: "50% 50%",
  },
  // 4:5 photo with the logo in its top third: the focus keeps the logo in a wide or square crop.
  logo: {
    src: "/images/finale-logo-table.jpg",
    alt: `The ${BRAND.name} Events logo above a candlelit table of white roses and baby's breath`,
    focus: "50% 14%",
  },
} satisfies Record<string, MoodPicture>;

export const SECTIONS: readonly Section[] = [
  {
    id: "grand-entrances",
    kicker: "The first hello",
    title: "Grand Entrances",
    body: "Arrive between walls of white roses and sheer drapery. Candlelit aisles and a glow underfoot turn the first step into a moment nobody forgets.",
    photo: {
      // Wide and symmetrical: a vanishing-point aisle or an archway centred in frame.
      // Keep the floor/aisle in the lower third, but leave the bottom-left calm for the text.
      src: "/images/grand-entrance.jpg",
      // Portrait crop: archway centred, full height of the arch visible.
      mobileSrc: "/images/grand-entrance-mobile.jpg",
      alt: "Candlelit ceremony aisle leading to an arch of white roses and baby's breath",
      focus: "50% 55%",
      brief: "Candlelit aisle to an arch of white roses and baby's breath, symmetrical, arch centred",
    },
    swatches: [
      { name: "Ivory", value: "#f6efe3" },
      { name: "Champagne", value: "#dcc7a1" },
      { name: "Eucalyptus", value: "#8b9378" },
      { name: "Candlelight", value: "#e9c88f" },
      { name: "Baby’s Breath", value: "#fdfaf3" },
      { name: "Umber", value: "#2b2215" },
    ],
    moodboard: [MOOD.aisle, MOOD.floral, MOOD.table],
    bloomSeed: 101,
  },
  {
    id: "bespoke-stage-backdrop",
    kicker: "Where every eye lands",
    title: "Bespoke Stage & Backdrop Design",
    body: "Sculpted arches wrapped in roses, silk that falls like a waterfall, a warm light painted just for you. Your vows, spoken inside a work of art.",
    photo: {
      // The stage fills the middle of a wide frame. Leave the top third relatively clear:
      // the header and the section dots sit there.
      src: "/images/bespoke-stage.jpg",
      // Portrait crop: the backdrop's centre piece, as tall as possible.
      mobileSrc: "/images/bespoke-stage-mobile.jpg",
      alt: "Ceremony stage with an arch of white roses and floor-length ivory drapes",
      focus: "50% 45%",
      brief: "Rose-covered arch against ivory silk drapes, architectural focal point, centred",
    },
    swatches: [
      { name: "Silk", value: "#f1e9dc" },
      { name: "Gypsophila", value: "#fdfaf3" },
      { name: "Eucalyptus", value: "#97a281" },
      { name: "Bronze", value: "#b58b67" },
      { name: "Spotlight", value: "#f3dfb0" },
      { name: "Mahogany", value: "#4a3524" },
    ],
    moodboard: [MOOD.stage, MOOD.aisle, MOOD.lights],
    bloomSeed: 202,
  },
  {
    id: "floral-architecture",
    kicker: "Blooms that forgot gravity",
    title: "Floral Architecture",
    body: "Cascades of white roses and baby’s breath pour from the ceiling. Clouds of blooms hang in mid-air, and the room feels like it is still unfolding.",
    photo: {
      // Tall hanging installations suit a 3:2 frame cropped to 16:9: shoot a little wider than you
      // need, with the installation's lowest point near the vertical centre.
      src: "/images/floral-architecture.jpg",
      // Portrait crop: this is the section that benefits most. Show the installation top to bottom.
      mobileSrc: "/images/floral-architecture-mobile.jpg",
      alt: "Suspended installation of white roses, baby's breath and sage foliage above a candlelit table",
      focus: "60% 35%",
      brief: "Hanging installation of white roses, baby's breath and sage, blooms suspended mid-air",
    },
    swatches: [
      { name: "Garden Rose", value: "#efe3d0" },
      { name: "Baby’s Breath", value: "#fdfaf3" },
      { name: "Eucalyptus", value: "#7f8b6a" },
      { name: "Dusty Sage", value: "#a9b295" },
      { name: "Cream", value: "#ecdfc6" },
      { name: "Candlelight", value: "#e6c58b" },
    ],
    moodboard: [MOOD.floral, MOOD.stage, MOOD.table],
    bloomSeed: 303,
  },
  {
    id: "custom-table-settings",
    kicker: "Luxury, up close",
    title: "Custom Table Settings",
    body: "Linen that falls like silk. Tall tapers glowing in glass, centrepieces of garden roses and baby’s breath, candlelight pooling on gilded rims.",
    photo: {
      // A close, shallow-depth-of-field shot reads best: one table, one centrepiece, candles
      // glowing. Place the centrepiece slightly right of centre so the text has room on the left.
      src: "/images/custom-table.jpg",
      // Portrait crop: the centrepiece in the upper half, the place setting below it.
      mobileSrc: "/images/custom-table-mobile.jpg",
      alt: "Long candlelit table with ivory linen, tall tapers and white rose centrepieces",
      focus: "60% 50%",
      brief: "Close-up luxury table: ivory linen, white rose centrepiece, tall tapers in glass, crystal",
    },
    swatches: [
      { name: "Linen", value: "#efe6d6" },
      { name: "Taper", value: "#f3e6c8" },
      { name: "Gilt", value: "#c9a96e" },
      { name: "Garden Rose", value: "#f4ecdd" },
      { name: "Sage", value: "#97a281" },
      { name: "Umber", value: "#2b2215" },
    ],
    moodboard: [MOOD.table, MOOD.floral, MOOD.lights],
    bloomSeed: 404,
  },
  {
    id: "lighting-ambience",
    kicker: "The room, in a mood",
    title: "Lighting & Ambience",
    body: "Crystal chandeliers and canopies of fairy lights shimmer overhead. Candelabras glow, silk catches the light, and the whole night turns to amber.",
    photo: {
      // Dark, moody and wide. Light sources can be in the top half: the dark lower part keeps the
      // text readable without any extra darkening.
      src: "/images/lighting-ambience.jpg",
      alt: "Reception hall with a crystal chandelier and a canopy of warm fairy lights",
      focus: "50% 35%",
      brief: "Crystal chandelier, fairy-light canopy and candelabras over an ivory-draped reception hall",
    },
    swatches: [
      { name: "Candlelight", value: "#e9c88f" },
      { name: "Crystal", value: "#f6efe3" },
      { name: "Bronze", value: "#987558" },
      { name: "Champagne", value: "#dcc7a1" },
      { name: "Silk", value: "#efe6d6" },
      { name: "Umber", value: "#2b2215" },
    ],
    moodboard: [MOOD.lights, MOOD.table, MOOD.aisle],
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
  instagram: {
    /** https://www.instagram.com/<handle without the @>/ */
    url: string;
    /** Shown on the page, including the @. */
    handle: string;
    /** Read out to screen readers before the handle. */
    label: string;
    /** Read out to screen readers after the handle. */
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
  /** Pictures shown in the moodboard panel while the finale is open. Use three, as in `Section`. */
  moodboard: readonly MoodPicture[];
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
      // The brand's own photo: a candlelit table of white roses and baby's breath with the logo
      // above it. It is 4:5, so it fills the arch exactly; phones show it full-bleed with the copy
      // over its lower half, and the logo sits in the clear top third. To show the founder's own
      // photo instead, point `src` at "/placeholders/founder-portrait-mobile.jpg" and set the `alt`.
      src: "/images/finale-logo-table.jpg",
      alt: `The ${BRAND.name} Events logo above a candlelit table of white roses and baby's breath`,
      focus: "50% 30%",
      brief: "Brand photo with the logo in the top third, candlelit table below",
      desktopShape: "portrait",
    },
  },
  whatsapp: {
    url: "https://wa.me/923137027761",
    label: "Chat on WhatsApp",
    newTabNote: "(opens in a new tab)",
  },
  instagram: {
    url: "https://www.instagram.com/thewedtheory/",
    handle: "@thewedtheory",
    label: "Follow us on Instagram",
    newTabNote: "(opens in a new tab)",
  },
  consultation: {
    buttonLabel: "Schedule a Private Consultation",
    title: "Schedule a Private Consultation",
    intro: "Tell us a little about your day and we’ll pick up the conversation on WhatsApp.",
    closeLabel: "Close",
    submitLabel: "Send via WhatsApp",
    messageGreeting: `Hello, I would like to schedule a private consultation with ${BRAND.name}.`,
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
    { name: "Umber", value: "#17110a" },
    { name: "Champagne", value: "#cfae72" },
    { name: "Ivory", value: "#f6efe3" },
    { name: "Sage", value: "#8b9378" },
    { name: "Bronze", value: "#987558" },
    { name: "Candlelight", value: "#e9c88f" },
  ],
  moodboard: [MOOD.logo, MOOD.lights, MOOD.floral],
  bloomSeed: 606,
};

/** What every scene (the five showpieces and the finale) offers to navigation and the moodboard. */
export type SceneMeta = {
  id: string;
  title: string;
  moodboard: readonly MoodPicture[];
  swatches: readonly Swatch[];
};

/** Every scene in scroll order. The finale is always last. */
export const SCENES: readonly SceneMeta[] = [...SECTIONS, FINALE];

/** Index of the scene named by a URL hash (with or without the leading #), or -1. */
export function sceneIndexFromHash(hash: string): number {
  const id = hash.replace(/^#/, "");
  return SCENES.findIndex((s) => s.id === id);
}
