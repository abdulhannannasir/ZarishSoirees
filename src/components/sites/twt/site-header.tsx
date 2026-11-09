"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, NAV } from "./content";
import { SiteLink } from "./site-link";

/** The home link is current only on the home page; any other link also stays lit on the pages inside it (Services on /services/birthdays). */
const isCurrent = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const navLink =
  "border-b pb-2 font-ui text-[13.5px] leading-none tracking-[0.06em] text-ink transition-colors duration-300 outline-none focus-visible:border-ink";

const pill =
  "tap-target inline-flex h-[38px] items-center gap-2.5 rounded-full bg-forest px-[25px] font-ui text-[13px] leading-none tracking-[0.08em] text-cream transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

/**
 * Sits over the top of the hero: navigation on the left, the logo in the middle, Contact and the
 * Enquire pill on the right. Below `lg` the links move into a full-screen menu.
 *
 * On inner pages it scrolls away with the page. On the front page, whose scrolling journey is many
 * screens long, it stays put (fixed) so the menu and the Enquire button are always within reach: it
 * starts transparent over the hero's drapes, then settles into a slim ivory bar after the first scroll.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);
  // A page other than the front page never has the slim bar, even if the state is left over.
  const slim = isHome && scrolled;

  return (
    <header
      data-scrolled={slim ? "true" : undefined}
      className={cn(
        "group/header intro-hide inset-x-0 top-0 z-30 transition-[background-color,box-shadow] duration-500",
        isHome ? "fixed" : "absolute",
        "data-[scrolled=true]:bg-ivory data-[scrolled=true]:shadow-[0_1px_0_rgba(53,52,42,0.14)]",
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-4 transition-[padding] duration-500 sm:px-8 lg:items-start lg:pt-[26px] lg:pr-[4.14vw] lg:pl-[6.56vw] group-data-[scrolled=true]/header:pt-2 group-data-[scrolled=true]/header:pb-2 lg:group-data-[scrolled=true]/header:min-h-[72px] lg:group-data-[scrolled=true]/header:items-center lg:group-data-[scrolled=true]/header:py-0">
        <div className="flex items-start">
          <nav aria-label="Primary" className="mt-4 hidden gap-x-[30px] pt-[11px] lg:flex lg:group-data-[scrolled=true]/header:mt-0 lg:group-data-[scrolled=true]/header:pt-0">
            {NAV.links.map((link) => {
              const active = isCurrent(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    navLink,
                    active ? "border-ink/60" : "border-transparent hover:border-ink/40",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger
              aria-label={NAV.menuOpen}
              className="-ml-2.5 inline-flex size-11 items-center justify-center text-ink outline-none focus-visible:ring-2 focus-visible:ring-forest/50 lg:hidden"
            >
              <Menu className="size-6" strokeWidth={1.2} aria-hidden="true" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Popup className="fixed inset-0 z-50 flex flex-col bg-ivory px-5 pt-4 pb-10 text-ink outline-none transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 sm:px-8">
                <Dialog.Title className="sr-only">{NAV.menuLabel}</Dialog.Title>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                  <span />
                  <Image
                    src={BRAND.logo.src}
                    alt=""
                    width={BRAND.logo.width}
                    height={BRAND.logo.height}
                    sizes="150px"
                    className="h-auto w-[150px]"
                  />
                  <Dialog.Close
                    aria-label={NAV.menuClose}
                    className="-mr-2.5 inline-flex size-11 items-center justify-center justify-self-end outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
                  >
                    <X className="size-6" strokeWidth={1.2} aria-hidden="true" />
                  </Dialog.Close>
                </div>

                <nav
                  aria-label="Mobile"
                  className="flex flex-1 flex-col items-center justify-center gap-7"
                >
                  {[...NAV.links, NAV.contact].map((link) => (
                    <SiteLink
                      key={link.href}
                      href={link.href}
                      aria-current={isCurrent(link.href, pathname) ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="font-serif text-[34px] leading-none font-light tracking-[0.01em] outline-none focus-visible:underline focus-visible:underline-offset-8 aria-[current=page]:underline aria-[current=page]:decoration-ink/40 aria-[current=page]:underline-offset-8"
                    >
                      {link.label}
                    </SiteLink>
                  ))}
                  <SiteLink
                    href={NAV.enquire.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(pill, "mt-3 h-12 px-8 text-[17px]")}
                  >
                    {NAV.enquire.label}
                    <ArrowRight className="size-[18px]" strokeWidth={1.3} aria-hidden="true" />
                  </SiteLink>
                </nav>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <Link
          href="/"
          aria-label={BRAND.logo.alt}
          className="tap-target block outline-none focus-visible:ring-2 focus-visible:ring-forest/50 lg:absolute lg:top-[26px] lg:left-1/2 lg:-translate-x-1/2 lg:transition-[top] lg:duration-500 lg:group-data-[scrolled=true]/header:top-1/2 lg:group-data-[scrolled=true]/header:-translate-y-1/2"
        >
          <Image
            src={BRAND.logo.src}
            alt={BRAND.logo.alt}
            width={BRAND.logo.width}
            height={BRAND.logo.height}
            preload
            sizes="(min-width: 1024px) 23vw, 150px"
            className="h-auto w-[150px] transition-[width] duration-500 sm:w-[190px] lg:w-[22.65vw] lg:max-w-[360px] group-data-[scrolled=true]/header:w-[104px] sm:group-data-[scrolled=true]/header:w-[116px] lg:group-data-[scrolled=true]/header:w-[150px]"
          />
        </Link>

        <div className="col-start-3 flex items-start justify-end gap-x-[30px] lg:mt-4 lg:group-data-[scrolled=true]/header:mt-0 group-data-[scrolled=true]/header:items-center">
          <SiteLink
            href={NAV.contact.href}
            aria-current={pathname === NAV.contact.href ? "page" : undefined}
            className={cn(
              navLink,
              "hidden pt-[11px] lg:block lg:group-data-[scrolled=true]/header:pt-0",
              pathname === NAV.contact.href
                ? "border-ink/60"
                : "border-transparent hover:border-ink/40",
            )}
          >
            {NAV.contact.label}
          </SiteLink>
          <SiteLink
            href={NAV.enquire.href}
            className={cn(pill, "h-9 px-4 text-sm lg:h-[38px] lg:px-[25px] lg:text-[15px]")}
          >
            {NAV.enquire.label}
            <ArrowRight
              className="size-[13px] lg:size-[14px]"
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </SiteLink>
        </div>
      </div>
    </header>
  );
}
