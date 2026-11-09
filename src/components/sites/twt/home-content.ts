/**
 * THE FRONT PAGE BELOW THE JOURNEY: the services overview, the planning process and the portfolio
 * preview. The scrolling journey itself is in journey-content.ts.
 *
 * Nothing here is new information about the business. The service descriptions and offer lists
 * come straight from services-content.ts and the process steps from ABOUT in content.ts, so each
 * fact is written once. What this file adds is only how they are introduced on the front page.
 * Only real services are listed, and no client names, figures, awards or reviews appear anywhere.
 */

import { ABOUT, SERVICES } from "./content";
import { SERVICE_PAGES, serviceHref, type ServiceSlug } from "./services-content";

export const SERVICES_OVERVIEW = {
  /** The existing /#services address keeps working. */
  id: SERVICES.id,
  kicker: SERVICES.kicker,
  headline: ["Every celebration,", "designed around you."],
  intro: SERVICES.intro,
  allServices: { label: "See all our services", href: "/services" },
  /**
   * The three service areas. `pick` chooses which entries of the service page's "what we plan" list
   * to show here (by position), so the wording stays in services-content.ts.
   */
  items: [
    {
      slug: "weddings",
      title: "Wedding Planning & Design",
      pick: [0, 2, 4, 5],
      more: [],
    },
    {
      slug: "social-events",
      title: "Social Events & Private Celebrations",
      pick: [0, 1, 2, 5],
      // Birthdays have their own page, and belong to this area of the studio's work.
      more: [{ label: "Birthday parties", href: serviceHref("birthdays") }],
    },
    {
      slug: "corporate-events",
      title: "Corporate Events & Experiences",
      pick: [0, 1, 2, 3],
      more: [],
    },
  ],
} as const satisfies {
  id: string;
  kicker: string;
  headline: readonly [string, string];
  intro: string;
  allServices: { label: string; href: string };
  items: readonly {
    slug: ServiceSlug;
    title: string;
    pick: readonly number[];
    more: readonly { label: string; href: string }[];
  }[];
};

/** What one service area shows on the front page, assembled from its service page. */
export function serviceOverview(item: (typeof SERVICES_OVERVIEW.items)[number]) {
  const page = SERVICE_PAGES[item.slug];
  return {
    ...item,
    href: serviceHref(item.slug),
    description: page.intro,
    highlights: item.pick.map((position) => page.offer.items[position].title),
    photo: page.hero,
    // A second, smaller picture for the editorial composition.
    detail: page.features[0].photo,
    cta: `Explore ${page.name}`,
  };
}

export const PROCESS = {
  id: "process",
  kicker: "How it works",
  headline: ["From a first message", "to a plan made for you."],
  intro:
    "Every event starts with a conversation. Here is how an enquiry becomes a personalised plan, and then a celebration.",
  /** The first step's wording comes from the About page; each step adds what it means for an enquiry. */
  steps: [
    {
      title: ABOUT.process.steps[0].title,
      body: ABOUT.process.steps[0].body,
      detail:
        "You send an enquiry. We reply to learn about the occasion, your guests, the date, the venue and a budget range.",
    },
    {
      title: ABOUT.process.steps[1].title,
      body: ABOUT.process.steps[1].body,
      detail: "You see the look and the plan first. Nothing is booked until you are happy with it.",
    },
    {
      title: ABOUT.process.steps[2].title,
      body: ABOUT.process.steps[2].body,
      detail: "Your plan becomes bookings, schedules and a timeline that everyone involved works from.",
    },
    {
      title: ABOUT.process.steps[3].title,
      body: ABOUT.process.steps[3].body,
      detail: "We are on the day, running the details while you are with your guests.",
    },
  ],
  cta: { label: "Start with an enquiry", href: "#enquire" },
} as const;

export const PORTFOLIO_PREVIEW = {
  id: "portfolio",
  kicker: "Portfolio",
  headline: ["A look at the", "work we love."],
  intro:
    "Entrances, tables, florals and light across weddings, celebrations and corporate events. Tap any picture to see it full screen.",
  all: { label: "See the full portfolio", href: "/portfolio" },
} as const;

/** The portfolio page's gallery, which includes every picture on the site and can be filtered. */
export const PORTFOLIO_BROWSE = {
  kicker: "Browse",
  headline: ["Every kind of", "celebration."],
  intro:
    "Weddings, social celebrations and corporate events, together. Filter by the kind of event, and tap any picture to see it full screen.",
  back: { label: "Back to the front page", href: "/" },
} as const;
