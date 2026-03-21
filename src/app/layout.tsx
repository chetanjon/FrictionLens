import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
  title: "FrictionLens — App Review Intelligence",
  description:
    "Synthesize hundreds of app store reviews into one shareable Vibe Report with sentiment scores, churn signals, and action items.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
