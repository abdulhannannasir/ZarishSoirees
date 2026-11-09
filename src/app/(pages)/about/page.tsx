import type { Metadata } from "next";
import { AboutMoments } from "@/components/sites/twt/about-moments";
import {
  AboutApproach,
  AboutPhoto,
  AboutProcess,
  AboutServices,
} from "@/components/sites/twt/about-sections";
import { ClosingCta } from "@/components/sites/twt/closing-cta";
import { ABOUT } from "@/components/sites/twt/content";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "The Wed Theory is an event planning and design studio in Lahore, planning weddings, social events and corporate functions around the people they are for.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow={ABOUT.eyebrow} headline={ABOUT.headline} intro={ABOUT.intro}>
        <AboutPhoto />
      </PageIntro>
      <AboutApproach />
      <AboutProcess />
      <AboutMoments />
      <AboutServices />
      <ClosingCta />
    </>
  );
}
