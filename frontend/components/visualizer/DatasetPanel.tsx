"use client";

import { MARS_DATASETS, VIKING_MDIM21, MOLA_CLRSHADE } from "@/lib/data/mars-datasets";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import DatasetCard from "./DatasetCard";
import {
  Layers,
  Globe,
  Grid,
  MapPin,
  Scan,
  Sparkles,
  SunMedium,
  Mountain,
} from "lucide-react";

export default function DatasetPanel() {
  const activeBaseMapId = useVisualizerStore((state) => state.activeBaseMapId);
  const activeOverlayId = useVisualizerStore((state) => state.activeOverlayId);
  const setBaseMap = useVisualizerStore((state) => state.setBaseMap);
  const setOverlay = useVisualizerStore((state) => state.setOverlay);

  const showGraticule = useVisualizerStore((state) => state.showGraticule);
  const showLandmarks = useVisualizerStore((state) => state.showLandmarks);
  const showFootprints = useVisualizerStore((state) => state.showFootprints);

  const setShowGraticule = useVisualizerStore((state) => state.setShowGraticule);
  const setShowLandmarks = useVisualizerStore((state) => state.setShowLandmarks);
  const setShowFootprints = useVisualizerStore((state) => state.setShowFootprints);

  // Group overlays by scientific purpose
  const highResOverlays = MARS_DATASETS.filter(
    (d) => !d.isBaseMap && (d.category === "imagery" || d.id === "jez-regional-visible")
  );

  const thermalOverlays = MARS_DATASETS.filter(
    (d) => !d.isBaseMap && d.category === "thermal"
  );

  return (
    <div className="space-y-6">
      {/* 1. PLANETARY BASE MAP SELECTOR */}
      <div className="space-y-2.5 p-3.5 rounded-lg bg-[#17191D]/80 border border-[#C66B3D]/30 shadow-lg">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#E9A16A]">
          <span className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Planetary Base Map</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#090A0C] border border-[#C66B3D]/30">
            GLOBAL CONTEXT
          </span>
        </div>

        <p className="text-[11px] text-[#777C83] leading-relaxed">
          Provides authentic planetary surface context under high-resolution targeted swathes.
        </p>

        {/* Base Map Options */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Viking MDIM 2.1 Mars Natural Color */}
          <button
            type="button"
            onClick={() => setBaseMap(VIKING_MDIM21.id)}
            className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${
              activeBaseMapId === VIKING_MDIM21.id
                ? "bg-[#090A0C] border-[#C66B3D] ring-1 ring-[#C66B3D]"
                : "bg-[#090A0C]/50 border-[#17191D] hover:border-[#777C83]/30"
            }`}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#E8E5DF]">
                <SunMedium className="w-3.5 h-3.5 text-[#E9A16A]" />
                <span>Viking MDIM 2.1 — Mars Natural Color</span>
              </div>
              <p className="text-[10px] text-[#777C83] leading-tight">
                Authentic reddish-ochre Mars surface imagery (~232 m/px)
              </p>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#17191D] text-[#E9A16A] border border-[#777C83]/20 shrink-0">
              232 m/px
            </span>
          </button>

          {/* MGS MOLA Topography */}
          <button
            type="button"
            onClick={() => setBaseMap(MOLA_CLRSHADE.id)}
            className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${
              activeBaseMapId === MOLA_CLRSHADE.id
                ? "bg-[#090A0C] border-[#C66B3D] ring-1 ring-[#C66B3D]"
                : "bg-[#090A0C]/50 border-[#17191D] hover:border-[#777C83]/30"
            }`}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#E8E5DF]">
                <Mountain className="w-3.5 h-3.5 text-teal-400" />
                <span>MGS MOLA — Elevation Hillshade</span>
              </div>
              <p className="text-[10px] text-[#777C83] leading-tight">
                Laser altimetry hypsometric relief color ramp (~463 m/px)
              </p>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#17191D] text-teal-400 border border-[#777C83]/20 shrink-0">
              463 m/px
            </span>
          </button>

          {/* None / Space Void */}
          <button
            type="button"
            onClick={() => setBaseMap("none")}
            className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between text-xs ${
              activeBaseMapId === "none"
                ? "bg-[#090A0C] border-[#C66B3D] ring-1 ring-[#C66B3D]"
                : "bg-[#090A0C]/50 border-[#17191D] hover:border-[#777C83]/30"
            }`}
          >
            <span className="text-[11px] text-[#777C83]">Deep Space Void (No Basemap)</span>
            <span className="text-[9px] font-mono text-[#777C83] uppercase">Pitch Black</span>
          </button>
        </div>
      </div>

      {/* PAN-SHARPENING SCIENTIFIC TIP */}
      <div className="p-3 rounded-lg bg-[#0E1015] border border-[#C66B3D]/30 space-y-1">
        <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-[#E9A16A]">
          <Sparkles className="w-3 h-3 text-[#E9A16A]" />
          <span>Pan-Sharpening Mars Tip</span>
        </div>
        <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
          Panchromatic CTX (6m) &amp; HiRISE (25cm) provide razor-sharp grayscale relief. Select{" "}
          <strong className="text-[#E9A16A]">Multiply</strong> or{" "}
          <strong className="text-[#E9A16A]">Luminosity</strong> blend mode on an active layer to combine high-res textures with authentic Martian ochre color!
        </p>
      </div>

      {/* 2. TARGETED SCIENTIFIC OVERLAYS */}
      <div className="space-y-4">
        {/* Category A: High-Resolution Orbital Imagery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#777C83]">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E9A16A]" />
              <span>Orbital High-Resolution Swaths</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#17191D] text-[#E9A16A]">
              PANCHROMATIC &amp; VIS
            </span>
          </div>

          <div className="space-y-2">
            {highResOverlays.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isActive={activeOverlayId === dataset.id}
                onSelect={() => setOverlay(dataset.id)}
              />
            ))}
          </div>
        </div>

        {/* Category B: Thermophysical & Infrared */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#777C83]">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E27D60]" />
              <span>Thermophysical Infrared</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#17191D] text-[#E27D60]">
              THERMAL EMISSION
            </span>
          </div>

          <div className="space-y-2">
            {thermalOverlays.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isActive={activeOverlayId === dataset.id}
                onSelect={() => setOverlay(dataset.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. CARTOGRAPHIC OVERLAYS */}
      <div className="space-y-3 pt-3 border-t border-[#17191D]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#777C83] flex items-center space-x-1.5">
          <Grid className="w-3.5 h-3.5 text-[#E9A16A]" />
          <span>Cartographic Overlays</span>
        </div>

        <div className="space-y-2">
          {/* Graticule Grid Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#17191D]/60 border border-[#17191D] text-xs">
            <div className="flex items-center space-x-2">
              <Grid className="w-3.5 h-3.5 text-[#E9A16A]" />
              <div>
                <span className="font-semibold text-[#E8E5DF] block text-xs">
                  Mars Graticule Grid
                </span>
                <span className="text-[10px] text-[#777C83]">
                  Latitude &amp; longitude grid lines with degree labels
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGraticule((prev) => !prev)}
              aria-label="Toggle Mars Graticule Grid"
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                showGraticule ? "bg-[#C66B3D]" : "bg-[#090A0C] border border-[#777C83]/30"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showGraticule ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Landmarks Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#17191D]/60 border border-[#17191D] text-xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#E9A16A]" />
              <div>
                <span className="font-semibold text-[#E8E5DF] block text-xs">
                  Sourced Surface Landmarks
                </span>
                <span className="text-[10px] text-[#777C83]">
                  Perseverance landing site, craters, and delta POIs
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLandmarks((prev) => !prev)}
              aria-label="Toggle Surface Landmarks"
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                showLandmarks ? "bg-[#C66B3D]" : "bg-[#090A0C] border border-[#777C83]/30"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showLandmarks ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Instrument Coverage Footprints */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#17191D]/60 border border-[#17191D] text-xs">
            <div className="flex items-center space-x-2">
              <Scan className="w-3.5 h-3.5 text-[#E9A16A]" />
              <div>
                <span className="font-semibold text-[#E8E5DF] block text-xs">
                  Coverage Footprint Swaths
                </span>
                <span className="text-[10px] text-[#777C83]">
                  Delineates exact boundaries of CTX, HiRISE, &amp; HRSC
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFootprints((prev) => !prev)}
              aria-label="Toggle Coverage Footprints"
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                showFootprints ? "bg-[#C66B3D]" : "bg-[#090A0C] border border-[#777C83]/30"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showFootprints ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
