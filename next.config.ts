import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    // In development, photos are served from /public exactly as they are: no optimizer, so no
    // image cache. Next keeps optimized copies for up to 4 hours (`minimumCacheTTL`) and, even
    // after that, serves the old copy once while it re-optimizes, so a photo swapped in under the
    // same filename would not show up. Production is unchanged and still optimizes every image.
    unoptimized: isDev,
  },
};

export default nextConfig;
