"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import { MARS_DATASETS } from "@/lib/data/mars-datasets";
import { ExternalLink, ShieldAlert } from "lucide-react";

export default function DatasetInspector() {
  const activeDatasetId = useVisualizerStore((state) => state.activeDatasetId);
  const activeDataset = MARS_DATASETS.find((d) => d.id === activeDatasetId) || MARS_DATASETS[0];

  if (!activeDataset) {
    return (
      <div className="p-4 text-xs text-[#777C83]">
        No dataset selected. Select a dataset from the list above to inspect its metadata.
      </div>
    );
  }

  const [west, south, east, north] = activeDataset.extent;
  const [width, height] = activeDataset.imageSize;

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="border-b border-[#17191D] pb-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#E9A16A] mb-1">
          Dataset Inspector
        </div>
        <h2 className="text-base font-bold text-[#E8E5DF] tracking-wide">
          {activeDataset.name}
        </h2>
        <div className="text-[11px] text-[#777C83] mt-0.5">
          {activeDataset.mission} • {activeDataset.instrument}
        </div>
      </div>

      {/* Description */}
      <div className="text-[#A3A8B0] leading-relaxed">
        {activeDataset.description}
      </div>

      {/* Scientific Honesty Notice */}
      <div className="p-3 rounded bg-[#17191D]/80 border border-[#C66B3D]/30 space-y-1.5">
        <div className="flex items-center space-x-1.5 text-[#E9A16A] font-semibold text-[11px] uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Scientific Calibration Notice</span>
        </div>
        <p className="text-[11px] text-[#777C83] leading-relaxed">
          Values are 8-bit uncalibrated digital numbers (DN 0–255) representing relative thermal emission.
          They are <strong className="text-[#E8E5DF]">not calibrated Kelvin temperatures</strong>. Black border fill (DN 0) has been assigned full transparency as nodata.
        </p>
      </div>

      {/* Spatial Metadata Table */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-[#777C83] font-semibold">
          Spatial & Technical Parameters
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Resolution</span>
            <span className="text-[#E8E5DF]">{activeDataset.resolutionMeters} m / pixel</span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Raster Dimensions</span>
            <span className="text-[#E8E5DF]">{width} × {height} px</span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
            <span className="text-[#777C83] block text-[9px] uppercase">Geographic Extent [W, S, E, N]</span>
            <span className="text-[#E8E5DF] break-all">
              [{west.toFixed(4)}°, {south.toFixed(4)}°, {east.toFixed(4)}°, {north.toFixed(4)}°]
            </span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
            <span className="text-[#777C83] block text-[9px] uppercase">Projection Reference</span>
            <span className="text-[#E9A16A]">{activeDataset.projection} (Equirectangular Cylindrical)</span>
          </div>
        </div>
      </div>

      {/* Attribution & Source Link */}
      <div className="pt-2 border-t border-[#17191D] flex items-center justify-between text-[11px]">
        <div className="text-[#777C83]">
          Attribution: <span className="text-[#E8E5DF]">{activeDataset.attribution}</span>
        </div>
        <a
          href={activeDataset.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[#E9A16A] hover:text-[#C66B3D] transition-colors"
        >
          <span>ASU Archive</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
