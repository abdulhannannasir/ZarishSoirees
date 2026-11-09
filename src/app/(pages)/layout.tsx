import { InstagramButton } from "@/components/sites/twt/instagram-button";
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
      <SkipLink />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <InstagramButton />
      <PointerEffects />
      <ScrollMotion />
    </div>
  );
}
