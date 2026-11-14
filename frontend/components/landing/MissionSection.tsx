"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function MissionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      // Title heading slides in dynamically from the left
      gsap.from(headingRef.current, {
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        x: -160,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      // Supporting editorial content reveals smoothly
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="relative w-full py-36 bg-transparent border-t border-white/20"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section Tag with clear white dividers above and below */}
        <div className="w-full border-t border-white/30" />
        <div className="flex items-center justify-between py-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#E9A16A] font-semibold">
            01 // MISSION BRIEFING
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8E5DF]/70">
            PROJECT ASTRA
          </div>
        </div>
        <div className="w-full border-b border-white/30" />

        {/* Big Impactful Title Heading (Animates from Left) */}
        <div className="pt-16 pb-12 max-w-5xl">
          <h2
            ref={headingRef}
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-heading font-black uppercase tracking-tight text-[#FFFFFF] leading-[0.98]"
          >
            Mars is not just a destination. It is an environment we must
            understand.
          </h2>
        </div>

        {/* Editorial Narrative Split (Clean, highly visible text) */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
        >
          {/* Main Statement (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-lg sm:text-xl text-[#FFFFFF] font-medium leading-relaxed">
              Martian Map synthesizes fragmented planetary spatial observations
              into a unified, map-centered exploration platform.
            </p>

            <div className="space-y-4 text-sm sm:text-base text-[#E8E5DF] leading-relaxed pt-2">
              <p>
                From global orbital mosaics and digital elevation contours to in
                situ rover drill cores, our platform brings planetary surface
                data together in one interactive environment.
              </p>
              <p>
                Users can investigate where scientific observations apply,
                examine slope relief along ancient waterways, and explore
                hypothetical traverse pathways across the Martian terrain.
              </p>
            </div>
          </div>

          {/* Planetary Parameters Block (5 cols) */}
          <div className="lg:col-span-5 relative p-8 rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 space-y-6 shadow-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-[#E9A16A] font-semibold pb-3 border-b border-white/20">
              Key Planetary Parameters
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[#E8E5DF]/70">
                    Atmospheric Pressure
                  </div>
                  <div className="text-sm font-bold text-[#FFFFFF]">
                    610 Pa
                  </div>
                </div>
                <div className="text-xs text-[#E9A16A] uppercase tracking-wider font-medium">
                  0.6% Earth
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[#E8E5DF]/70">
                    Surface Gravity
                  </div>
                  <div className="text-sm font-bold text-[#FFFFFF]">
                    3.71 m/s²
                  </div>
                </div>
                <div className="text-xs text-[#E9A16A] uppercase tracking-wider font-medium">
                  0.38 g
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[#E8E5DF]/70">
                    Diurnal Range
                  </div>
                  <div className="text-sm font-bold text-[#FFFFFF]">
                    -89°C to -14°C
                  </div>
                </div>
                <div className="text-xs text-[#E9A16A] uppercase tracking-wider font-medium">
                  Equatorial
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-[#E8E5DF]/70">
                    Focus Study Site
                  </div>
                  <div className="text-sm font-bold text-[#FFFFFF]">
                    Jezero Crater (-2,540 m)
                  </div>
                </div>
                <div className="text-xs text-[#C66B3D] uppercase tracking-wider font-medium">
                  Paleolake
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
