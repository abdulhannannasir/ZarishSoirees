/**
 * The site's public address, used for share previews, canonical links, the sitemap and robots.txt.
 *
 * It is read, in order, from NEXT_PUBLIC_SITE_URL (set it to use a custom domain explicitly), then from
 * the production domain Vercel assigns to the project (which follows a custom domain once one is
 * attached), and finally falls back to localhost for development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
