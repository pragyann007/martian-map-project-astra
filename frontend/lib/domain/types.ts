export interface LonLat {
  lon: number;
  lat: number;
}

export interface Point3D {
  lon: number;
  lat: number;
  elevM: number;
}

export type Strategy = 'shortest' | 'survival' | 'energy' | 'science';

export interface AstronautProfile {
  name: string;
  oxygenCapacityL: number;
  oxygenRemainingL: number;
  oxygenBurnBaseLpm: number; // Basal consumption at 0 grade
  batteryCapacityWh: number;
  batteryRemainingPct: number;
  suitMassKg: number;
  bodyMassKg: number;
  maxSlopeComfortDeg: number;
  maxSlopeLimitDeg: number;
  isEmergencyLeak: boolean;
  leakRateLpm: number;
  nominalSpeedKmh: number;
}

export interface RouteMetrics {
  distanceM: number;
  length3dM: number;
  gainM: number;
  lossM: number;
  maxSlopeDeg: number;
  meanSlopeDeg: number;
  estimatedDurationSec: number;
  oxygenConsumedL: number;
  energyConsumedKj: number;
  batteryConsumedWh: number;
  survivalProbability: number; // 0.0 to 1.0
  hypoxiaRisk: 'nominal' | 'elevated' | 'critical';
  criticalSlopeSegments: number;
  scienceBonusEarned: number;
  warnings: string[];
  profile: Array<{
    distM: number;
    elev: number;
    slopeDeg: number;
    o2RemainingL: number;
  }>;
}

export interface RouteResult {
  id: string;
  strategy: Strategy;
  label: string;
  color: string;
  found: boolean;
  error?: string;
  coordinates: LonLat[];
  coordinates3d: Point3D[]; // 3D coordinates ready for future WebGL simulation
  cells: number[];
  metrics: RouteMetrics | null;
  explanation: string[];
  simulated: boolean;
}

export interface ScienceObjective {
  id: string;
  name: string;
  category: 'Deltaic Sediment' | 'Crater Scarp' | 'Clay Mineral' | 'Carbonates' | 'Volcanic Floor';
  location: LonLat;
  elevationM: number;
  mineralPotentialScore: number; // 0-100
  scientificSignificance: string;
  minerals: string[];
  description: string;
  // Computed ranking fields
  distanceFromStartM?: number;
  slopeDifficultyScore?: number; // 0 (flat) to 100 (steep)
  missionSuccessScore?: number; // Composite rank 0-100
}

export type PlannerMode = 'survival' | 'science';
