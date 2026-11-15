import { create } from 'zustand';
import type {
  AstronautProfile,
  LonLat,
  PlannerMode,
  RouteResult,
  ScienceObjective,
  Strategy,
} from '../domain/types';
import type { TerrainGrid } from '../domain/terrain-grid';
import { DEFAULT_ASTRONAUT } from '../domain/survival-model';
import {
  JEZERO_SCIENCE_TARGETS,
  START_PRESETS,
  HAVEN_PRESETS,
  rankScienceObjectives,
} from '../domain/science-targets';
import { loadRealDem } from '../domain/dem-loader';
import { generateSimulatedTerrain } from '../domain/sim-terrain';
import { computeAllRoutes } from '../domain/pathfinder';

export type PlannerStep = 1 | 2 | 3 | 4 | 5;

interface PlannerState {
  currentStep: PlannerStep;
  mode: PlannerMode;
  astronaut: AstronautProfile;
  terrain: {
    grid: TerrainGrid | null;
    status: 'idle' | 'loading' | 'ready' | 'error';
    note: string;
  };
  startPoint: LonLat;
  destinationPoint: LonLat;
  selectedStartPresetId: string | null;
  selectedHavenPresetId: string | null;
  scienceTargets: ScienceObjective[];
  selectedTargetId: string | null;
  pickMode: 'start' | 'destination' | null;
  routes: Record<Strategy, RouteResult> | null;
  activeStrategy: Strategy;
  isCalculating: boolean;
  calculationError: string | null;
  aiBriefing: string | null;
  isGeneratingAi: boolean;
  roverProgress: number; // 0 to 1 along the active route geometry

  // Actions
  setStep: (step: PlannerStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: PlannerMode) => void;
  setPickMode: (pick: 'start' | 'destination' | null) => void;
  setStartPoint: (p: LonLat) => void;
  setDestinationPoint: (p: LonLat) => void;
  selectStartPreset: (id: string) => void;
  selectHavenPreset: (id: string) => void;
  selectScienceTarget: (id: string) => void;
  updateAstronaut: (updates: Partial<AstronautProfile>) => void;
  toggleEmergencyLeak: () => void;
  setActiveStrategy: (strategy: Strategy) => void;
  setRoverProgress: (progress: number) => void;
  initTerrain: () => Promise<void>;
  recalculateRoutes: () => void;
  requestAiBriefing: () => Promise<void>;
}

// Default Start: Octavia E. Butler Landing (Perseverance touchdown)
const DEFAULT_START: LonLat = { lon: 77.4509, lat: 18.4446 };
// Default Destination: Western Delta Front (Clay & Carbonate boundary)
const DEFAULT_DEST: LonLat = { lon: 77.3820, lat: 18.4280 };

export const usePlannerStore = create<PlannerState>((set, get) => ({
  currentStep: 1,
  mode: 'survival',
  astronaut: { ...DEFAULT_ASTRONAUT },
  terrain: {
    grid: null,
    status: 'idle',
    note: 'Initializing Mars elevation surface...',
  },
  startPoint: DEFAULT_START,
  destinationPoint: DEFAULT_DEST,
  selectedStartPresetId: 'octavia-butler',
  selectedHavenPresetId: 'delta-refuge',
  scienceTargets: rankScienceObjectives(DEFAULT_START, JEZERO_SCIENCE_TARGETS),
  selectedTargetId: JEZERO_SCIENCE_TARGETS[0].id,
  pickMode: null,
  routes: null,
  activeStrategy: 'survival',
  isCalculating: false,
  calculationError: null,
  aiBriefing: null,
  isGeneratingAi: false,
  roverProgress: 0,

  setStep: (currentStep) => set({ currentStep }),
  nextStep: () => set((s) => ({ currentStep: Math.min(5, s.currentStep + 1) as PlannerStep })),
  prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) as PlannerStep })),

  setMode: (mode) => {
    set({ mode });
    get().recalculateRoutes();
  },

  setPickMode: (pickMode) => set({ pickMode }),

  setStartPoint: (startPoint) => {
    const targets = rankScienceObjectives(startPoint, JEZERO_SCIENCE_TARGETS);
    set({ startPoint, selectedStartPresetId: null, scienceTargets: targets });
    get().recalculateRoutes();
  },

  setDestinationPoint: (destinationPoint) => {
    set({ destinationPoint, selectedHavenPresetId: null, selectedTargetId: null });
    get().recalculateRoutes();
  },

  selectStartPreset: (id) => {
    const p = START_PRESETS.find((s) => s.id === id);
    if (!p) return;
    const targets = rankScienceObjectives(p.location, JEZERO_SCIENCE_TARGETS);
    set({
      startPoint: p.location,
      selectedStartPresetId: id,
      scienceTargets: targets,
    });
    get().recalculateRoutes();
  },

  selectHavenPreset: (id) => {
    const h = HAVEN_PRESETS.find((s) => s.id === id);
    if (!h) return;
    set({
      destinationPoint: h.location,
      selectedHavenPresetId: id,
      selectedTargetId: null,
    });
    get().recalculateRoutes();
  },

  selectScienceTarget: (id) => {
    const target = JEZERO_SCIENCE_TARGETS.find((t) => t.id === id);
    if (!target) return;
    set({
      selectedTargetId: id,
      destinationPoint: target.location,
      selectedHavenPresetId: null,
    });
    get().recalculateRoutes();
  },

  updateAstronaut: (updates) => {
    set((state) => ({
      astronaut: { ...state.astronaut, ...updates },
    }));
    get().recalculateRoutes();
  },

  toggleEmergencyLeak: () => {
    set((state) => ({
      astronaut: {
        ...state.astronaut,
        isEmergencyLeak: !state.astronaut.isEmergencyLeak,
      },
    }));
    get().recalculateRoutes();
  },

  setActiveStrategy: (activeStrategy) => set({ activeStrategy, roverProgress: 0 }),
  setRoverProgress: (roverProgress) => set({ roverProgress }),

  initTerrain: async () => {
    set({ terrain: { grid: null, status: 'loading', note: 'Loading USGS Mars 2020 Jezero DTM...' } });
    try {
      // 1. Try loading real NASA USGS Jezero DTM (prefer fast 60m grid for rapid UI)
      let grid = await loadRealDem(false);
      let note = 'Loaded 100% Real USGS Mars 2020 Jezero CTX DTM (MRO Stereo Topography).';

      // 2. Resilient fallback to simulated terrain if offline
      if (!grid) {
        console.warn('[ASTRA] Real DEM not found, falling back to simulated terrain.');
        grid = generateSimulatedTerrain();
        note = 'Using SIMULATED Procedural Terrain (DEM download required for live elevation).';
      }

      set({
        terrain: {
          grid,
          status: 'ready',
          note,
        },
      });

      // Compute initial routes
      get().recalculateRoutes();
    } catch (err) {
      console.error('[ASTRA] Terrain initialization error:', err);
      const fallbackGrid = generateSimulatedTerrain();
      set({
        terrain: {
          grid: fallbackGrid,
          status: 'ready',
          note: 'Fallback to simulated terrain due to initialization error.',
        },
      });
      get().recalculateRoutes();
    }
  },

  recalculateRoutes: () => {
    const { terrain, startPoint, destinationPoint, astronaut, scienceTargets } = get();
    if (!terrain.grid || terrain.status !== 'ready') return;

    set({ isCalculating: true, calculationError: null });

    try {
      const routes = computeAllRoutes(
        terrain.grid,
        startPoint,
        destinationPoint,
        astronaut,
        scienceTargets
      );

      set({
        routes,
        isCalculating: false,
      });
    } catch (err) {
      console.error('[ASTRA] Route computation failed:', err);
      set({
        isCalculating: false,
        calculationError: err instanceof Error ? err.message : 'Pathfinding failed',
      });
    }
  },

  requestAiBriefing: async () => {
    const { routes, activeStrategy, astronaut, mode, startPoint, destinationPoint, terrain } = get();
    if (!routes) return;

    set({ isGeneratingAi: true, aiBriefing: null });

    try {
      const payload = {
        mode,
        activeStrategy,
        astronaut,
        terrainType: terrain.grid?.source === 'dem' ? 'Real USGS Jezero DTM' : 'Simulated Terrain',
        startPoint,
        destinationPoint,
        routes: {
          shortest: {
            distanceM: routes.shortest.metrics?.distanceM,
            durationSec: routes.shortest.metrics?.estimatedDurationSec,
            maxSlopeDeg: routes.shortest.metrics?.maxSlopeDeg,
            oxygenConsumedL: routes.shortest.metrics?.oxygenConsumedL,
            survivalProbability: routes.shortest.metrics?.survivalProbability,
            criticalSlopeSegments: routes.shortest.metrics?.criticalSlopeSegments,
          },
          survival: {
            distanceM: routes.survival.metrics?.distanceM,
            durationSec: routes.survival.metrics?.estimatedDurationSec,
            maxSlopeDeg: routes.survival.metrics?.maxSlopeDeg,
            oxygenConsumedL: routes.survival.metrics?.oxygenConsumedL,
            survivalProbability: routes.survival.metrics?.survivalProbability,
            criticalSlopeSegments: routes.survival.metrics?.criticalSlopeSegments,
          },
          science: {
            distanceM: routes.science.metrics?.distanceM,
            durationSec: routes.science.metrics?.estimatedDurationSec,
            maxSlopeDeg: routes.science.metrics?.maxSlopeDeg,
            oxygenConsumedL: routes.science.metrics?.oxygenConsumedL,
            survivalProbability: routes.science.metrics?.survivalProbability,
          },
        },
      };

      const res = await fetch('/api/route-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`AI API responded with status ${res.status}`);
      }

      const data = await res.json();
      set({ aiBriefing: data.briefing, isGeneratingAi: false });
    } catch (err) {
      console.warn('[ASTRA] AI request fallback triggered:', err);
      // Fallback deterministic Flight Surgeon analysis if offline
      const activeRoute = routes[activeStrategy];
      const m = activeRoute.metrics;
      const o2Left = astronaut.oxygenRemainingL - (m?.oxygenConsumedL ?? 0);
      const isFatal = o2Left <= 0 || (m?.survivalProbability ?? 0) < 0.2;

      const fallbackText = `**[AUTOMATED FLIGHT SURGEON ADVISORY — TELEMETRY ANALYSIS]**\n\n` +
        `• **Traverse Status**: Route evaluated across ${m?.distanceM ? (m.distanceM / 1000).toFixed(2) : '--'} km of Jezero Crater terrain.\n` +
        `• **Survival Assessment**: ${isFatal ? '🚨 CRITICAL RISK DETECTED' : '✅ SAFE & VIABLE TRANSECT'}. Estimated survival probability is **${((m?.survivalProbability ?? 0) * 100).toFixed(0)}%** with ${o2Left.toFixed(1)} L of reserve oxygen.\n` +
        `• **Slope Analysis**: Maximum edge slope is **${m?.maxSlopeDeg.toFixed(1)}°** (Mean: ${m?.meanSlopeDeg.toFixed(1)}°). ` +
        (activeStrategy === 'shortest' && (m?.criticalSlopeSegments ?? 0) > 0
          ? `The Euclidean direct path cuts straight across the Jezero delta scarp, creating severe rollover and hypoxia risk.`
          : `The terrain-conscious algorithm successfully detoured around high-angle cliffs, preserving suit energy and metabolic stability.`);

      set({ aiBriefing: fallbackText, isGeneratingAi: false });
    }
  },
}));
