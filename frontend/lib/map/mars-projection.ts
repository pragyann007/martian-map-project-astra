import Projection from "ol/proj/Projection";

export const MARS_GEOGRAPHIC = new Projection({
  code: "MARS:GEOGRAPHIC",
  units: "degrees",
  extent: [0, -90, 360, 90],
});
