import type { Metadata } from "next";
import { BRAND } from "@/components/sites/twt/content";

/** The site's share card, used by every page that does not have a card of its own. */
export const SITE_CARD = {
  url: "/share/site.jpg",
  alt: `${BRAND.fullName}: thoughtfully planned, beautifully celebrated`,
};

type PageMetadataInput = {
  /** The page's own title; the site name is added after it (see the title template in layout.tsx). */
  title: string;
  description: string;
  /** The page's path, such as "/portfolio". Used for the canonical link and the shared link. */
  path: string;
  /** A share image for this page, as a path under /public. Without one, the site's card is used. */
  image?: { url: string; alt: string };
  /** Keep the page out of search results. */
  noIndex?: boolean;
};

/**
 * The title, description, canonical link and share-preview tags for a page, all kept in step. Next
 * does not copy a page's title and description into its share tags on its own, so each page asks
 * for them here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = SITE_CARD,
  noIndex,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: BRAND.fullName,
      locale: "en_PK",
      title: `${title} | ${BRAND.fullName}`,
      description,
      url: path,
      images: [{ url: image.url, width: 1200, height: 630, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND.fullName}`,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}
