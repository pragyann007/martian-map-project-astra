"use client";

import type { MarsRasterDataset } from "@/lib/data/dataset.types";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import LayerControls from "./LayerControls";

interface DatasetCardProps {
  dataset: MarsRasterDataset;
  isActive: boolean;
  onSelect: () => void;
}

export default function DatasetCard({ dataset, isActive, onSelect }: DatasetCardProps) {
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const isVisible = visibleLayers.includes(dataset.id);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded border transition-all cursor-pointer ${
        isActive
          ? "bg-[#17191D] border-[#C66B3D] shadow-md shadow-[#C66B3D]/10"
          : "bg-[#17191D]/60 border-[#17191D] hover:border-[#777C83]/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isVisible ? "bg-[#E9A16A]" : "bg-[#777C83]"
              }`}
            />
            <h3 className="text-sm font-semibold text-[#E8E5DF] tracking-wide">
              {dataset.name}
            </h3>
          </div>
          <p className="text-[11px] text-[#777C83]">
            {dataset.instrument} • {dataset.mission}
          </p>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#090A0C] border border-[#777C83]/30 text-[#E9A16A]">
          {dataset.resolutionMeters} m/px
        </span>
      </div>

      {/* Layer Controls when active */}
      {isActive && (
        <div className="mt-3 pt-3 border-t border-[#090A0C]" onClick={(e) => e.stopPropagation()}>
          <LayerControls dataset={dataset} />
        </div>
      )}
    </div>
  );
}
