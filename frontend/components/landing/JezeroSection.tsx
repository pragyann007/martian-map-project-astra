"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Compass, Eye, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function JezeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

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
        x: -140,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
      });

      // Orbital photo zooms in slightly
      gsap.from(imageCardRef.current, {
        scrollTrigger: {
          trigger: imageCardRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1.0,
        delay: 0.15,
        ease: "power3.out",
      });

      // Text descriptions slide up
      gsap.from(textContentRef.current, {
        scrollTrigger: {
          trigger: textContentRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1.0,
        delay: 0.25,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="jezero"
      ref={sectionRef}
      className="relative w-full py-36 bg-transparent border-t border-white/20"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section Tag with clear white dividers above and below */}
        <div className="w-full border-t border-white/30" />
        <div className="flex items-center justify-between py-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#E9A16A] font-semibold">
            02 // THE EXPLORATION REGION
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8E5DF]/70">
            JEZERO CRATER • 18.38° N, 77.58° E
          </div>
        </div>
        <div className="w-full border-b border-white/30" />

        {/* Note: NO title and NO texts above the Jezero image as requested. Directly starting with the main media grid. */}
        <div className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Verified NASA Orbital Imagery with Inset (7 cols) */}
          <div
            ref={imageCardRef}
            className="lg:col-span-7 relative rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 overflow-hidden shadow-2xl group"
          >
            {/* Top Bar with white divider */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 text-xs uppercase tracking-wider text-[#FFFFFF]">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-[#E9A16A]" />
                <span className="font-semibold text-[#FFFFFF]">
                  Orbital Context & Jezero Crater Inset
                </span>
              </div>
              <span className="text-[10px] text-[#E9A16A] bg-white/5 px-2.5 py-0.5 rounded border border-white/20 font-medium">
                ESA / DLR / NASA / CTX
              </span>
            </div>

            {/* The Actual Orbital Photograph */}
            <div className="relative aspect-[4/3] w-full bg-[#090A0C] overflow-hidden">
              <Image
                src="/assets/mars/jezero-orbital.jpg"
                alt="Orbital photograph of Mars showing Jezero Crater, ancient river delta, and the boundary between Syrtis Major and Isidis Planitia"
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* Photo Watermark & Caption */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider bg-[#090A0C]/90 backdrop-blur-xs px-3.5 py-2 rounded border border-white/20 text-[#FFFFFF]">
                <div>
                  <span className="text-[#E9A16A] font-semibold">MACRO:</span> 250 KM SYRTIS-ISIDIS BOUNDARY
                </div>
                <div>
                  <span className="text-[#E9A16A] font-semibold">INSET:</span> 10 KM JEZERO CRATER RIM & DELTA
                </div>
              </div>
            </div>

            {/* Bottom Link Action */}
            <div className="p-4 border-t border-white/20 flex items-center justify-between text-xs uppercase tracking-wider bg-white/5">
              <span className="text-[#E8E5DF]">
                Explore full calibrated 2D layers & elevation
              </span>
              <Link
                href="/visualizer"
                className="inline-flex items-center space-x-1.5 text-[#E9A16A] hover:text-white font-semibold transition-colors"
              >
                <span>Open in Visualizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Rich Geological Description & Section Title (5 cols) */}
          <div
            ref={textContentRef}
            className="lg:col-span-5 space-y-6 text-[#E8E5DF]"
          >
            {/* Title integrated beside the image, animates in from left */}
            <div className="space-y-3 pb-2">
              <div className="text-xs uppercase tracking-[0.25em] text-[#E9A16A] font-semibold">
                Syrtis Major Quadrangle • 45 km Paleolake Basin
              </div>
              <h2
                ref={headingRef}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight text-[#FFFFFF] leading-[1.05]"
              >
                Jezero Crater
              </h2>
              <p className="text-base text-[#FFFFFF] font-medium leading-relaxed">
                Ancient Paleolake & Western River Delta Architecture
              </p>
            </div>

            {/* Geographic Position Setting */}
            <div className="p-5 rounded-sm bg-[#090A0C]/85 backdrop-blur-md border border-white/20 space-y-2.5 shadow-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-[#E9A16A] font-semibold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geographic Position</span>
              </div>
              <p className="text-sm sm:text-base text-[#E8E5DF] leading-relaxed">
                As visible in the regional photograph, Jezero Crater sits exactly
                at the dramatic geological boundary where the dark, volcanic
                basaltic shield of <strong className="text-white">Syrtis Major</strong> (left)
                descends into the vast, ancient golden basin of <strong className="text-white">Isidis Planitia</strong> (right).
              </p>
            </div>

            {/* Western Delta Formation */}
            <div className="p-5 rounded-sm bg-[#090A0C]/85 backdrop-blur-md border border-white/20 space-y-2.5 shadow-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-[#E9A16A] font-semibold">
                Neretva Vallis & The River Delta Fan
              </div>
              <p className="text-sm sm:text-base text-[#E8E5DF] leading-relaxed">
                The close-up inset clearly captures the <strong className="text-white">Western Delta Fan</strong>.
                Around 3.7 billion years ago, a massive river valley breached the
                crater’s western wall, depositing layered clays, mudstones, and
                carbonates into what was once a 250-meter-deep paleolake.
              </p>
              <p className="text-xs sm:text-sm text-[#D4D1CA] leading-relaxed pt-1">
                These fine-grained lacustrine sediments have the highest known
                potential to preserve micro-fossil organic biosignatures on Mars.
              </p>
            </div>

            {/* Crater Floor & Séítah */}
            <div className="p-5 rounded-sm bg-[#090A0C]/85 backdrop-blur-md border border-white/20 space-y-2.5 shadow-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-[#E9A16A] font-semibold">
                Crater Floor & Séítah Formation
              </div>
              <p className="text-sm sm:text-base text-[#E8E5DF] leading-relaxed">
                The darker units inside the crater floor correspond to the
                <strong className="text-white"> Séítah formation</strong>—an ancient olivine-rich
                igneous basement rock unit formed by volcanic magma ponding or
                impact melt, later exposed by wind erosion and dune fields.
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Link
                href="/visualizer"
                className="group inline-flex items-center justify-center w-full px-6 py-3.5 text-xs sm:text-sm font-heading font-bold tracking-[0.18em] uppercase text-white bg-[#E96A3D] hover:bg-[#d8582c] rounded-md shadow-lg shadow-[#E96A3D]/25 transition-all duration-300"
              >
                <Compass className="w-4 h-4 mr-2 text-white" />
                <span>Inspect Jezero in Map Visualizer</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
