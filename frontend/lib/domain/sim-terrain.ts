import type { TerrainGrid } from './terrain-grid';
import { DEG, M_PER_DEG } from './mars-math';

export const SIM_AOI = { west: 77.2, south: 18.2, east: 77.7, north: 18.7 } as const;
export const SIM_CELL_M = 100;

function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * (valueNoise(x * f, y * f, seed + o * 17) - 0.5) * 2;
    amp *= 0.5;
    f *= 2;
  }
  return sum;
}

export function generateSimulatedTerrain(seed = 2026): TerrainGrid {
  const { west, south, east, north } = SIM_AOI;
  const midLat = (south + north) / 2;
  const dLat = SIM_CELL_M / M_PER_DEG;
  const dLon = dLat / Math.cos(midLat * DEG);
  const cols = Math.ceil((east - west) / dLon);
  const rows = Math.ceil((north - south) / dLat);
  const elev = new Float32Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    const lat = north - (r + 0.5) * dLat;
    const yM = (lat - midLat) * M_PER_DEG;
    for (let c = 0; c < cols; c++) {
      const lon = west + (c + 0.5) * dLon;
      const xM = (lon - (west + east) / 2) * M_PER_DEG * Math.cos(midLat * DEG);
      const r_dist = Math.hypot(xM + 2000, yM - 1000);
      const bowl = -2600 + 400 * (1 - Math.exp(-((r_dist / 8000) ** 2)));
      const scarp = xM > 1000 && xM < 2500 ? 120 * Math.sin(yM / 1500) : 0;
      elev[r * cols + c] = bowl + scarp + fbm(xM / 2000, yM / 2000, seed) * 45;
    }
  }

  return {
    id: 'simulated-jezero',
    source: 'simulated',
    dataClass: 'SIMULATED',
    label: 'SIMULATED Procedural Terrain (DEM Offline Fallback)',
    west,
    south,
    east: west + cols * dLon,
    north,
    cols,
    rows,
    dLon,
    dLat,
    elev,
    resolutionM: SIM_CELL_M,
    minElev: -2700,
    maxElev: -1900,
    provenance: 'Procedural synthetic noise demonstration.',
  };
}
