import type { Metadata } from "next";
import { BRAND } from "@/components/sites/twt/content";
import { LocalBusinessSchema } from "@/components/sites/twt/local-business-schema";
import { Wonderland } from "@/components/sites/wedding-wonderland/wonderland";

// The front page keeps its own full title; this adds its canonical link.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}` },
};

/**
 * The front page: the immersive showcase (five showpieces and the founder finale). The inner pages
 * (services, portfolio, about, contact and the quiz) live in the (pages) group.
 */
export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <Wonderland />
    </>
  );
}
