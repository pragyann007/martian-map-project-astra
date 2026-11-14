# ASTRA — Mars Dataset Visualizer
## Implementation Plan (Revised Architecture)

**Module:** Independent Dataset Visualizer  
**Frontend:** Next.js App Router, React, TypeScript  
**Map engine:** OpenLayers  
**State:** Zustand  
**Data storage:** Local filesystem and Next.js public assets  
**Initial geographical region:** Jezero Crater, Mars  
**Initial datasets:** Six ASU Mars Global Data Sets

---

# 1. Objective and scope

Build a standalone Mars dataset visualization workspace.

The visualizer allows users to explore six different Mars datasets through one geographical interface.

### Core capabilities

1. Display a Mars geographical map centered on Jezero Crater.
2. Display six independent scientific raster layers.
3. Toggle individual datasets on and off.
4. Overlay multiple datasets.
5. Adjust the opacity of individual layers.
6. Inspect dataset information, instrument, resolution and source.
7. Display appropriate legends and explain the meaning of each layer.
8. Navigate and zoom around the selected geographical region.

### Explicitly out of scope

The visualizer will NOT implement:

- Mission route planning.
- Scientific target ranking.
- Astronaut resource calculations.
- Terrain hazard scoring.
- Mission feasibility.
- Three.js globe rendering.
- GSAP animations.
- AI-based scientific interpretation.

These belong to other application modules.

The visualizer should remain independently usable without importing anything from the landing page or planner.

---

# 2. Initial dataset selection

Use the following six products from the ASU Mars Global Data Sets catalog.

| Dataset ID | Dataset | Resolution |
|---|---|---:|
| moc-atlas | MOC Wide Angle Atlas | 231.55 m/px |
| themis-day | THEMIS Day IR 100m Mosaic | 99.7 m/px |
| themis-night | THEMIS Night IR 100m Mosaic | 99.7 m/px |
| mola-elevation | MOLA Colorized Elevation | 463.1 m/px |
| mola-roughness | MOLA Vertical Roughness | 7.5 km/px |
| tes-thermal-inertia | TES Thermal Inertia Nighttime 2005 | 3 km/px |

### Dataset-specific considerations

**MOC Atlas**
- Original format: PNG tiles.
- Original projection: Simple cylindrical.
- Tile layout: 30° × 30°.
- Use as the visible-light reference layer.

**THEMIS Day IR**
- Original format: PGM tiles.
- Original projection: Simple cylindrical.
- Longitude convention: 0–360° east.
- Spatial coverage: 90°N to 90°S.
- Display as a thermal infrared imagery layer.

**THEMIS Night IR**
- Original format: PGM tiles.
- Original projection: Simple cylindrical.
- Longitude convention: 0–360° east.
- Spatial coverage: 60°N to 60°S.
- Display as a thermal infrared imagery layer.

**MOLA Colorized Elevation**
- Original format: PNG tiles.
- Original projection: Simple cylindrical.
- Tile layout: 30° × 30°.
- Use for topographic context.

**MOLA Vertical Roughness**
- Original format: RGB PNG.
- Single global image.
- Red channel: 0.6 km baseline.
- Green channel: 2.4 km baseline.
- Blue channel: 9.2 km baseline.
- Display its three channels' meanings in the legend.

**TES Thermal Inertia Nighttime 2005**
- Original format: TIFF.
- Original projection: Simple cylindrical.
- Single global image.
- Use for regional thermal inertia visualization.

All six datasets must have their actual source resolution displayed in the interface.

Do not represent coarse-resolution data as detailed terrain observations. In particular, MOLA roughness and TES thermal inertia are regional information layers, not detailed walking-hazard datasets.

---

# 3. Project structure

Follow the existing project architecture.

The visualizer-specific implementation should live under `components/visualizer/`.

```text
project/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── visualizer/
│   │   └── page.tsx
│   │
│   ├── planner/
│   │   └── page.tsx
│   │
│   └── api/
│       └── (only when needed)
│
├── components/
│   │
│   ├── map/
│   │   └── (shared OpenLayers utilities)
│   │
│   ├── visualizer/
│   │   ├── VisualizerWorkspace.tsx
│   │   ├── VisualizerHeader.tsx
│   │   ├── DatasetPanel.tsx
│   │   ├── DatasetCard.tsx
│   │   ├── LayerControls.tsx
│   │   ├── DatasetLegend.tsx
│   │   ├── DatasetInspector.tsx
│   │   └── MapContainer.tsx
│   │
│   ├── planner/
│   │
│   ├── layout/
│   │
│   └── ui/
│
├── lib/
│   │
│   ├── data/
│   │   ├── mars-datasets.ts
│   │   ├── mars-regions.ts
│   │   └── dataset.types.ts
│   │
│   ├── domain/
│   │
│   ├── state/
│   │   └── visualizer-store.ts
│   │
│   ├── map/
│   │   ├── mars-projection.ts
│   │   ├── map-config.ts
│   │   └── layer-factory.ts
│   │
│   └── server/
│       └── (only when needed)
│
├── public_data/
│   └── raw/
│       ├── moc-atlas/
│       ├── themis-day/
│       ├── themis-night/
│       ├── mola-elevation/
│       ├── mola-roughness/
│       └── tes-thermal-inertia/
│
├── public/
│   └── data/
│       └── mars/
│           └── jezero/
│               ├── moc-atlas/
│               ├── themis-day/
│               ├── themis-night/
│               ├── mola-elevation/
│               ├── mola-roughness/
│               └── tes-thermal-inertia/
│
└── scripts/
    └── prepare-mars-data/
        ├── inspect.py
        ├── crop.py
        ├── normalize.py
        └── generate-tiles.py
```

The structure is conceptual. Preserve existing project files and conventions wherever possible.

Use `visualizer` consistently for the route and component naming.

---

# 4. Data storage strategy

No database or object storage is required.

Use two local directories.

### A. public_data/raw/

This is where original datasets downloaded from ASU will be placed.

Responsibilities:
- Preserve original downloaded files.
- Provide inputs to preprocessing scripts.
- Keep original source files unchanged.
- Avoid committing large source files to Git.

Add the directory to `.gitignore`.

### B. public/data/mars/

This contains prepared assets that the browser can access.

Responsibilities:
- Store Jezero-specific processed imagery.
- Store generated raster map tiles.
- Provide low-resolution previews if needed.
- Store tile metadata and legends if appropriate.

Next.js serves these files directly.

For example:

```text
public/data/mars/jezero/moc-atlas/0/0/0.png
```

Can be accessed through:

```text
/data/mars/jezero/moc-atlas/0/0/0.png
```

The frontend should use these public URLs.

### Important

Do not put original large global rasters into the Next.js public directory.

Only put the prepared regional assets needed by the application there.

For the hackathon, use a Git-independent download/preprocessing workflow and document how each teammate can reproduce the prepared data. Commit only processed assets that are reasonably sized and necessary for the deployed application.

---

# 5. Dataset preparation pipeline

The purpose of this pipeline is to make the six original ASU products compatible with one geographical map.

The processing happens before the application runs.

It does not happen inside Next.js requests.

### Step 1: Inspect datasets

For every downloaded product, record:

- Original filename.
- File size.
- Image dimensions.
- File format.
- Number of raster bands.
- Data type.
- Coordinate reference system.
- Longitude convention.
- Spatial coverage.
- Resolution.
- No-data values.
- Source and citation.

Use GDAL tools, especially `gdalinfo`, for inspection.

The processing script must not assume that all TIFF, PGM or PNG files contain the same type of scientific data.

### Step 2: Select Jezero source coverage

Identify the original tiles that intersect the selected Jezero exploration area.

Download and process only those files.

Do not download the complete THEMIS global mosaic merely to visualize Jezero.

The source products have different layouts, so select the correct source tiles for each dataset.

### Step 3: Crop the geographical region

Define one region configuration:

```typescript
export const JEZERO_REGION = {
  id: "jezero",
  name: "Jezero Crater",

  // Finalize these values against the chosen source products.
  west: undefined,
  east: undefined,
  south: undefined,
  north: undefined,
};
```

The final bounds must be agreed upon by the team and used consistently.

### Step 4: Normalize coordinates

The datasets do not all use the same longitude convention.

For the visualizer, define one canonical Mars coordinate convention:

- Planetocentric latitude.
- East-positive longitude.
- Longitude normalized to 0–360°.
- A common simple cylindrical geographical grid.

THEMIS already uses 0–360° longitude, whereas MOC and MOLA products use -180° to 180°.

Normalize the latter before combining the products.

Keep the coordinate transformations documented.

Do not treat Earth's Web Mercator as the scientific coordinate reference for Mars.

### Step 5: Prepare browser-compatible imagery

Convert unsupported source formats into optimized display assets.

| Original format | Preparation |
|---|---|
| PNG | Georeference/crop and prepare tiles |
| PGM | Convert into browser-compatible raster tiles |
| TIFF | Inspect bands and values, then prepare tiles |
| RGB PNG | Preserve channel information and prepare tiles |

For single-band products, record the display stretch used to turn the source values into visible imagery.

For rendered colorized products, preserve their original colors.

For quantitative products, do not discard numerical values without recording the loss of information.

### Step 6: Generate map tiles

Generate regional raster tiles for each dataset.

All six layers must use the same geographical tile grid.

Recommended initial structure:

```text
jezero/
  moc-atlas/
    {z}/{x}/{y}.png

  themis-day/
    {z}/{x}/{y}.png

  themis-night/
    {z}/{x}/{y}.png

  mola-elevation/
    {z}/{x}/{y}.png

  mola-roughness/
    {z}/{x}/{y}.png

  tes-thermal-inertia/
    {z}/{x}/{y}.png
```

Use a custom Mars geographic tile grid compatible with the chosen projection.

Do not blindly use standard Earth Web Mercator XYZ tiles.

For the hackathon, generate only the zoom levels and regional coverage required by the visualizer.

### Step 7: Validate output

Before using any prepared asset:

- Confirm geographical alignment.
- Confirm the correct Jezero coverage.
- Check image dimensions and resolution.
- Check no-data transparency.
- Check color preservation.
- Check longitude conversion.
- Compare the output with the ASU source.

---

# 6. Central dataset registry

This is the shared contract between the data pipeline and frontend.

Rather than building APIs for static metadata, define one centralized dataset registry.

Location:

```text
lib/data/mars-datasets.ts
```

Suggested TypeScript contract:

```typescript
export interface MarsDataset {
  id: string;
  name: string;

  instrument: string;
  mission: string;

  description: string;
  category: string;

  resolutionMeters: number;

  sourceUrl: string;
  sourceCitation: string;

  format: string;

  spatialCoverage: {
    west: number;
    east: number;
    south: number;
    north: number;
  };

  rendering: {
    type: "raster";
    tileUrl: string;

    defaultVisible: boolean;
    defaultOpacity: number;

    legend?: {
      type: "rgb" | "grayscale" | "continuous" | "categorical";
      unit?: string;
      description?: string;
      labels?: string[];
    };
  };

  limitations?: string[];
}
```

Example dataset definition:

```typescript
export const MARS_DATASETS: MarsDataset[] = [
  {
    id: "mola-elevation",

    name: "MOLA Colorized Elevation",

    instrument: "MOLA",
    mission: "Mars Global Surveyor",

    description:
      "Colorized topographic imagery derived from MOLA altimetry.",

    category: "topography",

    resolutionMeters: 463.1,

    sourceUrl:
      "https://www.mars.asu.edu/data/mola_color/",

    sourceCitation:
      "NASA MGS/MOLA",

    format: "PNG",

    spatialCoverage: {
      west: 0,
      east: 360,
      south: -90,
      north: 90
    },

    rendering: {
      type: "raster",

      tileUrl:
        "/data/mars/jezero/mola-elevation/{z}/{x}/{y}.png",

      defaultVisible: true,
      defaultOpacity: 1,

      legend: {
        type: "continuous",
        description:
          "Colorized elevation. Refer to original product metadata for interpretation."
      }
    },

    limitations: [
      "Rendered elevation imagery, not a numerical DEM.",
      "Not suitable as the sole input for precise terrain displacement."
    ]
  }
];
```

All six datasets must be registered using the same contract.

Do not hardcode dataset metadata inside individual map components.

---

# 7. Frontend implementation — OpenLayers

OpenLayers is the only map-rendering engine in this module.

Build it as a client-side React component.

### Main map responsibilities

- Initialize the Mars map.
- Load the prepared raster tile layers.
- Manage layer ordering.
- Toggle layer visibility.
- Adjust layer opacity.
- Support zoom and geographical navigation.
- Maintain geographical selection.
- Display the selected region.

### Map initialization

Create the map once using a React lifecycle hook.

Maintain:
- One map instance.
- One layer registry.
- One stable map target.

Do not recreate the entire map when Zustand state changes.

The layer registry should maintain references to the existing OpenLayers layers, indexed by dataset ID.

When a user changes visibility or opacity, update the corresponding existing layer.

### Layer creation

Implement a reusable layer factory.

```typescript
createDatasetLayer(dataset: MarsDataset)
```

It should:
1. Read the dataset's tile URL.
2. Create the appropriate OpenLayers raster layer.
3. Configure its tile grid and source.
4. Set visibility.
5. Set initial opacity.
6. Return a layer associated with the dataset ID.

The map should not have six independent hardcoded implementations.

### Default visualization

When the visualizer loads:

- Center the map on Jezero.
- Load MOC Atlas as the base reference.
- Make MOLA elevation available as an overlay.
- Keep the remaining datasets selectable from the dataset panel.

---

# 8. Visualizer interface

Create the main layout inside:

```text
components/visualizer/VisualizerWorkspace.tsx
```

Suggested layout:

```text
+-------------------------------------------------------+
| ASTRA                       MARS DATA VISUALIZER      |
+----------------------+--------------------------------+
|                      |                                |
| DATASETS             |                                |
|                      |                                |
| [x] MOC Atlas        |                                |
|                      |                                |
| [ ] THEMIS Day IR    |          OPENLAYERS            |
|                      |                                |
| [ ] THEMIS Night IR  |         MARS MAP               |
|                      |                                |
| [x] MOLA Elevation   |                                |
|                      |                                |
| [ ] MOLA Roughness   |                                |
|                      |                                |
| [ ] TES Thermal      |                                |
|     Inertia          |                                |
|                      |                                |
|                      |                                |
+----------------------+--------------------------------+
| SELECTED DATASET INFORMATION                           |
+-------------------------------------------------------+
```

### Dataset panel

Each dataset card should contain:

- Dataset name.
- Instrument.
- Resolution.
- Short description.
- Visibility toggle.
- Information action.

### Layer controls

For active layers:

- Opacity slider.
- Layer ordering.
- Visibility control.
- Remove/hide option.

### Dataset inspector

When a dataset is selected, show:

- Full dataset name.
- Mission and instrument.
- Spatial resolution.
- Observation/product information.
- Original data source.
- Known limitations.
- Legend.

### Legends

Legends must correspond to the actual source products.

Examples:

**MOLA Roughness**
- Red: 0.6 km baseline.
- Green: 2.4 km baseline.
- Blue: 9.2 km baseline.

**THEMIS Day/Night**
- Display the selected rendering stretch or product color interpretation.
- Do not label raw digital numbers as surface temperature without appropriate calibration.

**MOLA Elevation**
- Explain that it is colorized elevation imagery.
- Do not invent an exact elevation color scale.

---

# 9. Zustand state

Create a dedicated visualizer store.

Location:

```text
lib/state/visualizer-store.ts
```

Suggested interface:

```typescript
interface VisualizerState {
  selectedRegion: string;

  visibleLayers: string[];

  activeDatasetId: string | null;

  layerOpacity: Record<string, number>;

  selectedCoordinates: {
    longitude: number;
    latitude: number;
  } | null;

  toggleLayer: (id: string) => void;

  setOpacity: (
    id: string,
    opacity: number
  ) => void;

  setActiveDataset: (
    id: string | null
  ) => void;

  setRegion: (id: string) => void;

  setCoordinates: (
    coordinates: {
      longitude: number;
      latitude: number;
    } | null
  ) => void;
}
```

Do not place OpenLayers objects or raster binary data inside Zustand.

The store handles UI state only.

Keep the planner's state separate.

---

# 10. Backend requirements

For the initial implementation:

**No custom API endpoints are required.**

The dataset registry is static TypeScript configuration.

The processed raster tiles are static assets.

The browser retrieves tiles directly from Next.js public URLs.

Do not introduce:
- Database connections.
- PostGIS.
- MinIO.
- Dataset upload APIs.
- Raster-processing route handlers.
- A separate tile-serving server.

Introduce Next.js Route Handlers only when a real requirement emerges, such as dynamic spatial queries or server-side filtering of large feature datasets.

---

# 11. Parallel development and agent responsibilities

The visualizer is divided into four independently developable workstreams.

All agents must agree on the shared dataset interface before implementation.

### Agent 1 — Dataset processing

Owns:

```text
public_data/
public/data/mars/
scripts/prepare-mars-data/
```

Responsibilities:
- Inspect all six downloaded products.
- Select the source tiles for Jezero.
- Normalize coordinates.
- Prepare the regional datasets.
- Generate browser-compatible raster tiles.
- Validate geographical alignment.
- Document source provenance and processing assumptions.

Deliverable: Six prepared datasets with a common geographical extent and tile scheme.

### Agent 2 — OpenLayers map

Owns:

```text
components/map/
lib/map/
```

Responsibilities:
- Initialize the OpenLayers map.
- Implement the custom Mars projection.
- Implement the dataset layer factory.
- Load raster tiles.
- Implement layer ordering.
- Support visibility and opacity updates.
- Implement geographical navigation.

Deliverable: Working OpenLayers map with mocked dataset definitions.

### Agent 3 — Visualizer UI and Zustand

Owns:

```text
components/visualizer/
lib/state/visualizer-store.ts
```

Responsibilities:
- Main visualizer workspace.
- Dataset panel.
- Dataset cards.
- Layer controls.
- Dataset inspector.
- Legends.
- Loading and error states.
- Zustand integration.

Deliverable: Working interface connected to a mocked map.

### Agent 4 — Integration owner

Owns:

```text
app/visualizer/
lib/data/mars-datasets.ts
```

Responsibilities:
- Define and maintain the shared dataset contract.
- Register the six datasets.
- Integrate the UI and OpenLayers components.
- Connect real processed data.
- Test layer combinations.
- Ensure independence from the landing page and planner.

Deliverable: Complete `/visualizer` route.

### Parallelization rule

Agents 2 and 3 can start with mocked datasets immediately.

Agent 1 does not need the complete frontend.

Agent 4 defines the shared interface first and integrates the other modules once their contracts are satisfied.

No agent should invent a separate dataset format or create another Zustand store for the same visualizer concerns.

---

# 12. Development order and milestones

## Milestone 1 — Establish contracts

- [ ] Confirm six dataset IDs.
- [ ] Define the shared dataset interface.
- [ ] Finalize the Jezero geographical bounds.
- [ ] Define the canonical Mars coordinate convention.
- [ ] Create the visualizer store.
- [ ] Create the route and component skeleton.

## Milestone 2 — Prove the data pipeline

Start with two datasets:

1. MOC Atlas.
2. MOLA Colorized Elevation.

- [ ] Inspect both source products.
- [ ] Prepare their Jezero coverage.
- [ ] Normalize coordinates.
- [ ] Generate corresponding map tiles.
- [ ] Verify that both layers align in OpenLayers.

This is the most important early milestone.

Do not prepare all six products before verifying the coordinate and tile pipeline.

## Milestone 3 — Complete the 2D map

- [ ] Integrate all six datasets.
- [ ] Implement independent layer toggles.
- [ ] Implement opacity controls.
- [ ] Implement layer ordering.
- [ ] Implement map navigation.
- [ ] Implement metadata and legends.

## Milestone 4 — Integration and testing

- [ ] Integrate the visualizer into `/visualizer`.
- [ ] Verify all six datasets.
- [ ] Test multiple simultaneous layers.
- [ ] Test layer switching.
- [ ] Verify geographical alignment.
- [ ] Test loading and error states.
- [ ] Test that no planner or landing page dependencies are introduced.

---

# 13. Acceptance criteria

The module is complete when:

### Dataset handling
- [ ] All six datasets appear in the central registry.
- [ ] Dataset source attribution is available.
- [ ] Original spatial resolutions are shown.
- [ ] No-data areas are handled.
- [ ] The prepared products align geographically.

### Map functionality
- [ ] The Jezero region loads.
- [ ] MOC Atlas displays correctly.
- [ ] All six datasets can be independently enabled and disabled.
- [ ] Multiple datasets can be overlaid.
- [ ] Each layer has independent opacity.
- [ ] Zoom and navigation work correctly.
- [ ] Map interactions do not cause the OpenLayers instance to be recreated.

### Interface
- [ ] Dataset information can be inspected.
- [ ] Legends are available.
- [ ] Loading and error states are handled.
- [ ] The existing application styling is respected.

### Independence
- [ ] `/visualizer` works independently.
- [ ] No mission planner imports are required.
- [ ] No landing page component imports are required.
- [ ] Planner and visualizer states are separate.
- [ ] No additional database or object storage infrastructure is required.

---

# 14. Implementation priorities

| Priority | Work |
|---|---|
| P0 | Dataset contract and registry |
| P0 | Mars coordinate and tile-grid definition |
| P0 | MOC + MOLA initial integration |
| P0 | OpenLayers map and layer factory |
| P0 | Six dataset layer controls |
| P1 | Dataset metadata inspector |
| P1 | Legends and source attribution |
| P1 | Performance and loading optimization |
| P2 | Numerical raster pixel inspection |
| P2 | Additional Mars regions |

**Final definition of done:**

A user opens `/visualizer`, navigates around Jezero Crater, enables any combination of six ASU Mars datasets, adjusts their opacity, inspects their scientific metadata and compares their geographical information through one OpenLayers map.

The entire experience uses prepared local data, a centralized dataset registry and the existing Next.js application. No separate infrastructure is required.