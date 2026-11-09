/**
 * The first thing a keyboard or screen-reader visitor reaches on an inner page, visible only while
 * focused: it jumps past the header to the page's content.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[80] bg-cream font-ui text-sm text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-5 focus:py-3.5 focus:ring-2 focus:ring-forest"
    >
      Skip to content
    </a>
  );
}
