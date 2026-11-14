"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Navigation } from "./Navigation";
import { HeroSection } from "./HeroSection";
import { MissionSection } from "./MissionSection";
import { JezeroSection } from "./JezeroSection";
import { CapabilitiesSection } from "./CapabilitiesSection";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import { usePlanetScrollStore, INITIAL_TRANSFORM } from "./planetScrollStore";

gsap.registerPlugin(ScrollTrigger);

// Dynamically import 3D Mars scene without SSR
const MarsScene = dynamic(() => import("./MarsScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-56 h-56 rounded-full border border-[#C66B3D]/30 animate-pulse bg-[#17191D]/40" />
    </div>
  ),
});

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setTransform = usePlanetScrollStore((s) => s.setTransform);
  const setSection = usePlanetScrollStore((s) => s.setSection);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      // Section Keyframe Definitions
      // Hero (0): Center, lower half overlapping MARS headline
      const heroState = { ...INITIAL_TRANSFORM };

      // Mission (1): Mars glides right to open space for left editorial text
      const missionState = {
        x: 1.45,
        y: 0.0,
        z: 0.0,
        scale: 0.88,
        rotY: 0.9,
        rotX: 0.0,
        opacity: 1.0,
      };

      // Jezero (2): Mars glides closer and rotates directly towards Jezero Crater coordinates (18.38°N, 77.58°E)
      const jezeroState = {
        x: 0.95,
        y: 0.05,
        z: 0.0,
        scale: 1.25,
        rotY: 2.1,
        rotX: 0.22,
        opacity: 1.0,
      };

      // Capabilities (3): Mars glides left to open space for right capabilities list
      const capabilitiesState = {
        x: -1.35,
        y: -0.05,
        z: 0.0,
        scale: 0.82,
        rotY: 3.3,
        rotX: 0.0,
        opacity: 1.0,
      };

      // Final CTA (4): Mars glides back to center-bottom forming a majestic planetary horizon
      const ctaState = {
        x: 0.0,
        y: -0.85,
        z: 0.0,
        scale: 1.35,
        rotY: 4.5,
        rotX: 0.0,
        opacity: 1.0,
      };

      // 1. Transition: Hero -> Mission
      ScrollTrigger.create({
        trigger: "#mission",
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setSection(p > 0.5 ? 1 : 0);
          setTransform({
            x: lerp(heroState.x, missionState.x, p),
            y: lerp(heroState.y, missionState.y, p),
            scale: lerp(heroState.scale, missionState.scale, p),
            rotY: lerp(heroState.rotY, missionState.rotY, p),
            rotX: lerp(heroState.rotX, missionState.rotX, p),
          });
        },
      });

      // 2. Transition: Mission -> Jezero
      ScrollTrigger.create({
        trigger: "#jezero",
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p > 0) {
            setSection(p > 0.5 ? 2 : 1);
            setTransform({
              x: lerp(missionState.x, jezeroState.x, p),
              y: lerp(missionState.y, jezeroState.y, p),
              scale: lerp(missionState.scale, jezeroState.scale, p),
              rotY: lerp(missionState.rotY, jezeroState.rotY, p),
              rotX: lerp(missionState.rotX, jezeroState.rotX, p),
            });
          }
        },
      });

      // 3. Transition: Jezero -> Capabilities
      ScrollTrigger.create({
        trigger: "#capabilities",
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p > 0) {
            setSection(p > 0.5 ? 3 : 2);
            setTransform({
              x: lerp(jezeroState.x, capabilitiesState.x, p),
              y: lerp(jezeroState.y, capabilitiesState.y, p),
              scale: lerp(jezeroState.scale, capabilitiesState.scale, p),
              rotY: lerp(jezeroState.rotY, capabilitiesState.rotY, p),
              rotX: lerp(jezeroState.rotX, capabilitiesState.rotX, p),
            });
          }
        },
      });

      // 4. Transition: Capabilities -> Final CTA
      ScrollTrigger.create({
        trigger: "#explore",
        start: "top bottom",
        end: "top 30%",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p > 0) {
            setSection(p > 0.5 ? 4 : 3);
            setTransform({
              x: lerp(capabilitiesState.x, ctaState.x, p),
              y: lerp(capabilitiesState.y, ctaState.y, p),
              scale: lerp(capabilitiesState.scale, ctaState.scale, p),
              rotY: lerp(capabilitiesState.rotY, ctaState.rotY, p),
              rotX: lerp(capabilitiesState.rotX, ctaState.rotX, p),
            });
          }
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col selection:bg-[#C66B3D] selection:text-white"
    >
      {/* 1. Global Sticky 3D Mars Scene Backdrop (Persists through all sections) */}
      <div className="fixed inset-0 z-0 w-full h-screen pointer-events-none">
        <MarsScene />
      </div>

      {/* 2. Global Minimal Navigation */}
      <Navigation />

      {/* 3. Section Stack (Transparent backgrounds allowing 3D Mars to stay in view) */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Section 0: Hero — Centered Mars overlapping MARS headline */}
        <HeroSection />

        {/* Section 1: Mission Briefing — Mars shifts right, opening space for editorial text */}
        <MissionSection />

        {/* Section 2: Jezero Crater — Mars zooms in & rotates Jezero coordinates to camera */}
        <JezeroSection />

        {/* Section 3: Exploration Capabilities — Mars shifts left, capabilities on right */}
        <CapabilitiesSection />

        {/* Section 4: Final Call to Action — Mars curves on bottom horizon */}
        <FinalCTA />

        {/* Provenance & Attributions Footer */}
        <Footer />
      </div>
    </main>
  );
}
