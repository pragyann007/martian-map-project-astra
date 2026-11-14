"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import type { MarsRasterDataset } from "@/lib/data/dataset.types";
import { Eye, EyeOff, Sliders } from "lucide-react";

interface LayerControlsProps {
  dataset: MarsRasterDataset;
}

export default function LayerControls({ dataset }: LayerControlsProps) {
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);
  const toggleLayer = useVisualizerStore((state) => state.toggleLayer);
  const setLayerOpacity = useVisualizerStore((state) => state.setLayerOpacity);

  const isVisible = visibleLayers.includes(dataset.id);
  const opacity = layerOpacity[dataset.id] !== undefined ? layerOpacity[dataset.id] : 1;

  return (
    <div className="space-y-3 pt-2">
      {/* Visibility Toggle */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center space-x-2 cursor-pointer text-[#E8E5DF] hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={() => toggleLayer(dataset.id)}
            className="w-4 h-4 rounded border-[#777C83] bg-[#090A0C] text-[#C66B3D] focus:ring-1 focus:ring-[#C66B3D] cursor-pointer"
          />
          <span className="font-medium">Layer Visibility</span>
        </label>
        <button
          onClick={() => toggleLayer(dataset.id)}
          className="text-[#777C83] hover:text-[#E8E5DF] transition-colors p-1"
          title={isVisible ? "Hide layer" : "Show layer"}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5 text-[#E9A16A]" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#777C83]">
          <span className="flex items-center space-x-1.5">
            <Sliders className="w-3 h-3 text-[#E9A16A]" />
            <span>Opacity</span>
          </span>
          <span className="font-mono text-[#E8E5DF]">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          disabled={!isVisible}
          onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[#090A0C] rounded-lg appearance-none cursor-pointer accent-[#C66B3D] disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
