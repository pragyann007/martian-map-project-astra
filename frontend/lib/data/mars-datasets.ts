import type {
  MarsDataset,
  MarsLandmark,
  MarsLocalRasterDataset,
  MarsWmtsDataset,
} from "./dataset.types";

/**
 * Verified Geographic Landmarks & Points of Interest across Jezero Crater & Mars.
 * Coordinates are sourced from NASA Mars 2020 mission data, USGS SIM 3464, and IAU nomenclature.
 */
export const MARS_LANDMARKS: MarsLandmark[] = [
  {
    id: "octavia-butler-landing",
    name: "Octavia E. Butler Landing",
    category: "Landing Site",
    location: [77.4509, 18.4446],
    elevationM: -2570,
    description:
      "Touchdown site of NASA's Mars 2020 Perseverance rover on February 18, 2021. Located on the flat basaltic floor of Jezero Crater.",
    source: "NASA Mars 2020 / JPL-Caltech",
  },
  {
    id: "jezero-crater",
    name: "Jezero Crater (Center)",
    category: "Crater",
    location: [77.58, 18.38],
    elevationM: -2540,
    description:
      "45 km impact crater that once hosted an open-basin lake fed by Neretva Vallis and overflowed into Pliva Vallis ~3.7 billion years ago.",
    source: "IAU / USGS Planetary Nomenclature",
  },
  {
    id: "kodiak-butte",
    name: "Kodiak Butte (Delta Remnant)",
    category: "Geological Feature",
    location: [77.345, 18.412],
    elevationM: -2480,
    description:
      "Isolated erosional butte exhibiting stepped bottomset, foreset, and topset deltaic layering, confirming ancient sustained river delta deposits.",
    source: "Mangold et al., Science 2021 / USGS SIM 3464",
  },
  {
    id: "belva-crater",
    name: "Belva Crater Delta Scarp",
    category: "Crater",
    location: [77.362, 18.498],
    elevationM: -2610,
    description:
      "Secondary impact crater ~1 km wide that carved a deep cross-section through the Jezero river delta, exposing boulder conglomerates.",
    source: "NASA Mars 2020 Science Team",
  },
  {
    id: "nili-planum",
    name: "Nili Planum Highlands",
    category: "Planitia",
    location: [76.0, 19.0],
    elevationM: -1800,
    description:
      "Ancient Noachian-aged plateau to the west of Jezero, rich in smectite clay minerals and carbonate-bearing rocks.",
    source: "USGS SIM 3464 / CRISM Team",
  },
  {
    id: "isidis-planitia",
    name: "Isidis Planitia Basin",
    category: "Planitia",
    location: [88.0, 13.0],
    elevationM: -3700,
    description:
      "Massive 1,500 km diameter impact basin on the edge of the Martian dichotomy boundary, bounding Jezero Crater to the east.",
    source: "MOLA Altimetry Science Team",
  },
  {
    id: "syrtis-major",
    name: "Syrtis Major Volcanic Shield",
    category: "Geological Feature",
    location: [69.0, 8.5],
    elevationM: -1000,
    description:
      "Low-relief basaltic shield volcano southwest of Jezero Crater, covered by dark pyroxene-rich volcanic dust.",
    source: "Viking / MGS MOLA Global Survey",
  },
];

/**
 * 1. Viking MDIM 2.1 Color Mosaic Global (NASA Trek)
 * PRIMARY PLANETARY COLOR BASEMAP — provides authentic Mars desert ochre colors worldwide.
 */
export const VIKING_MDIM21: MarsWmtsDataset = {
  id: "viking-mdim21",
  name: "Viking MDIM 2.1 — Planetary Color Mosaic",
  shortName: "Viking Mars Color",
  instrument: "Orbiter Visual Imaging Subsystem",
  mission: "Viking 1 & 2",
  description:
    "Global controlled color mosaic at ~232 m/pixel resolution. Provides authentic planetary visual context with natural Martian red/ochre surface tones across the entire globe.",
  category: "regional",
  isBaseMap: true,
  spectralType: "color",
  wavelengthRange: "Visible (RGB Composite)",
  sourceType: "wmts",
  layerId: "Mars_Viking_MDIM21_ClrMosaic_global_232m",
  tileMatrixSet: "default028mm",
  format: "image/jpeg",
  maxNativeZoom: 7,
  extent: [-180, -90, 180, 90],
  resolutionMeters: 232,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: true,
  defaultOpacity: 1.0,
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / USGS via NASA Mars Trek",
  coverageNote: "Global planetary coverage (-180° to +180° Lon, -90° to +90° Lat).",
};

/**
 * 2. MGS MOLA Colorized Elevation Hillshade (NASA Trek)
 * TOPOGRAPHIC BASEMAP — hypsometric elevation tinting with shaded relief.
 */
export const MOLA_CLRSHADE: MarsWmtsDataset = {
  id: "mola-clrshade",
  name: "MGS MOLA — Elevation Hypsometric Hillshade",
  shortName: "MOLA Topography",
  instrument: "MOLA (Mars Orbiter Laser Altimeter)",
  mission: "Mars Global Surveyor",
  description:
    "Global elevation-based hypsometric color ramp overlaid on shaded relief. Blue/cyan highlights deep basin depressions (Jezero & Isidis), warm ochre marks plains, and red/white marks crater rims and plateaus.",
  category: "topography",
  isBaseMap: true,
  spectralType: "altimetry",
  wavelengthRange: "1064 nm Nd:YAG Laser Altimetry",
  sourceType: "wmts",
  layerId: "Mars_MGS_MOLA_ClrShade_merge_global_463m",
  tileMatrixSet: "default028mm",
  format: "image/jpeg",
  maxNativeZoom: 6,
  extent: [-180, -90, 180, 90],
  resolutionMeters: 463,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: false,
  defaultOpacity: 0.9,
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / GSFC / MOLA Science Team via NASA Mars Trek",
  calibrationNotice:
    "Color tinting is a visualization aid derived from laser altimetry; numerical elevation values for pathfinding are managed separately by the DEM pipeline.",
  coverageNote: "Global planetary coverage (-180° to +180° Lon, -90° to +90° Lat).",
};

/**
 * 3. MRO Context Camera (CTX) Controlled Jezero Mosaic.
 * HIGH-RESOLUTION ORBITAL OVERLAY — ~6 m/pixel panchromatic detail.
 */
export const JEZ_CTX: MarsWmtsDataset = {
  id: "jez-ctx",
  name: "MRO CTX — Jezero Controlled Mosaic (~6 m/px)",
  shortName: "CTX Jezero Mosaic",
  instrument: "CTX (Context Camera)",
  mission: "Mars Reconnaissance Orbiter",
  description:
    "Controlled, orthorectified mosaic of Jezero Crater and surrounding highlands at ~6 m/pixel. Captured by the Context Camera (CTX). Panchromatic CCD sensor (500–800 nm) providing razor-sharp geological relief.",
  category: "imagery",
  isBaseMap: false,
  spectralType: "panchromatic",
  wavelengthRange: "500–800 nm (Visible to Near-IR)",
  sourceType: "wmts",
  layerId: "JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0",
  tileMatrixSet: "default028mm",
  format: "image/png",
  maxNativeZoom: 13,
  extent: [77.1604655, 18.2110274, 77.6991776, 18.7211945],
  resolutionMeters: 6,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: true,
  defaultOpacity: 0.9,
  defaultBlendMode: "normal",
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / JPL-Caltech / MSSS / USGS via NASA Mars Trek",
  provenanceNotice:
    "Verified live via NASA Mars Trek WMTS REST endpoint (14 tile matrix levels, native zoom 0–13).",
  coverageNote:
    "Targeted controlled regional mosaic centered on Jezero Crater (77.16°E to 77.70°E, 18.21°N to 18.72°N). Surrounding terrain is supplemented by the planetary base map.",
};

/**
 * 4. MRO HiRISE Controlled Jezero High-Resolution Mosaic.
 * ULTRA-HIGH-RESOLUTION ROVER-SCALE OVERLAY — ~25 cm/pixel.
 */
export const JEZ_HIRISE: MarsWmtsDataset = {
  id: "jez-hirise",
  name: "MRO HiRISE — Jezero Delta Swath (~25 cm/px)",
  shortName: "HiRISE Delta Swath",
  instrument: "HiRISE (High Resolution Imaging Science Experiment)",
  mission: "Mars Reconnaissance Orbiter",
  description:
    "Ultra-high-resolution controlled orthomosaic at ~25 cm/pixel. Resolves individual metre-scale boulders, layered bedrock benches, and rover tire tracks across the western river delta.",
  category: "imagery",
  isBaseMap: false,
  spectralType: "panchromatic",
  wavelengthRange: "400–1000 nm (Broadband High-Res)",
  sourceType: "wmts",
  layerId: "JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd",
  tileMatrixSet: "default028mm",
  format: "image/png",
  maxNativeZoom: 17,
  extent: [77.2229331, 18.3067994, 77.583964, 18.669315],
  resolutionMeters: 0.25,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: false,
  defaultOpacity: 1.0,
  defaultBlendMode: "normal",
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / JPL-Caltech / University of Arizona / USGS via NASA Mars Trek",
  provenanceNotice:
    "Verified live via NASA Mars Trek WMTS REST endpoint (18 tile matrix levels, native zoom 0–17).",
  coverageNote:
    "Targeted high-resolution science swath focused on the Jezero delta and Perseverance traverse corridor (77.22°E to 77.58°E, 18.31°N to 18.67°N).",
};

/**
 * 5. HiRISE / CTX / HRSC Regional Visible Mosaic.
 * REGIONAL MULTI-INSTRUMENT VISIBLE OVERLAY — ~12 m/pixel.
 */
export const JEZ_REGIONAL_VISIBLE: MarsWmtsDataset = {
  id: "jez-regional-visible",
  name: "HRSC / CTX / HiRISE — Jezero Regional Visible Composite",
  shortName: "HRSC/CTX Composite",
  instrument: "HRSC / CTX / HiRISE Composite",
  mission: "Mars Express / MRO",
  description:
    "Multi-instrument controlled visible-light composite covering the broader Jezero Crater basin, western inlet valleys, and surrounding rim terrains at ~12 m/pixel.",
  category: "regional",
  isBaseMap: false,
  spectralType: "color",
  wavelengthRange: "Multispectral Color Composite",
  sourceType: "wmts",
  layerId: "NES_JEZ_MID_Visible_Mosaic_HiRISE_CTX_HRSC_GCS_MARS_07-10-2018",
  tileMatrixSet: "default028mm",
  format: "image/png",
  maxNativeZoom: 14,
  extent: [76.7912789, 17.5791654, 77.7314417, 18.6926322],
  resolutionMeters: 12,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: false,
  defaultOpacity: 0.95,
  defaultBlendMode: "normal",
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / ESA / DLR / Freie Universität Berlin / JPL via NASA Mars Trek",
  coverageNote:
    "Regional basin mosaic covering 76.79°E to 77.73°E, 17.58°N to 18.69°N.",
};

/**
 * 6. THEMIS Day IR Controlled Mosaic (NASA Trek).
 * THERMOPHYSICAL INFRARED OVERLAY — 100 m/pixel.
 */
export const THEMIS_DAY_WMTS: MarsWmtsDataset = {
  id: "themis-day-wmts",
  name: "THEMIS Day IR — Thermal Emission Mosaic",
  shortName: "THEMIS Day IR",
  instrument: "THEMIS (Thermal Emission Imaging System)",
  mission: "2001 Mars Odyssey",
  description:
    "Daytime thermal infrared mosaic at ~100 m/pixel. Pixel brightness reflects surface solar thermal response, distinguishing bare rock from fine loose mantle.",
  category: "thermal",
  isBaseMap: false,
  spectralType: "thermal",
  wavelengthRange: "6.78–14.88 µm (Thermal IR Bands 1–10)",
  sourceType: "wmts",
  layerId: "THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018",
  tileMatrixSet: "default028mm",
  format: "image/png",
  maxNativeZoom: 8,
  extent: [-180, -65, 180, 65],
  resolutionMeters: 100,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: false,
  defaultOpacity: 0.85,
  defaultBlendMode: "normal",
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / JPL / ASU via NASA Mars Trek",
  calibrationNotice:
    "Values represent relative daytime thermal emission digital numbers (DN), not calibrated Kelvin temperatures.",
  coverageNote: "Global mosaic between -65°S and +65°N latitude.",
};

/**
 * 7. THEMIS Night IR Controlled Mosaic (NASA Trek).
 * THERMAL INERTIA OVERLAY — 100 m/pixel.
 */
export const THEMIS_NIGHT_WMTS: MarsWmtsDataset = {
  id: "themis-night-wmts",
  name: "THEMIS Night IR — Thermal Inertia Proxy",
  shortName: "THEMIS Night IR",
  instrument: "THEMIS (Thermal Emission Imaging System)",
  mission: "2001 Mars Odyssey",
  description:
    "Nighttime thermal infrared mosaic at ~100 m/pixel. Night brightness tracks thermal inertia: high-inertia bedrock and boulder fields hold daytime warmth and glow bright, while fine insulating dust cools rapidly and appears dark.",
  category: "thermal",
  isBaseMap: false,
  spectralType: "thermal",
  wavelengthRange: "6.78–14.88 µm (Thermal IR Bands 1–10)",
  sourceType: "wmts",
  layerId: "THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018",
  tileMatrixSet: "default028mm",
  format: "image/png",
  maxNativeZoom: 8,
  extent: [-180, -65, 180, 65],
  resolutionMeters: 100,
  projection: "MARS:GEOGRAPHIC",
  defaultVisible: false,
  defaultOpacity: 0.85,
  defaultBlendMode: "normal",
  sourceUrl: "https://trek.nasa.gov/mars/",
  attribution: "NASA / JPL / ASU via NASA Mars Trek",
  calibrationNotice:
    "Values represent nighttime relative thermal emission (thermal inertia proxy). These are uncalibrated values, not calibrated surface temperatures.",
  coverageNote: "Global mosaic between -65°S and +65°N latitude.",
};

/**
 * 8. Locally prepared THEMIS Day IR raster.
 */
export const THEMIS_DAY_LOCAL: MarsLocalRasterDataset = {
  id: "themis-day",
  name: "THEMIS Day IR (Local Processed Jezero Raster)",
  shortName: "Local THEMIS Raster",
  instrument: "THEMIS",
  mission: "Mars Odyssey",
  description:
    "Locally preprocessed daytime thermal infrared raster of Jezero Crater, cropped and masked with transparent no-data alpha via the offline Python/GDAL pipeline.",
  category: "thermal",
  isBaseMap: false,
  spectralType: "thermal",
  wavelengthRange: "6.78–14.88 µm",
  sourceType: "local-raster",
  imageUrl: "/data/mars/jezero/themis-day/themis-day.png",
  extent: [76.4989034, 17.4992971, 78.5013777, 19.5000844],
  imageSize: [1187, 1186],
  resolutionMeters: 99.7,
  projection: "MARS:GEOGRAPHIC",
  nodataValue: 0,
  defaultVisible: false,
  defaultOpacity: 0.9,
  defaultBlendMode: "normal",
  sourceUrl: "https://www.mars.asu.edu/data/thm_dir_100m/",
  attribution: "NASA / ASU / THEMIS",
  calibrationNotice:
    "Values are 8-bit uncalibrated digital numbers (DN 0–255) representing relative thermal emission.",
};

export const THEMIS_DAY = THEMIS_DAY_LOCAL;

/**
 * Master Registry of all validated Mars datasets.
 */
export const MARS_DATASETS: MarsDataset[] = [
  VIKING_MDIM21,
  MOLA_CLRSHADE,
  JEZ_CTX,
  JEZ_HIRISE,
  JEZ_REGIONAL_VISIBLE,
  THEMIS_DAY_WMTS,
  THEMIS_NIGHT_WMTS,
  THEMIS_DAY_LOCAL,
];

export const BASEMAP_DATASETS = MARS_DATASETS.filter((d) => d.isBaseMap);
export const OVERLAY_DATASETS = MARS_DATASETS.filter((d) => !d.isBaseMap);
