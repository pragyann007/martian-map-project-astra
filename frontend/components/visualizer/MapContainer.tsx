"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import type Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromExtent } from "ol/geom/Polygon";
import { Style, Stroke, Fill, Text, Circle as CircleStyle } from "ol/style";
import Graticule from "ol/layer/Graticule";
import ScaleLine from "ol/control/ScaleLine";
import { defaults as defaultControls } from "ol/control/defaults";
import "ol/ol.css";

import {
  MARS_DATASETS,
  MARS_LANDMARKS,
  JEZ_CTX,
  JEZ_HIRISE,
  JEZ_REGIONAL_VISIBLE,
} from "@/lib/data/mars-datasets";
import { MARS_GEOGRAPHIC } from "@/lib/map/mars-projection";
import { createDatasetLayer } from "@/lib/map/layer-factory";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Loader2,
  Crosshair,
  Compass,
  MapPin,
} from "lucide-react";

export default function MapContainer() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const layersMapRef = useRef<Record<string, Layer>>({});
  const graticuleRef = useRef<Graticule | null>(null);
  const landmarksLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const footprintsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const pendingRequestsRef = useRef<number>(0);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const filtersRef = useRef<{
    brightness: Record<string, number>;
    contrast: Record<string, number>;
    blendMode: Record<string, string>;
  }>({
    brightness: {},
    contrast: {},
    blendMode: {},
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ lon: string; lat: string } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<string>("9.5");
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // Store bindings
  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);
  const layerBrightness = useVisualizerStore((state) => state.layerBrightness);
  const layerContrast = useVisualizerStore((state) => state.layerContrast);
  const layerBlendMode = useVisualizerStore((state) => state.layerBlendMode);

  const showGraticule = useVisualizerStore((state) => state.showGraticule);
  const showLandmarks = useVisualizerStore((state) => state.showLandmarks);
  const showFootprints = useVisualizerStore((state) => state.showFootprints);
  const selectedLandmarkId = useVisualizerStore((state) => state.selectedLandmarkId);
  const landmarkNonce = useVisualizerStore((state) => state.landmarkNonce);

  const activeOverlayId = useVisualizerStore((state) => state.activeOverlayId);
  const activeBaseMapId = useVisualizerStore((state) => state.activeBaseMapId);
  const activeDataset =
    MARS_DATASETS.find((d) => d.id === activeOverlayId) ||
    MARS_DATASETS.find((d) => d.id === activeBaseMapId) ||
    JEZ_CTX;

  // Throttled loading state helper to avoid rapid re-rendering during tile bursts
  const setTileLoading = useCallback((delta: number) => {
    pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current + delta);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    if (pendingRequestsRef.current > 0) {
      setIsLoading(true);
    } else {
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 150);
    }
  }, []);

  // Initialize Map once
  useEffect(() => {
    if (!mapElementRef.current) return;

    const layerRegistry: Record<string, Layer> = {};
    const initialLayers: Layer[] = [];

    // 1. Build imagery raster & tile layers (Base Maps + Scientific Overlays)
    MARS_DATASETS.forEach((dataset) => {
      const layer = createDatasetLayer(dataset);
      layerRegistry[dataset.id] = layer;
      initialLayers.push(layer);

      // Attach canvas rendering filters (brightness, contrast, and blend mode)
      layer.on("prerender", (evt) => {
        const ctx = (evt as unknown as { context?: CanvasRenderingContext2D }).context;
        if (ctx) {
          const b = filtersRef.current.brightness[dataset.id] ?? 1.0;
          const c = filtersRef.current.contrast[dataset.id] ?? 1.0;
          const blend = filtersRef.current.blendMode[dataset.id] ?? "normal";
          ctx.save();
          if (b !== 1.0 || c !== 1.0) {
            ctx.filter = `brightness(${b}) contrast(${c})`;
          }
          if (blend && blend !== "normal") {
            ctx.globalCompositeOperation = blend as GlobalCompositeOperation;
          }
        }
      });

      layer.on("postrender", (evt) => {
        const ctx = (evt as unknown as { context?: CanvasRenderingContext2D }).context;
        if (ctx) {
          ctx.restore();
        }
      });

      // Track loading states
      const source = layer.getSource();
      if (source) {
        const s = source as unknown as { on: (event: string, fn: () => void) => void };
        if (dataset.sourceType === "wmts") {
          s.on("tileloadstart", () => {
            setTileLoading(1);
            setLoadError(null);
          });
          s.on("tileloadend", () => {
            setTileLoading(-1);
          });
          s.on("tileloaderror", () => {
            setTileLoading(-1);
          });
        } else {
          s.on("imageloadstart", () => {
            setIsLoading(true);
            setLoadError(null);
          });
          s.on("imageloadend", () => {
            setIsLoading(false);
          });
          s.on("imageloaderror", () => {
            setIsLoading(false);
            setLoadError(`Failed to load raster image: ${dataset.name}`);
          });
        }
      }
    });

    layersMapRef.current = layerRegistry;

    // 2. High-Tech Instrument Coverage Footprint Overlays (Footprints Layer)
    const footprintFeatures = [
      new Feature({
        geometry: fromExtent(JEZ_HIRISE.extent),
        name: "MRO HiRISE Delta Swath (~25 cm/px)",
        instrument: "HiRISE",
        color: "rgba(233, 161, 106, 0.9)",
      }),
      new Feature({
        geometry: fromExtent(JEZ_CTX.extent),
        name: "MRO CTX Jezero Mosaic (~6 m/px)",
        instrument: "CTX",
        color: "rgba(198, 107, 61, 0.75)",
      }),
      new Feature({
        geometry: fromExtent(JEZ_REGIONAL_VISIBLE.extent),
        name: "HRSC / CTX Regional Visible Composite",
        instrument: "HRSC",
        color: "rgba(119, 124, 131, 0.6)",
      }),
    ];

    const footprintsLayer = new VectorLayer({
      source: new VectorSource({
        features: footprintFeatures,
      }),
      style: (feature) => {
        const color = (feature.get("color") as string) || "rgba(198, 107, 61, 0.8)";
        const name = feature.get("name") as string;
        return new Style({
          stroke: new Stroke({
            color,
            width: 1.5,
            lineDash: [6, 4],
          }),
          fill: new Fill({
            color: "rgba(198, 107, 61, 0.02)",
          }),
          text: new Text({
            text: `[SWATH] ${name}`,
            font: "10px monospace",
            fill: new Fill({ color: "rgba(233, 161, 106, 0.9)" }),
            stroke: new Stroke({ color: "rgba(9, 10, 12, 0.95)", width: 3 }),
            placement: "line",
            offsetY: -8,
          }),
        });
      },
      zIndex: 15,
      visible: true,
    });
    footprintsLayerRef.current = footprintsLayer;
    initialLayers.push(footprintsLayer);

    // 3. Sourced Geographic Landmarks & Science POIs Layer
    const landmarkFeatures = MARS_LANDMARKS.map((lm) => {
      const f = new Feature({
        geometry: new Point(lm.location),
        name: lm.name,
        category: lm.category,
        landmarkId: lm.id,
      });
      return f;
    });

    const landmarksLayer = new VectorLayer({
      source: new VectorSource({
        features: landmarkFeatures,
      }),
      style: (feature) => {
        const name = feature.get("name") as string;
        const category = feature.get("category") as string;
        const isLanding = category === "Landing Site";

        return new Style({
          image: new CircleStyle({
            radius: isLanding ? 6 : 4.5,
            fill: new Fill({
              color: isLanding ? "rgba(233, 161, 106, 0.95)" : "rgba(232, 229, 223, 0.9)",
            }),
            stroke: new Stroke({
              color: "rgba(9, 10, 12, 0.9)",
              width: 2,
            }),
          }),
          text: new Text({
            text: name,
            font: "bold 10px sans-serif",
            fill: new Fill({
              color: isLanding ? "#E9A16A" : "#E8E5DF",
            }),
            stroke: new Stroke({
              color: "rgba(9, 10, 12, 0.95)",
              width: 3.5,
            }),
            offsetY: -12,
          }),
        });
      },
      zIndex: 30,
      visible: true,
    });
    landmarksLayerRef.current = landmarksLayer;
    initialLayers.push(landmarksLayer);

    // 4. Mars Graticule Overlay (Latitude & Longitude Grid Lines)
    const graticule = new Graticule({
      strokeStyle: new Stroke({
        color: "rgba(198, 107, 61, 0.22)",
        width: 0.8,
        lineDash: [4, 4],
      }),
      showLabels: true,
      wrapX: false,
      latLabelStyle: new Text({
        font: "10px monospace",
        textBaseline: "middle",
        textAlign: "right",
        offsetX: -6,
        fill: new Fill({ color: "rgba(233, 161, 106, 0.75)" }),
        stroke: new Stroke({ color: "rgba(9, 10, 12, 0.9)", width: 3 }),
      }),
      lonLabelStyle: new Text({
        font: "10px monospace",
        textBaseline: "bottom",
        textAlign: "center",
        offsetY: -6,
        fill: new Fill({ color: "rgba(233, 161, 106, 0.75)" }),
        stroke: new Stroke({ color: "rgba(9, 10, 12, 0.9)", width: 3 }),
      }),
      intervals: [90, 45, 30, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05],
      zIndex: 25,
      visible: true,
    });
    graticuleRef.current = graticule;
    initialLayers.push(graticule);

    // Initial View centered directly on Jezero Crater coordinates [77.45° E, 18.45° N]
    const initialView = new View({
      projection: MARS_GEOGRAPHIC,
      center: [77.45, 18.45],
      zoom: 9.5,
      minZoom: 1,
      maxZoom: 18,
      enableRotation: false,
    });

    // Mars Scaleline Control (metric km/m accurately calibrated to Mars radius)
    const scaleLineControl = new ScaleLine({
      units: "metric",
      bar: true,
      steps: 4,
      text: true,
      minWidth: 120,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: initialLayers,
      view: initialView,
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }).extend([scaleLineControl]),
    });

    // Update coordinates safely on mouse move and detect landmark hover
    map.on("pointermove", (event) => {
      const coord = event.coordinate;
      if (coord && typeof coord[0] === "number" && typeof coord[1] === "number") {
        setMouseCoord({
          lon: coord[0].toFixed(4),
          lat: coord[1].toFixed(4),
        });
      }

      // Feature hit-testing for cursor feedback
      let hit = false;
      map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          const name = feature.get("name") as string | undefined;
          if (name) {
            setHoveredLandmark(name);
            hit = true;
            return true;
          }
        },
        { layerFilter: (l) => l === landmarksLayer }
      );
      if (!hit) setHoveredLandmark(null);
    });

    map.on("moveend", () => {
      const z = initialView.getZoom();
      if (z !== undefined) {
        setCurrentZoom(z.toFixed(1));
      }
    });

    mapInstanceRef.current = map;

    // Observe container size and keep OpenLayers canvas in sync
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
            map.updateSize();
          }
        }
      });
      resizeObserver.observe(mapElementRef.current);
    }

    // Trigger initial layout fit
    const fitTimer = setTimeout(() => {
      map.updateSize();
      const size = map.getSize();
      if (size && size[0] > 50 && size[1] > 50) {
        initialView.fit(JEZ_CTX.extent, {
          size,
          padding: [40, 40, 40, 40],
        });
      }
    }, 120);

    return () => {
      clearTimeout(fitTimer);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.setTarget(undefined);
      mapInstanceRef.current = null;
      layersMapRef.current = {};
      graticuleRef.current = null;
      landmarksLayerRef.current = null;
      footprintsLayerRef.current = null;
    };
  }, [setTileLoading]);

  // Synchronize layer visibility from Zustand without reconstructing map
  useEffect(() => {
    const registry = layersMapRef.current;
    const layers = visibleLayers || [];
    Object.keys(registry).forEach((id) => {
      const layer = registry[id];
      const isVisible = layers.includes(id);
      if (layer.getVisible() !== isVisible) {
        layer.setVisible(isVisible);
      }
    });
  }, [visibleLayers]);

  // Synchronize layer opacity from Zustand
  useEffect(() => {
    const registry = layersMapRef.current;
    const opacities = layerOpacity || {};
    Object.keys(registry).forEach((id) => {
      const layer = registry[id];
      const opacity = opacities[id] !== undefined ? opacities[id] : 1;
      if (layer.getOpacity() !== opacity) {
        layer.setOpacity(opacity);
      }
    });
  }, [layerOpacity]);

  // Synchronize Graticule, Landmarks, and Footprints visibility
  useEffect(() => {
    if (graticuleRef.current) {
      graticuleRef.current.setVisible(showGraticule);
    }
  }, [showGraticule]);

  useEffect(() => {
    if (landmarksLayerRef.current) {
      landmarksLayerRef.current.setVisible(showLandmarks);
    }
  }, [showLandmarks]);

  useEffect(() => {
    if (footprintsLayerRef.current) {
      footprintsLayerRef.current.setVisible(showFootprints);
    }
  }, [showFootprints]);

  // Apply Hardware-Accelerated Canvas Filters (Brightness, Contrast, BlendMode)
  useEffect(() => {
    filtersRef.current = {
      brightness: layerBrightness,
      contrast: layerContrast,
      blendMode: layerBlendMode,
    };
    mapInstanceRef.current?.render();
  }, [layerBrightness, layerContrast, layerBlendMode]);

  // Handle Animated Fly-To when a Landmark is selected
  useEffect(() => {
    if (!selectedLandmarkId || !mapInstanceRef.current) return;
    const landmark = MARS_LANDMARKS.find((lm) => lm.id === selectedLandmarkId);
    if (!landmark) return;

    const view = mapInstanceRef.current.getView();
    if (view) {
      view.animate({
        center: landmark.location,
        zoom: landmark.category === "Landing Site" ? 14 : landmark.category === "Planitia" ? 6 : 12,
        duration: 900,
      });
    }
  }, [selectedLandmarkId, landmarkNonce]);

  // Navigation Helpers
  const handleZoomIn = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const zoom = view.getZoom() ?? 9;
      view.animate({ zoom: zoom + 1, duration: 250 });
    }
  };

  const handleZoomOut = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const zoom = view.getZoom() ?? 9;
      view.animate({ zoom: zoom - 1, duration: 250 });
    }
  };

  const handleResetJezero = () => {
    const map = mapInstanceRef.current;
    const view = map?.getView();
    if (map && view) {
      map.updateSize();
      const size = map.getSize();
      if (size && size[0] > 50 && size[1] > 50) {
        view.fit(JEZ_CTX.extent, {
          size,
          padding: [40, 40, 40, 40],
          duration: 400,
        });
      }
    }
  };

  const handleGlobalMars = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      view.animate({
        center: [77.5, 18.4],
        zoom: 2.5,
        duration: 500,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col bg-[#090A0C] overflow-hidden select-none min-h-0">
      {/* Map Canvas Element */}
      <div
        ref={mapElementRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing outline-none"
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded bg-[#090A0C]/90 border border-[#777C83]/30 backdrop-blur-md text-xs text-[#E9A16A] shadow-xl">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Streaming NASA Mars Trek tiles...</span>
        </div>
      )}

      {/* Hovered Landmark HUD Pill */}
      {hoveredLandmark && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#090A0C]/90 border border-[#E9A16A]/50 backdrop-blur-md text-xs text-[#E8E5DF] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <MapPin className="w-3.5 h-3.5 text-[#E9A16A]" />
          <span className="font-semibold">{hoveredLandmark}</span>
        </div>
      )}

      {/* Error Banner */}
      {loadError && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-2 rounded bg-red-950/80 border border-red-800 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Viewport Floating Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#090A0C]/90 border border-[#17191D] p-1.5 rounded-lg backdrop-blur-md shadow-2xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="p-2 text-[#E8E5DF] hover:text-white hover:bg-[#17191D] rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="p-2 text-[#E8E5DF] hover:text-white hover:bg-[#17191D] rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-[#17191D]" />

        <button
          onClick={handleResetJezero}
          title="Fit Jezero Crater AOI"
          aria-label="Fit Jezero Crater AOI"
          className="p-2 text-[#E9A16A] hover:text-white hover:bg-[#17191D] rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleGlobalMars}
          title="Mars Global Hemisphere View"
          aria-label="Mars Global View"
          className="p-2 text-[#777C83] hover:text-[#E9A16A] hover:bg-[#17191D] rounded transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Status Ribbon HUD */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono uppercase tracking-wider text-[#777C83]">
        {/* Coordinates readout */}
        <div className="bg-[#090A0C]/90 border border-[#17191D] px-3.5 py-1.5 rounded-md backdrop-blur-md pointer-events-auto flex items-center space-x-3 shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-[#E9A16A]" />
          {mouseCoord ? (
            <span>
              LON: <strong className="text-[#E8E5DF]">{mouseCoord.lon}° E</strong> | LAT:{" "}
              <strong className="text-[#E8E5DF]">{mouseCoord.lat}° N</strong>
            </span>
          ) : (
            <span>HOVER OVER MAP FOR MARS COORDINATES</span>
          )}
          <span className="text-[#17191D]">|</span>
          <span>
            ZOOM: <strong className="text-[#E9A16A]">{currentZoom}</strong>
          </span>
        </div>

        {/* Active Instrument & Layer Badge */}
        <div className="bg-[#090A0C]/90 border border-[#17191D] px-3 py-1.5 rounded-md backdrop-blur-md pointer-events-auto flex items-center space-x-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#E8E5DF] font-semibold">{activeDataset.shortName}</span>
          <span className="text-[#777C83]">[{activeDataset.resolutionMeters} M/PX]</span>
          <span className="text-[#17191D]">|</span>
          <span className="text-[#E9A16A]">{activeBaseMapId.toUpperCase()} BASE</span>
        </div>
      </div>
    </div>
  );
}
