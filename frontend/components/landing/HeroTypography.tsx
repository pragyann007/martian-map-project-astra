"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

interface HeroTypographyProps {
  headlineRef?: React.RefObject<HTMLDivElement | null>;
  ctaRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeroTypography({ headlineRef, ctaRef }: HeroTypographyProps) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between pointer-events-none z-20 select-none px-6">
      {/* 1. Eyebrow text: EXPLORE THE RED PLANET */}
      <div className="pt-24 sm:pt-28 text-center pointer-events-auto">
        <p className="text-xs sm:text-sm font-heading font-medium tracking-[0.35em] uppercase text-[#E8E5DF]/90">
          EXPLORE THE RED PLANET
        </p>
      </div>

      {/* 2. One enormous MARS headline positioned behind the planet */}
      <div
        ref={headlineRef}
        className="absolute top-[16%] sm:top-[17%] left-0 right-0 flex items-center justify-center pointer-events-none z-5"
      >
        <span className="text-[25vw] sm:text-[23vw] font-heading font-black tracking-wider uppercase text-[#FFFFFF] leading-none select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]">
          MARS
        </span>
      </div>

      {/* 3. Supporting sentence & Exploration CTAs */}
      <div
        ref={ctaRef}
        className="pb-14 sm:pb-20 flex flex-col items-center text-center pointer-events-auto z-25 space-y-4 max-w-xl mx-auto"
      >
        <p className="text-xs sm:text-sm font-heading font-medium tracking-[0.18em] uppercase text-[#E8E5DF]/90">
          Touch down on Mars: Gravity at 3.71 m/s² awaits your step.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full">
          <Link
            href="/visualizer"
            className="group relative inline-flex items-center justify-center px-8 sm:px-9 py-3.5 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] uppercase text-white bg-[#E96A3D] hover:bg-[#d8582c] rounded-md shadow-lg shadow-[#E96A3D]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>BEGIN EXPLORATION</span>
            <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#past-exploration"
            className="group relative inline-flex items-center justify-center px-8 sm:px-9 py-3.5 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] uppercase text-[#E8E5DF] hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#E96A3D]/60 rounded-md backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
          >
            <Compass className="w-4 h-4 mr-2.5 text-[#E9A16A] group-hover:rotate-45 transition-transform duration-300" />
            <span>EXPLORE THE PAST</span>
          </a>
        </div>
      </div>
    </div>
  );
}
