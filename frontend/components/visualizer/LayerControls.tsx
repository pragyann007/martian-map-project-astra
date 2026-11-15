"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import type { MarsDataset } from "@/lib/data/dataset.types";
import { Eye, EyeOff, Sliders } from "lucide-react";

interface LayerControlsProps {
  dataset: MarsDataset;
}

export default function LayerControls({ dataset }: LayerControlsProps) {
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);
  const toggleLayer = useVisualizerStore((state) => state.toggleLayer);
  const setLayerOpacity = useVisualizerStore((state) => state.setLayerOpacity);

  if (!dataset) return null;

  const isVisible = (visibleLayers || []).includes(dataset.id);
  const opacity =
    layerOpacity && layerOpacity[dataset.id] !== undefined
      ? layerOpacity[dataset.id]
      : (dataset.defaultOpacity ?? 1);

  return (
    <div className="space-y-2.5 pt-1.5 text-xs">
      {/* Visibility Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer text-[#E7E9E8] hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={() => toggleLayer(dataset.id)}
            className="w-3.5 h-3.5 rounded border-[#292F32] bg-[#0B0D0E] text-[#D97943] focus:ring-1 focus:ring-[#D97943] cursor-pointer"
          />
          <span className="font-medium">Layer Visibility</span>
        </label>
        <button
          onClick={() => toggleLayer(dataset.id)}
          className="text-[#929B9E] hover:text-[#E7E9E8] transition-colors p-1"
          title={isVisible ? "Hide layer" : "Show layer"}
        >
          {isVisible ? (
            <Eye className="w-3.5 h-3.5 text-[#D97943]" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#929B9E]">
          <span className="flex items-center space-x-1.5">
            <Sliders className="w-3 h-3 text-[#D97943]" />
            <span>Opacity</span>
          </span>
          <span className="font-mono text-[#E7E9E8]">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          disabled={!isVisible}
          onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
          className="w-full h-1 bg-[#292F32] rounded appearance-none cursor-pointer accent-[#D97943] disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
