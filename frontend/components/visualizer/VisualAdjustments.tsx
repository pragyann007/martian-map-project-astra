"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import type { MarsDataset, BlendMode } from "@/lib/data/dataset.types";
import { Sliders, Sun, Contrast, Blend, RotateCcw } from "lucide-react";

interface VisualAdjustmentsProps {
  dataset: MarsDataset;
}

export default function VisualAdjustments({ dataset }: VisualAdjustmentsProps) {
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);
  const layerBrightness = useVisualizerStore((state) => state.layerBrightness);
  const layerContrast = useVisualizerStore((state) => state.layerContrast);
  const layerBlendMode = useVisualizerStore((state) => state.layerBlendMode);

  const setLayerOpacity = useVisualizerStore((state) => state.setLayerOpacity);
  const setLayerBrightness = useVisualizerStore((state) => state.setLayerBrightness);
  const setLayerContrast = useVisualizerStore((state) => state.setLayerContrast);
  const setLayerBlendMode = useVisualizerStore((state) => state.setLayerBlendMode);

  const opacity = layerOpacity[dataset.id] !== undefined ? layerOpacity[dataset.id] : (dataset.defaultOpacity ?? 1);
  const brightness = layerBrightness[dataset.id] !== undefined ? layerBrightness[dataset.id] : 1.0;
  const contrast = layerContrast[dataset.id] !== undefined ? layerContrast[dataset.id] : 1.0;
  const blendMode = layerBlendMode[dataset.id] ?? "normal";

  const handleReset = () => {
    setLayerOpacity(dataset.id, dataset.defaultOpacity ?? 1);
    setLayerBrightness(dataset.id, 1.0);
    setLayerContrast(dataset.id, 1.0);
    setLayerBlendMode(dataset.id, "normal");
  };

  return (
    <div className="space-y-3 p-3 rounded-md bg-[#101315] border border-[#292F32] text-xs">
      <div className="flex items-center justify-between text-xs font-semibold text-[#E7E9E8]">
        <span className="flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#D97943]" />
          <span>Image Adjustments</span>
        </span>
        <button
          onClick={handleReset}
          title="Reset to default rendering"
          className="text-[10px] text-[#929B9E] hover:text-[#E7E9E8] transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Blend Mode Selection */}
      <div className="space-y-1">
        <label className="text-[10px] text-[#929B9E] font-medium flex items-center space-x-1">
          <Blend className="w-3 h-3 text-[#D97943]" />
          <span>Composite Blend Mode</span>
        </label>
        <select
          value={blendMode}
          onChange={(e) => setLayerBlendMode(dataset.id, e.target.value as BlendMode)}
          aria-label="Layer Blend Mode"
          className="w-full bg-[#0B0D0E] border border-[#292F32] rounded px-2.5 py-1.5 text-xs text-[#E7E9E8] focus:outline-none focus:border-[#D97943] transition-colors cursor-pointer"
        >
          <option value="normal">Normal (Direct Sensor Overlay)</option>
          <option value="multiply">Multiply (Pan-Sharpen with Base Map)</option>
          <option value="luminosity">Luminosity (Modulate Natural Color)</option>
          <option value="screen">Screen (Lighten Dark Shadowed Regions)</option>
          <option value="overlay">Overlay (Enhanced Relief Contrast)</option>
        </select>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#929B9E]">
          <span>Opacity</span>
          <span className="font-mono text-[#E7E9E8]">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
          className="w-full h-1 bg-[#292F32] rounded appearance-none cursor-pointer accent-[#D97943]"
        />
      </div>

      {/* Brightness Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#929B9E]">
          <span className="flex items-center space-x-1">
            <Sun className="w-2.5 h-2.5 text-[#D97943]" />
            <span>Brightness</span>
          </span>
          <span className="font-mono text-[#E7E9E8]">{Math.round(brightness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={brightness}
          onChange={(e) => setLayerBrightness(dataset.id, parseFloat(e.target.value))}
          className="w-full h-1 bg-[#292F32] rounded appearance-none cursor-pointer accent-[#D97943]"
        />
      </div>

      {/* Contrast Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-[#929B9E]">
          <span className="flex items-center space-x-1">
            <Contrast className="w-2.5 h-2.5 text-[#D97943]" />
            <span>Contrast</span>
          </span>
          <span className="font-mono text-[#E7E9E8]">{Math.round(contrast * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={contrast}
          onChange={(e) => setLayerContrast(dataset.id, parseFloat(e.target.value))}
          className="w-full h-1 bg-[#292F32] rounded appearance-none cursor-pointer accent-[#D97943]"
        />
      </div>
    </div>
  );
}
