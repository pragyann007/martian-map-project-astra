"use client";

import { useVisualizerStore } from "@/lib/state/visualizer-store";
import { MARS_DATASETS, JEZ_CTX } from "@/lib/data/mars-datasets";
import {
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Globe,
  HardDrive,
  Info,
  Camera,
  Activity,
} from "lucide-react";

export default function DatasetInspector() {
  const activeInspectorDatasetId = useVisualizerStore(
    (state) => state.activeInspectorDatasetId
  );
  const setInspectorDataset = useVisualizerStore((state) => state.setInspectorDataset);

  const activeDataset =
    MARS_DATASETS.find((d) => d.id === activeInspectorDatasetId) ||
    MARS_DATASETS.find((d) => d.id === "jez-ctx") ||
    MARS_DATASETS[0] ||
    JEZ_CTX;

  if (!activeDataset) {
    return (
      <div className="p-4 text-xs text-[#777C83]">
        No dataset selected. Select a layer to inspect its scientific telemetry.
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
      <div className="border-b border-[#17191D] pb-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#E9A16A]">
          <span className="flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>Mission Telemetry &amp; Specs</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>NASA Verified</span>
          </span>
        </div>

        {/* Layer Selector Dropdown */}
        <select
          value={activeDataset.id}
          onChange={(e) => setInspectorDataset(e.target.value)}
          aria-label="Select dataset to inspect"
          className="w-full bg-[#090A0C] border border-[#777C83]/30 rounded px-2.5 py-1.5 text-xs text-[#E8E5DF] focus:outline-none focus:border-[#C66B3D] transition-colors cursor-pointer"
        >
          {MARS_DATASETS.map((ds) => (
            <option key={ds.id} value={ds.id} className="bg-[#090A0C] text-[#E8E5DF]">
              {ds.name} ({ds.resolutionMeters} m/px)
            </option>
          ))}
        </select>

        <div>
          <h2 className="text-sm font-bold text-[#E8E5DF] tracking-wide mt-1">
            {activeDataset.name}
          </h2>
          <div className="text-[11px] text-[#777C83] mt-0.5 flex items-center space-x-2">
            <span>
              {activeDataset.mission} • {activeDataset.instrument}
            </span>
            <span>|</span>
            <span className="inline-flex items-center space-x-1 text-[#E9A16A]">
              {activeDataset.sourceType === "wmts" ? (
                <>
                  <Globe className="w-3 h-3" />
                  <span>NASA Mars Trek WMTS</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3" />
                  <span>Local GDAL Raster</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-[#A3A8B0] leading-relaxed text-[11px]">
        {activeDataset.description}
      </div>

      {/* Scientific Explanation Card for Panchromatic or Thermal */}
      {activeDataset.spectralType === "panchromatic" && (
        <div className="p-3 rounded-lg bg-[#0E1015] border border-[#777C83]/30 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[#E9A16A] font-semibold text-[10px] uppercase font-mono tracking-wider">
            <Info className="w-3.5 h-3.5" />
            <span>Why is this imagery panchromatic (grayscale)?</span>
          </div>
          <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
            Panchromatic CCDs omit color Bayer filter mosaics to capture 100% of incident photons across 500–800 nm broadband. This achieves maximum signal-to-noise ratio and ultra-high spatial resolution (up to 25 cm/px) without chromatic aberration. To view authentic surface hues, blend this layer over the Viking Color Base Map using <strong>Multiply</strong> or <strong>Luminosity</strong> mode!
          </p>
        </div>
      )}

      {activeDataset.spectralType === "thermal" && (
        <div className="p-3 rounded-lg bg-[#0E1015] border border-[#E27D60]/30 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[#E27D60] font-semibold text-[10px] uppercase font-mono tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Thermal Infrared &amp; Thermal Inertia</span>
          </div>
          <p className="text-[11px] text-[#A3A8B0] leading-relaxed">
            THEMIS measures emission in thermal infrared (6.78–14.88 µm). Daytime brightness reflects solar albedo response. Nighttime brightness is a direct indicator of <strong>thermal inertia</strong>: high-inertia bedrock and boulder fields hold warmth through the night and glow bright, while low-inertia loose dust cools rapidly and appears dark.
          </p>
        </div>
      )}

      {/* Scientific Calibration Notice */}
      {activeDataset.calibrationNotice && (
        <div className="p-3 rounded-lg bg-[#17191D]/80 border border-[#C66B3D]/30 space-y-1">
          <div className="flex items-center space-x-1.5 text-[#E9A16A] font-semibold text-[10px] uppercase tracking-wider font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scientific Data Honesty Notice</span>
          </div>
          <p className="text-[11px] text-[#777C83] leading-relaxed">
            {activeDataset.calibrationNotice}
          </p>
        </div>
      )}

      {/* Technical & Sensor Specifications Table */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-[#777C83] font-semibold flex items-center justify-between">
          <span>Sensor &amp; Geodetic Parameters</span>
          <span className="font-mono text-[#E9A16A]">EPSG:104905</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Ground Resolution</span>
            <span className="text-[#E8E5DF] font-semibold">
              {activeDataset.resolutionMeters} m / px
            </span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Spectral Bandwidth</span>
            <span className="text-[#E8E5DF] truncate block">
              {activeDataset.wavelengthRange || "Broadband"}
            </span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Service Type</span>
            <span className="text-[#E8E5DF] uppercase">
              {activeDataset.sourceType === "wmts" ? "WMTS REST 256px" : "Local GeoTIFF"}
            </span>
          </div>

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
            <span className="text-[#777C83] block text-[9px] uppercase">Spectral Modality</span>
            <span className="text-[#E9A16A] uppercase">
              {activeDataset.spectralType || "Planetary"}
            </span>
          </div>

          {activeDataset.sourceType === "wmts" ? (
            <>
              <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
                <span className="text-[#777C83] block text-[9px] uppercase">
                  NASA Mars Trek Layer Identifier
                </span>
                <span className="text-[#E9A16A] break-all text-[10px] select-all">
                  {activeDataset.layerId}
                </span>
              </div>

              <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
                <span className="text-[#777C83] block text-[9px] uppercase">Tile Matrix Set</span>
                <span className="text-[#E8E5DF]">{activeDataset.tileMatrixSet}</span>
              </div>

              <div className="p-2 rounded bg-[#17191D] border border-[#17191D]">
                <span className="text-[#777C83] block text-[9px] uppercase">Native Zoom Range</span>
                <span className="text-[#E8E5DF]">0 to {activeDataset.maxNativeZoom}</span>
              </div>
            </>
          ) : (
            <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
              <span className="text-[#777C83] block text-[9px] uppercase">Raster Dimensions</span>
              <span className="text-[#E8E5DF]">{width} × {height} pixels</span>
            </div>
          )}

          <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
            <span className="text-[#777C83] block text-[9px] uppercase">
              Coverage Bounding Box [W, S, E, N]
            </span>
            <span className="text-[#E8E5DF] text-[10px] select-all">
              [{west.toFixed(4)}°, {south.toFixed(4)}°, {east.toFixed(4)}°, {north.toFixed(4)}°]
            </span>
          </div>

          {activeDataset.coverageNote && (
            <div className="p-2 rounded bg-[#17191D] border border-[#17191D] col-span-2">
              <span className="text-[#777C83] block text-[9px] uppercase">Coverage Extent Note</span>
              <span className="text-[#A3A8B0] text-[10px] font-sans">
                {activeDataset.coverageNote}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution & Official NASA Portal Link */}
      <div className="pt-2 border-t border-[#17191D] flex items-center justify-between text-[11px]">
        <div className="text-[#777C83] truncate mr-2">
          Attribution: <span className="text-[#E8E5DF]">{activeDataset.attribution}</span>
        </div>
        <a
          href={activeDataset.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-[#E9A16A] hover:text-[#C66B3D] transition-colors shrink-0 font-mono text-[10px] uppercase tracking-wider"
        >
          <span>NASA Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
