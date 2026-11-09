import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/sites/twt/service-page";
import {
  SERVICE_PAGES,
  SERVICE_SLUGS,
  isServiceSlug,
  serviceHref,
} from "@/components/sites/twt/services-content";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

// The four services are the only pages here; anything else is a 404, and all four are built ahead of time.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const page = SERVICE_PAGES[slug];
  return pageMetadata({
    title: page.name,
    description: page.metaDescription,
    path: serviceHref(slug),
    image: { url: page.card.src, alt: page.card.alt },
  });
}

export default async function ServiceRoute({ params }: Props) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  return <ServicePage slug={slug} />;
}
