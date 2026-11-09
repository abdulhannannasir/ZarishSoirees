import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TheoryResult } from "@/components/sites/twt/theory-result";
import { THEME_IDS, THEMES, THEORY_PAGE } from "@/components/sites/twt/theory-content";
import { isThemeId } from "@/components/sites/twt/theory";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// The four results are the only pages here; anything else is a 404, and all four are built ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return THEME_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isThemeId(slug)) return {};
  const theme = THEMES[slug];
  return pageMetadata({
    title: theme.name,
    description: `My Wed Theory is ${theme.name}: ${theme.tagline.toLowerCase()} Six questions to find yours.`,
    path: `/theory/${slug}`,
    image: { url: theme.card.src, alt: theme.card.alt },
  });
}

export default async function TheoryResultPage({ params }: Props) {
  const { slug } = await params;
  if (!isThemeId(slug)) notFound();
  return <TheoryResult themeId={slug} shareUrl={`${SITE_URL}${THEORY_PAGE.path}/${slug}`} />;
}
