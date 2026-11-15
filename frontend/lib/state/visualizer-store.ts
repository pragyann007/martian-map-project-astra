import { create } from "zustand";
import type { BlendMode } from "@/lib/data/dataset.types";

interface VisualizerState {
  // Base map & Overlay IDs
  activeBaseMapId: string;
  activeOverlayId: string;
  activeInspectorDatasetId: string;

  // Layer rendering state
  visibleLayers: string[];
  layerOpacity: Record<string, number>;
  layerBrightness: Record<string, number>;
  layerContrast: Record<string, number>;
  layerBlendMode: Record<string, BlendMode>;

  // Cartographic & Landmark Overlays
  showGraticule: boolean;
  showLandmarks: boolean;
  showFootprints: boolean;
  selectedLandmarkId: string | null;
  landmarkNonce: number;

  // Workspace layout
  isSidebarOpen: boolean;
  activeSidebarTab: "layers" | "telemetry" | "landmarks";

  // Actions
  setBaseMap: (id: string) => void;
  setOverlay: (id: string) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBrightness: (id: string, brightness: number) => void;
  setLayerContrast: (id: string, contrast: number) => void;
  setLayerBlendMode: (id: string, mode: BlendMode) => void;

  setShowGraticule: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowLandmarks: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowFootprints: (show: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedLandmark: (id: string | null) => void;
  flyToLandmark: (id: string) => void;

  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setActiveSidebarTab: (tab: "layers" | "telemetry" | "landmarks") => void;
  setInspectorDataset: (id: string) => void;

  // Backwards compatibility aliases
  activeDatasetId: string;
  selectBaseLayer: (id: string) => void;
  setActiveDataset: (id: string) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  // Default: Viking Planetary Color as base, CTX 6m as high-res overlay
  activeBaseMapId: "viking-mdim21",
  activeOverlayId: "jez-ctx",
  activeInspectorDatasetId: "jez-ctx",

  // Both the global Viking color basemap AND CTX high-res overlay are active by default
  visibleLayers: ["viking-mdim21", "jez-ctx"],

  layerOpacity: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 0.85,
    "jez-ctx": 0.95,
    "jez-hirise": 1.0,
    "jez-regional-visible": 0.95,
    "themis-day-wmts": 0.85,
    "themis-night-wmts": 0.85,
    "themis-day": 0.9,
  },

  layerBrightness: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 1.05,
    "jez-ctx": 1.05,
    "jez-hirise": 1.05,
    "jez-regional-visible": 1.0,
    "themis-day-wmts": 1.0,
    "themis-night-wmts": 1.0,
    "themis-day": 1.0,
  },

  layerContrast: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 1.1,
    "jez-ctx": 1.15,
    "jez-hirise": 1.2,
    "jez-regional-visible": 1.05,
    "themis-day-wmts": 1.1,
    "themis-night-wmts": 1.1,
    "themis-day": 1.0,
  },

  layerBlendMode: {
    "viking-mdim21": "normal",
    "mola-clrshade": "normal",
    "jez-ctx": "normal",
    "jez-hirise": "normal",
    "jez-regional-visible": "normal",
    "themis-day-wmts": "normal",
    "themis-night-wmts": "normal",
    "themis-day": "normal",
  },

  showGraticule: true,
  showLandmarks: true,
  showFootprints: true,
  selectedLandmarkId: null,
  landmarkNonce: 0,

  isSidebarOpen: true,
  activeSidebarTab: "layers",

  // Set the planetary base map (Viking / MOLA / None)
  setBaseMap: (id) =>
    set((state) => {
      const basemapIds = ["viking-mdim21", "mola-clrshade"];
      // Remove previous basemaps from visible layers
      const withoutBasemaps = state.visibleLayers.filter((l) => !basemapIds.includes(l));
      const nextVisible = id === "none" ? withoutBasemaps : [...withoutBasemaps, id];
      return {
        activeBaseMapId: id,
        visibleLayers: nextVisible,
      };
    }),

  // Set the active scientific overlay
  setOverlay: (id) =>
    set((state) => {
      const nextVisible = state.visibleLayers.includes(id)
        ? state.visibleLayers
        : [...state.visibleLayers, id];
      return {
        activeOverlayId: id,
        activeInspectorDatasetId: id,
        activeDatasetId: id,
        visibleLayers: nextVisible,
      };
    }),

  toggleLayer: (id) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(id)
        ? state.visibleLayers.filter((layerId) => layerId !== id)
        : [...state.visibleLayers, id],
    })),

  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layerOpacity: {
        ...state.layerOpacity,
        [id]: Math.min(1, Math.max(0, opacity)),
      },
    })),

  setLayerBrightness: (id, brightness) =>
    set((state) => ({
      layerBrightness: {
        ...state.layerBrightness,
        [id]: Math.min(2.0, Math.max(0.2, brightness)),
      },
    })),

  setLayerContrast: (id, contrast) =>
    set((state) => ({
      layerContrast: {
        ...state.layerContrast,
        [id]: Math.min(2.5, Math.max(0.5, contrast)),
      },
    })),

  setLayerBlendMode: (id, mode) =>
    set((state) => ({
      layerBlendMode: {
        ...state.layerBlendMode,
        [id]: mode,
      },
    })),

  setShowGraticule: (val) =>
    set((state) => ({
      showGraticule: typeof val === "function" ? val(state.showGraticule) : val,
    })),

  setShowLandmarks: (val) =>
    set((state) => ({
      showLandmarks: typeof val === "function" ? val(state.showLandmarks) : val,
    })),

  setShowFootprints: (val) =>
    set((state) => ({
      showFootprints: typeof val === "function" ? val(state.showFootprints) : val,
    })),

  setSelectedLandmark: (id) => set({ selectedLandmarkId: id, landmarkNonce: Date.now() }),
  flyToLandmark: (id) => set({ selectedLandmarkId: id, landmarkNonce: Date.now() }),

  setSidebarOpen: (val) =>
    set((state) => ({
      isSidebarOpen: typeof val === "function" ? val(state.isSidebarOpen) : val,
    })),

  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  setInspectorDataset: (id) =>
    set({ activeInspectorDatasetId: id, activeDatasetId: id }),

  // Backwards compatibility
  activeDatasetId: "jez-ctx",
  selectBaseLayer: (id) =>
    set((state) => {
      const nextVisible = state.visibleLayers.includes(id)
        ? state.visibleLayers
        : [...state.visibleLayers, id];
      return {
        activeOverlayId: id,
        activeInspectorDatasetId: id,
        activeDatasetId: id,
        visibleLayers: nextVisible,
      };
    }),
  setActiveDataset: (id) =>
    set({ activeInspectorDatasetId: id, activeDatasetId: id }),
}));
