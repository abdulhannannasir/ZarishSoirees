import { SITE_URL } from "@/lib/site";
import { BRAND, SOCIAL } from "./content";
import {
  SERVICE_PAGES,
  SERVICE_SLUGS,
  serviceHref,
  type ServicePageContent,
} from "./services-content";

/** Puts structured data in the page for search engines. `<` is escaped so it can never close the script tag. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const provider = {
  "@type": "ProfessionalService",
  name: BRAND.fullName,
  url: SITE_URL,
};

const areaServed = { "@type": "City", name: BRAND.city };

/**
 * Tells search engines, in the structured form they read, who the business is, where it works and
 * what it offers: a professional service in Lahore with a catalogue of the four services. It is
 * shown to visitors nowhere. There is no street address in the site's content, so none is claimed;
 * add one here (and to the Google Business Profile) when there is a studio people can visit.
 */
export function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        ...provider,
        alternateName: BRAND.name,
        logo: `${SITE_URL}${BRAND.logo.src}`,
        image: `${SITE_URL}/images/custom-table.jpg`,
        description: `Event planning and design in ${BRAND.city}: tailored weddings, birthdays, social events and corporate functions.`,
        telephone: SOCIAL.whatsapp.display,
        address: { "@type": "PostalAddress", addressLocality: BRAND.city, addressCountry: "PK" },
        areaServed,
        sameAs: [SOCIAL.instagram.href],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Event planning services",
          itemListElement: SERVICE_SLUGS.map((slug) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: SERVICE_PAGES[slug].name,
              url: `${SITE_URL}${serviceHref(slug)}`,
            },
          })),
        },
      }}
    />
  );
}

/** The same for one service page: what the service is, who provides it and where. */
export function ServiceSchema({ page }: { page: ServicePageContent }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: page.name,
        serviceType: page.name,
        description: page.metaDescription,
        url: `${SITE_URL}${serviceHref(page.slug)}`,
        provider,
        areaServed,
      }}
    />
  );
}
