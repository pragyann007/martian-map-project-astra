import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" className={`${spaceGrotesk.variable} dark h-full antialiased`}>
      <body className="h-full min-h-full flex flex-col bg-[#090A0C] text-[#E8E5DF] selection:bg-[#C66B3D] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
