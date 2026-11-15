"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const scaleWrapRef = useRef<HTMLDivElement>(null);

  const [isInteractive, setIsInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOverMap, setIsOverMap] = useState(false);

  // Stable refs to avoid recreating event listeners or re-triggering state when values haven't changed
  const isVisibleRef = useRef(false);
  const isInteractiveRef = useRef(false);
  const isOverMapRef = useRef(false);

  useEffect(() => {
    // Only activate for fine pointer (mouse/trackpad desktop) and respect accessibility reduced-motion
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReduced) {
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    const cursor = cursorRef.current;
    const scaleWrap = scaleWrapRef.current;
    if (!cursor) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Direct hardware-accelerated positioning for zero input latency
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering over native map canvas (OpenLayers viewport or marked native cursor element)
      const overMapCanvas = Boolean(
        target.closest('.ol-viewport, [data-native-cursor="true"]')
      );
      if (overMapCanvas !== isOverMapRef.current) {
        isOverMapRef.current = overMapCanvas;
        setIsOverMap(overMapCanvas);
      }

      // Check if hovering over an interactive element (buttons, links, inputs, cards)
      const interactive = Boolean(
        target.closest(
          'a, button, input, textarea, select, [role="button"], [role="link"], label, .cursor-pointer, [data-cursor="interactive"]'
        )
      );
      if (interactive !== isInteractiveRef.current) {
        isInteractiveRef.current = interactive;
        setIsInteractive(interactive);
      }
    };

    const handlePointerDown = () => {
      if (scaleWrap) {
        // Subtle click pulse anchored strictly at the hotspot (0px 0px) to prevent tip jumping
        gsap.to(scaleWrap, {
          scale: 0.88,
          duration: 0.1,
          ease: "power1.out",
          overwrite: "auto",
        });
      }
    };

    const handlePointerUp = () => {
      if (scaleWrap) {
        gsap.to(scaleWrap, {
          scale: 1.0,
          duration: 0.15,
          ease: "back.out(2)",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`custom-mars-cursor fixed top-0 left-0 z-[9999] pointer-events-none select-none transition-opacity duration-150 ${
        isVisible && !isOverMap ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      <div
        ref={scaleWrapRef}
        style={{ transformOrigin: "0px 0px" }}
        className="relative"
      >
        {/* Subtle ambient Mars glow behind cursor */}
        <div
          className="absolute -inset-2 rounded-full blur-md pointer-events-none transition-opacity duration-200"
          style={{
            background: isInteractive
              ? "radial-gradient(circle, rgba(233,106,61,0.7) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(230,80,30,0.5) 0%, transparent 70%)",
            opacity: isInteractive ? 0.6 : 0.35,
          }}
        />

        {/* Mars-inspired Triangular Pointer (hotspot at apex: x: ~2px, y: ~1px) */}
        <div
          className={`relative transform -translate-x-[2px] -translate-y-[1px] transition-opacity duration-150 ${
            isInteractive ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
          }`}
          style={{
            filter: "drop-shadow(0 0 6px rgba(233, 106, 61, 0.55))",
          }}
        >
          <Image
            src="/cursor-pointer.png"
            alt="Pointer cursor"
            width={26}
            height={29}
            className="w-6 h-auto select-none pointer-events-none"
            priority
            unoptimized
          />
        </div>

        {/* Mars-themed Hand Cursor (hotspot at pointing index fingertip: x: ~8px, y: ~2px) */}
        <div
          className={`relative transform -translate-x-[8px] -translate-y-[2px] transition-opacity duration-150 ${
            isInteractive ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
          }`}
          style={{
            filter: "drop-shadow(0 0 6px rgba(233, 106, 61, 0.55))",
          }}
        >
          <Image
            src="/cursor-hand.png"
            alt="Interactive cursor"
            width={24}
            height={32}
            className="w-6 h-auto select-none pointer-events-none"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
