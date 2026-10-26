import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Jost, Mrs_Saint_Delafield } from "next/font/google";
import { BRAND } from "@/components/sites/wedding-wonderland/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Open stand-ins for the source's licensed display serif and Gill-style label face.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// A flowing signature script, the closest open match to the script in the brand's logo.
const script = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: `${BRAND.name} | Wedding Event Management & Decoration`,
  description:
    "Timeless, candlelit wedding event management and decoration: grand entrances, bespoke stages, floral architecture, custom table settings and lighting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
