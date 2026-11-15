import type { AstronautProfile, RouteMetrics } from './types';
import { MARS_GRAVITY } from './mars-math';

export const DEFAULT_ASTRONAUT: AstronautProfile = {
  name: 'Commander Sarah Chen (EVA-1)',
  oxygenCapacityL: 240,
  oxygenRemainingL: 145,
  oxygenBurnBaseLpm: 0.8, // 0.8 L/min basal metabolic rate
  batteryCapacityWh: 1200,
  batteryRemainingPct: 78,
  suitMassKg: 110,
  bodyMassKg: 75,
  maxSlopeComfortDeg: 14,
  maxSlopeLimitDeg: 22, // Absolute physical cliff/rollover limit
  isEmergencyLeak: false,
  leakRateLpm: 1.2, // Emergency leak rate in L/min
  nominalSpeedKmh: 3.6, // 1.0 m/s
};

/**
 * Calculates human traversal speed (m/s) on Mars given slope gradient and climbing direction.
 * Uphill climbing significantly slows the astronaut down, while downhill requires caution.
 */
export function walkingSpeedMs(slopeDeg: number, isUphill: boolean, baseSpeedKmh: number): number {
  const v0 = (baseSpeedKmh * 1000) / 3600; // m/s
  if (slopeDeg <= 2) return v0;

  if (isUphill) {
    // Speed decreases exponentially with climbing angle
    const factor = Math.max(0.12, 1.0 - Math.pow(slopeDeg / 24, 1.4));
    return v0 * factor;
  } else {
    // Controlled descent: slight reduction on steep downhill to prevent tumbling
    const factor = slopeDeg > 15 ? Math.max(0.3, 1.0 - (slopeDeg - 15) * 0.05) : 0.95;
    return v0 * factor;
  }
}

/**
 * Instantaneous oxygen consumption rate in Liters per minute.
 * Combines metabolic demand under Mars gravity with any active suit leak.
 */
export function oxygenConsumptionLpm(
  slopeDeg: number,
  isUphill: boolean,
  profile: AstronautProfile
): number {
  const slopeRad = (slopeDeg * Math.PI) / 180;
  // Metabolic exertion multiplier
  let exertion = 1.0;
  if (isUphill) {
    exertion += 2.8 * Math.sin(slopeRad) * (slopeDeg / 10);
  } else if (slopeDeg > 12) {
    exertion += 0.4 * Math.sin(slopeRad); // Muscle braking exertion on steep descent
  }

  const metabolicLpm = profile.oxygenBurnBaseLpm * exertion;
  const leakLpm = profile.isEmergencyLeak ? profile.leakRateLpm : 0;
  return metabolicLpm + leakLpm;
}

/**
 * Instantaneous energy consumption (Watts) for biomechanical locomotion and suit heating/electronics.
 */
export function powerExpenditureWatts(
  slopeDeg: number,
  isUphill: boolean,
  speedMs: number,
  profile: AstronautProfile
): number {
  const totalMass = profile.suitMassKg + profile.bodyMassKg;
  const slopeRad = (slopeDeg * Math.PI) / 180;
  const gradeClimb = isUphill ? Math.sin(slopeRad) : 0;

  // Mechanical work under Mars gravity (3.721 m/s^2)
  const locomotionWatts = totalMass * MARS_GRAVITY * speedMs * (0.28 + 1.8 * gradeClimb);
  const suitAuxiliaryWatts = 120; // Life support pumps, scrubbers, communications
  return locomotionWatts + suitAuxiliaryWatts;
}

/**
 * Computes complete survival metrics for an entire traversed path.
 */
export function evaluateSurvivalTrajectory(
  segments: Array<{ distM: number; elevStart: number; elevEnd: number; slopeDeg: number }>,
  profile: AstronautProfile
): Omit<RouteMetrics, 'scienceBonusEarned' | 'warnings'> & { warnings: string[] } {
  let totalDistanceM = 0;
  let totalDurationSec = 0;
  let totalO2L = 0;
  let totalEnergyJoules = 0;
  let totalGainM = 0;
  let totalLossM = 0;
  let maxSlopeDeg = 0;
  let slopeSum = 0;
  let criticalSlopeCount = 0;

  let currentO2RemainingL = profile.oxygenRemainingL;
  const profileTimeline: Array<{ distM: number; elev: number; slopeDeg: number; o2RemainingL: number }> = [];

  for (const seg of segments) {
    const dz = seg.elevEnd - seg.elevStart;
    const isUphill = dz > 0;
    if (isUphill) totalGainM += dz;
    else totalLossM += Math.abs(dz);

    const slope = seg.slopeDeg;
    if (slope > maxSlopeDeg) maxSlopeDeg = slope;
    if (slope > profile.maxSlopeLimitDeg) criticalSlopeCount++;

    const speed = walkingSpeedMs(slope, isUphill, profile.nominalSpeedKmh);
    const duration = seg.distM / Math.max(0.05, speed);
    const o2Rate = oxygenConsumptionLpm(slope, isUphill, profile);
    const o2Used = (o2Rate / 60) * duration;
    const watts = powerExpenditureWatts(slope, isUphill, speed, profile);

    totalDistanceM += seg.distM;
    totalDurationSec += duration;
    totalO2L += o2Used;
    totalEnergyJoules += watts * duration;
    slopeSum += slope * seg.distM;

    currentO2RemainingL -= o2Used;
    profileTimeline.push({
      distM: totalDistanceM,
      elev: seg.elevEnd,
      slopeDeg: slope,
      o2RemainingL: Math.max(0, currentO2RemainingL),
    });
  }

  const meanSlopeDeg = totalDistanceM > 0 ? slopeSum / totalDistanceM : 0;
  const batteryConsumedWh = (totalEnergyJoules / 3600);
  const remainingO2MarginL = profile.oxygenRemainingL - totalO2L;

  // Survival probability calculation (multivariate safety index)
  let survivalProb = 1.0;
  const warnings: string[] = [];

  // 1. Oxygen depletion risk
  if (remainingO2MarginL <= 0) {
    survivalProb = 0.0;
    warnings.push(`FATAL OXYGEN DEPLETION: Required ${totalO2L.toFixed(1)} L exceeds available ${profile.oxygenRemainingL.toFixed(1)} L.`);
  } else if (remainingO2MarginL < 15) {
    const marginRatio = remainingO2MarginL / 15;
    survivalProb *= marginRatio;
    warnings.push(`CRITICAL O2 RESERVE: Only ${remainingO2MarginL.toFixed(1)} L remaining at destination.`);
  }

  // 2. Critical slope rollover hazard
  if (criticalSlopeCount > 0) {
    const penalty = Math.pow(0.85, criticalSlopeCount);
    survivalProb *= penalty;
    warnings.push(`HAZARDOUS TERRAIN: Traverses ${criticalSlopeCount} segments with slope > ${profile.maxSlopeLimitDeg}°. High rollover/fall risk.`);
  }

  // 3. Battery exhaustion
  const remainingBatteryWh = (profile.batteryCapacityWh * (profile.batteryRemainingPct / 100)) - batteryConsumedWh;
  if (remainingBatteryWh <= 0) {
    survivalProb *= 0.3;
    warnings.push('SUIT POWER EXHAUSTION: Battery will fully deplete before mission completion.');
  }

  // Classify hypoxia risk level
  const hypoxiaRisk: RouteMetrics['hypoxiaRisk'] =
    remainingO2MarginL <= 5 ? 'critical' : remainingO2MarginL < 25 ? 'elevated' : 'nominal';

  return {
    distanceM: totalDistanceM,
    length3dM: Math.hypot(totalDistanceM, totalGainM - totalLossM),
    gainM: totalGainM,
    lossM: totalLossM,
    maxSlopeDeg,
    meanSlopeDeg,
    estimatedDurationSec: totalDurationSec,
    oxygenConsumedL: totalO2L,
    energyConsumedKj: totalEnergyJoules / 1000,
    batteryConsumedWh,
    survivalProbability: Math.max(0, Math.min(1, survivalProb)),
    hypoxiaRisk,
    criticalSlopeSegments: criticalSlopeCount,
    profile: profileTimeline,
    warnings,
  };
}
