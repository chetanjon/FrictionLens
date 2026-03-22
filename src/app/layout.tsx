import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PostHogAnalyticsProvider } from "@/components/analytics/posthog-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://frictionlens.app";

export const metadata: Metadata = {
  title: {
    default: "FrictionLens — App Review Intelligence",
    template: "%s | FrictionLens",
  },
  description:
    "Synthesize hundreds of app store reviews into one shareable Vibe Report with sentiment scores, churn signals, and action items.",
  metadataBase: new URL(siteUrl),
  keywords: [
    "app review analysis",
    "sentiment analysis",
    "vibe report",
    "churn prediction",
    "app store reviews",
    "product intelligence",
    "friction score",
    "user feedback",
  ],
  authors: [{ name: "Chetan Jonnalagadda" }],
  creator: "Chetan Jonnalagadda",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "FrictionLens",
    title: "FrictionLens — App Review Intelligence",
    description:
      "Synthesize hundreds of app store reviews into one shareable Vibe Report with sentiment scores, churn signals, and action items.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrictionLens — App Review Intelligence",
    description:
      "Synthesize hundreds of app store reviews into one shareable Vibe Report with sentiment scores, churn signals, and action items.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${ibmPlexMono.variable} ${newsreader.variable} antialiased`}
      >
        {/* Skip-to-content for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-friction-blue"
        >
          Skip to main content
        </a>
        <PostHogAnalyticsProvider>
          {children}
          <Toaster />
        </PostHogAnalyticsProvider>
      </body>
    </html>
  );
}
