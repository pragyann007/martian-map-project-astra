# ASTRA — THEMIS Data Preparation and OpenLayers Integration

**Document type:** AI-agent implementation specification  
**Module:** Independent Mars Dataset Visualizer  
**Initial dataset:** THEMIS Day IR, ASU 100 m global mosaic tile  
**Initial area of interest:** Jezero Crater, Mars  
**Frontend:** Next.js App Router, React, TypeScript, OpenLayers  
**State management:** Zustand  
**Data preparation:** GDAL command-line tools, Python, NumPy, Pillow  
**Storage:** Local source files and Next.js `public/` assets; no MinIO or database

---

## 1. Objective

Implement one complete data-to-browser vertical slice using the downloaded THEMIS Day IR dataset.

The result must be a working `/visualizer` page that displays a browser-ready image of the Jezero region in the correct geographical position using OpenLayers.

The first version should support:

- Loading the prepared THEMIS image.
- Correct geographical positioning using a Mars-specific coordinate convention.
- Panning and zooming.
- Layer visibility and opacity controls.
- Displaying dataset name, instrument, resolution, source, and attribution.
- A component structure that can support additional raster datasets later.

Keep the visualizer independent from the landing page and planner. Do not implement mission planning, hazard scoring, scientific target ranking, resource calculations, AI interpretation, Three.js, GSAP, a database, MinIO, a tile server, or an API for this milestone.

## 2. Current state and known input data

The following source file has already been downloaded:

```text
public_data/raw/themis-day/lat00_lon060.pgm
```

GDAL successfully inspected it. The reported properties were:

```text
Driver: PNM/Portable Pixmap Format (netpbm)
Size: 35566 x 17783
Band 1: Byte, Gray
```

The source PGM did not contain geographical coordinates. A GeoTIFF was created by assigning the tile bounds:

```text
public_data/processed/themis-day/themis-day-georef.tif
```

The current `gdalinfo` output confirms:

```text
Origin: (60, 30)
Pixel Size: (0.001687004442445, -0.001687004442445)
Upper Left:  (60, 30)
Lower Left:  (60, 0)
Upper Right: (120, 30)
Lower Right: (120, 0)
```

Therefore, the source tile covers approximately:

- West: 60° E
- East: 120° E
- South: 0° latitude
- North: 30° N

The image is a single-band, 8-bit grayscale raster. Its pixel values range from 0 to 255. ASU product documentation identifies black-filled gaps (value 0) as missing data; preserve this as no-data information rather than presenting those pixels as meaningful observations.

The product is THEMIS daytime thermal infrared imagery. Do not label its raw grayscale digital numbers as calibrated temperatures or Kelvin values unless a separate calibration step and appropriate product documentation justify that interpretation.

## 3. Initial Jezero crop

Use the following initial area of interest (AOI):

```text
West:  76.5° E
East:  78.5° E
South: 17.5° N
North: 19.5° N
```

These are requested crop bounds. GDAL may snap the output to the source pixel grid, so the exact output bounds must be read from the cropped file using `gdalinfo` and then used in the frontend dataset registry.

Do not assume the final image dimensions or exact extent. Measure them from the resulting GeoTIFF.

## 4. Target repository structure

Use the existing repository conventions and avoid unnecessary file movement. The following is the desired organization for this feature:

```text
project/
├── app/
│   └── visualizer/
│       └── page.tsx
│
├── components/
│   └── visualizer/
│       ├── VisualizerWorkspace.tsx
│       ├── MapContainer.tsx
│       ├── DatasetPanel.tsx
│       ├── DatasetCard.tsx
│       ├── LayerControls.tsx
│       └── DatasetInspector.tsx
│
├── lib/
│   ├── data/
│   │   ├── dataset.types.ts
│   │   └── mars-datasets.ts
│   ├── map/
│   │   ├── mars-projection.ts
│   │   └── layer-factory.ts
│   └── state/
│       └── visualizer-store.ts
│
├── public_data/
│   ├── raw/
│   │   └── themis-day/
│   │       └── lat00_lon060.pgm
│   └── processed/
│       └── themis-day/
│           ├── themis-day-georef.tif
│           └── jezero/
│               └── themis-day-jezero.tif
│
├── public/
│   └── data/
│       └── mars/
│           └── jezero/
│               └── themis-day/
│                   └── themis-day.png
│
└── scripts/
    └── prepare-mars-data/
        ├── inspect-themis.py
        ├── crop-themis.py
        └── convert-to-png.py
```

The `public_data/` directory is a local data-preparation area and is not directly served by Next.js. Next.js serves static browser assets from `public/`.

Add source and intermediate files to `.gitignore`:

```gitignore
public_data/raw/
public_data/processed/
```

Only commit the prepared browser asset if its size is acceptable and repository policy permits it. Do not commit the original 603 MB source tile by default.

## 5. Pipeline overview

The required data flow is:

```text
Original THEMIS PGM
       |
       v
Georeferenced GeoTIFF
       |
       v
Crop Jezero AOI
       |
       v
Inspect exact extent, dimensions, and no-data value
       |
       v
Convert to transparent browser-ready PNG
       |
       v
Place PNG under Next.js public/
       |
       v
Register dataset metadata in TypeScript
       |
       v
Load image with OpenLayers ImageStatic
       |
       v
Add map controls and Zustand integration
```

The data conversion happens during development or as an explicit preparation script. It must not happen in a Next.js request handler or in the browser.

## 6. Stage A — Crop the THEMIS raster

### Input

```text
public_data/processed/themis-day/themis-day-georef.tif
```

### Output

```text
public_data/processed/themis-day/jezero/themis-day-jezero.tif
```

Create the output directory and crop the AOI:

```bash
mkdir -p public_data/processed/themis-day/jezero

gdal_translate \
  -of GTiff \
  -projwin 76.5 19.5 78.5 17.5 \
  -a_nodata 0 \
  public_data/processed/themis-day/themis-day-georef.tif \
  public_data/processed/themis-day/jezero/themis-day-jezero.tif
```

The `-projwin` arguments are ordered as upper-left X, upper-left Y, lower-right X, lower-right Y: west, north, east, south.

### Validate the crop

Run:

```bash
gdalinfo -stats \
  public_data/processed/themis-day/jezero/themis-day-jezero.tif
```

Record the actual:

- Raster width and height.
- Upper-left coordinate.
- Lower-right coordinate.
- Pixel size.
- Data type and band count.
- No-data value.
- Statistics and pixel-value distribution.

Use the exact output extent and dimensions in the dataset metadata. Do not hardcode an assumed size such as 1186 × 1186.

### Validation requirements

- The cropped extent must intersect the Jezero area.
- The output must have one grayscale band.
- The output must retain the source pixel values.
- Zero must be marked as no-data, subject to the ASU product documentation.
- The image must not be flipped or transposed.

## 7. Stage B — Convert the GeoTIFF to a browser-ready PNG

For this first milestone, create one RGBA PNG rather than a tile pyramid. OpenLayers can load the image directly with `ImageStatic` and a defined image extent.

Install the Python dependencies:

```bash
python -m pip install pillow numpy
```

Create `scripts/prepare-mars-data/convert-to-png.py`:

```python
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(
    "public_data/processed/themis-day/jezero/"
    "themis-day-jezero.tif"
)

OUTPUT = Path(
    "public/data/mars/jezero/themis-day/"
    "themis-day.png"
)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source raster not found: {SOURCE}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    # Read the raster as an 8-bit grayscale image.
    with Image.open(SOURCE) as image:
        grayscale = np.asarray(image.convert("L"), dtype=np.uint8)

    if grayscale.ndim != 2:
        raise ValueError("Expected a single-band grayscale raster")

    # Repeat grayscale values across RGB channels and add alpha.
    rgba = np.empty((*grayscale.shape, 4), dtype=np.uint8)
    rgba[:, :, 0] = grayscale
    rgba[:, :, 1] = grayscale
    rgba[:, :, 2] = grayscale

    # The ASU product documents zero-valued black gaps as missing data.
    rgba[:, :, 3] = np.where(grayscale == 0, 0, 255)

    Image.fromarray(rgba, mode="RGBA").save(
        OUTPUT,
        format="PNG",
        optimize=True,
    )

    print(f"Output: {OUTPUT}")
    print(f"Dimensions: {grayscale.shape[1]} x {grayscale.shape[0]}")
    print(f"File size: {OUTPUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
```

Run:

```bash
python scripts/prepare-mars-data/convert-to-png.py
```

### Important image-processing constraints

- Preserve source grayscale values; do not apply an arbitrary contrast stretch in the initial pipeline.
- Make documented no-data pixels transparent.
- Do not change the raster orientation.
- Do not resample unless necessary.
- Do not convert raw digital numbers into temperature values.
- If Pillow cannot read the GeoTIFF correctly in the environment, use GDAL to produce a PNG while preserving the no-data transparency, and document the exact command used.

### Verify direct browser access

Start the Next.js development server and open:

```text
http://localhost:3000/data/mars/jezero/themis-day/themis-day.png
```

The browser must display the PNG before OpenLayers integration begins. This isolates data-preparation issues from map issues.

## 8. Stage C — Define the shared dataset contract

Create `lib/data/dataset.types.ts`:

```typescript
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
```

Create `lib/data/mars-datasets.ts`:

```typescript
import type { MarsRasterDataset } from "./dataset.types";

export const THEMIS_DAY: MarsRasterDataset = {
  id: "themis-day",
  name: "THEMIS Day Infrared",
  instrument: "THEMIS",
  mission: "Mars Odyssey",

  description: "Daytime thermal infrared imagery of Mars.",
  category: "thermal",

  imageUrl: "/data/mars/jezero/themis-day/themis-day.png",

  // Replace with the exact bounds reported by gdalinfo
  // on themis-day-jezero.tif. Order: west, south, east, north.
  extent: [76.5, 17.5, 78.5, 19.5],

  // Replace with the actual cropped raster dimensions.
  imageSize: [0, 0],

  resolutionMeters: 99.7,
  projection: "MARS:GEOGRAPHIC",
  nodataValue: 0,

  defaultVisible: true,
  defaultOpacity: 1,

  sourceUrl: "https://www.mars.asu.edu/data/thm_dir_100m/",
  attribution: "NASA / ASU / THEMIS",
};

export const MARS_DATASETS: MarsRasterDataset[] = [THEMIS_DAY];
```

The example extent and image dimensions are provisional. Before merging, replace them with values measured from the cropped GeoTIFF. The TypeScript registry must be the single source of frontend dataset metadata; do not duplicate dataset definitions inside map components.

## 9. Stage D — Configure the Mars geographic projection

Create `lib/map/mars-projection.ts`:

```typescript
import Projection from "ol/proj/Projection";

export const MARS_GEOGRAPHIC = new Projection({
  code: "MARS:GEOGRAPHIC",
  units: "degrees",
  extent: [0, -90, 360, 90],
});
```

For this visualizer, use a simple cylindrical Mars longitude/latitude coordinate space:

- East-positive longitude.
- Longitude range normalized to 0–360°.
- Planetocentric latitude.

All prepared dataset extents must use this same convention. Do not assign an Earth CRS such as EPSG:4326 to Mars data. Do not use Web Mercator for this first Mars map.

The projection is a local map-coordinate definition for OpenLayers. It does not, by itself, encode every planetary datum or cartographic parameter. Keep the coordinate convention and assumptions documented in the data pipeline.

## 10. Stage E — Implement a reusable raster layer factory

Create `lib/map/layer-factory.ts`:

```typescript
import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";

import type { MarsRasterDataset } from "@/lib/data/dataset.types";
import { MARS_GEOGRAPHIC } from "./mars-projection";

export function createRasterLayer(dataset: MarsRasterDataset) {
  return new ImageLayer({
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
```

This function should be reusable for the other raster datasets. Do not hardcode THEMIS-specific behavior in the OpenLayers layer factory.

## 11. Stage F — Build the OpenLayers map component

Create `components/visualizer/MapContainer.tsx`.

Responsibilities:

1. Render a map container with a measurable height.
2. Initialize one OpenLayers map instance.
3. Create the THEMIS layer using the shared layer factory.
4. Configure the map view with `MARS_GEOGRAPHIC`.
5. Center or fit the view to the actual THEMIS image extent.
6. Support panning and zooming.
7. Clean up the map target when the React component unmounts.
8. Report image-loading errors in a way that can be diagnosed.

Implementation requirements:

- Mark the component with `"use client"`.
- Store the map instance in `useRef`.
- Initialize the map inside `useEffect`.
- Do not recreate the map when Zustand state changes.
- Maintain layer instances in a layer registry keyed by dataset ID.
- Call `map.setTarget(undefined)` during cleanup.
- Ensure the map container and its parent have a non-zero height.
- Do not repeatedly reset the map view when opacity or visibility changes.

Initial view configuration:

```typescript
const view = new View({
  projection: MARS_GEOGRAPHIC,
  center: [77.5, 18.5],
  resolution: 0.003,
  enableRotation: false,
});
```

After the map has a measurable size, fit the exact image extent:

```typescript
view.fit(THEMIS_DAY.extent, {
  size: map.getSize(),
  padding: [32, 32, 32, 32],
});
```

Ensure `map.updateSize()` is called when necessary before fitting. The initial view resolution is only a fallback; the fit operation should establish the final initial viewport.

## 12. Stage G — Add Zustand controls

Create `lib/state/visualizer-store.ts`.

The store should own UI state only. Do not store OpenLayers maps, layers, raster pixel arrays, or image objects in Zustand.

Suggested store:

```typescript
import { create } from "zustand";

interface VisualizerState {
  visibleLayers: string[];
  activeDatasetId: string | null;
  layerOpacity: Record<string, number>;

  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setActiveDataset: (id: string | null) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  visibleLayers: ["themis-day"],
  activeDatasetId: "themis-day",
  layerOpacity: {
    "themis-day": 1,
  },

  toggleLayer: (id) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(id)
        ? state.visibleLayers.filter((layerId) => layerId !== id)
        : [...state.visibleLayers, id],
    })),

  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layerOpacity: {
        ...state.layerOpacity,
        [id]: Math.min(1, Math.max(0, opacity)),
      },
    })),

  setActiveDataset: (id) =>
    set({ activeDatasetId: id }),
}));
```

The OpenLayers component should subscribe to relevant store values and update the existing layer instances:

- `layer.setVisible(...)` when visibility changes.
- `layer.setOpacity(...)` when opacity changes.

Avoid rebuilding the map or layer source for these UI changes.

Keep visualizer state separate from planner state.

## 13. Stage H — Build the visualizer UI

Implement the main UI under `components/visualizer/`.

| Component | Responsibility |
|---|---|
| `VisualizerWorkspace.tsx` | Main visualizer layout |
| `MapContainer.tsx` | OpenLayers map lifecycle and rendering |
| `DatasetPanel.tsx` | Dataset selection panel |
| `DatasetCard.tsx` | Dataset name, instrument, resolution, visibility |
| `LayerControls.tsx` | Visibility and opacity controls |
| `DatasetInspector.tsx` | Scientific description, source, attribution, limitations |

Initial layout:

```text
+-------------------------------------------------------+
| ASTRA                         MARS DATA VISUALIZER     |
+----------------------+--------------------------------+
| DATASETS             |                                |
|                      |                                |
| [x] THEMIS Day IR    |          OPENLAYERS            |
|                      |          MARS MAP              |
| [ ] THEMIS Night IR  |                                |
| [ ] MOLA Elevation   |                                |
| [ ] MOLA Roughness   |                                |
| [ ] TES Thermal      |                                |
|                      |                                |
+----------------------+--------------------------------+
| DATASET INFORMATION / LEGEND / SOURCE                  |
+-------------------------------------------------------+
```

Only THEMIS Day IR needs to be wired to real data for this milestone. Other future dataset cards may be omitted or clearly marked as unavailable; do not show non-functional controls as if they work.

Display:

- Dataset name.
- Instrument and mission.
- Native spatial resolution.
- Source URL and attribution.
- A description explaining that the current rendering is thermal infrared grayscale imagery.
- A note that raw digital numbers are not calibrated temperatures.

## 14. Stage I — Create the visualizer route

Create `app/visualizer/page.tsx`:

```tsx
import VisualizerWorkspace from "@/components/visualizer/VisualizerWorkspace";

export default function VisualizerPage() {
  return <VisualizerWorkspace />;
}
```

`VisualizerWorkspace.tsx` should compose the dataset panel, map, and dataset inspector using the existing project styling and component conventions.

Do not add a new design system. Do not import planner or landing-page feature components unless they are genuinely shared layout primitives already used by the project.

## 15. Testing and acceptance criteria

The milestone is complete only when the following checks pass.

### Data preparation

- [ ] The cropped GeoTIFF is generated successfully.
- [ ] Actual image dimensions are recorded.
- [ ] Exact image extent is recorded from `gdalinfo`.
- [ ] No-data pixels are transparent in the PNG.
- [ ] Non-missing grayscale values are preserved.
- [ ] Image orientation is correct.
- [ ] The image can be opened directly through its Next.js public URL.

### OpenLayers

- [ ] The Mars projection is used consistently.
- [ ] The THEMIS image appears at its correct geographical position.
- [ ] The map supports panning and zooming.
- [ ] The image is not flipped, stretched, or offset.
- [ ] The map container has a measurable size.
- [ ] The map is not recreated on ordinary state updates.
- [ ] Cleanup works when the React component unmounts.

### UI and state

- [ ] THEMIS can be hidden and shown.
- [ ] THEMIS opacity can be adjusted.
- [ ] Dataset metadata and attribution are visible.
- [ ] Loading and image-error states are handled.
- [ ] Planner state remains independent.

### Architecture

- [ ] The visualizer works at `/visualizer`.
- [ ] No database or object storage is required.
- [ ] No raster processing happens in Next.js request handlers.
- [ ] Dataset metadata is defined centrally.
- [ ] The layer factory is reusable for future raster datasets.

## 16. Common failure cases

| Symptom | First things to check |
|---|---|
| PNG URL returns 404 | Verify the file is under `public/` and the URL omits the `public` prefix. |
| Image is in the wrong location | Use exact cropped GeoTIFF bounds, not approximate requested crop bounds. |
| Image appears flipped | Check source orientation, upper-left/lower-right bounds, and conversion steps. |
| Map is blank | Check map container height, image network request, projection, and `imageExtent`. |
| Image loads but is stretched | Verify image dimensions and extent ordering: `[west, south, east, north]`. |
| Missing regions appear black | Check that the no-data pixels became alpha 0 in the PNG. |
| Map resets when opacity changes | Check React effect dependencies and ensure the map instance is held in a ref. |
| Image looks too dark or washed out | Inspect pixel statistics; do not apply an undocumented contrast stretch. |

## 17. Implementation order

Execute the tasks in this order. Do not move on to a later stage until the previous stage has been validated.

| Order | Task | Priority |
|---:|---|---|
| 1 | Crop THEMIS to Jezero | P0 |
| 2 | Inspect actual cropped GeoTIFF bounds and dimensions | P0 |
| 3 | Convert GeoTIFF to transparent PNG | P0 |
| 4 | Verify PNG through a browser URL | P0 |
| 5 | Define dataset type and central registry | P0 |
| 6 | Configure Mars projection | P0 |
| 7 | Implement reusable raster layer factory | P0 |
| 8 | Implement OpenLayers map lifecycle | P0 |
| 9 | Connect `/visualizer` route | P0 |
| 10 | Add Zustand visibility and opacity controls | P1 |
| 11 | Add dataset inspector and attribution | P1 |
| 12 | Run acceptance tests | P1 |

## 18. Definition of done

A user can open `/visualizer` and see the actual THEMIS Day IR image covering the correct Jezero geographical extent in an OpenLayers map. The user can pan and zoom, toggle the image, adjust its opacity, and inspect the dataset's metadata and source attribution.

The implementation must use local prepared data, a central TypeScript dataset registry, one Mars geographic projection, and a reusable OpenLayers raster layer factory. It must not depend on the landing page or planner and must not require a database, MinIO, a tile server, or a custom backend API.

## 19. Follow-up milestone

After the THEMIS vertical slice passes acceptance tests:

1. Add MOLA Colorized Elevation as a second raster image layer.
2. Confirm its source tiles and coordinate conventions independently.
3. Prepare it using the same data-processing principles.
4. Register it in `mars-datasets.ts`.
5. Load it through the same layer factory.
6. Add the remaining datasets one at a time.
7. Introduce a tile pyramid only when image size, map coverage, or zoom performance makes it necessary.

The core principle is: **prepare each scientific dataset into a browser-ready asset with documented geographical metadata, then let the same OpenLayers visualizer render it through a shared dataset contract.**

---

## References

- ASU THEMIS Day IR dataset: https://www.mars.asu.edu/data/thm_dir_100m/
- OpenLayers `ImageStatic` API: https://openlayers.org/en/latest/apidoc/module-ol_source_ImageStatic-ImageStatic.html
- OpenLayers static image example: https://openlayers.org/en/latest/examples/static-image.html
- GDAL `gdal_translate`: https://gdal.org/en/stable/programs/gdal_translate.html
- Next.js static assets (`public` directory): https://nextjs.org/docs/app/building-your-application/optimizing/static-assets
