"use client";

import { MARS_DATASETS, VIKING_MDIM21, MOLA_CLRSHADE } from "@/lib/data/mars-datasets";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import DatasetCard from "./DatasetCard";
import {
  Globe,
  SunMedium,
  Mountain,
  Grid,
  Layers,
  Info,
} from "lucide-react";

export default function DatasetPanel() {
  const activeBaseMapId = useVisualizerStore((state) => state.activeBaseMapId);
  const selectedDatasetId = useVisualizerStore((state) => state.selectedDatasetId);
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const setBaseMap = useVisualizerStore((state) => state.setBaseMap);
  const setSelectedDataset = useVisualizerStore((state) => state.setSelectedDataset);

  const showGraticule = useVisualizerStore((state) => state.showGraticule);
  const showLandmarks = useVisualizerStore((state) => state.showLandmarks);
  const showFootprints = useVisualizerStore((state) => state.showFootprints);

  const setShowGraticule = useVisualizerStore((state) => state.setShowGraticule);
  const setShowLandmarks = useVisualizerStore((state) => state.setShowLandmarks);
  const setShowFootprints = useVisualizerStore((state) => state.setShowFootprints);

  // Group overlays by scientific purpose
  const highResOverlays = MARS_DATASETS.filter(
    (d) => d.role === "overlay" && (d.category === "imagery" || d.id === "jez-regional-visible")
  );

  const thermalOverlays = MARS_DATASETS.filter(
    (d) => d.role === "overlay" && d.category === "thermal"
  );

  const isCtxActive = visibleLayers.includes("jez-ctx");

  return (
    <div className="space-y-5 text-xs">
      {/* 1. PLANETARY BASE MAP SELECTOR (Choose Exactly One) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#E7E9E8] flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#D97943]" />
            <span>Base Map</span>
          </span>
          <span className="text-[10px] text-[#929B9E] font-mono">CHOOSE ONE</span>
        </div>

        <p className="text-[11px] text-[#929B9E] leading-relaxed">
          Global planetary foundation rendered beneath high-resolution science swaths.
        </p>

        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {/* Viking MDIM 2.1 Mars Natural Color */}
          <button
            type="button"
            onClick={() => setBaseMap(VIKING_MDIM21.id)}
            className={`p-2.5 rounded-md border text-left transition-all flex items-center justify-between gap-2.5 ${
              activeBaseMapId === VIKING_MDIM21.id
                ? "bg-[#171B1D] border-[#D97943] ring-1 ring-[#D97943]"
                : "bg-[#101315] border-[#292F32] hover:border-[#929B9E]/40"
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  activeBaseMapId === VIKING_MDIM21.id
                    ? "border-[#D97943] bg-[#D97943]"
                    : "border-[#60686B] bg-[#0B0D0E]"
                }`}
              >
                {activeBaseMapId === VIKING_MDIM21.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 text-xs font-medium text-[#E7E9E8]">
                  <SunMedium className="w-3 h-3 text-[#D97943]" />
                  <span>Viking MDIM 2.1 — Color</span>
                </div>
                <div className="text-[10px] text-[#929B9E] truncate">
                  Authentic natural desert ochre tones
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#929B9E] px-1.5 py-0.5 rounded bg-[#0B0D0E] border border-[#292F32] shrink-0">
              232 m/px
            </span>
          </button>

          {/* MGS MOLA Topography Relief */}
          <button
            type="button"
            onClick={() => setBaseMap(MOLA_CLRSHADE.id)}
            className={`p-2.5 rounded-md border text-left transition-all flex items-center justify-between gap-2.5 ${
              activeBaseMapId === MOLA_CLRSHADE.id
                ? "bg-[#171B1D] border-[#D97943] ring-1 ring-[#D97943]"
                : "bg-[#101315] border-[#292F32] hover:border-[#929B9E]/40"
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  activeBaseMapId === MOLA_CLRSHADE.id
                    ? "border-[#D97943] bg-[#D97943]"
                    : "border-[#60686B] bg-[#0B0D0E]"
                }`}
              >
                {activeBaseMapId === MOLA_CLRSHADE.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 text-xs font-medium text-[#E7E9E8]">
                  <Mountain className="w-3 h-3 text-[#80A49B]" />
                  <span>MGS MOLA — Topography</span>
                </div>
                <div className="text-[10px] text-[#929B9E] truncate">
                  Hypsometric elevation &amp; hillshade ramp
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#80A49B] px-1.5 py-0.5 rounded bg-[#0B0D0E] border border-[#292F32] shrink-0">
              463 m/px
            </span>
          </button>
        </div>

        {/* Notice when high-resolution CTX overlay is rendered above base map */}
        {isCtxActive && (
          <div className="p-2 rounded bg-[#171B1D]/60 border border-[#292F32] flex items-center justify-between text-[11px] text-[#929B9E]">
            <span className="flex items-center space-x-1">
              <Info className="w-3 h-3 text-[#D97943] shrink-0" />
              <span>CTX overlay is active in Jezero Crater</span>
            </span>
          </div>
        )}
      </section>

      {/* 2. SCIENTIFIC OVERLAYS (Independently Toggleable) */}
      <section className="space-y-4 pt-1">
        {/* Orbital High-Resolution Mosaics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#929B9E]">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D97943]" />
              <span>Orbital Imagery Swaths</span>
            </span>
            <span className="text-[10px] font-mono text-[#60686B]">VISIBLE / PAN</span>
          </div>

          <div className="space-y-1.5">
            {highResOverlays.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isActive={selectedDatasetId === dataset.id}
                onSelect={() => setSelectedDataset(dataset.id)}
              />
            ))}
          </div>
        </div>

        {/* Thermophysical & Infrared Overlays */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#929B9E]">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#D97943]" />
              <span>Thermophysical Infrared</span>
            </span>
            <span className="text-[10px] font-mono text-[#60686B]">THEMIS IR</span>
          </div>

          <div className="space-y-1.5">
            {thermalOverlays.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isActive={selectedDatasetId === dataset.id}
                onSelect={() => setSelectedDataset(dataset.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARTOGRAPHIC AUXILIARY LAYERS */}
      <section className="space-y-2 pt-3 border-t border-[#292F32]">
        <div className="text-[11px] font-semibold text-[#929B9E] flex items-center space-x-1.5">
          <Grid className="w-3.5 h-3.5 text-[#D97943]" />
          <span>Cartographic Overlays</span>
        </div>

        <div className="space-y-1.5">
          {/* Graticule Grid Toggle */}
          <div className="flex items-center justify-between p-2 rounded-md bg-[#101315] border border-[#292F32]">
            <div className="space-y-0.5">
              <span className="font-medium text-[#E7E9E8] block text-xs">
                Mars Coordinate Graticule
              </span>
              <span className="text-[10px] text-[#929B9E]">
                Latitude &amp; longitude grid lines with degree intervals
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGraticule((prev) => !prev)}
              aria-label={showGraticule ? "Hide Graticule Grid" : "Show Graticule Grid"}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                showGraticule ? "bg-[#D97943]" : "bg-[#0B0D0E] border border-[#292F32]"
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
          <div className="flex items-center justify-between p-2 rounded-md bg-[#101315] border border-[#292F32]">
            <div className="space-y-0.5">
              <span className="font-medium text-[#E7E9E8] block text-xs">
                Surface Landmarks
              </span>
              <span className="text-[10px] text-[#929B9E]">
                Perseverance landing site, craters, and delta remnants
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLandmarks((prev) => !prev)}
              aria-label={showLandmarks ? "Hide Surface Landmarks" : "Show Surface Landmarks"}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                showLandmarks ? "bg-[#D97943]" : "bg-[#0B0D0E] border border-[#292F32]"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showLandmarks ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Coverage Footprint Swaths Toggle */}
          <div className="flex items-center justify-between p-2 rounded-md bg-[#101315] border border-[#292F32]">
            <div className="space-y-0.5">
              <span className="font-medium text-[#E7E9E8] block text-xs">
                Instrument Coverage Outlines
              </span>
              <span className="text-[10px] text-[#929B9E]">
                Show boundary footprints for CTX, HiRISE, &amp; HRSC
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowFootprints((prev) => !prev)}
              aria-label={showFootprints ? "Hide Instrument Footprints" : "Show Instrument Footprints"}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                showFootprints ? "bg-[#D97943]" : "bg-[#0B0D0E] border border-[#292F32]"
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
      </section>
    </div>
  );
}
