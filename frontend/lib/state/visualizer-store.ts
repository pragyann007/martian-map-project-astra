import { create } from "zustand";

interface VisualizerState {
  visibleLayers: string[];
  activeDatasetId: string | null;
  layerOpacity: Record<string, number>;

  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setActiveDataset: (id: string | null) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  visibleLayers: ["themis-day"],
  activeDatasetId: "themis-day",
  layerOpacity: {
    "themis-day": 1,
  },

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

  setActiveDataset: (id) =>
    set({ activeDatasetId: id }),
}));
