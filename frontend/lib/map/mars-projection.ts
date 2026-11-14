import Projection from "ol/proj/Projection";
import { addProjection, addEquivalentProjections } from "ol/proj";

export const MARS_GEOGRAPHIC = new Projection({
  code: "MARS:GEOGRAPHIC",
  units: "degrees",
  extent: [0, -90, 360, 90],
  global: true,
});

// Register projection in OpenLayers global registry
addProjection(MARS_GEOGRAPHIC);
addEquivalentProjections([MARS_GEOGRAPHIC]);
