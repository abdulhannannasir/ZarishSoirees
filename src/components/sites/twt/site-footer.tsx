import Image from "next/image";
import Link from "next/link";
import { BRAND, FOOTER, NAV, SOCIAL } from "./content";
import { SERVICE_PAGES, SERVICE_SLUGS, serviceHref } from "./services-content";
import { SiteLink } from "./site-link";

const footerLink =
  "block text-[15px] leading-none text-ink max-lg:py-[14.5px] transition-colors duration-300 outline-none hover:text-ink-soft focus-visible:underline focus-visible:underline-offset-4";

/** The closing band of the inner pages. The front page is a single screen and has no footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto grid max-w-[1760px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16 lg:px-[6.56vw] lg:py-16">
        <div>
          <Link href="/" aria-label={BRAND.logo.alt} className="inline-block outline-none">
            <Image
              src={BRAND.logo.src}
              alt=""
              width={BRAND.logo.width}
              height={BRAND.logo.height}
              sizes="180px"
              className="h-auto w-[180px]"
            />
          </Link>
          <p className="mt-5 max-w-[16rem] text-[15px] leading-[1.4] text-ink-soft italic">
            {FOOTER.tagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
            {FOOTER.exploreLabel}
          </p>
          <ul className="mt-3 flex flex-col lg:mt-5 lg:gap-3.5">
            {[...NAV.links, NAV.contact, ...FOOTER.moreLinks].map((link) => (
              <li key={link.href}>
                <SiteLink href={link.href} className={footerLink}>
                  {link.label}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={FOOTER.servicesLabel}>
          <p className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
            {FOOTER.servicesLabel}
          </p>
          <ul className="mt-3 flex flex-col lg:mt-5 lg:gap-3.5">
            {SERVICE_SLUGS.map((slug) => (
              <li key={slug}>
                <SiteLink href={serviceHref(slug)} className={footerLink}>
                  {SERVICE_PAGES[slug].name}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase">
            {FOOTER.contactLabel}
          </p>
          <ul className="mt-3 flex flex-col lg:mt-5 lg:gap-3.5">
            <li>
              <SiteLink href={SOCIAL.whatsapp.href} className={footerLink}>
                {SOCIAL.whatsapp.label}
              </SiteLink>
            </li>
            <li>
              <SiteLink href={SOCIAL.instagram.href} className={footerLink}>
                {SOCIAL.instagram.label}
                <span className="ml-2 text-ink-soft">{SOCIAL.instagram.handle}</span>
              </SiteLink>
            </li>
            <li className="text-[15px] leading-none text-ink-soft max-lg:py-[14.5px]">
              {FOOTER.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-[1760px] px-5 py-5 text-[12px] tracking-[0.04em] text-ink-soft sm:px-8 lg:px-[6.56vw]">
          © {new Date().getFullYear()} {BRAND.fullName}
        </p>
      </div>
    </footer>
  );
}
