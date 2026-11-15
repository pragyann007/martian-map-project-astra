/**
 * ArcGIS Maps SDK dynamic loader for Martian 3D SceneView.
 * Lazy-loads the Esri script and theme without polluting the main bundle.
 */

export type ArcGISConstructor<T = Record<string, unknown>> = new (...args: unknown[]) => T;

export interface ArcGISMarsView {
  container: HTMLDivElement | null;
  map: unknown;
  camera: {
    position: { x: number; y: number; z: number };
    heading: number;
    tilt: number;
  };
  when: (callback: () => void) => Promise<void>;
  watch: (property: string, callback: (val: unknown) => void) => { remove: () => void };
  goTo: (target: unknown, options?: { duration?: number }) => Promise<void>;
  destroy: () => void;
}

export interface ArcGISMarsLayer {
  visible: boolean;
  opacity?: number;
}

export interface ArcGISMarsModules {
  Map: ArcGISConstructor;
  SceneView: ArcGISConstructor<ArcGISMarsView>;
  TileLayer: ArcGISConstructor<ArcGISMarsLayer>;
  ElevationLayer: ArcGISConstructor<ArcGISMarsLayer>;
  Camera: ArcGISConstructor;
  SpatialReference: ArcGISConstructor;
}

export const MARS_SCENE_CONFIG = {
  wkid: 104971,
  elevationUrl: "https://astro.arcgis.com/arcgis/rest/services/OnMars/MDEM200M/ImageServer",
  elevationCopyright: "Topography: NASA GSFC, DLR, USGS Astrogeology, JPL, Esri",
  ctxTileUrl: "https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX1/MapServer",
  ctxCopyright: "Imagery: NASA, JPL, MSSS, Caltech/Murray Lab, Esri",
  ctxTitle: "Global CTX Mosaic of Mars V01 (NASA/JPL/MSSS/The Murray Lab)",
  colorDemUrl: "https://astro.arcgis.com/arcgis/rest/services/OnMars/MColorDEM/MapServer",
  colorDemCopyright: "USGS Astrogeology Science Center, NASA, JPL, ESA, DLR, Esri",
  caltechViewerUrl: "https://murray-lab.caltech.edu/CTX/V01/SceneView/MurrayLabCTXmosaic.html",
  caltechFallbackUrl: "https://murray-lab.caltech.edu/CTX/V01/SceneView/3dViewer.html",
  jezeroDefault: {
    lon: 77.49,
    lat: 18.25,
    altitude: 32000,
    heading: 335,
    tilt: 65,
  },
};

interface ArcGISWindow {
  require?: (
    deps: string[],
    callback: (
      Map: ArcGISConstructor,
      SceneView: ArcGISConstructor<ArcGISMarsView>,
      TileLayer: ArcGISConstructor<ArcGISMarsLayer>,
      ElevationLayer: ArcGISConstructor<ArcGISMarsLayer>,
      Camera: ArcGISConstructor,
      SpatialReference: ArcGISConstructor
    ) => void,
    errback?: (err: unknown) => void
  ) => void;
}

let arcgisPromise: Promise<ArcGISMarsModules> | null = null;

export function loadArcGISMars(): Promise<ArcGISMarsModules> {
  if (arcgisPromise) return arcgisPromise;

  arcgisPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("ArcGIS SDK cannot be initialized on server."));
      return;
    }

    // Ensure ArcGIS dark theme stylesheet is present
    if (!document.getElementById("arcgis-dark-css")) {
      const link = document.createElement("link");
      link.id = "arcgis-dark-css";
      link.rel = "stylesheet";
      link.href = "https://js.arcgis.com/4.28/esri/themes/dark/main.css";
      document.head.appendChild(link);
    }

    const getArcGISWindow = () => window as unknown as ArcGISWindow;

    const resolveModules = () => {
      const req = getArcGISWindow().require;
      if (!req) {
        reject(new Error("ArcGIS AMD loader (window.require) is unavailable."));
        return;
      }

      req(
        [
          "esri/Map",
          "esri/views/SceneView",
          "esri/layers/TileLayer",
          "esri/layers/ElevationLayer",
          "esri/Camera",
          "esri/geometry/SpatialReference",
        ],
        (
          Map: ArcGISConstructor,
          SceneView: ArcGISConstructor<ArcGISMarsView>,
          TileLayer: ArcGISConstructor<ArcGISMarsLayer>,
          ElevationLayer: ArcGISConstructor<ArcGISMarsLayer>,
          Camera: ArcGISConstructor,
          SpatialReference: ArcGISConstructor
        ) => {
          resolve({
            Map,
            SceneView,
            TileLayer,
            ElevationLayer,
            Camera,
            SpatialReference,
          });
        },
        (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          reject(new Error("Failed to resolve ArcGIS modules: " + message));
        }
      );
    };

    // Check if script is already present
    if (getArcGISWindow().require) {
      resolveModules();
      return;
    }

    const script = document.createElement("script");
    script.id = "arcgis-js-api";
    script.src = "https://js.arcgis.com/4.28/";
    script.async = true;
    script.onload = () => resolveModules();
    script.onerror = (e) => reject(new Error("Failed to load ArcGIS JavaScript API: " + e));
    document.body.appendChild(script);
  });

  return arcgisPromise;
}
