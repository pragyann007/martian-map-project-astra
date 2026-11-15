import type {
  AstronautProfile,
  LonLat,
  Point3D,
  RouteResult,
  ScienceObjective,
  Strategy,
} from './types';
import {
  TerrainGrid,
  cellOf,
  cellSizeM,
  elevationAt,
  lonLatOf,
} from './terrain-grid';
import { calculateStepCost } from './cost-model';
import { evaluateSurvivalTrajectory } from './survival-model';
import { edgeSlopeDeg } from './mars-math';

class MinHeap {
  private nodes: number[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.nodes.length;
  }

  push(node: number, key: number): void {
    const n = this.nodes;
    const k = this.keys;
    let i = n.length;
    n.push(node);
    k.push(key);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= k[i]) break;
      [n[p], n[i]] = [n[i], n[p]];
      [k[p], k[i]] = [k[i], k[p]];
      i = p;
    }
  }

  pop(): number {
    const n = this.nodes;
    const k = this.keys;
    const top = n[0];
    const lastN = n.pop() as number;
    const lastK = k.pop() as number;
    if (n.length > 0) {
      n[0] = lastN;
      k[0] = lastK;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < n.length && k[l] < k[m]) m = l;
        if (r < n.length && k[r] < k[m]) m = r;
        if (m === i) break;
        [n[m], n[i]] = [n[i], n[m]];
        [k[m], k[i]] = [k[i], k[m]];
        i = m;
      }
    }
    return top;
  }
}

const NEIGHBOURS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1,  0],          [1,  0],
  [-1,  1], [0,  1], [1,  1],
];

export function buildScienceField(
  grid: TerrainGrid,
  targets: ScienceObjective[],
  radiusM = 3000
): Float32Array | null {
  if (targets.length === 0) return null;
  const { cols, rows } = grid;
  const field = new Float32Array(cols * rows).fill(1.0);
  const rowDx: number[] = [];
  for (let r = 0; r < rows; r++) rowDx.push(cellSizeM(grid, r).dx);
  const dy = cellSizeM(grid, 0).dy;
  const dxMin = Math.min(...rowDx);

  for (const t of targets) {
    const cell = cellOf(grid, t.location);
    if (!cell) continue;
    const wc = Math.ceil(radiusM / dxMin) + 1;
    const wr = Math.ceil(radiusM / dy) + 1;
    const bonus = 0.65; // Max 65% cost discount near mineral targets

    for (let r = Math.max(0, cell.row - wr); r <= Math.min(rows - 1, cell.row + wr); r++) {
      for (let c = Math.max(0, cell.col - wc); c <= Math.min(cols - 1, cell.col + wc); c++) {
        const dist = Math.hypot((c - cell.col) * rowDx[r], (r - cell.row) * dy);
        if (dist < radiusM) {
          const mult = 1.0 - bonus * (1.0 - dist / radiusM);
          const idx = r * cols + c;
          if (mult < field[idx]) field[idx] = mult;
        }
      }
    }
  }

  return field;
}

export function findRoute(
  grid: TerrainGrid,
  start: LonLat,
  destination: LonLat,
  strategy: Strategy,
  profile: AstronautProfile,
  scienceField: Float32Array | null = null
): RouteResult {
  const startCell = cellOf(grid, start);
  const goalCell = cellOf(grid, destination);

  const colors: Record<Strategy, string> = {
    survival: '#E9A16A', // Mars dust gold
    shortest: '#D9452B', // Warning rust red
    energy: '#38BDF8',   // Electric cyan
    science: '#4ADE80',  // Emerald green
  };

  const labels: Record<Strategy, string> = {
    survival: 'Astronaut Survival Route',
    shortest: 'Euclidean Shortest Path',
    energy: 'Minimum Energy Route',
    science: 'Science-Maximized Route',
  };

  const resultTemplate: RouteResult = {
    id: `route-${strategy}`,
    strategy,
    label: labels[strategy],
    color: colors[strategy],
    found: false,
    coordinates: [],
    coordinates3d: [],
    cells: [],
    metrics: null,
    explanation: [],
    simulated: grid.source === 'simulated',
  };

  if (!startCell || !goalCell) {
    return {
      ...resultTemplate,
      error: 'Selected start or destination is outside the Jezero Crater terrain boundaries.',
    };
  }

  const { cols, rows, elev } = grid;
  const startIdx = startCell.row * cols + startCell.col;
  const goalIdx = goalCell.row * cols + goalCell.col;

  const n = cols * rows;
  const g = new Float64Array(n).fill(Infinity);
  const parent = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);

  const rowDx = new Float64Array(rows);
  for (let r = 0; r < rows; r++) rowDx[r] = cellSizeM(grid, r).dx;
  const dy = cellSizeM(grid, 0).dy;
  let dxMin = Infinity;
  for (let r = 0; r < rows; r++) if (rowDx[r] < dxMin) dxMin = rowDx[r];

  const goalC = goalCell.col;
  const goalR = goalCell.row;

  const heuristic = (i: number): number => {
    const c = i % cols;
    const r = (i - c) / cols;
    return Math.hypot((c - goalC) * dxMin, (r - goalR) * dy);
  };

  const open = new MinHeap();
  g[startIdx] = 0;
  open.push(startIdx, heuristic(startIdx));

  let found = false;
  let expanded = 0;

  while (open.size > 0 && expanded < 400000) {
    const cur = open.pop();
    if (closed[cur]) continue;
    closed[cur] = 1;
    expanded++;

    if (cur === goalIdx) {
      found = true;
      break;
    }

    const c = cur % cols;
    const r = (cur - c) / cols;
    const zc = elev[cur];

    for (const [dc, dr] of NEIGHBOURS) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const ni = nr * cols + nc;
      if (closed[ni]) continue;

      const zn = elev[ni];
      if (Number.isNaN(zn)) continue; // Never traverse no-data voids

      const dxAvg = (rowDx[r] + rowDx[nr]) / 2;
      const dist = Math.hypot(dc * dxAvg, dr * dy);
      const attraction = scienceField ? (scienceField[cur] + scienceField[ni]) / 2 : 1.0;

      const cost = calculateStepCost(dist, zn - zc, strategy, profile, attraction);
      if (!Number.isFinite(cost)) continue;

      const ng = g[cur] + cost;
      if (ng < g[ni]) {
        g[ni] = ng;
        parent[ni] = cur;
        open.push(ni, ng + heuristic(ni));
      }
    }
  }

  if (!found) {
    return {
      ...resultTemplate,
      error: `No traversable path exists under ${profile.maxSlopeLimitDeg}° slope constraint. The terrain contains impassable cliffs.`,
    };
  }

  // Reconstruct path
  const cells: number[] = [];
  for (let p = goalIdx; p !== -1; p = parent[p]) cells.push(p);
  cells.reverse();

  // Convert to 2D coordinates and 3D points
  const coordinates: LonLat[] = [];
  const coordinates3d: Point3D[] = [];
  const trajectorySegments: Array<{ distM: number; elevStart: number; elevEnd: number; slopeDeg: number }> = [];

  for (let k = 0; k < cells.length; k++) {
    const idx = cells[k];
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    const lonLat = lonLatOf(grid, c, r);
    const elevM = elevationAt(grid, c, r);

    coordinates.push(lonLat);
    coordinates3d.push({ lon: lonLat.lon, lat: lonLat.lat, elevM });

    if (k > 0) {
      const prevC = cells[k - 1] % cols;
      const prevR = Math.floor(cells[k - 1] / cols);
      const prevElev = elevationAt(grid, prevC, prevR);
      const dx = rowDx[r];
      const dist = Math.hypot((c - prevC) * dx, (r - prevR) * dy);
      const slope = edgeSlopeDeg(dist, elevM - prevElev);
      trajectorySegments.push({ distM: dist, elevStart: prevElev, elevEnd: elevM, slopeDeg: slope });
    }
  }

  // Exact endpoint snapping
  coordinates[0] = start;
  coordinates[coordinates.length - 1] = destination;
  coordinates3d[0].lon = start.lon;
  coordinates3d[0].lat = start.lat;
  coordinates3d[coordinates3d.length - 1].lon = destination.lon;
  coordinates3d[coordinates3d.length - 1].lat = destination.lat;

  // Evaluate survival & biomechanical metrics
  const survivalMetrics = evaluateSurvivalTrajectory(trajectorySegments, profile);

  // Generate explanatory notes
  const explanation: string[] = [];
  if (strategy === 'shortest') {
    explanation.push('Calculated strictly as shortest Euclidean distance. Ignores terrain slope penalties.');
    if (survivalMetrics.criticalSlopeSegments > 0) {
      explanation.push(`⚠️ DANGER: Traverses ${survivalMetrics.criticalSlopeSegments} scarp segments with slopes > ${profile.maxSlopeLimitDeg}°. Critical rollover/slip hazard!`);
    }
  } else if (strategy === 'survival') {
    explanation.push('Optimized to minimize astronaut metabolic oxygen burn and avoid steep scarp features.');
    explanation.push(`Maintains average slope of ${survivalMetrics.meanSlopeDeg.toFixed(1)}° across natural ramp gradients.`);
  } else if (strategy === 'energy') {
    explanation.push('Maximizes flatness to preserve suit battery reserves and minimize joint motor torque.');
  } else if (strategy === 'science') {
    explanation.push('Bends trajectory through ancient deltaic clay and carbonate mineral outcrops.');
  }

  return {
    ...resultTemplate,
    found: true,
    coordinates,
    coordinates3d,
    cells,
    metrics: {
      ...survivalMetrics,
      scienceBonusEarned: strategy === 'science' ? 1.0 : 0.0,
    },
    explanation,
  };
}

/**
 * Computes all 3 comparative routes simultaneously:
 * 1. Shortest Path (Direct / Euclidean)
 * 2. Survival Path (Metabolic & Slope-Weighted)
 * 3. Science Path (Mineral Attraction)
 */
export function computeAllRoutes(
  grid: TerrainGrid,
  start: LonLat,
  destination: LonLat,
  profile: AstronautProfile,
  scienceTargets: ScienceObjective[] = []
): Record<Strategy, RouteResult> {
  const scienceField = buildScienceField(grid, scienceTargets);

  const shortest = findRoute(grid, start, destination, 'shortest', profile);
  const survival = findRoute(grid, start, destination, 'survival', profile);
  const energy = findRoute(grid, start, destination, 'energy', profile);
  const science = findRoute(grid, start, destination, 'science', profile, scienceField);

  return { shortest, survival, energy, science };
}
