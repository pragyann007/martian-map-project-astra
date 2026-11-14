"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HeroTypography } from "./HeroTypography";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(headlineRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1.2,
        delay: 0.2,
      }).from(
        ctaRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.9,
        },
        "-=0.6"
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-transparent"
    >
      <HeroTypography headlineRef={headlineRef} ctaRef={ctaRef} />
    </section>
  );
}
