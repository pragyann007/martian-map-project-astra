"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Layers,
  Database,
  Mountain,
  Compass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Capability {
  number: string;
  title: string;
  category: string;
  description: string;
  provenance: "OBSERVED" | "DERIVED" | "MODELLED" | "SIMULATED";
  status: string;
  icon: typeof Layers;
}

const CAPABILITIES: Capability[] = [
  {
    number: "01",
    title: "Dataset Visualization",
    category: "Orbital Mosaics & Cartography",
    description:
      "Inspect Viking global mosaics, CTX basemaps, and HiRISE sub-meter imagery calibrated in OpenLayers using standard Mars 2000 cartographic projections.",
    provenance: "OBSERVED",
    status: "Core Architecture",
    icon: Layers,
  },
  {
    number: "02",
    title: "Geological Context",
    category: "Mineralogy & Sedimentary Strata",
    description:
      "Contextualize in situ rover observations and drill core locations with Jezero Crater's deltaic clay deposits and volcanic floor units.",
    provenance: "OBSERVED",
    status: "Catalogue Grounded",
    icon: Database,
  },
  {
    number: "03",
    title: "Terrain Information",
    category: "Topographic Elevation Models",
    description:
      "Study vertical relief, crater rim elevation profiles, and calculate slope inclinations to identify challenging terrain gradients.",
    provenance: "DERIVED",
    status: "HRSC / MOLA Blended",
    icon: Mountain,
  },
  {
    number: "04",
    title: "Route-Planning Support",
    category: "Traverse Exploration Concept",
    description:
      "An experimental algorithm demonstration that evaluates hypothetical travel corridors between points of interest using terrain and slope weighting.",
    provenance: "SIMULATED",
    status: "Experimental Demo",
    icon: Compass,
  },
];

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Pure DOM scrolling helpers (no React re-renders to prevent animation resets)
  const handleScrollNext = () => {
    if (trackContainerRef.current) {
      trackContainerRef.current.scrollBy({ left: 440, behavior: "smooth" });
    }
  };

  const handleScrollPrev = () => {
    if (trackContainerRef.current) {
      trackContainerRef.current.scrollBy({ left: -440, behavior: "smooth" });
    }
  };

  const handleScrollTo = (index: number) => {
    if (trackContainerRef.current && trackRef.current) {
      const cards = trackRef.current.querySelectorAll(".capability-card");
      if (cards[index]) {
        const card = cards[index] as HTMLElement;
        trackContainerRef.current.scrollTo({
          left: card.offsetLeft - trackContainerRef.current.offsetLeft,
          behavior: "smooth",
        });
      }
    }
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      // 1. Big Title Heading: slides in smoothly from the left
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { x: -120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 2. Horizontal Cards Entrance Animation:
      // When the cards container enters viewport, the cards smoothly appear from the right side towards the left.
      // Card 01 lands cleanly at x: 0 at the start of the row (100% visible, NEVER scrolled through).
      // Uses once: true to guarantee the cards never become invisible or reversed.
      const cards = trackRef.current?.querySelectorAll(".capability-card");
      if (cards && cards.length > 0 && trackContainerRef.current) {
        gsap.fromTo(
          cards,
          { x: 160, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: trackContainerRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      className="relative w-full py-36 bg-transparent border-t border-white/20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section Tag with clear white dividers above and below */}
        <div className="w-full border-t border-white/30" />
        <div className="flex items-center justify-between py-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#E9A16A] font-semibold">
            03 // EXPLORATION CAPABILITIES
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8E5DF]/70">
            SYSTEM OVERVIEW
          </div>
        </div>
        <div className="w-full border-b border-white/30" />

        {/* Big Impactful Title Heading (Animates from Left) */}
        <div className="pt-16 pb-12 max-w-4xl space-y-4">
          <h2
            ref={headingRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.05]"
          >
            Planetary Geospatial Capabilities
          </h2>
          <p className="text-base sm:text-lg text-[#E8E5DF] leading-relaxed max-w-2xl">
            A focused toolset built to explore Martian spatial datasets and
            hypothetical rover traverses with transparent provenance for every data layer.
          </p>
        </div>

        {/* Horizontal Navigation Header with Quick Indicators & Arrow Controls */}
        <div className="flex items-center justify-between pb-6 pt-2">
          {/* Quick Jump Buttons */}
          <div className="flex items-center space-x-3 text-xs font-mono uppercase tracking-widest text-[#E8E5DF]">
            <span className="text-[#E9A16A] font-semibold">CAPABILITY</span>
            <span className="text-white/40">•</span>
            <div className="flex items-center space-x-2">
              {CAPABILITIES.map((cap, idx) => (
                <button
                  key={cap.number}
                  onClick={() => handleScrollTo(idx)}
                  className="px-2.5 py-1 rounded text-xs bg-white/5 hover:bg-white/15 border border-white/20 text-[#E8E5DF] hover:text-white transition-all font-mono"
                >
                  {cap.number}
                </button>
              ))}
            </div>
          </div>

          {/* Left / Right Carousel Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleScrollPrev}
              aria-label="Previous card"
              className="p-2.5 rounded-sm bg-white/5 hover:bg-white/15 border border-white/20 text-[#E8E5DF] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleScrollNext}
              aria-label="Next card"
              className="p-2.5 rounded-sm bg-white/5 hover:bg-white/15 border border-white/20 text-[#E8E5DF] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Container (Cards arranged horizontally, appearing from right to left, Card 01 fully in view at start) */}
      <div
        ref={trackContainerRef}
        className="w-full overflow-x-auto pb-8 px-6 sm:px-10 max-w-7xl mx-auto scroll-smooth snap-x snap-mandatory"
      >
        <div
          ref={trackRef}
          className="flex flex-nowrap gap-6 items-stretch py-2 w-max"
        >
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.number}
                className="capability-card snap-start w-[320px] sm:w-[420px] lg:w-[460px] shrink-0 p-7 sm:p-8 rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 hover:border-[#E96A3D]/70 transition-all duration-300 flex flex-col justify-between shadow-2xl space-y-6 group opacity-100"
              >
                {/* Header row */}
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/15">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl sm:text-3xl font-bold text-[#E9A16A]">
                        {cap.number}
                      </span>
                      <Icon className="w-5 h-5 text-white/70 group-hover:text-[#E9A16A] transition-colors" />
                    </div>
                    <span className="px-2.5 py-1 rounded-xs text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-[#E9A16A] border border-white/20">
                      {cap.provenance}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="pt-4 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-[#E9A16A] font-semibold">
                      {cap.category}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#FFFFFF] leading-snug">
                      {cap.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="pt-4 text-sm sm:text-base text-[#E8E5DF] leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                {/* Status Footer */}
                <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs uppercase tracking-wider text-[#E8E5DF]/70">
                  <span>Architecture</span>
                  <span className="text-[#FFFFFF] font-semibold">
                    {cap.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Scope Disclaimer */}
        <div className="mt-8 p-5 rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-[#E8E5DF] leading-relaxed shadow-lg">
          <strong className="text-[#E9A16A] font-semibold uppercase tracking-wider mr-2">
            Scope Notice:
          </strong>
          Martian Map does not claim live telemetry, real-time weather, or
          operational astronaut safety certifications. All routing calculations
          are experimental demonstrations.
        </div>
      </div>
    </section>
  );
}
