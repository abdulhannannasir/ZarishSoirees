import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsapp } from "./content";
import { SiteLink } from "./site-link";

const variants = {
  /** On the dark journey scenes. */
  light:
    "border-champagne-light/60 text-champagne-light hover:bg-champagne-light hover:text-charcoal focus-visible:ring-champagne-light focus-visible:ring-offset-charcoal",
  /** On ivory pages. */
  outline:
    "border-ink/40 text-ink hover:bg-ink hover:text-cream focus-visible:ring-forest/50 focus-visible:ring-offset-ivory",
  /** The strongest version, for the one action a page most wants. */
  solid:
    "border-forest bg-forest text-cream hover:bg-[#3b4936] focus-visible:ring-forest/50 focus-visible:ring-offset-ivory",
} as const;

interface WhatsAppCTAProps {
  /** The message that is already typed when WhatsApp opens. */
  message: string;
  label?: string;
  variant?: keyof typeof variants;
  className?: string;
}

/**
 * A button that opens a WhatsApp chat with the studio, a message already typed. The number lives in
 * src/config/business.ts, so changing it there changes every one of these.
 */
export function WhatsAppCTA({
  message,
  label = "Chat on WhatsApp",
  variant = "outline",
  className,
}: WhatsAppCTAProps) {
  return (
    <SiteLink
      href={whatsapp(message)}
      aria-label={`${label} (opens in a new tab)`}
      data-magnetic=""
      className={cn(
        "inline-flex min-h-12 items-center gap-3 border px-6 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] uppercase transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:opacity-80",
        variants[variant],
        className,
      )}
    >
      <MessageCircle className="size-[17px] shrink-0" strokeWidth={1.4} aria-hidden="true" />
      {label}
    </SiteLink>
  );
}
