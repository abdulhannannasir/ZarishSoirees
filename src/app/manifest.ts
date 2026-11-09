import type { MetadataRoute } from "next";
import { BRAND } from "@/components/sites/twt/content";

/** Lets visitors add the site to a phone's home screen with the right name, colours and icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,
    short_name: BRAND.name,
    description: `Event planning and design in ${BRAND.city}: weddings, social events and corporate functions.`,
    start_url: "/",
    display: "standalone",
    background_color: "#f0ede2",
    theme_color: "#f0ede2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
