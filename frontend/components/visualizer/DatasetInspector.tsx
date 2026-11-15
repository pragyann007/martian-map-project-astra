"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import { MARS_DATASETS, JEZ_CTX } from "@/lib/data/mars-datasets";
import VisualAdjustments from "./VisualAdjustments";
import {
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Globe,
  HardDrive,
  Info,
  Activity,
  Layers,
} from "lucide-react";

export default function DatasetInspector() {
  const selectedDatasetId = useVisualizerStore(
    (state) => state.selectedDatasetId || state.activeInspectorDatasetId
  );
  const setSelectedDataset = useVisualizerStore((state) => state.setSelectedDataset);

  const activeDataset =
    MARS_DATASETS.find((d) => d.id === selectedDatasetId) ||
    MARS_DATASETS.find((d) => d.id === "jez-ctx") ||
    MARS_DATASETS[0] ||
    JEZ_CTX;

  if (!activeDataset) {
    return (
      <div className="p-4 text-xs text-[#929B9E]">
        Select a layer or landmark to inspect details.
      </div>
    );
  }

  const extent = Array.isArray(activeDataset.extent)
    ? activeDataset.extent
    : [77.1604, 18.211, 77.6991, 18.7211];
  const [west = 0, south = 0, east = 0, north = 0] = extent;

  const isLocalRaster = activeDataset.sourceType === "local-raster";
  const imageSize =
    isLocalRaster && "imageSize" in activeDataset && Array.isArray(activeDataset.imageSize)
      ? activeDataset.imageSize
      : [1187, 1186];
  const [width = 0, height = 0] = imageSize;

  return (
    <div className="space-y-4 text-xs">
      {/* Inspector Header & Layer Selector */}
      <div className="border-b border-[#292F32] pb-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#929B9E]">
          <span className="flex items-center space-x-1.5 font-medium text-[#E7E9E8]">
            <Layers className="w-3.5 h-3.5 text-[#D97943]" />
            <span>Dataset Specification</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>NASA Verified</span>
          </span>
        </div>

        {/* Layer Selector Dropdown */}
        <select
          value={activeDataset.id}
          onChange={(e) => setSelectedDataset(e.target.value)}
          aria-label="Select dataset to inspect"
          className="w-full bg-[#101315] border border-[#292F32] rounded px-2.5 py-1.5 text-xs text-[#E7E9E8] focus:outline-none focus:border-[#D97943] transition-colors cursor-pointer"
        >
          {MARS_DATASETS.map((ds) => (
            <option key={ds.id} value={ds.id} className="bg-[#101315] text-[#E7E9E8]">
              {ds.shortName || ds.name} ({ds.resolutionMeters} m/px)
            </option>
          ))}
        </select>

        <div>
          <h2 className="text-sm font-semibold text-[#E7E9E8] tracking-wide mt-1">
            {activeDataset.name}
          </h2>
          <div className="text-[11px] text-[#929B9E] mt-0.5 flex items-center space-x-2">
            <span>
              {activeDataset.mission} • {activeDataset.instrument}
            </span>
            <span>|</span>
            <span className="inline-flex items-center space-x-1 text-[#D97943]">
              {activeDataset.sourceType === "wmts" ? (
                <>
                  <Globe className="w-3 h-3" />
                  <span>NASA Mars Trek WMTS</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3" />
                  <span>Local Processed Raster</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-[#929B9E] leading-relaxed text-[11px]">
        {activeDataset.description}
      </div>

      {/* Scientific Explanation Card for Panchromatic or Thermal */}
      {activeDataset.spectralType === "panchromatic" && (
        <div className="p-3 rounded-md bg-[#101315] border border-[#292F32] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D97943] font-medium text-[11px]">
            <Info className="w-3.5 h-3.5" />
            <span>Panchromatic (Broadband) Imaging</span>
          </div>
          <p className="text-[11px] text-[#929B9E] leading-relaxed">
            Panchromatic CCD detectors omit color filter arrays to capture all incident photons across 500–800 nm, achieving maximum signal-to-noise ratio and ultra-high spatial resolution without chromatic dispersion.
          </p>
        </div>
      )}

      {activeDataset.spectralType === "thermal" && (
        <div className="p-3 rounded-md bg-[#101315] border border-[#292F32] space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D97943] font-medium text-[11px]">
            <Activity className="w-3.5 h-3.5" />
            <span>Thermal Infrared &amp; Thermal Inertia</span>
          </div>
          <p className="text-[11px] text-[#929B9E] leading-relaxed">
            THEMIS measures emission in thermal infrared (6.78–14.88 µm). Daytime brightness tracks solar albedo response. Nighttime emission reflects <strong>thermal inertia</strong>: high-inertia bedrock and boulder fields hold warmth through the night and appear bright, whereas fine loose dust cools rapidly and appears dark.
          </p>
        </div>
      )}

      {/* Scientific Calibration Notice */}
      {activeDataset.calibrationNotice && (
        <div className="p-3 rounded-md bg-[#171B1D] border border-[#D97943]/30 space-y-1">
          <div className="flex items-center space-x-1.5 text-[#D97943] font-medium text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scientific Data Notice</span>
          </div>
          <p className="text-[11px] text-[#929B9E] leading-relaxed">
            {activeDataset.calibrationNotice}
          </p>
        </div>
      )}

      {/* Visual Adjustments for this dataset */}
      <VisualAdjustments dataset={activeDataset} />

      {/* Technical & Sensor Specifications Table */}
      <div className="space-y-2">
        <div className="text-[11px] text-[#929B9E] font-medium flex items-center justify-between">
          <span>Sensor &amp; Geodetic Parameters</span>
          <span className="font-mono text-[10px] text-[#60686B]">EPSG:104905</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
          <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
            <span className="text-[#60686B] block text-[10px]">Ground Resolution</span>
            <span className="text-[#E7E9E8] font-medium">
              {activeDataset.resolutionMeters} m / px
            </span>
          </div>

          <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
            <span className="text-[#60686B] block text-[10px]">Spectral Band</span>
            <span className="text-[#E7E9E8] truncate block">
              {activeDataset.wavelengthRange || "Broadband"}
            </span>
          </div>

          <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
            <span className="text-[#60686B] block text-[10px]">Service Type</span>
            <span className="text-[#E7E9E8]">
              {activeDataset.sourceType === "wmts" ? "WMTS REST 256px" : "Local GeoTIFF"}
            </span>
          </div>

          <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
            <span className="text-[#60686B] block text-[10px]">Spectral Modality</span>
            <span className="text-[#D97943] uppercase">
              {activeDataset.spectralType}
            </span>
          </div>

          {activeDataset.sourceType === "wmts" ? (
            <>
              <div className="p-2 rounded bg-[#101315] border border-[#292F32] col-span-2">
                <span className="text-[#60686B] block text-[10px]">
                  NASA Mars Trek Layer Identifier
                </span>
                <span className="text-[#D97943] break-all text-[10px] select-all">
                  {activeDataset.layerId}
                </span>
              </div>

              <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
                <span className="text-[#60686B] block text-[10px]">Tile Matrix Set</span>
                <span className="text-[#E7E9E8]">{activeDataset.tileMatrixSet}</span>
              </div>

              <div className="p-2 rounded bg-[#101315] border border-[#292F32]">
                <span className="text-[#60686B] block text-[10px]">Native Zoom Range</span>
                <span className="text-[#E7E9E8]">0 to {activeDataset.maxNativeZoom}</span>
              </div>
            </>
          ) : (
            <div className="p-2 rounded bg-[#101315] border border-[#292F32] col-span-2">
              <span className="text-[#60686B] block text-[10px]">Raster Dimensions</span>
              <span className="text-[#E7E9E8]">{width} × {height} pixels</span>
            </div>
          )}

          <div className="p-2 rounded bg-[#101315] border border-[#292F32] col-span-2">
            <span className="text-[#60686B] block text-[10px]">
              Coverage Bounding Box [W, S, E, N]
            </span>
            <span className="text-[#E7E9E8] text-[10px] select-all">
              [{west.toFixed(3)}°, {south.toFixed(3)}°, {east.toFixed(3)}°, {north.toFixed(3)}°]
            </span>
          </div>

          {activeDataset.coverageNote && (
            <div className="p-2 rounded bg-[#101315] border border-[#292F32] col-span-2">
              <span className="text-[#60686B] block text-[10px]">Coverage Extent Note</span>
              <span className="text-[#929B9E] text-[10px] font-sans">
                {activeDataset.coverageNote}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution & Official NASA Portal Link */}
      <div className="pt-2 border-t border-[#292F32] flex items-center justify-between text-[11px]">
        <div className="text-[#929B9E] truncate mr-2">
          Attribution: <span className="text-[#E7E9E8]">{activeDataset.attribution}</span>
        </div>
        <a
          href={activeDataset.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[#D97943] hover:underline shrink-0 font-mono text-[10px]"
        >
          <span>NASA Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
