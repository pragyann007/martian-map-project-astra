"use client";

import Link from "next/link";
import Image from "next/image";

export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-5 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand identity: Ethereal Transparent Project Astra Logo */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center space-x-3 group transition-all duration-300"
            aria-label="Project Astra Home"
          >
            <div className="relative flex items-center justify-center py-1 px-2.5 rounded-sm bg-white/[0.02] backdrop-blur-[2px] border border-white/10 group-hover:border-[#E96A3D]/40 transition-all">
              {/* Ethereal celestial glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#E96A3D]/15 via-[#E9A16A]/20 to-transparent rounded-sm opacity-40 group-hover:opacity-90 blur-sm transition-opacity pointer-events-none" />
              <Image
                src="/logomain-white.png"
                alt="Project Astra Logo"
                width={135}
                height={35}
                className="h-7 sm:h-8 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_10px_rgba(233,161,106,0.4)]"
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

        {/* Right CTA */}
        <div className="pointer-events-auto">
          <Link
            href="/visualizer"
            className="text-xs font-heading font-medium tracking-[0.2em] uppercase text-[#E9A16A] hover:text-white transition-colors"
          >
            VISUALIZER →
          </Link>
        </div>
      </div>
    </header>
  );
}
