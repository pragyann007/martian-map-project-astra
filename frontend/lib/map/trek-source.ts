import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import type ImageTile from "ol/ImageTile";
import type { MarsWmtsDataset } from "@/lib/data/dataset.types";
import { MARS_GEOGRAPHIC } from "./mars-projection";

/**
 * NASA Mars Trek Equirectangular tile matrix pyramid (TileMatrixSet 'default028mm'):
 * - Level 0: 2 columns × 1 row of 256×256 px tiles covering [-180, 180] × [-90, 90]
 * - Origin: Top-Left [-180.0, 90.0]
 * - Level 0 resolution: 360 / (2 * 256) = 0.703125 degrees / pixel
 * - Each subsequent zoom level halves the resolution (2^z scaling).
 */
export const LEVEL0_RES = 360 / (2 * 256); // 0.703125 deg/px

export function createTrekWmtsGrid(maxNativeZoom: number): WMTSTileGrid {
  const resolutions: number[] = [];
  const matrixIds: string[] = [];

  for (let z = 0; z <= maxNativeZoom; z++) {
    resolutions.push(LEVEL0_RES / Math.pow(2, z));
    matrixIds.push(String(z));
  }

  return new WMTSTileGrid({
    origin: [-180.0, 90.0],
    resolutions,
    matrixIds,
    tileSize: 256,
  });
}

/**
 * Construct an OpenLayers WMTS source configured for NASA Mars Trek RESTful tile services.
 * Specifies crossOrigin: "anonymous" to support hardware-accelerated canvas filter adjustments.
 */
export function createTrekWmtsSource(dataset: MarsWmtsDataset): WMTS {
  const ext = dataset.format === "image/jpeg" ? "jpg" : "png";
  const urlTemplate = `https://trek.nasa.gov/tiles/Mars/EQ/${dataset.layerId}/1.0.0/default/${dataset.tileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.${ext}`;

  return new WMTS({
    url: urlTemplate,
    layer: dataset.layerId,
    matrixSet: dataset.tileMatrixSet,
    format: dataset.format,
    projection: MARS_GEOGRAPHIC,
    requestEncoding: "REST",
    tileGrid: createTrekWmtsGrid(dataset.maxNativeZoom),
    style: "default",
    wrapX: false,
    crossOrigin: "anonymous",
    attributions: dataset.attribution,
    tileLoadFunction: (tile, src) => {
      const img = (tile as ImageTile).getImage() as HTMLImageElement;
      img.crossOrigin = "anonymous";
      // Missing tiles (HTTP 404) are normal in NASA Trek for regional mosaics outside their coverage.
      img.onerror = () => {
        // Transparent fallback prevents broken image icons on the canvas
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      };
      img.src = src;
    },
  });
}
