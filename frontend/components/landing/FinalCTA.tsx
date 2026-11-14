"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
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
        x: -120,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
      });

      // Supporting CTA actions reveal smoothly
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
      id="explore"
      ref={sectionRef}
      className="relative w-full py-40 bg-transparent border-t border-white/20 overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center space-y-6">
        {/* Section Tag */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-sm bg-[#090A0C]/90 border border-white/20 text-xs uppercase tracking-[0.25em] text-[#E9A16A] font-semibold">
          <span>DATASET VISUALIZER READY // JEZERO CRATER</span>
        </div>

        {/* Big Impactful Title Heading (Animates from Left) */}
        <h2
          ref={headingRef}
          className="text-5xl sm:text-7xl lg:text-8xl font-heading font-black uppercase tracking-tight text-[#FFFFFF] leading-tight"
        >
          Your Exploration <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E96A3D] via-[#E9A16A] to-[#FFFFFF]">
            Starts Here.
          </span>
        </h2>

        <div ref={contentRef} className="space-y-6 pt-2">
          <p className="text-base sm:text-lg text-[#E8E5DF] max-w-xl mx-auto leading-relaxed">
            Open the dedicated dataset visualizer to inspect calibrated Mars
            imagery, observe Jezero’s river delta structures, and explore verified
            spatial layers.
          </p>

          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/visualizer"
              className="group relative inline-flex items-center justify-center px-10 py-4 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] uppercase text-white bg-[#E96A3D] hover:bg-[#d8582c] rounded-md shadow-xl shadow-[#E96A3D]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>ENTER MARTIAN MAP</span>
              <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
