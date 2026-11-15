export type DatasetSourceType = "wmts" | "local-raster";
export type DatasetCategory = "imagery" | "thermal" | "topography" | "regional";
export type DatasetRole = "base" | "overlay";
export type BlendMode = "normal" | "multiply" | "screen" | "luminosity" | "overlay";

export interface MarsLandmark {
  id: string;
  name: string;
  category: "Crater" | "Landing Site" | "Geological Feature" | "Planitia" | "Rover Target";
  location: [number, number]; // [lon, lat] in degrees East/North
  elevationM?: number;
  description: string;
  source: string;
}

export interface BaseMarsDataset {
  id: string;
  name: string;
  shortName: string;
  instrument: string;
  mission: string;
  description: string;
  category: DatasetCategory;
  role: DatasetRole;

  /** [west, south, east, north], in Mars geographic degrees. */
  extent: [number, number, number, number];

  resolutionMeters: number | string;
  projection: string;

  defaultVisible: boolean;
  defaultOpacity: number;
  defaultBlendMode?: BlendMode;

  isBaseMap?: boolean;
  zIndex?: number;
  spectralType: "color" | "panchromatic" | "thermal" | "altimetry";
  wavelengthRange?: string;

  sourceUrl: string;
  attribution: string;
  provenanceNotice?: string;
  calibrationNotice?: string;
  coverageNote?: string;
}

export interface MarsWmtsDataset extends BaseMarsDataset {
  sourceType: "wmts";
  layerId: string;
  tileMatrixSet: string;
  format: "image/png" | "image/jpeg";
  maxNativeZoom: number;
  minNativeZoom?: number;
}

export interface MarsLocalRasterDataset extends BaseMarsDataset {
  sourceType: "local-raster";
  imageUrl: string;
  /** [width, height] in pixels, measured from the prepared image. */
  imageSize: [number, number];
  nodataValue: number;
}

export type MarsDataset = MarsWmtsDataset | MarsLocalRasterDataset;

/** Backwards compatibility alias for existing code */
export type MarsRasterDataset = MarsLocalRasterDataset;
