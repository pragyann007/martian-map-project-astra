import * as THREE from "three";
import type { TerrainGrid } from "@/lib/domain/terrain-grid";
import type { LonLat } from "@/lib/domain/types";
import { DEG, M_PER_DEG } from "@/lib/domain/mars-math";

export interface TerrainAdapterOptions {
  simScale?: number; // default: 0.04 (1 unit = 25m)
  verticalExaggeration?: number; // default: 1.0 (true scale)
  baseElevationM?: number; // default: -2600m
}

export class TerrainCoordinateAdapter {
  readonly grid: TerrainGrid;
  readonly origin: LonLat;
  readonly simScale: number;
  readonly verticalExaggeration: number;
  readonly baseElevationM: number;

  readonly widthM: number;
  readonly heightM: number;
  readonly sceneWidth: number;
  readonly sceneHeight: number;

  constructor(grid: TerrainGrid, options: TerrainAdapterOptions = {}) {
    this.grid = grid;
    this.simScale = options.simScale ?? 0.04;
    this.verticalExaggeration = options.verticalExaggeration ?? 1.0;
    this.baseElevationM = options.baseElevationM ?? -2600;

    this.origin = {
      lon: (grid.west + grid.east) / 2,
      lat: (grid.south + grid.north) / 2,
    };

    const midLat = this.origin.lat * DEG;
    this.widthM = (grid.east - grid.west) * M_PER_DEG * Math.cos(midLat);
    this.heightM = (grid.north - grid.south) * M_PER_DEG;

    this.sceneWidth = this.widthM * this.simScale;
    this.sceneHeight = this.heightM * this.simScale;
  }

  /**
   * Convert geographic [lon, lat] and optional elevation to local Three.js position.
   * X: East (+), West (-)
   * Y: Elevation above base datum * exaggeration * simScale
   * Z: South (+), North (-)
   */
  lonLatToScene(lonLat: LonLat, overrideElevM?: number): THREE.Vector3 {
    const elev = overrideElevM ?? this.sampleElevation(lonLat);
    const midLat = this.origin.lat * DEG;

    const xMeters = (lonLat.lon - this.origin.lon) * M_PER_DEG * Math.cos(midLat);
    const zMeters = -(lonLat.lat - this.origin.lat) * M_PER_DEG;
    const yMeters = (elev - this.baseElevationM) * this.verticalExaggeration;

    return new THREE.Vector3(
      xMeters * this.simScale,
      yMeters * this.simScale,
      zMeters * this.simScale
    );
  }

  /**
   * Convert local Three.js position back to Mars geographic [lon, lat].
   */
  sceneToLonLat(pos: THREE.Vector3): LonLat {
    const midLat = this.origin.lat * DEG;
    const xMeters = pos.x / this.simScale;
    const zMeters = pos.z / this.simScale;

    const lon = this.origin.lon + xMeters / (M_PER_DEG * Math.cos(midLat));
    const lat = this.origin.lat - zMeters / M_PER_DEG;

    return { lon, lat };
  }

  /**
   * Sample DTM elevation with high-precision bilinear interpolation across grid cells.
   */
  sampleElevation(lonLat: LonLat): number {
    const { west, north, east, south, cols, rows, dLon, dLat, elev } = this.grid;

    // Check bounds
    if (lonLat.lon < west || lonLat.lon > east || lonLat.lat < south || lonLat.lat > north) {
      return this.baseElevationM;
    }

    const cExact = (lonLat.lon - west) / dLon - 0.5;
    const rExact = (north - lonLat.lat) / dLat - 0.5;

    const c0 = Math.max(0, Math.min(cols - 1, Math.floor(cExact)));
    const r0 = Math.max(0, Math.min(rows - 1, Math.floor(rExact)));
    const c1 = Math.max(0, Math.min(cols - 1, c0 + 1));
    const r1 = Math.max(0, Math.min(rows - 1, r0 + 1));

    const fx = Math.max(0, Math.min(1, cExact - c0));
    const fy = Math.max(0, Math.min(1, rExact - r0));

    const z00 = elev[r0 * cols + c0];
    const z10 = elev[r0 * cols + c1];
    const z01 = elev[r1 * cols + c0];
    const z11 = elev[r1 * cols + c1];

    // If all 4 neighbours are finite, do bilinear interpolation
    if (
      Number.isFinite(z00) &&
      Number.isFinite(z10) &&
      Number.isFinite(z01) &&
      Number.isFinite(z11)
    ) {
      const top = z00 * (1 - fx) + z10 * fx;
      const bottom = z01 * (1 - fx) + z11 * fx;
      return top * (1 - fy) + bottom * fy;
    }

    // Fallback to nearest valid cell
    if (Number.isFinite(z00)) return z00;
    if (Number.isFinite(z10)) return z10;
    if (Number.isFinite(z01)) return z01;
    if (Number.isFinite(z11)) return z11;

    return this.baseElevationM;
  }

  /**
   * Compute normalized surface normal vector at given coordinate.
   */
  sampleNormal(lonLat: LonLat): THREE.Vector3 {
    const deltaLon = this.grid.dLon * 0.5;
    const deltaLat = this.grid.dLat * 0.5;

    const pCenter = this.lonLatToScene(lonLat);
    const pEast = this.lonLatToScene({ lon: lonLat.lon + deltaLon, lat: lonLat.lat });
    const pNorth = this.lonLatToScene({ lon: lonLat.lon, lat: lonLat.lat + deltaLat });

    const vEast = new THREE.Vector3().subVectors(pEast, pCenter);
    const vNorth = new THREE.Vector3().subVectors(pNorth, pCenter);

    const normal = new THREE.Vector3().crossVectors(vEast, vNorth).normalize();
    if (normal.y < 0) normal.negate();
    return normal;
  }

  /**
   * Calculate terrain slope in degrees at a given coordinate.
   */
  sampleSlopeDeg(lonLat: LonLat): number {
    const normal = this.sampleNormal(lonLat);
    const cosAngle = Math.max(-1, Math.min(1, normal.y));
    return (Math.acos(cosAngle) / Math.PI) * 180;
  }

  /**
   * UV mapping: maps geographic coordinate to [0, 1] texture coordinates matching the CTX orthomosaic.
   */
  lonLatToUV(lonLat: LonLat): [number, number] {
    const u = (lonLat.lon - this.grid.west) / (this.grid.east - this.grid.west);
    const v = (lonLat.lat - this.grid.south) / (this.grid.north - this.grid.south);
    return [Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))];
  }
}
