"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  ExternalLink,
  Maximize2,
  Minimize2,
  Info,
  AlertTriangle,
  HelpCircle,
  Eye,
} from "lucide-react";

interface TerrainExplorerProps {
  lon?: number | null;
  lat?: number | null;
  source?: string | null;
}

const SKETCHFAB_MODEL_ID = "f8501fbe652241b585f7734bee259ad3";
const SKETCHFAB_MODEL_PAGE = `https://sketchfab.com/3d-models/jezero-crater-mars-${SKETCHFAB_MODEL_ID}`;
// Embed URL with FPS navigation enabled by default
const EMBED_URL = `https://sketchfab.com/models/${SKETCHFAB_MODEL_ID}/embed?autostart=1&navigation=fps&fps_speed=25&ui_theme=dark`;

export default function TerrainExplorer({ lon, lat, source }: TerrainExplorerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [loadTimeoutTriggered, setLoadTimeoutTriggered] = useState(false);

  // Monitor iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Fallback timer: if iframe takes > 12s, show helper guidance
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadTimeoutTriggered(true);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Fullscreen management
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const hasValidCoordinates =
    typeof lon === "number" &&
    typeof lat === "number" &&
    !isNaN(lon) &&
    !isNaN(lat) &&
    lon >= -180 &&
    lon <= 360 &&
    lat >= -90 &&
    lat <= 90;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col overflow-hidden font-sans select-none"
    >
      {/* 1. Slim Header Bar */}
      <header className="h-13 bg-[#090A0C]/95 backdrop-blur-md border-b border-[#17191D] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/planner"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#777C83] hover:text-[#E8E5DF] transition-colors py-1 px-2 rounded hover:bg-[#17191D]"
          >
            <ArrowLeft className="w-4 h-4 text-[#E9A16A]" />
            <span className="font-semibold">Back to Planner</span>
          </Link>

          <span className="text-[#17191D] hidden sm:inline">|</span>

          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-pulse" />
            <h1 className="font-heading font-bold text-xs sm:text-sm text-[#E8E5DF] uppercase tracking-wider">
              Jezero Crater 3D Explorer
            </h1>
          </div>
        </div>

        {/* Center / Context Location Indicator */}
        {hasValidCoordinates && (
          <div className="hidden md:flex items-center space-x-2 bg-[#17191D]/80 border border-[#777C83]/30 px-3 py-1 rounded-full text-[11px] font-mono text-[#E9A16A]">
            <Compass className="w-3.5 h-3.5 text-[#E9A16A]" />
            <span>
              PLANNER CONTEXT: {lon?.toFixed(4)}° E, {lat?.toFixed(4)}° N{source ? ` [${source}]` : ""}
            </span>
            <span
              title="Reference coordinates from 2D planner. The 3D model camera provides visual exploration of Jezero topography; it is not georeferenced to this exact point."
              className="cursor-help text-[#777C83] hover:text-[#E8E5DF]"
            >
              <Info className="w-3 h-3 ml-0.5 inline" />
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-1.5 rounded text-xs transition-colors ${
              showHelp
                ? "bg-[#E9A16A]/20 text-[#E9A16A] border border-[#E9A16A]/40"
                : "text-[#777C83] hover:text-[#E8E5DF] hover:bg-[#17191D]"
            }`}
            title="Toggle Controls Guide"
            aria-label="Toggle Controls Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <a
            href={SKETCHFAB_MODEL_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-[#777C83] hover:text-[#E8E5DF] transition-colors py-1 px-2 rounded hover:bg-[#17191D]"
            title="Open original model page on Sketchfab"
          >
            <span className="hidden lg:inline">Sketchfab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-[#777C83] hover:text-[#E8E5DF] hover:bg-[#17191D] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main 3D Canvas / Sketchfab Iframe Container */}
      <main className="flex-1 relative w-full h-full bg-[#090A0C]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090A0C] text-center p-6 space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-[#17191D] border-t-[#E9A16A] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#E9A16A] animate-ping" />
              </div>
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-[#E8E5DF] uppercase tracking-wider">
                Loading Jezero Crater 3D Environment
              </p>
              <p className="text-xs text-[#777C83] mt-1 max-w-sm">
                Streaming photogrammetric orbital elevation mesh via Sketchfab viewer...
              </p>
            </div>

            {loadTimeoutTriggered && (
              <div className="mt-4 p-3 rounded-lg bg-[#17191D] border border-[#777C83]/30 max-w-md text-xs text-[#777C83]">
                <p className="text-[#E9A16A] font-semibold flex items-center justify-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Taking longer than expected?
                </p>
                <p>
                  High-resolution 3D models require WebGL hardware acceleration. You can also view the model directly:
                </p>
                <a
                  href={SKETCHFAB_MODEL_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[#E9A16A] underline hover:text-white"
                >
                  Open directly on Sketchfab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Failure Overlay if embed blocked */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090A0C] text-center p-6 space-y-4">
            <AlertTriangle className="w-10 h-10 text-[#D9452B]" />
            <p className="font-heading font-bold text-sm text-[#E8E5DF] uppercase">
              Failed to Embed 3D Model
            </p>
            <p className="text-xs text-[#777C83] max-w-md">
              The external 3D viewer could not be loaded inside the iframe. This may occur if third-party frames are restricted by network security policies.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={SKETCHFAB_MODEL_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-[#E9A16A] text-[#090A0C] font-semibold text-xs hover:bg-[#C66B3D] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open Model on Sketchfab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/planner"
                className="px-4 py-2 rounded bg-[#17191D] border border-[#777C83]/30 text-xs text-[#E8E5DF] hover:bg-[#17191D]/80 transition-colors"
              >
                Return to 2D Planner
              </Link>
            </div>
          </div>
        )}

        {/* Sketchfab Embedded Viewer Iframe */}
        <iframe
          ref={iframeRef}
          title="Jezero Crater, Mars 3D Model"
          src={EMBED_URL}
          onLoad={handleIframeLoad}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="w-full h-full border-0 absolute inset-0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          execution-while-out-of-viewport="true"
          execution-while-not-rendered="true"
          web-share="true"
        />

        {/* 3. Floating First-Person Instructions Card */}
        {showHelp && !isLoading && !hasError && (
          <div className="absolute top-4 left-4 z-20 bg-[#090A0C]/90 backdrop-blur-md border border-[#17191D] shadow-2xl p-3.5 rounded-xl max-w-xs text-xs text-[#E8E5DF] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-[#17191D] pb-2 mb-2.5">
              <span className="font-heading font-semibold text-[11px] uppercase tracking-wider text-[#E9A16A] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                First-Person Navigation
              </span>
              <button
                onClick={() => setShowHelp(false)}
                className="text-[#777C83] hover:text-[#E8E5DF] text-xs px-1"
                aria-label="Dismiss Instructions"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-[#A6ABB2]">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-[#17191D] border border-[#777C83]/30 px-1.5 py-0.5 rounded text-white text-[10px]">
                  W A S D / Arrows
                </span>
                <span>Move camera across terrain</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-[#17191D] border border-[#777C83]/30 px-1.5 py-0.5 rounded text-white text-[10px]">
                  Click + Drag
                </span>
                <span>Look around (mouse-look)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-[#17191D] border border-[#777C83]/30 px-1.5 py-0.5 rounded text-white text-[10px]">
                  Mouse Scroll
                </span>
                <span>Adjust movement / fly speed</span>
              </div>
            </div>

            <p className="mt-3 pt-2 border-t border-[#17191D] text-[10px] text-[#777C83] leading-relaxed">
              Click anywhere on the 3D surface to focus the viewer controls.
            </p>
          </div>
        )}

        {/* 4. Bottom Disclaimer & Attribution Bar */}
        <div className="absolute bottom-2 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#777C83] bg-[#090A0C]/75 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#17191D]/80 pointer-events-none">
          <div className="pointer-events-auto">
            <span>Model: </span>
            <a
              href={SKETCHFAB_MODEL_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A6ABB2] hover:text-[#E9A16A] underline"
            >
              Jezero Crater, Mars
            </a>
            <span> on Sketchfab • Embedded via hosted viewer</span>
          </div>

          <div className="text-[10px] text-[#777C83] mt-1 sm:mt-0">
            <span>Visual Exploration Prototype • Camera coordinates not georeferenced</span>
          </div>
        </div>
      </main>
    </div>
  );
}
