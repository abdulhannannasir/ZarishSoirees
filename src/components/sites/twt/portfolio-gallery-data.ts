/**
 * THE PORTFOLIO GALLERY'S PICTURES: every photograph the site has, gathered into one list with the
 * facts a caption needs. Nothing is written twice: the pictures come from PORTFOLIO and
 * PORTFOLIO_DETAILS (content.ts) and from the service pages' galleries (services-content.ts).
 *
 * HONESTY ABOUT THE PICTURES
 * The site does not yet hold photographs of the studio's own events. Each picture therefore carries
 * its `provenance`, and the gallery prints it in the caption ("Concept image", "Stock photo"), so no
 * visitor mistakes a stand-in for real client work. When real photography arrives, replace the file,
 * set `provenance` to "studio" for it (no label is shown) and add its `location` once the venue and
 * the client have agreed to it being named. A `location` is shown only when it is set, so nothing
 * here is ever guessed or invented.
 */

import type { MasonryItem } from "@/components/ui/masonry-gallery";
import { PORTFOLIO, PORTFOLIO_DETAILS } from "./content";
import { SERVICE_PAGES } from "./services-content";

export type GalleryCategory = "weddings" | "social" | "corporate";

/** Where a picture comes from. Only "studio" pictures are shown without a label. */
export type Provenance = "concept" | "stock" | "studio";

export interface GalleryItem {
  id: string;
  src: string;
  /** The picture's shape in pixels; only the proportions matter. They reserve space so nothing jumps as pictures load. */
  width: number;
  height: number;
  alt: string;
  title: string;
  category: GalleryCategory;
  /** The kind of event, as printed in the caption. */
  eventType: string;
  /** Where it took place. Set only when that is verified and the client agrees: otherwise nothing is printed. */
  location?: string;
  provenance: Provenance;
}

export const GALLERY_CATEGORIES: readonly { id: GalleryCategory; label: string }[] = [
  { id: "weddings", label: "Weddings" },
  { id: "social", label: "Social celebrations" },
  { id: "corporate", label: "Corporate" },
];

/** What a caption says about a picture that is not the studio's own work; null prints nothing. */
export const PROVENANCE_LABEL: Record<Provenance, string | null> = {
  concept: "Concept image",
  stock: "Stock photo",
  studio: null,
};

/** The notice printed above the gallery while any picture is a stand-in. */
export const GALLERY_NOTICE =
  "Until we add photographs from our own events, these are concept and stock images that show the kind of work we plan. Each one is labelled.";

/** A masonry picture, whose height is relative to its width (400 is a square). */
const fromMasonry = (
  item: MasonryItem,
  category: GalleryCategory,
  eventType: string,
  provenance: Provenance,
): GalleryItem => ({
  id: `${category}-${item.id}`,
  src: item.img,
  width: 800,
  height: Math.round((item.height / 400) * 800),
  alt: item.alt ?? item.title ?? "",
  title: item.title ?? item.kicker ?? eventType,
  category,
  eventType,
  provenance,
});

const WEDDING_COLLECTIONS: GalleryItem[] = PORTFOLIO.items.map((item) => ({
  id: `weddings-${item.id}`,
  src: item.photo.src,
  width: 2400,
  height: 1350,
  alt: item.photo.alt,
  title: item.title,
  category: "weddings",
  eventType: "Wedding",
  provenance: "concept",
}));

const WEDDING_DETAILS = PORTFOLIO_DETAILS.items.map((item) =>
  fromMasonry(item, "weddings", "Wedding", "concept"),
);

const SOCIAL = [
  ...SERVICE_PAGES["social-events"].gallery.items.map((item) =>
    fromMasonry(item, "social", "Social event", "stock"),
  ),
  ...SERVICE_PAGES.birthdays.gallery.items.map((item) =>
    fromMasonry({ ...item, id: `birthday-${item.id}` }, "social", "Birthday", "stock"),
  ),
];

const CORPORATE = SERVICE_PAGES["corporate-events"].gallery.items.map((item) =>
  fromMasonry(item, "corporate", "Corporate event", "stock"),
);

/** Takes one from each list in turn, so the first pictures a visitor sees are a mix of celebrations. */
function interleave<T>(lists: readonly (readonly T[])[]): T[] {
  const longest = Math.max(...lists.map((list) => list.length));
  const mixed: T[] = [];
  for (let position = 0; position < longest; position += 1) {
    for (const list of lists) if (position < list.length) mixed.push(list[position]);
  }
  return mixed;
}

/** Every picture, the three kinds of celebration mixed together. */
export const GALLERY_ITEMS: readonly GalleryItem[] = interleave([
  [...WEDDING_COLLECTIONS, ...WEDDING_DETAILS],
  SOCIAL,
  CORPORATE,
]);

/** The few shown on the front page: the same mix, wide pictures first so the composition has weight. */
export const FEATURED_ITEMS: readonly GalleryItem[] = interleave([
  WEDDING_COLLECTIONS.slice(0, 3),
  SOCIAL.slice(0, 3),
  CORPORATE.slice(0, 3),
]);
