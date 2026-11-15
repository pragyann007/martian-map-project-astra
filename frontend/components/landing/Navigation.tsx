"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#090A0C]/85 backdrop-blur-md border-b border-white/10 shadow-2xl py-3.5 pointer-events-auto"
          : "bg-transparent py-5 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand identity: Astra Logo with white background, similar to logomain.png, easily distinguished */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center space-x-3 group transition-transform duration-200"
            aria-label="Project Astra Home"
          >
            <div className="relative flex items-center justify-center px-2.5 py-1 rounded-md bg-white border border-white/90 shadow-md shadow-black/30 group-hover:shadow-white/20 group-hover:scale-105 transition-all duration-200">
              <Image
                src="/logomain-white-bg.png"
                alt="Project Astra Logo"
                width={130}
                height={34}
                className="h-6 sm:h-7 w-auto object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Minimal Navigation links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-heading font-medium tracking-[0.2em] uppercase text-[#777C83] pointer-events-auto">
          <a
            href="#"
            className="text-[#E8E5DF] hover:text-[#E9A16A] transition-colors"
          >
            HOME
          </a>
          <a
            href="#mission"
            className="hover:text-[#E8E5DF] transition-colors"
          >
            MISSION
          </a>
          <a
            href="#jezero"
            className="hover:text-[#E8E5DF] transition-colors"
          >
            JEZERO
          </a>
          <a
            href="#past-exploration"
            className="hover:text-[#E9A16A] transition-colors"
          >
            EXPLORATION
          </a>
          <a
            href="#team"
            className="hover:text-[#E8E5DF] transition-colors"
          >
            TEAM
          </a>
          <Link
            href="/visualizer"
            className="hover:text-[#E9A16A] transition-colors"
          >
            VISUALIZER
          </Link>
        </nav>

        {/* Right CTA: Visualizer button with white background and radiant glowing hover effect */}
        <div className="pointer-events-auto relative group">
          {/* Ambient luminous aura that blooms with a radiant glow on hover */}
          <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-white via-white/85 to-[#E9A16A]/75 opacity-30 group-hover:opacity-100 blur-md transition-all duration-300 pointer-events-none" />

          <Link
            href="/visualizer"
            className="relative inline-flex items-center justify-center px-4 py-2 sm:px-4.5 sm:py-2 text-xs font-heading font-bold tracking-[0.18em] uppercase text-[#090A0C] bg-white rounded-md border border-white shadow-[0_0_15px_rgba(255,255,255,0.45)] group-hover:shadow-[0_0_28px_rgba(255,255,255,0.95),0_0_50px_rgba(233,161,106,0.6)] group-hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>VISUALIZER</span>
            <span className="ml-1.5 inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
