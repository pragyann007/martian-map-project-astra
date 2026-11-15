import type { LonLat } from './types';
import { DEG, M_PER_DEG } from './mars-math';

export interface TerrainGrid {
  id: string;
  source: 'dem' | 'simulated';
  dataClass: 'OBSERVED' | 'DERIVED' | 'SIMULATED';
  label: string;
  west: number;
  south: number;
  east: number;
  north: number;
  cols: number;
  rows: number;
  dLon: number;
  dLat: number;
  elev: Float32Array;
  resolutionM: number;
  minElev: number;
  maxElev: number;
  provenance: string;
}

export interface Cell {
  col: number;
  row: number;
}

export function inGrid(g: TerrainGrid, p: LonLat): boolean {
  return p.lon >= g.west && p.lon <= g.east && p.lat >= g.south && p.lat <= g.north;
}

export function cellOf(g: TerrainGrid, p: LonLat): Cell | null {
  if (!inGrid(g, p)) return null;
  const col = Math.min(g.cols - 1, Math.max(0, Math.floor((p.lon - g.west) / g.dLon)));
  const row = Math.min(g.rows - 1, Math.max(0, Math.floor((g.north - p.lat) / g.dLat)));
  return { col, row };
}

export function lonLatOf(g: TerrainGrid, col: number, row: number): LonLat {
  return {
    lon: g.west + (col + 0.5) * g.dLon,
    lat: g.north - (row + 0.5) * g.dLat,
  };
}

export function elevationAt(g: TerrainGrid, col: number, row: number): number {
  if (col < 0 || col >= g.cols || row < 0 || row >= g.rows) return NaN;
  return g.elev[row * g.cols + col];
}

export function cellSizeM(g: TerrainGrid, row: number): { dx: number; dy: number } {
  const lat = g.north - (row + 0.5) * g.dLat;
  return {
    dx: g.dLon * M_PER_DEG * Math.cos(lat * DEG),
    dy: g.dLat * M_PER_DEG,
  };
}

/**
 * Slope calculation in degrees using Horn's method (3x3 weighted finite differences).
 * Derived directly from elevation matrix; accounts for latitude-dependent cell width.
 */
export function computeSlopeDeg(g: TerrainGrid): Float32Array {
  const { cols, rows, elev } = g;
  const out = new Float32Array(cols * rows);

  for (let r = 0; r < rows; r++) {
    const { dx, dy } = cellSizeM(g, r);
    const rN = Math.max(0, r - 1);
    const rS = Math.min(rows - 1, r + 1);

    for (let c = 0; c < cols; c++) {
      const cW = Math.max(0, c - 1);
      const cE = Math.min(cols - 1, c + 1);

      const z1 = elev[rN * cols + cW];
      const z2 = elev[rN * cols + c];
      const z3 = elev[rN * cols + cE];
      const z4 = elev[r * cols + cW];
      const z6 = elev[r * cols + cE];
      const z7 = elev[rS * cols + cW];
      const z8 = elev[rS * cols + c];
      const z9 = elev[rS * cols + cE];

      if (
        Number.isNaN(z1) || Number.isNaN(z2) || Number.isNaN(z3) ||
        Number.isNaN(z4) || Number.isNaN(z6) || Number.isNaN(z7) ||
        Number.isNaN(z8) || Number.isNaN(z9)
      ) {
        out[r * cols + c] = NaN;
        continue;
      }

      const spanX = cE - cW || 1;
      const spanY = rS - rN || 1;
      const dzdx = (z3 + 2 * z6 + z9 - (z1 + 2 * z4 + z7)) / (4 * spanX * dx);
      const dzdy = (z1 + 2 * z2 + z3 - (z7 + 2 * z8 + z9)) / (4 * spanY * dy);
      out[r * cols + c] = (Math.atan(Math.hypot(dzdx, dzdy)) / Math.PI) * 180;
    }
  }

  return out;
}
