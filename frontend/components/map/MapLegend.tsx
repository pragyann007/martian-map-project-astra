"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface MapLegendProps {
  mode?: "planner" | "visualizer";
  className?: string;
}

export function MapLegend({ mode = "planner", className = "" }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div
      className={`absolute bottom-4 right-4 z-30 select-none font-sans pointer-events-auto transition-all ${className}`}
    >
      <div className="bg-[#090A0C]/90 backdrop-blur-md border border-[#777C83]/30 rounded-xl shadow-2xl p-2.5 sm:p-3 text-xs w-60 sm:w-64">
        {/* Header / Toggle */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer text-[#E8E5DF] hover:text-white transition-colors pb-1 border-b border-[#17191D]"
        >
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#E9A16A]" />
            <span>Map & Route Legend</span>
          </div>
          <button className="text-[#777C83] hover:text-[#E8E5DF]">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Legend Body */}
        {isExpanded && (
          <div className="mt-2.5 space-y-2 text-[10px] font-medium text-[#777C83]">
            {mode === "planner" ? (
              <>
                {/* Route Strategies */}
                <div className="space-y-1.5">
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-[#E8E5DF]">
                    Route Classifications
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#E8E5DF]">
                      <span className="w-3.5 h-1 rounded bg-[#E9A16A] inline-block shadow-sm" />
                      <span>Survival Optimized</span>
                    </span>
                    <span className="text-[#E9A16A] font-mono text-[9px] font-bold">RECOMMENDED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#E8E5DF]">
                      <span className="w-3.5 h-1 rounded bg-[#D9452B] inline-block shadow-sm" />
                      <span>Shortest Transect</span>
                    </span>
                    <span className="text-[#D9452B] font-mono text-[9px] font-bold">HIGH RISK (&gt;18°)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#E8E5DF]">
                      <span className="w-3.5 h-1 rounded bg-[#4ADE80] inline-block shadow-sm" />
                      <span>Energy Conserving</span>
                    </span>
                    <span className="text-[#4ADE80] font-mono text-[9px]">LOW WORK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#E8E5DF]">
                      <span className="w-3.5 h-1 rounded bg-[#38BDF8] inline-block shadow-sm" />
                      <span>Science Mission</span>
                    </span>
                    <span className="text-[#38BDF8] font-mono text-[9px]">HIGH SCIENCE</span>
                  </div>
                </div>

                {/* Terrain Risk Zones */}
                <div className="pt-1.5 border-t border-[#17191D] space-y-1">
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-[#E8E5DF]">
                    Terrain Hazards
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D9452B] inline-block ring-1 ring-red-400" />
                      <span>Delta Scarp Cliff (&gt;18°)</span>
                    </span>
                    <span className="text-[#D9452B] font-mono">NON-TRAVERSABLE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] inline-block ring-1 ring-green-400" />
                      <span>Gentle Valley (&lt;8°)</span>
                    </span>
                    <span className="text-[#4ADE80] font-mono">SAFE PASSAGE</span>
                  </div>
                </div>

                {/* Waypoints */}
                <div className="pt-1.5 border-t border-[#17191D] flex items-center justify-between text-[9px]">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E9A16A]" />
                    <span>Start / Habitat Base</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                    <span>Safe Refuge / Target</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Visualizer Mode */}
                <div className="space-y-1.5">
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-[#E8E5DF]">
                    Jezero Spatial Layers
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97943]" />
                    <span className="text-[#E8E5DF]">Perseverance Rover Site</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E7E9E8]" />
                    <span className="text-[#E8E5DF]">Jezero Geological Landmarks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-1 rounded bg-[#E9A16A]" />
                    <span className="text-[#E8E5DF]">USGS Mars DEM Contours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-1 rounded bg-[#38BDF8]" />
                    <span className="text-[#E8E5DF]">THEMIS Thermal IR Imagery</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
