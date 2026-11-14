import type { MarsRasterDataset } from "./dataset.types";

export const THEMIS_DAY: MarsRasterDataset = {
  id: "themis-day",
  name: "THEMIS Day Infrared",
  instrument: "THEMIS",
  mission: "Mars Odyssey",

  description:
    "Daytime thermal infrared imagery of Mars. Captured by the 2001 Mars Odyssey Thermal Emission Imaging System. Raw pixel brightness reflects surface temperature response and thermal inertia properties.",
  category: "thermal",

  imageUrl: "/data/mars/jezero/themis-day/themis-day.png",

  // Exact bounds measured from themis-day-jezero.tif via gdalinfo
  // Order: [west, south, east, north] in Mars planetocentric degrees
  extent: [76.4989034, 17.4992971, 78.5013777, 19.5000844],

  // Exact dimensions measured from cropped raster (1187 x 1186 px)
  imageSize: [1187, 1186],

  resolutionMeters: 99.7,
  projection: "MARS:GEOGRAPHIC",
  nodataValue: 0,

  defaultVisible: true,
  defaultOpacity: 1,

  sourceUrl: "https://www.mars.asu.edu/data/thm_dir_100m/",
  attribution: "NASA / ASU / THEMIS",
};

export const MARS_DATASETS: MarsRasterDataset[] = [THEMIS_DAY];
