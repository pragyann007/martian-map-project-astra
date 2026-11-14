import { create } from "zustand";

export interface PlanetTransform {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotY: number;
  rotX: number;
  opacity: number;
}

interface PlanetScrollStore {
  transform: PlanetTransform;
  activeSection: number;
  scrollProgress: number;
  setTransform: (transform: Partial<PlanetTransform>) => void;
  setSection: (section: number) => void;
  setProgress: (progress: number) => void;
}

// Initial hero state: Mars centered, lower half overlapping the headline
export const INITIAL_TRANSFORM: PlanetTransform = {
  x: 0,
  y: -0.42,
  z: 0,
  scale: 1.0,
  rotY: 0,
  rotX: 0,
  opacity: 1.0,
};

export const usePlanetScrollStore = create<PlanetScrollStore>((set) => ({
  transform: INITIAL_TRANSFORM,
  activeSection: 0,
  scrollProgress: 0,
  setTransform: (newTransform) =>
    set((state) => ({
      transform: { ...state.transform, ...newTransform },
    })),
  setSection: (section) => set({ activeSection: section }),
  setProgress: (progress) => set({ scrollProgress: progress }),
}));
