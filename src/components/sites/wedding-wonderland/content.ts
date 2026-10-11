/**
 * Everything the visitor reads or sees lives in this file: brand, hero copy, UI labels, the five
 * showpiece sections, their photos and their moodboard palettes. To reskin or translate the site,
 * edit this file only. No component needs to change.
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
 *   Run `npm run placeholders` to regenerate the labelled placeholder images.
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
  sectionNavLabel: "Showpiece sections",
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

/** Index of the section named by a URL hash (with or without the leading #), or -1. */
export function sectionIndexFromHash(hash: string): number {
  const id = hash.replace(/^#/, "");
  return SECTIONS.findIndex((s) => s.id === id);
}
