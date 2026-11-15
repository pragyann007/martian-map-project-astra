import { create } from "zustand";
import type { BlendMode } from "@/lib/data/dataset.types";

export type VisualizerTab = "layers" | "landmarks" | "details" | "telemetry";

interface VisualizerState {
  // Base map & Overlay IDs
  activeBaseMapId: string;
  activeOverlayId: string;
  selectedDatasetId: string;
  activeInspectorDatasetId: string;
  hoveredDatasetId: string | null;

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

  // Workspace layout & readiness
  isSidebarOpen: boolean;
  activeSidebarTab: VisualizerTab;
  isMapReady: boolean;
  baseMapError: string | null;

  // Actions
  setBaseMap: (id: string) => void;
  setOverlay: (id: string) => void;
  toggleOverlay: (id: string) => void;
  toggleLayer: (id: string) => void;
  setSelectedDataset: (id: string) => void;
  setHoveredDataset: (id: string | null) => void;

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
  setActiveSidebarTab: (tab: VisualizerTab) => void;
  setInspectorDataset: (id: string) => void;
  setIsMapReady: (ready: boolean) => void;
  setBaseMapError: (error: string | null) => void;

  // Backwards compatibility aliases
  activeDatasetId: string;
  selectBaseLayer: (id: string) => void;
  setActiveDataset: (id: string) => void;
}

const BASEMAP_IDS = ["viking-mdim21", "mola-clrshade"];

export const useVisualizerStore = create<VisualizerState>((set) => ({
  // Default: Viking Planetary Color as base, CTX 6m as high-res overlay
  activeBaseMapId: "viking-mdim21",
  activeOverlayId: "jez-ctx",
  selectedDatasetId: "jez-ctx",
  activeInspectorDatasetId: "jez-ctx",
  hoveredDatasetId: null,

  // Both the global Viking color basemap AND CTX high-res overlay are active by default
  visibleLayers: ["viking-mdim21", "jez-ctx"],

  layerOpacity: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 1.0,
    "jez-ctx": 0.85,
    "jez-hirise": 1.0,
    "jez-regional-visible": 0.9,
    "themis-day-wmts": 0.85,
    "themis-night-wmts": 0.85,
    "themis-day": 0.85,
  },

  layerBrightness: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 1.0,
    "jez-ctx": 1.0,
    "jez-hirise": 1.0,
    "jez-regional-visible": 1.0,
    "themis-day-wmts": 1.0,
    "themis-night-wmts": 1.0,
    "themis-day": 1.0,
  },

  layerContrast: {
    "viking-mdim21": 1.0,
    "mola-clrshade": 1.0,
    "jez-ctx": 1.0,
    "jez-hirise": 1.0,
    "jez-regional-visible": 1.0,
    "themis-day-wmts": 1.0,
    "themis-night-wmts": 1.0,
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
  showFootprints: false, // subtle / contextual by default to avoid clutter
  selectedLandmarkId: null,
  landmarkNonce: 0,

  isSidebarOpen: true,
  activeSidebarTab: "layers",
  isMapReady: false,
  baseMapError: null,

  // Set the planetary base map (Viking / MOLA)
  setBaseMap: (id) =>
    set((state) => {
      // Remove any previous basemap from visible layers
      const withoutBasemaps = state.visibleLayers.filter((l) => !BASEMAP_IDS.includes(l));
      const nextVisible = id === "none" ? withoutBasemaps : [id, ...withoutBasemaps];
      return {
        activeBaseMapId: id,
        selectedDatasetId: id,
        activeInspectorDatasetId: id,
        visibleLayers: nextVisible,
        baseMapError: null,
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
        selectedDatasetId: id,
        activeInspectorDatasetId: id,
        activeDatasetId: id,
        visibleLayers: nextVisible,
      };
    }),

  // Toggle an overlay on / off
  toggleOverlay: (id) =>
    set((state) => {
      const isVisible = state.visibleLayers.includes(id);
      const nextVisible = isVisible
        ? state.visibleLayers.filter((layerId) => layerId !== id)
        : [...state.visibleLayers, id];
      return {
        visibleLayers: nextVisible,
        activeOverlayId: isVisible ? state.activeOverlayId : id,
      };
    }),

  toggleLayer: (id) =>
    set((state) => {
      if (BASEMAP_IDS.includes(id)) {
        // Toggling a base map
        const isCurrent = state.activeBaseMapId === id;
        const targetId = isCurrent ? "none" : id;
        const withoutBasemaps = state.visibleLayers.filter((l) => !BASEMAP_IDS.includes(l));
        const nextVisible = targetId === "none" ? withoutBasemaps : [targetId, ...withoutBasemaps];
        return {
          activeBaseMapId: targetId,
          visibleLayers: nextVisible,
        };
      }
      return {
        visibleLayers: state.visibleLayers.includes(id)
          ? state.visibleLayers.filter((layerId) => layerId !== id)
          : [...state.visibleLayers, id],
      };
    }),

  setSelectedDataset: (id) =>
    set({ selectedDatasetId: id, activeInspectorDatasetId: id, activeDatasetId: id }),

  setHoveredDataset: (id) => set({ hoveredDatasetId: id }),

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

  setActiveSidebarTab: (tab) =>
    set({ activeSidebarTab: tab }),

  setInspectorDataset: (id) =>
    set({
      selectedDatasetId: id,
      activeInspectorDatasetId: id,
      activeDatasetId: id,
    }),

  setIsMapReady: (ready) => set({ isMapReady: ready }),
  setBaseMapError: (error) => set({ baseMapError: error }),

  // Backwards compatibility
  activeDatasetId: "jez-ctx",
  selectBaseLayer: (id) =>
    set((state) => {
      const nextVisible = state.visibleLayers.includes(id)
        ? state.visibleLayers
        : [...state.visibleLayers, id];
      return {
        activeOverlayId: id,
        selectedDatasetId: id,
        activeInspectorDatasetId: id,
        activeDatasetId: id,
        visibleLayers: nextVisible,
      };
    }),
  setActiveDataset: (id) =>
    set({
      selectedDatasetId: id,
      activeInspectorDatasetId: id,
      activeDatasetId: id,
    }),
}));
