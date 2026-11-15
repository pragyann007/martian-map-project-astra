"use client";

import { useState } from "react";
import type { MarsDataset } from "@/lib/data/dataset.types";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import { Eye, EyeOff, Sliders, ArrowUpRight } from "lucide-react";

interface DatasetCardProps {
  dataset: MarsDataset;
  isActive: boolean;
  onSelect: () => void;
}

export default function DatasetCard({ dataset, isActive, onSelect }: DatasetCardProps) {
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const toggleOverlay = useVisualizerStore((state) => state.toggleOverlay);
  const setInspectorDataset = useVisualizerStore((state) => state.setInspectorDataset);
  const setActiveSidebarTab = useVisualizerStore((state) => state.setActiveSidebarTab);
  const setHoveredDataset = useVisualizerStore((state) => state.setHoveredDataset);

  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);
  const setLayerOpacity = useVisualizerStore((state) => state.setLayerOpacity);

  const [isOpacityOpen, setIsOpacityOpen] = useState(false);

  if (!dataset) return null;

  const isVisible = (visibleLayers || []).includes(dataset.id);
  const opacity = layerOpacity[dataset.id] ?? dataset.defaultOpacity ?? 1;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleOverlay(dataset.id);
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInspectorDataset(dataset.id);
    setActiveSidebarTab("details");
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHoveredDataset(dataset.id)}
      onMouseLeave={() => setHoveredDataset(null)}
      className={`group rounded-md border transition-all text-xs cursor-pointer select-none ${
        isActive
          ? "bg-[#171B1D] border-[#D97943]/60 shadow-md"
          : "bg-[#101315] border-[#292F32] hover:border-[#929B9E]/40"
      }`}
    >
      <div className="p-2.5 flex items-center justify-between gap-2.5">
        {/* Visibility Checkbox & Eye */}
        <button
          type="button"
          onClick={handleToggle}
          title={isVisible ? `Hide ${dataset.shortName}` : `Show ${dataset.shortName}`}
          aria-label={isVisible ? `Hide ${dataset.shortName}` : `Show ${dataset.shortName}`}
          className={`p-1.5 rounded transition-colors shrink-0 flex items-center justify-center ${
            isVisible
              ? "text-[#D97943] bg-[#D97943]/15 hover:bg-[#D97943]/25"
              : "text-[#60686B] hover:text-[#E7E9E8] bg-[#0B0D0E]"
          }`}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Dataset Title & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-medium truncate ${
                isVisible ? "text-[#E7E9E8]" : "text-[#929B9E]"
              }`}
            >
              {dataset.shortName || dataset.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-[#929B9E] font-mono mt-0.5">
            <span>{dataset.instrument}</span>
            <span>•</span>
            <span>{dataset.resolutionMeters} m/px</span>
            {dataset.sourceType === "local-raster" && (
              <>
                <span>•</span>
                <span className="text-[#D97943]">Local</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons: Quick Opacity & Details Link */}
        <div className="flex items-center space-x-1 shrink-0">
          {isVisible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpacityOpen((prev) => !prev);
              }}
              title="Adjust Opacity"
              aria-label="Adjust Opacity"
              className={`p-1.5 rounded transition-colors text-[11px] font-mono flex items-center space-x-1 ${
                isOpacityOpen
                  ? "bg-[#292F32] text-[#E7E9E8]"
                  : "text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
              }`}
            >
              <Sliders className="w-3 h-3 text-[#D97943]" />
              <span>{Math.round(opacity * 100)}%</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleInspect}
            title="View Scientific Details"
            aria-label={`View details for ${dataset.name}`}
            className="p-1.5 rounded text-[#929B9E] hover:text-[#D97943] hover:bg-[#171B1D] transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Opacity Inline Slider */}
      {isVisible && isOpacityOpen && (
        <div
          className="px-3 pb-2.5 pt-1 border-t border-[#292F32]/60 bg-[#0B0D0E]/50 flex items-center space-x-3 text-[11px]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[#929B9E] shrink-0 font-mono">Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
            aria-label={`${dataset.name} Opacity`}
            className="w-full h-1 bg-[#292F32] rounded appearance-none cursor-pointer accent-[#D97943]"
          />
          <span className="font-mono text-[#E7E9E8] shrink-0 w-8 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
