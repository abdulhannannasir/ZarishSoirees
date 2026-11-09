import { InstagramButton } from "@/components/sites/twt/instagram-button";
import { ServicesMarquee } from "@/components/sites/twt/services-marquee";
import { SiteFooter } from "@/components/sites/twt/site-footer";
import { SiteHeader } from "@/components/sites/twt/site-header";
import { SkipLink } from "@/components/sites/twt/skip-link";
import { PointerEffects } from "@/components/ui/pointer-effects";
import { ScrollMotion } from "@/components/ui/scroll-motion";

/**
 * Shared frame of the inner pages (services, portfolio, about, contact, the quiz): skip link, header,
 * the page itself, the footer and the floating Instagram button. The front page is the immersive
 * showcase and brings its own chrome instead.
 */
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="twt-page flex min-h-full flex-1 flex-col">
      {/* How far down the page the visitor is: a champagne hairline along the top (scroll-motion.tsx). */}
      <div aria-hidden="true" data-scroll-progress className="scroll-progress" />
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ServicesMarquee />
      <SiteFooter />
      <InstagramButton />
      <PointerEffects />
      <ScrollMotion />
    </div>
  );
}
