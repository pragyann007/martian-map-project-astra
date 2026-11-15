"use client";

import { useState } from "react";
import type { MarsDataset } from "@/lib/data/dataset.types";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import VisualAdjustments from "./VisualAdjustments";
import {
  Globe,
  HardDrive,
  Eye,
  EyeOff,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

interface DatasetCardProps {
  dataset: MarsDataset;
  isActive: boolean;
  onSelect: () => void;
}

export default function DatasetCard({ dataset, isActive, onSelect }: DatasetCardProps) {
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const toggleLayer = useVisualizerStore((state) => state.toggleLayer);
  const setInspectorDataset = useVisualizerStore((state) => state.setInspectorDataset);
  const setActiveSidebarTab = useVisualizerStore((state) => state.setActiveSidebarTab);
  const layerBlendMode = useVisualizerStore((state) => state.layerBlendMode);

  const [showAdjustments, setShowAdjustments] = useState<boolean>(true);

  if (!dataset) return null;

  const isVisible = (visibleLayers || []).includes(dataset.id);
  const resolution = dataset.resolutionMeters ?? "N/A";
  const currentBlend = layerBlendMode[dataset.id] ?? "normal";

  const getSpectralBadge = () => {
    switch (dataset.spectralType) {
      case "panchromatic":
        return { label: "Panchromatic (500–800nm)", color: "text-[#A3A8B0] border-[#777C83]/30" };
      case "thermal":
        return { label: "Thermal IR (100m)", color: "text-[#E27D60] border-[#E27D60]/30" };
      case "color":
        return { label: "Visual Color", color: "text-[#E9A16A] border-[#C66B3D]/30" };
      case "altimetry":
        return { label: "Laser Altimetry", color: "text-emerald-400 border-emerald-500/30" };
      default:
        return { label: "Planetary Observation", color: "text-[#777C83] border-[#777C83]/20" };
    }
  };

  const badge = getSpectralBadge();

  const handleInspectTelemetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInspectorDataset(dataset.id);
    setActiveSidebarTab("telemetry");
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayer(dataset.id);
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border transition-all cursor-pointer ${
        isActive
          ? "bg-[#17191D] border-[#C66B3D] shadow-lg shadow-[#C66B3D]/10"
          : "bg-[#17191D]/50 border-[#17191D] hover:border-[#777C83]/30"
      }`}
    >
      <div className="p-3">
        {/* Top Header: Indicator + Title + Resolution */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleToggleVisibility}
                title={isVisible ? "Hide layer on map" : "Show layer on map"}
                className={`p-1 rounded transition-colors ${
                  isVisible
                    ? "text-[#E9A16A] bg-[#C66B3D]/20 hover:bg-[#C66B3D]/30"
                    : "text-[#777C83] bg-[#090A0C] hover:text-[#E8E5DF]"
                }`}
              >
                {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <h3 className="text-xs font-semibold text-[#E8E5DF] tracking-wide truncate">
                {dataset.shortName || dataset.name}
              </h3>
            </div>

            {/* Subtitle details */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] text-[#777C83] pl-6">
              <span>{dataset.instrument}</span>
              <span>•</span>
              <span>{dataset.mission}</span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1 text-[#A3A8B0]">
                {dataset.sourceType === "wmts" ? (
                  <>
                    <Globe className="w-2.5 h-2.5 text-[#E9A16A]" />
                    <span>NASA Trek</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-2.5 h-2.5 text-[#A3A8B0]" />
                    <span>Local Raster</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090A0C] border border-[#777C83]/30 text-[#E9A16A]">
              {resolution} m/px
            </span>
            {currentBlend !== "normal" && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#C66B3D]/20 text-[#E9A16A] border border-[#C66B3D]/30">
                {currentBlend}
              </span>
            )}
          </div>
        </div>

        {/* Spectral Tag & Telemetry Link */}
        <div className="mt-2.5 pt-2 border-t border-[#090A0C] flex items-center justify-between text-[10px]">
          <span className={`px-1.5 py-0.5 rounded font-mono border text-[9px] ${badge.color}`}>
            {badge.label}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleInspectTelemetry}
              className="text-[#777C83] hover:text-[#E9A16A] flex items-center space-x-1 transition-colors"
              title="Inspect scientific metadata and bandwidth"
            >
              <Info className="w-3 h-3" />
              <span>Specs</span>
            </button>

            {isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdjustments((prev) => !prev);
                }}
                className="text-[#777C83] hover:text-[#E8E5DF] flex items-center space-x-0.5 transition-colors"
                title="Toggle visual tuning controls"
              >
                <Sliders className="w-3 h-3 text-[#E9A16A]" />
                {showAdjustments ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Adjustments Accordion (when active and expanded) */}
      {isActive && showAdjustments && (
        <div
          className="border-t border-[#090A0C] p-3 bg-[#090A0C]/40 rounded-b-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <VisualAdjustments dataset={dataset} />
        </div>
      )}
    </div>
  );
}
