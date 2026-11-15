import type { LonLat, Point3D } from './types';

export const MARS_RADIUS_M = 3396190;
export const DEG = Math.PI / 180;
export const M_PER_DEG = (Math.PI * MARS_RADIUS_M) / 180; // ≈ 59,274.6975 m/deg
export const MARS_GRAVITY = 3.721; // m/s^2 (0.38g of Earth)

/** Great-circle distance between two Mars surface coordinates in meters. */
export function haversineM(a: LonLat, b: LonLat): number {
  const dLat = (b.lat - a.lat) * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const lat1 = a.lat * DEG;
  const lat2 = b.lat * DEG;
  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);
  const h = sinHalfLat * sinHalfLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon;
  return 2 * MARS_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Slope angle in degrees given horizontal run and vertical rise. */
export function edgeSlopeDeg(distM: number, dz: number): number {
  if (distM <= 0) return 0;
  return (Math.atan(Math.abs(dz) / distM) / Math.PI) * 180;
}

/** Format coordinates in degrees with hemisphere indicators (e.g. 77.451°E, 18.445°N). */
export function formatLonLat(p: LonLat, digits = 4): string {
  const lonH = p.lon >= 0 ? 'E' : 'W';
  const latH = p.lat >= 0 ? 'N' : 'S';
  return `${Math.abs(p.lon).toFixed(digits)}°${lonH}, ${Math.abs(p.lat).toFixed(digits)}°${latH}`;
}

export function formatKm(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(0)} m`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Maps geographic [lon, lat, elev] to local Euclidean meters centered at an origin.
 * Essential bridge for the future 3D simulation engine.
 */
export function lonLatToWorldMeters(p: Point3D, origin: LonLat): [number, number, number] {
  const midLat = origin.lat * DEG;
  const x = (p.lon - origin.lon) * M_PER_DEG * Math.cos(midLat);
  const z = -(p.lat - origin.lat) * M_PER_DEG; // Negative Z is North in Three.js standard
  const y = p.elevM;
  return [x, y, z];
}
