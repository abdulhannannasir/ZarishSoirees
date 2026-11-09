import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Jost, Mrs_Saint_Delafield } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BRAND } from "@/components/sites/twt/content";
import { SITE_CARD } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The brand's serif: the showcase's display face and the voice of every line on the inner pages.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// A clean, light sans for navigation, buttons, small labels, descriptions and the enquiry form.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// A flowing signature script, the closest open match to the script in the brand's logo.
const script = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint",
  subsets: ["latin"],
  weight: "400",
});

const DESCRIPTION = `Wedding planning and event design in ${BRAND.city}. ${BRAND.name} plans weddings, social celebrations, birthdays and corporate events, tailored to you. Enquire today.`;

export const metadata: Metadata = {
  // Share-preview images and links must be absolute; this is what turns "/portfolio" into a full address.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.fullName,
  // Pages with their own openGraph (see pageMetadata) replace this object, so each one names the card too.
  openGraph: {
    type: "website",
    siteName: BRAND.fullName,
    locale: "en_PK",
    title: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}`,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: SITE_CARD.url, width: 1200, height: 630, alt: SITE_CARD.alt }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: SITE_CARD.url, alt: SITE_CARD.alt }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f0ede2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
