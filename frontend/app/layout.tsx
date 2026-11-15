import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MARTIAN MAP — Planetary Exploration & Dataset Visualizer | Project Astra",
  description:
    "An interactive guide to Martian geography, scientific observations, and exploration for NASA Space Apps Challenge 2026. Focus region: Jezero Crater.",
  keywords: [
    "Mars",
    "Martian Map",
    "Jezero Crater",
    "Project Astra",
    "NASA Space Apps",
    "Planetary Exploration",
    "Mars Visualizer",
  ],
};

export const viewport: Viewport = {
  themeColor: "#090A0C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="h-full min-h-full flex flex-col bg-[#090A0C] text-[#E8E5DF] selection:bg-[#C66B3D] selection:text-white font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
