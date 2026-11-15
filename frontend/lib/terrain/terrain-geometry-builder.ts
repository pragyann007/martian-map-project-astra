import * as THREE from "three";
import type { TerrainGrid } from "@/lib/domain/terrain-grid";
import type { TerrainCoordinateAdapter } from "./terrain-coordinate-adapter";

export interface TerrainGeometryOptions {
  sampleStride?: number; // e.g. 1 (full res), 2 (balanced 60fps), 3
  colorMode?: "natural" | "elevation" | "slope";
}

/**
 * Builds an optimized Three.js BufferGeometry from the USGS TerrainGrid.
 * Perfectly georeferenced with UV coordinates matching the companion CTX orthomosaic.
 */
export function buildTerrainBufferGeometry(
  grid: TerrainGrid,
  adapter: TerrainCoordinateAdapter,
  options: TerrainGeometryOptions = {}
): THREE.BufferGeometry {
  const stride = Math.max(1, options.sampleStride ?? 2);
  const colorMode = options.colorMode ?? "natural";

  const numCols = Math.floor((grid.cols - 1) / stride) + 1;
  const numRows = Math.floor((grid.rows - 1) / stride) + 1;
  const numVertices = numCols * numRows;

  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const colors = new Float32Array(numVertices * 3);

  // Palette colors
  const colorBasin = new THREE.Color("#9E4822"); // Basalt basin floor
  const colorDelta = new THREE.Color("#C66B3D"); // Ancient clay/delta sediment
  const colorCliffHazard = new THREE.Color("#D9452B"); // Critical delta scarp cliff (>18°)
  const colorHighland = new THREE.Color("#E28B54"); // Crater rim highland dust
  const colorSlopeSafe = new THREE.Color("#4ADE80"); // Flat / rover navigable
  const colorSlopeWarning = new THREE.Color("#FBBF24"); // Moderate slope (10-18°)

  let vIdx = 0;
  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    const row = Math.min(grid.rows - 1, rIdx * stride);
    const lat = grid.north - (row + 0.5) * grid.dLat;

    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      const col = Math.min(grid.cols - 1, cIdx * stride);
      const lon = grid.west + (col + 0.5) * grid.dLon;

      const rawElev = grid.elev[row * grid.cols + col];
      const validElev = Number.isFinite(rawElev) ? rawElev : adapter.baseElevationM;

      // Position in local Three.js coordinates
      const scenePos = adapter.lonLatToScene({ lon, lat }, validElev);
      positions[vIdx * 3] = scenePos.x;
      positions[vIdx * 3 + 1] = scenePos.y;
      positions[vIdx * 3 + 2] = scenePos.z;

      // UV coordinates: matching CTX orthomosaic bounds
      // U: 0 (West) to 1 (East)
      // V: 0 (South) to 1 (North)
      const u = (lon - grid.west) / (grid.east - grid.west);
      const v = (lat - grid.south) / (grid.north - grid.south);
      uvs[vIdx * 2] = Math.max(0, Math.min(1, u));
      uvs[vIdx * 2 + 1] = Math.max(0, Math.min(1, v));

      // Vertex color coding based on mode
      const vertColor = new THREE.Color();
      if (colorMode === "elevation") {
        // Normalize elevation between -2700 and -1500
        const normElev = Math.max(0, Math.min(1, (validElev - (-2700)) / 1200));
        if (normElev < 0.25) {
          vertColor.copy(colorBasin).lerp(colorDelta, normElev / 0.25);
        } else if (normElev < 0.7) {
          vertColor.copy(colorDelta).lerp(colorHighland, (normElev - 0.25) / 0.45);
        } else {
          vertColor.copy(colorHighland).lerp(new THREE.Color("#FCE7D0"), (normElev - 0.7) / 0.3);
        }
      } else if (colorMode === "slope") {
        // Estimate slope from row/col neighbors
        vertColor.copy(colorSlopeSafe);
      } else {
        // Natural Mars basalt-regolith strata tint
        const normElev = Math.max(0, Math.min(1, (validElev - (-2600)) / 1000));
        vertColor.copy(colorBasin).lerp(colorDelta, normElev);
      }

      colors[vIdx * 3] = vertColor.r;
      colors[vIdx * 3 + 1] = vertColor.g;
      colors[vIdx * 3 + 2] = vertColor.b;

      vIdx++;
    }
  }

  // Generate triangle indices
  const numQuads = (numCols - 1) * (numRows - 1);
  const indices = new (numVertices > 65535 ? Uint32Array : Uint16Array)(numQuads * 6);

  let iIdx = 0;
  for (let rIdx = 0; rIdx < numRows - 1; rIdx++) {
    for (let cIdx = 0; cIdx < numCols - 1; cIdx++) {
      const topLeft = rIdx * numCols + cIdx;
      const topRight = topLeft + 1;
      const bottomLeft = (rIdx + 1) * numCols + cIdx;
      const bottomRight = bottomLeft + 1;

      // Two triangles per grid quad (counter-clockwise upward facing)
      indices[iIdx++] = topLeft;
      indices[iIdx++] = bottomLeft;
      indices[iIdx++] = topRight;

      indices[iIdx++] = topRight;
      indices[iIdx++] = bottomLeft;
      indices[iIdx++] = bottomRight;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Compute accurate face and vertex normals
  geometry.computeVertexNormals();

  // If slope coloring requested, refine vertex colors using computed normals
  if (colorMode === "slope") {
    const normalAttr = geometry.attributes.normal;
    for (let i = 0; i < numVertices; i++) {
      const ny = normalAttr.getY(i);
      const slopeDeg = (Math.acos(Math.max(-1, Math.min(1, ny))) / Math.PI) * 180;

      const c = new THREE.Color();
      if (slopeDeg < 10) {
        c.copy(colorSlopeSafe);
      } else if (slopeDeg <= 18) {
        const t = (slopeDeg - 10) / 8;
        c.copy(colorSlopeSafe).lerp(colorSlopeWarning, t);
      } else {
        const t = Math.min(1, (slopeDeg - 18) / 10);
        c.copy(colorSlopeWarning).lerp(colorCliffHazard, t);
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geometry.attributes.color.needsUpdate = true;
  }

  return geometry;
}
