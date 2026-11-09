import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { NOT_FOUND } from "@/components/sites/twt/content";
import { InstagramButton } from "@/components/sites/twt/instagram-button";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { SiteFooter } from "@/components/sites/twt/site-footer";
import { SiteHeader } from "@/components/sites/twt/site-header";
import { SiteLink } from "@/components/sites/twt/site-link";

// Next adds the noindex tag to every 404 response itself.
export const metadata: Metadata = { title: "Page not found" };

/** Shown for any address that does not exist. It sits outside the (pages) group, so it brings its own header and footer. */
export default function NotFound() {
  return (
    <div className="twt-page flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageIntro
          eyebrow={NOT_FOUND.eyebrow}
          headline={NOT_FOUND.headline}
          intro={NOT_FOUND.intro}
        />
        <nav
          aria-label="Where to next"
          className="mx-auto max-w-[1760px] px-5 pb-24 sm:px-8 lg:px-[6.56vw] lg:pb-32"
        >
          <ul className="max-w-[34rem] divide-y divide-line border-y border-line">
            {NOT_FOUND.links.map((link) => (
              <li key={link.href}>
                <SiteLink
                  href={link.href}
                  className="group tap-target flex items-center justify-between py-4 text-[clamp(1.25rem,1.8vw,1.625rem)] leading-[1.15] text-ink transition-colors duration-300 outline-none hover:text-ink-soft focus-visible:underline focus-visible:underline-offset-4"
                >
                  {link.label}
                  <ArrowRight
                    className="size-[15px] shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.3}
                    aria-hidden="true"
                  />
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <SiteFooter />
      <InstagramButton />
    </div>
  );
}
