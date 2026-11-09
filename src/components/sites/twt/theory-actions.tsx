"use client";

import { useState } from "react";
import { ArrowRight, Check, Link2, Share2 } from "lucide-react";
import { useSearchString } from "@/hooks/use-search-string";
import { SiteLink } from "./site-link";
import { contactLink, paramsToAnswers, theoryWhatsappLink } from "./theory";
import { THEMES, THEORY_PAGE, type ThemeId } from "./theory-content";

const { actions } = THEORY_PAGE.result;

// Each is a full 44px box (so wrapped rows do not crowd each other for a thumb), with the underline
// on the text inside.
const quietBox =
  "group inline-flex min-h-11 items-center text-[15px] leading-none text-cream/85 transition-colors duration-300 outline-none hover:text-cream focus-visible:text-cream";
const quietText =
  "inline-flex items-center gap-2 border-b border-cream/50 pb-[3px] transition-colors duration-300 group-hover:border-cream group-focus-visible:border-cream";

/**
 * The buttons at the end of a result: plan it on WhatsApp or the enquiry form (both carry the answers
 * from the address), and share it. Sharing uses the phone's own share sheet where there is one and
 * copies the link where there is not. The shared link is the clean result page, without the answers.
 */
export function TheoryActions({ themeId, shareUrl }: { themeId: ThemeId; shareUrl: string }) {
  const theme = THEMES[themeId];
  const answers = paramsToAnswers(new URLSearchParams(useSearchString()));
  const [status, setStatus] = useState("");

  const shareText = `My Wed Theory is ${theme.name}: ${theme.tagline.toLowerCase()} Find yours:`;
  const shareOnWhatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus(actions.copied);
    } catch {
      setStatus(actions.copyFailed);
    }
  }

  async function share() {
    if (typeof navigator.share !== "function") return copy();
    try {
      await navigator.share({ title: theme.name, text: shareText, url: shareUrl });
    } catch (error) {
      // Closing the share sheet is a choice, not a failure.
      if (!(error instanceof DOMException && error.name === "AbortError")) await copy();
    }
  }

  return (
    <section aria-labelledby="actions-heading" className="bg-forest text-cream">
      <div className="mx-auto flex max-w-[1760px] flex-col items-center px-5 py-20 text-center sm:px-8 lg:px-[6.56vw] lg:py-28">
        <p className="text-[13px] leading-none font-medium tracking-[0.28em] text-cream/70 uppercase">
          {actions.kicker}
        </p>
        <h2
          id="actions-heading"
          className="mt-4 text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.08] font-normal italic"
        >
          {actions.title}
        </h2>
        <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.4] text-cream/85">{actions.body}</p>

        <SiteLink
          href={theoryWhatsappLink(themeId, answers)}
          className="group mt-9 inline-flex h-11 items-center gap-2.5 bg-cream px-[30px] text-[15px] leading-none tracking-[0.02em] text-ink transition-colors duration-300 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
        >
          {actions.whatsapp}
          <ArrowRight
            className="size-[13px] transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </SiteLink>
        <SiteLink href={contactLink(themeId, answers)} className={quietBox}>
          <span className={quietText}>{actions.form}</span>
        </SiteLink>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 border-t border-cream/20 pt-6">
          <button type="button" onClick={share} className={quietBox}>
            <span className={quietText}>
              <Share2 className="size-3.5" strokeWidth={1.3} aria-hidden="true" />
              {actions.share}
            </span>
          </button>
          <SiteLink href={shareOnWhatsapp} className={quietBox}>
            <span className={quietText}>{actions.shareWhatsapp}</span>
          </SiteLink>
          <button type="button" onClick={copy} className={quietBox}>
            <span className={quietText}>
              {status === actions.copied ? (
                <Check className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Link2 className="size-3.5" strokeWidth={1.3} aria-hidden="true" />
              )}
              {actions.copy}
            </span>
          </button>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-[14px] text-cream/80">
          {status}
        </p>
      </div>
    </section>
  );
}
