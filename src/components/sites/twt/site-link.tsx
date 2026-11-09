import type { ComponentProps } from "react";
import Link from "next/link";

type SiteLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * A link that works for both kinds of destination in content.ts: pages on this site use the router,
 * and anything starting with http (WhatsApp, Instagram) opens in a new tab.
 */
export function SiteLink({ href, children, ...props }: SiteLinkProps) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...(props as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
