import type { AstronautProfile, Strategy } from './types';
import { edgeSlopeDeg } from './mars-math';

/**
 * Calculates directed edge traversal cost between adjacent terrain cells.
 * Returns Infinity if the slope exceeds the astronaut's physical safety limit.
 */
export function calculateStepCost(
  distM: number,
  dz: number,
  strategy: Strategy,
  profile: AstronautProfile,
  scienceAttraction = 1.0
): number {
  const slope = edgeSlopeDeg(distM, dz);

  // Absolute impassable constraint: sheer cliffs and rollover angles
  if (slope > profile.maxSlopeLimitDeg) {
    return Infinity;
  }

  // Strategy 1: Shortest Euclidean path (pure planar distance, no terrain penalty)
  if (strategy === 'shortest') {
    return distM;
  }

  // Non-dimensional slope penalty ratio
  const comfort = Math.max(5, profile.maxSlopeComfortDeg);
  const slopeRatio = slope / comfort;
  const uphillGrade = Math.max(0, dz / distM);

  // Strategy 2: Survival-Conscious Navigation (balances distance against metabolic exertion)
  if (strategy === 'survival') {
    const terrainPenalty = Math.pow(slopeRatio, 2.2) + 4.0 * uphillGrade;
    const baseCost = distM * (1.0 + 5.0 * terrainPenalty);
    return baseCost;
  }

  // Strategy 3: Minimum Energy / Battery Preservation (aggressively avoids climbing)
  if (strategy === 'energy') {
    const terrainPenalty = Math.pow(slopeRatio, 2.8) + 6.5 * uphillGrade;
    const baseCost = distM * (1.0 + 8.5 * terrainPenalty);
    return baseCost;
  }

  // Strategy 4: Science-Focused Expedition (terrain-conscious with mineral attraction discount)
  if (strategy === 'science') {
    const terrainPenalty = Math.pow(slopeRatio, 2.0) + 3.5 * uphillGrade;
    const baseCost = distM * (1.0 + 4.5 * terrainPenalty);
    // scienceAttraction <= 1.0 pulls the path towards mineral deposits
    return baseCost * Math.max(0.25, scienceAttraction);
  }

  return distM;
}
