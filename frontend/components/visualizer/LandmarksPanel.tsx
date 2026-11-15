"use client";

import { useState } from "react";
import { MARS_LANDMARKS } from "@/lib/data/mars-datasets";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import type { MarsLandmark } from "@/lib/data/dataset.types";
import {
  MapPin,
  Crosshair,
  Compass,
  Mountain,
  Search,
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Landing Site":
        return "border-[#C66B3D]/50 text-[#E9A16A] bg-[#C66B3D]/10";
      case "Crater":
        return "border-[#E27D60]/40 text-[#E27D60] bg-[#E27D60]/10";
      case "Geological Feature":
        return "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
      case "Planitia":
        return "border-sky-500/30 text-sky-400 bg-sky-500/10";
      default:
        return "border-[#777C83]/30 text-[#A3A8B0] bg-[#17191D]";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#E9A16A] mb-1">
          <span className="flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Landmark Navigator</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#090A0C] border border-[#C66B3D]/30">
            {MARS_LANDMARKS.length} POIs
          </span>
        </div>
        <p className="text-xs text-[#777C83] leading-relaxed">
          Geodetically verified surface locations from NASA Mars 2020 Perseverance mission, USGS, and IAU nomenclature.
        </p>
      </div>

      {/* Visibility Notice if landmarks layer is hidden */}
      {!showLandmarks && (
        <div className="p-2.5 rounded bg-[#17191D] border border-amber-500/30 flex items-center justify-between text-xs">
          <span className="text-amber-400 text-[11px]">Surface markers are currently hidden on map</span>
          <button
            onClick={() => setShowLandmarks(true)}
            className="px-2 py-0.5 rounded bg-[#C66B3D] text-white text-[10px] uppercase font-mono font-bold tracking-wider hover:bg-[#D97D4E] transition-colors"
          >
            Show Markers
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#777C83] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter landmarks by name or feature..."
          className="w-full bg-[#090A0C] border border-[#17191D] focus:border-[#C66B3D] rounded pl-8 pr-3 py-1.5 text-xs text-[#E8E5DF] placeholder-[#777C83] focus:outline-none transition-colors"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wide transition-colors ${
              selectedCategory === cat
                ? "bg-[#C66B3D] text-white font-semibold"
                : "bg-[#17191D] text-[#777C83] hover:text-[#E8E5DF] hover:bg-[#202328]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Landmarks List */}
      <div className="space-y-2.5">
        {filteredLandmarks.map((landmark) => {
          const isSelected = selectedLandmarkId === landmark.id;
          const [lon = 0, lat = 0] = landmark.location;

          return (
            <div
              key={landmark.id}
              className={`p-3 rounded-lg border transition-all text-xs ${
                isSelected
                  ? "bg-[#17191D] border-[#C66B3D] shadow-md shadow-[#C66B3D]/10"
                  : "bg-[#17191D]/60 border-[#17191D] hover:border-[#777C83]/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h3 className="font-semibold text-[#E8E5DF] flex items-center space-x-1.5">
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? "text-[#E9A16A]" : "text-[#777C83]"
                      }`}
                    />
                    <span>{landmark.name}</span>
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-[#777C83] mt-0.5 font-mono">
                    <span>
                      {lat.toFixed(3)}° N, {lon.toFixed(3)}° E
                    </span>
                    {landmark.elevationM !== undefined && (
                      <>
                        <span>•</span>
                        <span className="flex items-center space-x-0.5 text-[#A3A8B0]">
                          <Mountain className="w-2.5 h-2.5" />
                          <span>{landmark.elevationM.toLocaleString()} m</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${getCategoryColor(
                    landmark.category
                  )}`}
                >
                  {landmark.category}
                </span>
              </div>

              <p className="text-[11px] text-[#A3A8B0] leading-relaxed mb-2.5">
                {landmark.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#090A0C] text-[10px]">
                <span className="text-[#777C83] truncate max-w-[190px]">
                  Src: {landmark.source}
                </span>
                <button
                  onClick={() => handleFlyTo(landmark)}
                  className={`px-2.5 py-1 rounded flex items-center space-x-1 font-mono uppercase tracking-wider text-[10px] transition-colors ${
                    isSelected
                      ? "bg-[#C66B3D] text-white font-semibold"
                      : "bg-[#090A0C] text-[#E9A16A] border border-[#C66B3D]/40 hover:bg-[#C66B3D] hover:text-white"
                  }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Fly To POI</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredLandmarks.length === 0 && (
          <div className="p-4 text-center text-xs text-[#777C83] bg-[#17191D]/40 rounded border border-[#17191D]">
            No landmarks match the selected search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
