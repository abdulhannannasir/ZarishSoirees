import { SOCIAL } from "./content";

/** The Instagram glyph (a rounded square, a lens and a dot), drawn to match the site's thin line icons. */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A round button floating at the bottom right of every page that opens the studio's Instagram
 * profile in a new tab (the Instagram app, on a phone that has it). It pops in after the opening
 * animation, grows a "Follow us" label for a mouse or the keyboard, and keeps clear of notches. It sits
 * under the phone menu and the opening animation, and does not print. Its words and link are
 * `SOCIAL.instagram` in content.ts.
 */
export function InstagramButton() {
  const { href, floating } = SOCIAL.instagram;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={floating.ariaLabel}
      className="float-btn group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-14 min-w-14 items-center justify-center rounded-full border border-cream/35 bg-forest px-[15px] text-cream shadow-[0_10px_28px_rgb(47_59_43/0.3)] outline-none transition-[transform,box-shadow] duration-300 ease-out select-none motion-safe:animate-pop focus-visible:ring-2 focus-visible:ring-forest/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:scale-95 can-hover:hover:-translate-y-0.5 can-hover:hover:shadow-[0_14px_32px_rgb(47_59_43/0.38)] short:right-3 short:bottom-3 short:h-11 short:min-w-11 short:px-[11px] print:hidden"
    >
      <InstagramGlyph className="size-[26px] shrink-0 short:size-[22px]" />
      <span
        aria-hidden="true"
        className="max-w-0 overflow-hidden text-[15px] leading-none tracking-[0.02em] whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-500 ease-out group-focus-visible:ml-2.5 group-focus-visible:max-w-[7rem] group-focus-visible:opacity-100 can-hover:group-hover:ml-2.5 can-hover:group-hover:max-w-[7rem] can-hover:group-hover:opacity-100"
      >
        {floating.label}
      </span>
    </a>
  );
}
