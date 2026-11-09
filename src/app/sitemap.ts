import type { MetadataRoute } from "next";
import { SERVICE_SLUGS, SERVICES_PAGE, serviceHref } from "@/components/sites/twt/services-content";
import { THEME_IDS } from "@/components/sites/twt/theory-content";
import { SITE_URL } from "@/lib/site";

/** Every public page, for search engines. A new page needs a line here to be listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    SERVICES_PAGE.path,
    ...SERVICE_SLUGS.map(serviceHref),
    "/portfolio",
    "/about",
    "/contact",
    "/theory",
    ...THEME_IDS.map((id) => `/theory/${id}`),
  ];
  return paths.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
  }));
}
