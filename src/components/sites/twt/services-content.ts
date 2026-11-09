/**
 * THE SERVICE PAGES: weddings, birthdays, social events and corporate events, and the page that
 * introduces them. Each service has its own address (/services/<slug>) and its own photographs.
 * To reword a page, swap a photo or add a gallery picture, edit this file only.
 *
 * PHOTOS
 * - Weddings use the portfolio photos. The other three use stand-in stock photos kept in
 *   public/images/services/<slug>/ (credits in docs/photo-credits.md): replace them with the studio's
 *   own event photography when it is ready, keeping the file names, or update the paths here.
 * - `hero` is cropped into an arch, 4:5 portrait. `features` show at about 4:3. A gallery item's
 *   `height` must match its picture's shape (400 is a square; see `MasonryItem`).
 */

import type { MasonryItem } from "@/components/ui/masonry-gallery";
import { ENQUIRY } from "@/config/business";
import { PORTFOLIO, PORTFOLIO_DETAILS, whatsapp, type ClosingContent } from "./content";

export const SERVICE_SLUGS = [
  "weddings",
  "birthdays",
  "social-events",
  "corporate-events",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type Photo = { src: string; alt: string; focus: string };

export interface ServicePageContent {
  slug: ServiceSlug;
  /** The service's name in menus, cards and the footer. */
  name: string;
  /** One line for the cards on the services page and for search results. */
  summary: string;
  /** The label of the matching enquiry form option (see ENQUIRY.eventTypes in src/config/business.ts). */
  eventType: string;
  eyebrow: string;
  /** Two lines; the second one is set in italic. */
  headline: readonly [string, string];
  intro: string;
  metaDescription: string;
  hero: Photo;
  offer: {
    kicker: string;
    title: string;
    items: readonly { title: string; body: string }[];
  };
  features: readonly { kicker: string; title: string; body: string; photo: Photo }[];
  process: {
    kicker: string;
    title: string;
    steps: readonly { title: string; body: string }[];
  };
  gallery: {
    kicker: string;
    title: string;
    intro: string;
    items: readonly MasonryItem[];
  };
  closing: ClosingContent;
  /** The share card (made by scripts/generate-brand-assets.py). */
  card: { src: string; alt: string };
}

/** The enquiry form with this service's event type already chosen (see EnquiryForm). */
const enquiryForm = (slug: ServiceSlug) => ({
  label: "Or use the enquiry form",
  href: `/contact?service=${slug}#enquire`,
});

const FIND_THEORY = { label: "Not sure yet? Find your Wed Theory", href: "/theory" } as const;
const ALL_SERVICES = { label: "See all our services", href: "/services" } as const;

const photoOf = (id: string) => {
  const item = PORTFOLIO.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No portfolio photo called ${id}`);
  return item.photo;
};

const WEDDINGS: ServicePageContent = {
  slug: "weddings",
  name: "Weddings",
  summary: "Your special day, thoughtfully planned.",
  eventType: ENQUIRY.serviceEventTypes["weddings"],
  eyebrow: "Weddings",
  headline: ["Your day,", "thoughtfully planned."],
  intro:
    "From the first conversation to the last dance, we plan weddings that feel unmistakably yours: the setting, the flowers, the light and every moment in between.",
  metaDescription:
    "Wedding planning and design in Lahore: ceremonies, mehndi, baraat, walima, floral architecture and day-of coordination from The Wed Theory Events.",
  hero: photoOf("grand-entrances"),
  offer: {
    kicker: "What we plan",
    title: "Every function, one story",
    items: [
      {
        title: "Ceremony & nikah",
        body: "Arches, aisles and seating designed around the moment you say yes.",
      },
      {
        title: "Mehndi & pre-wedding evenings",
        body: "Colour, comfort and a calm plan for the celebrations that lead up to the day.",
      },
      {
        title: "Baraat & reception",
        body: "Grand entrances, stage and table design for your largest gathering.",
      },
      { title: "Walima", body: "A graceful, welcoming close to the celebration." },
      {
        title: "Floral & décor design",
        body: "Cascades, arches and table pieces made for your venue, not borrowed from a catalogue.",
      },
      {
        title: "Planning & day-of coordination",
        body: "One team, one timeline, and calm on the day.",
      },
    ],
  },
  features: [
    {
      kicker: "Where every eye lands",
      title: "Stages made like art",
      body: "Sculpted arches wrapped in roses, silk that falls like a waterfall and a warm light painted just for you. Your vows, spoken inside a work of art.",
      photo: photoOf("bespoke-stage-backdrop"),
    },
    {
      kicker: "Blooms that forgot gravity",
      title: "Florals with presence",
      body: "Cascades of white roses and baby’s breath pour from the ceiling, and clouds of blooms hang in mid-air, so the room feels like it is still unfolding.",
      photo: photoOf("floral-architecture"),
    },
    {
      kicker: "Luxury, up close",
      title: "Tables worth lingering at",
      body: "Linen that falls like silk, tall tapers glowing in glass and centrepieces of garden roses, with candlelight pooling on gilded rims.",
      photo: photoOf("custom-table-settings"),
    },
  ],
  process: {
    kicker: "How we work",
    title: "From first meeting to final toast",
    steps: [
      {
        title: "Meet",
        body: "A relaxed first conversation about your story, your families and the days you have in mind.",
      },
      {
        title: "Design",
        body: "Palette, florals, lighting and layout for each function, shared with you before anything is booked.",
      },
      {
        title: "Plan",
        body: "Venues, vendors, schedules and guest flow, coordinated and shared at every step.",
      },
      {
        title: "Celebrate",
        body: "We run every detail on the day, so you can be present for it.",
      },
    ],
  },
  gallery: {
    kicker: "In detail",
    title: "Wedding details, up close",
    intro:
      "The textures, light and florals that make a wedding feel considered, seen a little closer.",
    items: PORTFOLIO_DETAILS.items,
  },
  closing: {
    eyebrow: "Begin",
    headline: "Let’s plan your wedding.",
    body: "Tell us about your day and we’ll pick up the conversation on WhatsApp.",
    button: {
      label: "Plan Your Wedding",
      href: whatsapp("Hello The Wed Theory, I’d like to plan my wedding."),
    },
    secondary: [enquiryForm("weddings"), FIND_THEORY],
  },
  card: {
    src: "/share/service-weddings.jpg",
    alt: "Weddings by The Wed Theory Events: your day, thoughtfully planned",
  },
};

const BIRTHDAYS: ServicePageContent = {
  slug: "birthdays",
  name: "Birthdays",
  summary: "Parties designed around the person at the centre.",
  eventType: ENQUIRY.serviceEventTypes["birthdays"],
  eyebrow: "Birthdays",
  headline: ["Birthdays worth", "the candles."],
  intro:
    "From a first birthday to a milestone you have waited years for, we design each party around the person at the centre: their favourite colours, their people and the little details they will notice.",
  metaDescription:
    "Birthday party planning and design in Lahore: kids’ parties, first birthdays, milestone birthdays, surprise parties, dessert tables and balloon styling from The Wed Theory Events.",
  hero: {
    src: "/images/services/birthdays/hero.jpg",
    alt: "A pale blue cake on a tall stand beside cupcakes, with soft balloons in the background",
    focus: "50% 40%",
  },
  offer: {
    kicker: "What we plan",
    title: "Every birthday, every age",
    items: [
      {
        title: "Kids’ parties",
        body: "Themed settings, cakes and activities children love, and a calm plan for the grown-ups.",
      },
      {
        title: "First birthdays",
        body: "Soft, photogenic setups for the celebration that starts the family album.",
      },
      {
        title: "Milestone birthdays",
        body: "Sixteenth, eighteenth, thirtieth, fiftieth: statement styling for the years that matter.",
      },
      {
        title: "Surprise parties",
        body: "Quiet planning, careful timing and a reveal worth the secrecy.",
      },
      {
        title: "Intimate dinners",
        body: "A beautifully set table and a short guest list, for birthdays that are about conversation.",
      },
      {
        title: "Cakes, dessert tables & balloons",
        body: "Sweet tables and balloon sculpture that photograph as well as they taste.",
      },
    ],
  },
  features: [
    {
      kicker: "Styling",
      title: "Balloons, florals and backdrops",
      body: "Arches, columns and lit backdrops designed in your palette, so the whole room looks like one idea instead of a shelf of party supplies.",
      photo: {
        src: "/images/services/birthdays/balloon-arch.jpg",
        alt: "A pink and white balloon arch around a round cake table with a neon Happy Birthday sign",
        focus: "50% 50%",
      },
    },
    {
      kicker: "The sweet table",
      title: "Cakes and dessert tables",
      body: "A centrepiece cake and a table of small things to match it, arranged and styled so the spread is as much a part of the decor as the flowers.",
      photo: {
        src: "/images/services/birthdays/dessert-table.jpg",
        alt: "A seventieth birthday cake on a gold stand with desserts and a tall blue balloon column",
        focus: "50% 40%",
      },
    },
    {
      kicker: "Milestones",
      title: "The big numbers, done properly",
      body: "Lit numbers, hand-built balloon hoops and soft light that suit the age on the invitation, for the birthdays that deserve a photograph.",
      photo: {
        src: "/images/services/birthdays/milestone.jpg",
        alt: "A lit number 18 beside a gold and white balloon hoop in front of white curtains",
        focus: "50% 55%",
      },
    },
  ],
  process: {
    kicker: "How we work",
    title: "From the guest of honour to the last slice",
    steps: [
      {
        title: "Tell us",
        body: "Who is it for, how old are they and what do they love? We start with the person.",
      },
      {
        title: "Style",
        body: "A palette, a theme and a mood board, shared with you before anything is ordered.",
      },
      {
        title: "Arrange",
        body: "Cake, decor, activities and timings, booked and confirmed for you.",
      },
      {
        title: "Celebrate",
        body: "We set up before your guests arrive and clear away after they leave.",
      },
    ],
  },
  gallery: {
    kicker: "Inspiration",
    title: "Birthday ideas, up close",
    intro: "Balloon work, tables, cakes and the small details that make a party feel designed.",
    items: [
      {
        id: "arch-drapes",
        img: "/images/services/birthdays/arch-drapes.jpg",
        height: 267,
        kicker: "Styling",
        title: "Balloon arch",
        alt: "A balloon arch in metallic pink, blue and gold in front of white drapes and fairy lights",
      },
      {
        id: "balloon-twenty",
        img: "/images/services/birthdays/balloon-twenty.jpg",
        height: 600,
        kicker: "Milestones",
        title: "Twenty, lit up",
        alt: "A pink and white balloon arch with a lit number 20 beside a small cake table",
      },
      {
        id: "bubble-centrepiece",
        img: "/images/services/birthdays/bubble-centrepiece.jpg",
        height: 400,
        kicker: "Styling",
        title: "Bubble centrepiece",
        alt: "A glass table centrepiece set in a cloud of white and clear balloons",
      },
      {
        id: "garden-cake",
        img: "/images/services/birthdays/garden-cake.jpg",
        height: 600,
        kicker: "Cakes",
        title: "Garden party cake",
        alt: "A tall pink and green cake on a garden table with flowers",
      },
      {
        id: "gold-banner",
        img: "/images/services/birthdays/gold-banner.jpg",
        height: 267,
        kicker: "Backdrops",
        title: "Gold and tinsel",
        alt: "A Happy Birthday bunting banner against a gold tinsel curtain and gold balloons",
      },
      {
        id: "party-hall",
        img: "/images/services/birthdays/party-hall.jpg",
        height: 600,
        kicker: "Tables",
        title: "Hall styling",
        alt: "A party hall set with round tables, flowers and a floral birthday backdrop",
      },
      {
        id: "candles",
        img: "/images/services/birthdays/candles.jpg",
        height: 267,
        kicker: "Moments",
        title: "Candles and cake",
        alt: "A cream cake with lit candles being cut at a dinner table",
      },
      {
        id: "pink-table",
        img: "/images/services/birthdays/pink-table.jpg",
        height: 400,
        kicker: "Tables",
        title: "Pink table setting",
        alt: "A wooden table seen from above, set with pink plates, napkins and cups",
      },
      {
        id: "party-hat",
        img: "/images/services/birthdays/party-hat.jpg",
        height: 267,
        kicker: "Details",
        title: "Party details",
        alt: "A white party hat with gold lettering beside bouquets of red and yellow flowers",
      },
    ],
  },
  closing: {
    eyebrow: "Begin",
    headline: "Let’s plan the party.",
    body: "Tell us who we are celebrating and we’ll pick up the conversation on WhatsApp.",
    button: {
      label: "Plan a Birthday",
      href: whatsapp("Hello The Wed Theory, I’d like to plan a birthday."),
    },
    secondary: [enquiryForm("birthdays"), ALL_SERVICES],
  },
  card: {
    src: "/share/service-birthdays.jpg",
    alt: "Birthdays by The Wed Theory Events: parties designed around the person at the centre",
  },
};

const SOCIAL_EVENTS: ServicePageContent = {
  slug: "social-events",
  name: "Social Events",
  summary: "Meaningful celebrations, beautifully executed.",
  eventType: ENQUIRY.serviceEventTypes["social-events"],
  eyebrow: "Social Events",
  headline: ["Gatherings,", "beautifully held."],
  intro:
    "Engagements, anniversaries, baby showers and family milestones: the celebrations that matter most to the people closest to you, planned with the same care as any wedding.",
  metaDescription:
    "Planning and design for engagements, anniversaries, baby showers, bridal showers, graduations and family gatherings in Lahore, from The Wed Theory Events.",
  hero: {
    src: "/images/services/social-events/hero.jpg",
    alt: "A bridal shower table with a cake covered in fresh flowers, tall tapers, place settings and a bride headband",
    focus: "50% 45%",
  },
  offer: {
    kicker: "What we plan",
    title: "The moments in between",
    items: [
      {
        title: "Engagements",
        body: "An intimate dinner or a garden party to mark the promise.",
      },
      {
        title: "Anniversaries",
        body: "From a quiet twenty-fifth to a golden fiftieth, styled with warmth and meaning.",
      },
      {
        title: "Baby showers & gender reveals",
        body: "Soft palettes, sweet tables and a day that feels like a hug.",
      },
      {
        title: "Bridal showers",
        body: "Brunches, tea parties and evenings for the people closest to the bride.",
      },
      {
        title: "Graduations & achievements",
        body: "Celebrations for the milestones that took years of work.",
      },
      {
        title: "Family gatherings & dinners",
        body: "Long tables, good light and an easy plan for hosting the people you love.",
      },
    ],
  },
  features: [
    {
      kicker: "Garden parties",
      title: "Sunlit tables, unhurried afternoons",
      body: "Fresh flowers, soft linen and tables set outdoors, for engagements and gatherings that are meant to be lingered over.",
      photo: {
        src: "/images/services/social-events/garden-table.jpg",
        alt: "A table with a white cloth and glasses, set with flowers in golden evening light",
        focus: "50% 55%",
      },
    },
    {
      kicker: "Showers & sweet tables",
      title: "Soft palettes, sweet details",
      body: "Cakes, florals and dessert tables arranged together in gentle colours, for baby showers, bridal showers and tea parties.",
      photo: {
        src: "/images/services/social-events/dessert-table.jpg",
        alt: "A white cake with gold lettering on a dessert table with flowers beside a garden window",
        focus: "50% 50%",
      },
    },
    {
      kicker: "Anniversaries & milestones",
      title: "The years, in gold and candlelight",
      body: "Warm light and the details that tell the story of the years together, from a quiet dinner to a room full of family.",
      photo: {
        src: "/images/services/social-events/anniversary.jpg",
        alt: "Two gold foil balloons spelling 50 in front of a bookshelf",
        focus: "50% 50%",
      },
    },
  ],
  process: {
    kicker: "How we work",
    title: "From the occasion to the last guest",
    steps: [
      {
        title: "Listen",
        body: "We ask about the occasion, the people and the feeling you want in the room.",
      },
      {
        title: "Design",
        body: "A look for the day: palette, florals, table and light, shared before anything is booked.",
      },
      {
        title: "Arrange",
        body: "Venue, caterers, cakes and timings, handled and confirmed for you.",
      },
      {
        title: "Host",
        body: "We set up, run the day and clear away, so you can sit down with your guests.",
      },
    ],
  },
  gallery: {
    kicker: "Inspiration",
    title: "Gatherings, up close",
    intro: "Tables, sweets, florals and small details from the celebrations we design.",
    items: [
      {
        id: "desserts-florals",
        img: "/images/services/social-events/desserts-florals.jpg",
        height: 600,
        kicker: "Sweet tables",
        title: "Desserts and florals",
        alt: "A table of cakes and sweets arranged between vases of cream and peach flowers",
      },
      {
        id: "pastel-table",
        img: "/images/services/social-events/pastel-table.jpg",
        height: 267,
        kicker: "Tables",
        title: "Pastel table",
        alt: "A long table set with pink napkins, gold cutlery and pastel flowers",
      },
      {
        id: "place-setting",
        img: "/images/services/social-events/place-setting.jpg",
        height: 500,
        kicker: "Details",
        title: "Place setting",
        alt: "A place setting with a pink napkin, a name card and soft greenery",
      },
      {
        id: "baby-letters",
        img: "/images/services/social-events/baby-letters.jpg",
        height: 267,
        kicker: "Baby showers",
        title: "Baby, lit up",
        alt: "Large lit letters spelling BABY between pink, blue and gold balloon columns",
      },
      {
        id: "pink-plates",
        img: "/images/services/social-events/pink-plates.jpg",
        height: 500,
        kicker: "Tables",
        title: "Pink and gold",
        alt: "A table seen from above with pink plates, gold cutlery and wild greenery",
      },
      {
        id: "greenhouse-table",
        img: "/images/services/social-events/greenhouse-table.jpg",
        height: 600,
        kicker: "Dinners",
        title: "Greenhouse dinner",
        alt: "A dark green banquet table with white flowers in a glass-walled room",
      },
      {
        id: "table-runner",
        img: "/images/services/social-events/table-runner.jpg",
        height: 267,
        kicker: "Tables",
        title: "Sage runner",
        alt: "A table with a sage runner, glassware and bowls of yellow and white flowers",
      },
      {
        id: "tapers-roses",
        img: "/images/services/social-events/tapers-roses.jpg",
        height: 600,
        kicker: "Florals",
        title: "Tapers and roses",
        alt: "A centrepiece of pink roses and tall white tapers on a laid table",
      },
      {
        id: "floral-archway",
        img: "/images/services/social-events/floral-archway.jpg",
        height: 500,
        kicker: "Ceremonies",
        title: "Floral archway",
        alt: "A floral archway over a white aisle lined with white chairs and blooms",
      },
    ],
  },
  closing: {
    eyebrow: "Begin",
    headline: "Let’s plan your gathering.",
    body: "Tell us about the occasion and we’ll pick up the conversation on WhatsApp.",
    button: {
      label: "Plan a Celebration",
      href: whatsapp("Hello The Wed Theory, I’d like to plan a social event."),
    },
    secondary: [enquiryForm("social-events"), ALL_SERVICES],
  },
  card: {
    src: "/share/service-social-events.jpg",
    alt: "Social events by The Wed Theory Events: meaningful celebrations, beautifully executed",
  },
};

const CORPORATE_EVENTS: ServicePageContent = {
  slug: "corporate-events",
  name: "Corporate Events",
  summary: "Professional events with a personal touch.",
  eventType: ENQUIRY.serviceEventTypes["corporate-events"],
  eyebrow: "Corporate Events",
  headline: ["Events that", "reflect your brand."],
  intro:
    "Conferences, galas, launches and team celebrations, planned with the polish your guests expect and the personal attention a large agency rarely has time for.",
  metaDescription:
    "Corporate event planning in Lahore: conferences, galas and award nights, product launches, corporate dinners, workshops and team celebrations from The Wed Theory Events.",
  hero: {
    src: "/images/services/corporate-events/hero.jpg",
    alt: "A gala table in blue light with a purple floral centrepiece and candles in glass",
    focus: "42% 50%",
  },
  offer: {
    kicker: "What we plan",
    title: "Events for every audience",
    items: [
      {
        title: "Conferences & summits",
        body: "Staging, seating, screens and flow for speakers and audiences of any size.",
      },
      {
        title: "Galas & award nights",
        body: "Formal dinners with considered tables, light and a programme that runs to time.",
      },
      {
        title: "Product launches",
        body: "Reveals and receptions designed around your brand and your story.",
      },
      {
        title: "Corporate dinners & receptions",
        body: "Networking evenings that feel welcoming rather than transactional.",
      },
      {
        title: "Workshops & training days",
        body: "Rooms set for focus, with the logistics handled quietly.",
      },
      {
        title: "Team celebrations & annual parties",
        body: "Milestones, awards and year-end gatherings your team will talk about.",
      },
    ],
  },
  features: [
    {
      kicker: "Conferences & summits",
      title: "Rooms built for attention",
      body: "Stage, screens, seating and sightlines planned together, so every seat is a good one and the programme keeps its rhythm.",
      photo: {
        src: "/images/services/corporate-events/grand-hall.jpg",
        alt: "A large hall with tall windows and a screen, filled with an attentive audience",
        focus: "50% 50%",
      },
    },
    {
      kicker: "Galas & dinners",
      title: "Evenings with presence",
      body: "Tables, florals and light that suit the occasion, and a run of show that keeps to time from the first arrival to the last speech.",
      photo: {
        src: "/images/services/corporate-events/gala-dinner.jpg",
        alt: "Guests in black tie seated at a gala dinner table with flowers",
        focus: "50% 50%",
      },
    },
    {
      kicker: "Launches & celebrations",
      title: "Moments worth the build-up",
      body: "Reveals, lighting and a little spectacle, designed around your brand instead of borrowed from a template.",
      photo: {
        src: "/images/services/corporate-events/launch.jpg",
        alt: "Confetti falling over a cheering crowd in a darkened venue",
        focus: "50% 50%",
      },
    },
  ],
  process: {
    kicker: "How we work",
    title: "From the brief to the debrief",
    steps: [
      {
        title: "Brief",
        body: "Goals, audience, budget and brand: we start with what the event has to achieve.",
      },
      {
        title: "Concept",
        body: "A look and a plan for the room, the programme and the guest journey.",
      },
      {
        title: "Produce",
        body: "Venues, suppliers, staging and logistics, coordinated through a single point of contact.",
      },
      {
        title: "Deliver",
        body: "On-site management from load-in to the last guest, followed by a debrief.",
      },
    ],
  },
  gallery: {
    kicker: "Inspiration",
    title: "Corporate events, up close",
    intro: "Rooms, tables and moments from the conferences, dinners and launches we plan.",
    items: [
      {
        id: "celebration",
        img: "/images/services/corporate-events/celebration.jpg",
        height: 400,
        kicker: "Celebrations",
        title: "Team celebration",
        alt: "Guests raising glasses in a warm room under pendant lights",
      },
      {
        id: "workshop",
        img: "/images/services/corporate-events/workshop.jpg",
        height: 400,
        kicker: "Workshops",
        title: "Workshop room",
        alt: "A presenter leading a workshop at a curved table of laptops",
      },
      {
        id: "networking",
        img: "/images/services/corporate-events/networking.jpg",
        height: 500,
        kicker: "Receptions",
        title: "Networking evening",
        alt: "Guests talking beside candlelit tables at a networking evening",
      },
      {
        id: "formal-dinner",
        img: "/images/services/corporate-events/formal-dinner.jpg",
        height: 600,
        kicker: "Dinners",
        title: "Formal dinner",
        alt: "Guests seated at a formal dinner with a floral centrepiece",
      },
      {
        id: "toast",
        img: "/images/services/corporate-events/toast.jpg",
        height: 500,
        kicker: "Moments",
        title: "The toast",
        alt: "A guest raising a glass in a toast under strings of lights",
      },
      {
        id: "gala-tent",
        img: "/images/services/corporate-events/gala-tent.jpg",
        height: 267,
        kicker: "Galas",
        title: "Gala tent",
        alt: "A gala tent with round tables, candles and tall floral centrepieces",
      },
      {
        id: "evening-reception",
        img: "/images/services/corporate-events/evening-reception.jpg",
        height: 267,
        kicker: "Receptions",
        title: "Evening reception",
        alt: "An evening reception with round tables and pink and purple uplighting",
      },
      {
        id: "applause",
        img: "/images/services/corporate-events/applause.jpg",
        height: 267,
        kicker: "Celebrations",
        title: "Applause",
        alt: "Applauding guests at a corporate evening under pendant lights",
      },
    ],
  },
  closing: {
    eyebrow: "Begin",
    headline: "Let’s plan your event.",
    body: "Tell us about your audience and your date and we’ll pick up the conversation on WhatsApp.",
    button: {
      label: "Discuss an Event",
      href: whatsapp("Hello The Wed Theory, I’d like to discuss a corporate event."),
    },
    secondary: [enquiryForm("corporate-events"), ALL_SERVICES],
  },
  card: {
    src: "/share/service-corporate-events.jpg",
    alt: "Corporate events by The Wed Theory Events: professional events with a personal touch",
  },
};

export const SERVICE_PAGES: Record<ServiceSlug, ServicePageContent> = {
  weddings: WEDDINGS,
  birthdays: BIRTHDAYS,
  "social-events": SOCIAL_EVENTS,
  "corporate-events": CORPORATE_EVENTS,
};

export const serviceHref = (slug: ServiceSlug) => `/services/${slug}`;

export const isServiceSlug = (value: unknown): value is ServiceSlug =>
  typeof value === "string" && (SERVICE_SLUGS as readonly string[]).includes(value);

/** The services overview page, and the labels the service pages share. */
export const SERVICES_PAGE = {
  path: "/services",
  title: "Services",
  metaDescription:
    "Weddings, birthdays, social events and corporate events: planning and design for every kind of celebration in Lahore, from The Wed Theory Events.",
  eyebrow: "Services",
  headline: ["Every celebration,", "designed with care."],
  intro:
    "Weddings, birthdays, family occasions and corporate events: whatever you are marking, we plan it around the people it is for.",
  card: {
    src: "/share/services.jpg",
    alt: "The Wed Theory Events plans weddings, birthdays, social events and corporate events",
  },
  cardLink: "Explore",
  others: { kicker: "Other celebrations", title: "More ways we can help", all: "All services" },
  featuresKicker: "Our approach",
} as const;
