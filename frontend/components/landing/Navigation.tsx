"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-6 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Brand identity (Left) */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-heading font-bold tracking-[0.25em] text-[#E8E5DF] uppercase hover:text-[#E9A16A] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#E96A3D]" />
            <span>MARTIAN MAP</span>
          </Link>
        </div>

        {/* Minimal Navigation links */}
        <nav className="hidden sm:flex items-center space-x-8 text-xs font-heading font-medium tracking-[0.2em] uppercase text-[#777C83] pointer-events-auto">
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
