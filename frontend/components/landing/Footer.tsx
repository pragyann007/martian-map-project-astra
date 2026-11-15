"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-[#090A0C] border-t border-white/20 py-16 text-[#E8E5DF] text-xs">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/20">
          {/* Brand Info with Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="Project Astra Home">
              <div className="relative inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-white border border-white/90 shadow-md">
                <Image
                  src="/logomain-white-bg.png"
                  alt="Project Astra"
                  width={120}
                  height={32}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-[#E8E5DF] leading-relaxed">
              Interplanetary exploration guide and dataset visualizer for
              Jezero Crater, Mars. Developed for the NASA Space Apps Challenge 2026.
            </p>
            <div className="text-[11px] text-[#E9A16A] uppercase tracking-wider font-medium">
              PROJECT ASTRA // RECONNAISSANCE
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <div className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">
              Exploration
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#mission"
                  className="text-[#E8E5DF] hover:text-[#FFFFFF] transition-colors"
                >
                  Mission Briefing
                </a>
              </li>
              <li>
                <a
                  href="#jezero"
                  className="text-[#E8E5DF] hover:text-[#FFFFFF] transition-colors"
                >
                  Jezero Crater Region
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="text-[#E8E5DF] hover:text-[#FFFFFF] transition-colors"
                >
                  Geospatial Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#past-exploration"
                  className="text-[#E8E5DF] hover:text-[#E9A16A] transition-colors"
                >
                  Past Exploration & Perseverance
                </a>
              </li>
              <li>
                <a
                  href="#team"
                  className="text-[#E8E5DF] hover:text-[#E9A16A] transition-colors"
                >
                  Project Astra Team
                </a>
              </li>
              <li>
                <Link
                  href="/visualizer"
                  className="text-[#E9A16A] hover:text-white font-medium transition-colors"
                >
                  Open Dataset Visualizer →
                </Link>
              </li>
            </ul>
          </div>

          {/* Planetary Parameters */}
          <div className="space-y-2">
            <div className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">
              Mars Ephemeris Reference
            </div>
            <ul className="space-y-1.5 text-[11px] uppercase tracking-wider text-[#E8E5DF]">
              <li>
                <span className="text-[#FFFFFF] font-medium">Cartographic Datum:</span> Mars 2000
              </li>
              <li>
                <span className="text-[#FFFFFF] font-medium">Initial Target:</span> 18.38° N, 77.58° E
              </li>
              <li>
                <span className="text-[#FFFFFF] font-medium">Axial Tilt:</span> 25.19°
              </li>
              <li>
                <span className="text-[#FFFFFF] font-medium">Crater Diameter:</span> 45.0 km
              </li>
            </ul>
          </div>

          {/* Scientific Disclaimer */}
          <div className="space-y-2">
            <div className="text-xs text-[#FFFFFF] uppercase tracking-wider font-semibold">
              Data Provenance & Limits
            </div>
            <p className="text-[11px] text-[#E8E5DF] leading-relaxed">
              This application is an educational prototype and decision-support
              demonstration. It is not certified for operational astronaut
              navigation, flight safety, or mission operations.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-wider text-[#E8E5DF]/70">
          <div>
            © 2026 Project Astra • Martian Map • NASA Space Apps Challenge 2026
          </div>
          <div className="flex items-center space-x-3 text-[#E9A16A] font-medium">
            <span>OBSERVED</span>
            <span>•</span>
            <span>DERIVED</span>
            <span>•</span>
            <span>MODELLED</span>
            <span>•</span>
            <span>SIMULATED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
