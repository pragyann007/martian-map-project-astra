import type { TerrainGrid } from './terrain-grid';

export interface DemMeta {
  schema: 1;
  name: string;
  productId: string;
  provider: string;
  sourceUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  cols: number;
  rows: number;
  cellSizeM: number;
  elevationUnits: 'm';
  nodata: number;
  verticalDatum: string;
  minElev: number;
  maxElev: number;
  acquisition: string;
  license: string;
  file: string;
}

/**
 * Loads real USGS Mars 2020 Jezero DTM from Next.js public assets.
 * Prefers dem_fast.f32 (60m grid, ~1 MB) for sub-15ms pathfinding calculations,
 * but allows loading the full 20m high-res grid (dem.f32, ~9.6 MB).
 */
export async function loadRealDem(useHighRes = false): Promise<TerrainGrid | null> {
  try {
    const metaFile = useHighRes ? '/data/dem/dem.meta.json' : '/data/dem/dem_fast.meta.json';
    const res = await fetch(metaFile, { cache: 'force-cache' });
    if (!res.ok) return null;
    const meta: DemMeta = await res.json();

    const binRes = await fetch(`/data/dem/${meta.file}`, { cache: 'force-cache' });
    if (!binRes.ok) return null;

    const buffer = await binRes.arrayBuffer();
    const expectedBytes = meta.cols * meta.rows * 4;
    if (buffer.byteLength !== expectedBytes) {
      console.warn(`[ASTRA] DEM binary size mismatch: expected ${expectedBytes}, got ${buffer.byteLength}`);
      return null;
    }

    const elev = new Float32Array(buffer);
    // Convert any sentinel nodata to NaN
    for (let i = 0; i < elev.length; i++) {
      if (elev[i] === meta.nodata || !Number.isFinite(elev[i])) {
        elev[i] = NaN;
      }
    }

    return {
      id: meta.productId,
      source: 'dem',
      dataClass: 'OBSERVED',
      label: `${meta.name} (${meta.cellSizeM}m resolution)`,
      west: meta.bounds.west,
      south: meta.bounds.south,
      east: meta.bounds.east,
      north: meta.bounds.north,
      cols: meta.cols,
      rows: meta.rows,
      dLon: (meta.bounds.east - meta.bounds.west) / meta.cols,
      dLat: (meta.bounds.north - meta.bounds.south) / meta.rows,
      elev,
      resolutionM: meta.cellSizeM,
      minElev: meta.minElev,
      maxElev: meta.maxElev,
      provenance: `${meta.provider} — ${meta.productId}. Datum: ${meta.verticalDatum}. Source: ${meta.sourceUrl}`,
    };
  } catch (err) {
    console.warn('[ASTRA] Failed to load real DEM from static assets:', err);
    return null;
  }
}
