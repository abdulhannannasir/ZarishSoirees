import Image from "next/image";
import Link from "next/link";
import { THEME_IDS, THEMES, type ThemeId } from "./theory-content";

/**
 * The four theories as photo cards that link to their result pages. Used under the quiz, on the
 * portfolio banner, and on a result page (without the one the visitor already has).
 */
export function ThemeCards({ exclude }: { exclude?: ThemeId }) {
  const ids = THEME_IDS.filter((id) => id !== exclude);
  return (
    <ul
      className={
        ids.length === 3
          ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
          : "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      }
    >
      {ids.map((id) => {
        const theme = THEMES[id];
        return (
          <li key={id}>
            <Link
              href={`/theory/${id}`}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <span className="relative block aspect-[4/5] overflow-hidden bg-cream">
                <Image
                  src={theme.photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                  style={{ objectPosition: theme.photo.focus }}
                  className="object-cover transition-transform duration-700 ease-out can-hover:group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </span>
              <span className="mt-3.5 block text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.1] text-ink italic">
                {theme.name}
              </span>
              <span className="mt-1.5 block text-[15px] leading-[1.35] text-ink-soft">
                {theme.tagline}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
