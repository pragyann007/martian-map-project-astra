export interface MarsRasterDataset {
  id: string;
  name: string;
  instrument: string;
  mission: string;

  description: string;
  category: string;

  imageUrl: string;

  /** [west, south, east, north], in Mars geographic degrees. */
  extent: [number, number, number, number];

  /** [width, height] in pixels, measured from the prepared image. */
  imageSize: [number, number];

  resolutionMeters: number;
  projection: string;
  nodataValue: number;

  defaultVisible: boolean;
  defaultOpacity: number;

  sourceUrl: string;
  attribution: string;
}
