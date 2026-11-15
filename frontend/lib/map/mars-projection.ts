import Projection from "ol/proj/Projection";
import { addProjection, addEquivalentProjections } from "ol/proj";

/**
 * Mars 2000 spherical radius (IAU/IAG working group): 3,396,190 meters.
 * Circumference: 2 * PI * 3,396,190 = 21,338,891.1 meters.
 * Meters per degree of latitude: 21,338,891.1 / 360 ≈ 59,274.6975 m/deg.
 */
export const MARS_RADIUS_M = 3396190;
export const MARS_METERS_PER_DEG = (Math.PI * MARS_RADIUS_M) / 180; // ≈ 59274.6975

/**
 * NASA Mars Trek Equirectangular projection bounds:
 * Longitude: -180° to +180° (East positive)
 * Latitude: -90° to +90°
 */
export const MARS_EXTENT: [number, number, number, number] = [-180, -90, 180, 90];

export const MARS_GEOGRAPHIC = new Projection({
  code: "MARS:GEOGRAPHIC",
  units: "degrees",
  extent: MARS_EXTENT,
  worldExtent: MARS_EXTENT,
  global: true,
  metersPerUnit: MARS_METERS_PER_DEG,
});

export const MARS_2000_EQ = new Projection({
  code: "MARS:2000-EQ",
  units: "degrees",
  extent: MARS_EXTENT,
  worldExtent: MARS_EXTENT,
  global: true,
  metersPerUnit: MARS_METERS_PER_DEG,
});

export const MARS_OGC_CRS = new Projection({
  code: "urn:ogc:def:crs:EPSG::104905",
  units: "degrees",
  extent: MARS_EXTENT,
  worldExtent: MARS_EXTENT,
  global: true,
  metersPerUnit: MARS_METERS_PER_DEG,
});

// Register projections and equivalents in OpenLayers global registry
addProjection(MARS_GEOGRAPHIC);
addProjection(MARS_2000_EQ);
addProjection(MARS_OGC_CRS);
addEquivalentProjections([MARS_GEOGRAPHIC, MARS_2000_EQ, MARS_OGC_CRS]);
