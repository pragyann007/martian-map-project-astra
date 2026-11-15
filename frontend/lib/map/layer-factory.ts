import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";
import TileLayer from "ol/layer/Tile";
import type Layer from "ol/layer/Layer";

import type { MarsDataset, MarsLocalRasterDataset } from "@/lib/data/dataset.types";
import { MARS_GEOGRAPHIC } from "./mars-projection";
import { createTrekWmtsSource } from "./trek-source";

/**
 * Creates an OpenLayers layer for any supported Mars dataset (WMTS tile stream or local raster).
 * Includes hardware-accelerated canvas filter hooks for brightness, contrast, and blend modes.
 */
export function createDatasetLayer(dataset: MarsDataset): Layer {
  let layer: Layer;

  const layerZIndex = dataset.zIndex ?? (dataset.isBaseMap ? 1 : 10);

  if (dataset.sourceType === "wmts") {
    layer = new TileLayer({
      extent: dataset.extent,
      source: createTrekWmtsSource(dataset),
      opacity: dataset.defaultOpacity,
      visible: dataset.defaultVisible,
      properties: {
        datasetId: dataset.id,
        isBaseMap: Boolean(dataset.isBaseMap),
      },
      zIndex: layerZIndex,
    });
  } else {
    // Local pre-processed raster layer
    layer = new ImageLayer({
      extent: dataset.extent,
      source: new ImageStatic({
        url: dataset.imageUrl,
        projection: MARS_GEOGRAPHIC,
        imageExtent: dataset.extent,
        interpolate: true,
      }),
      opacity: dataset.defaultOpacity,
      visible: dataset.defaultVisible,
      properties: {
        datasetId: dataset.id,
        isBaseMap: false,
      },
      zIndex: layerZIndex,
    });
  }

  return layer;
}

/**
 * Backwards compatibility helper for existing local raster layer creation.
 */
export function createRasterLayer(dataset: MarsLocalRasterDataset): ImageLayer<ImageStatic> {
  return new ImageLayer({
    extent: dataset.extent,
    source: new ImageStatic({
      url: dataset.imageUrl,
      projection: MARS_GEOGRAPHIC,
      imageExtent: dataset.extent,
      interpolate: true,
    }),
    opacity: dataset.defaultOpacity,
    visible: dataset.defaultVisible,
    properties: {
      datasetId: dataset.id,
    },
    zIndex: 6,
  });
}
