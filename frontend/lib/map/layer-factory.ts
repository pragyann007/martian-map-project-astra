import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";

import type { MarsRasterDataset } from "@/lib/data/dataset.types";
import { MARS_GEOGRAPHIC } from "./mars-projection";

export function createRasterLayer(dataset: MarsRasterDataset): ImageLayer<ImageStatic> {
  return new ImageLayer({
    extent: dataset.extent,
    source: new ImageStatic({
      url: dataset.imageUrl,
      projection: MARS_GEOGRAPHIC,
      imageExtent: dataset.extent,
      interpolate: false,
    }),
    opacity: dataset.defaultOpacity,
    visible: dataset.defaultVisible,
    properties: {
      datasetId: dataset.id,
    },
  });
}
