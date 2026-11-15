"use client";

import { useState } from "react";
import { MARS_LANDMARKS } from "@/lib/data/mars-datasets";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import type { MarsLandmark } from "@/lib/data/dataset.types";
import {
  MapPin,
  Compass,
  Mountain,
  Search,
  Crosshair,
} from "lucide-react";

export default function LandmarksPanel() {
  const selectedLandmarkId = useVisualizerStore((state) => state.selectedLandmarkId);
  const flyToLandmark = useVisualizerStore((state) => state.flyToLandmark);
  const showLandmarks = useVisualizerStore((state) => state.showLandmarks);
  const setShowLandmarks = useVisualizerStore((state) => state.setShowLandmarks);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Landing Site", "Crater", "Geological Feature", "Planitia"];

  const filteredLandmarks = MARS_LANDMARKS.filter((lm) => {
    const matchesCategory =
      selectedCategory === "All" || lm.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFlyTo = (landmark: MarsLandmark) => {
    if (!showLandmarks) {
      setShowLandmarks(true);
    }
    flyToLandmark(landmark.id);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Landing Site":
        return "text-[#D97943] bg-[#D97943]/15 border-[#D97943]/40";
      case "Crater":
        return "text-[#80A49B] bg-[#80A49B]/15 border-[#80A49B]/40";
      case "Geological Feature":
        return "text-[#E7E9E8] bg-[#171B1D] border-[#292F32]";
      case "Planitia":
        return "text-[#929B9E] bg-[#101315] border-[#292F32]";
      default:
        return "text-[#929B9E] bg-[#101315] border-[#292F32]";
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-[#E7E9E8] mb-1">
          <span className="flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-[#D97943]" />
            <span>Landmarks &amp; Features</span>
          </span>
          <span className="text-[10px] font-mono text-[#929B9E]">
            {MARS_LANDMARKS.length} SOURCED POIS
          </span>
        </div>
        <p className="text-[11px] text-[#929B9E] leading-relaxed">
          Geodetically verified locations from NASA Mars 2020 mission and IAU nomenclature.
        </p>
      </div>

      {/* Surface markers disabled banner */}
      {!showLandmarks && (
        <div className="p-2 rounded bg-[#171B1D] border border-amber-500/30 flex items-center justify-between text-[11px]">
          <span className="text-amber-400">Map markers currently hidden</span>
          <button
            onClick={() => setShowLandmarks(true)}
            className="px-2 py-0.5 rounded bg-[#D97943] text-white text-[10px] font-medium hover:bg-[#E96A3D] transition-colors"
          >
            Show Markers
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#60686B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter landmarks..."
          aria-label="Filter landmarks"
          className="w-full bg-[#101315] border border-[#292F32] focus:border-[#D97943] rounded pl-8 pr-3 py-1.5 text-xs text-[#E7E9E8] placeholder-[#60686B] focus:outline-none transition-colors"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              selectedCategory === cat
                ? "bg-[#D97943] text-white font-medium"
                : "bg-[#101315] border border-[#292F32] text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Landmarks List (Compact & Scannable) */}
      <div className="space-y-1.5">
        {filteredLandmarks.map((landmark) => {
          const isSelected = selectedLandmarkId === landmark.id;
          const [lon = 0, lat = 0] = landmark.location;

          return (
            <div
              key={landmark.id}
              onClick={() => handleFlyTo(landmark)}
              className={`p-2.5 rounded-md border transition-all text-xs cursor-pointer select-none ${
                isSelected
                  ? "bg-[#171B1D] border-[#D97943] shadow-sm"
                  : "bg-[#101315] border-[#292F32] hover:border-[#929B9E]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? "text-[#D97943]" : "text-[#60686B]"
                      }`}
                    />
                    <span
                      className={`font-medium truncate ${
                        isSelected ? "text-[#E7E9E8]" : "text-[#E7E9E8]"
                      }`}
                    >
                      {landmark.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-[#929B9E] font-mono mt-0.5 pl-5">
                    <span>
                      {lat.toFixed(2)}° N, {lon.toFixed(2)}° E
                    </span>
                    {landmark.elevationM !== undefined && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-0.5 text-[#80A49B]">
                          <Mountain className="w-2.5 h-2.5" />
                          <span>{landmark.elevationM.toLocaleString()} m</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getCategoryBadge(
                      landmark.category
                    )}`}
                  >
                    {landmark.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlyTo(landmark);
                    }}
                    title={`Fly to ${landmark.name}`}
                    aria-label={`Fly to ${landmark.name}`}
                    className="p-1 rounded text-[#929B9E] hover:text-[#D97943] hover:bg-[#171B1D] transition-colors"
                  >
                    <Crosshair className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-[#292F32] space-y-1 pl-5">
                  <p className="text-[11px] text-[#929B9E] leading-relaxed">
                    {landmark.description}
                  </p>
                  <div className="text-[10px] text-[#60686B] font-mono">
                    Source: {landmark.source}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredLandmarks.length === 0 && (
          <div className="p-4 text-center text-xs text-[#929B9E] bg-[#101315] rounded border border-[#292F32]">
            No landmarks match the filter.
          </div>
        )}
      </div>
    </div>
  );
}
