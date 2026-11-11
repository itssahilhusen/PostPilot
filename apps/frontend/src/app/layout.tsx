import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./postpilot-landing.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "PostPilot — AI Carousel Automation & Content Engine",
  description: "Automate high-converting social media carousels in minutes. AI slide generation, daily RSS & news flywheel, studio editor, and multi-platform publishing — built for founders and creators.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/logos/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "PostPilot — AI Carousel Automation & Content Engine",
    description: "Automate high-converting social media carousels in minutes. AI slide generation, daily RSS & news flywheel, studio editor, and multi-platform publishing — built for founders and creators.",
    url: "https://www.postpilot.app",
    siteName: "PostPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPilot — AI Carousel Automation & Content Engine",
    description: "Automate high-converting social media carousels in minutes. AI slide generation, daily RSS & news flywheel, studio editor, and multi-platform publishing — built for founders and creators.",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, Instrument_Serif, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} ${playfairDisplay.variable} scroll-smooth font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        <link rel="stylesheet" href="/swipera/templates.css" />
        <script async src="/swipera/templates.js" />
      </head>
      <body className="font-sans antialiased selection:bg-primary selection:text-primary-foreground min-h-screen bg-black text-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add("dark");document.body.classList.add("dark");}catch(e){}})();`,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
