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
  THEMIS_DAY_LOCAL,
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
  Grid,
  Layers,
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
  const selectedLandmarkIdRef = useRef<string | null>(null);
  const hoveredDatasetIdRef = useRef<string | null>(null);
  const selectedDatasetIdRef = useRef<string>("jez-ctx");
  const showFootprintsRef = useRef<boolean>(false);
  const activeBaseMapIdRef = useRef<string>("viking-mdim21");

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

  const activeBaseMapId = useVisualizerStore((state) => state.activeBaseMapId);
  const activeOverlayId = useVisualizerStore((state) => state.activeOverlayId);
  const selectedDatasetId = useVisualizerStore((state) => state.selectedDatasetId);
  const hoveredDatasetId = useVisualizerStore((state) => state.hoveredDatasetId);

  const setShowGraticule = useVisualizerStore((state) => state.setShowGraticule);
  const setShowLandmarks = useVisualizerStore((state) => state.setShowLandmarks);
  const setShowFootprints = useVisualizerStore((state) => state.setShowFootprints);
  const setIsMapReady = useVisualizerStore((state) => state.setIsMapReady);
  const setBaseMapError = useVisualizerStore((state) => state.setBaseMapError);

  useEffect(() => {
    selectedLandmarkIdRef.current = selectedLandmarkId;
    hoveredDatasetIdRef.current = hoveredDatasetId;
    selectedDatasetIdRef.current = selectedDatasetId;
    showFootprintsRef.current = showFootprints;
    activeBaseMapIdRef.current = activeBaseMapId;
  }, [selectedLandmarkId, hoveredDatasetId, selectedDatasetId, showFootprints, activeBaseMapId]);

  const activeBaseMap = MARS_DATASETS.find((d) => d.id === activeBaseMapId) || MARS_DATASETS[0];
  const activeOverlayCount = visibleLayers.filter(
    (id) => id !== "viking-mdim21" && id !== "mola-clrshade"
  ).length;

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
    const initialVisible = useVisualizerStore.getState().visibleLayers || [];
    MARS_DATASETS.forEach((dataset) => {
      const layer = createDatasetLayer(dataset);
      // Initialize visibility directly matching current store state
      const isVisible = initialVisible.includes(dataset.id);
      layer.setVisible(isVisible);
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
            if (dataset.id === activeBaseMapIdRef.current) {
              setIsMapReady(true);
            }
          });
          s.on("tileloaderror", () => {
            setTileLoading(-1);
            if (dataset.id === activeBaseMapIdRef.current) {
              setBaseMapError(`Failed to load ${dataset.shortName} tiles from NASA Trek.`);
            }
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
        name: "HiRISE Delta Swath (~25 cm/px)",
        datasetId: "jez-hirise",
      }),
      new Feature({
        geometry: fromExtent(JEZ_CTX.extent),
        name: "CTX Jezero Mosaic (~6 m/px)",
        datasetId: "jez-ctx",
      }),
      new Feature({
        geometry: fromExtent(JEZ_REGIONAL_VISIBLE.extent),
        name: "Regional Visible Composite (~12 m/px)",
        datasetId: "jez-regional-visible",
      }),
      new Feature({
        geometry: fromExtent(THEMIS_DAY_LOCAL.extent),
        name: "THEMIS Day IR (Local Masked)",
        datasetId: "themis-day",
      }),
    ];

    const footprintsLayer = new VectorLayer({
      source: new VectorSource({
        features: footprintFeatures,
      }),
      style: (feature) => {
        const datasetId = feature.get("datasetId") as string;
        const name = feature.get("name") as string;
        const isHovered = hoveredDatasetIdRef.current === datasetId;
        const isSelected = selectedDatasetIdRef.current === datasetId;
        const globalShow = showFootprintsRef.current;

        // Contextual visibility: only show if global toggle is on OR this swath is hovered/selected
        if (!globalShow && !isHovered && !isSelected) {
          return undefined;
        }

        const color = isSelected || isHovered
          ? "rgba(217, 121, 67, 0.9)"
          : "rgba(146, 155, 158, 0.4)";

        return new Style({
          stroke: new Stroke({
            color,
            width: isSelected || isHovered ? 2 : 1,
            lineDash: isSelected || isHovered ? [6, 4] : [4, 4],
          }),
          fill: new Fill({
            color: isSelected || isHovered ? "rgba(217, 121, 67, 0.04)" : "transparent",
          }),
          text: isSelected || isHovered
            ? new Text({
                text: name,
                font: "10px monospace",
                fill: new Fill({ color: "#D97943" }),
                stroke: new Stroke({ color: "#0B0D0E", width: 3 }),
                placement: "line",
                offsetY: -8,
              })
            : undefined,
        });
      },
      zIndex: 20,
      visible: true,
    });
    footprintsLayerRef.current = footprintsLayer;
    initialLayers.push(footprintsLayer);

    // 3. Sourced Geographic Landmarks & Science POIs Layer (with OpenLayers declutter)
    const landmarkFeatures = MARS_LANDMARKS.map((lm) => {
      return new Feature({
        geometry: new Point(lm.location),
        name: lm.name,
        category: lm.category,
        landmarkId: lm.id,
      });
    });

    const landmarksLayer = new VectorLayer({
      source: new VectorSource({
        features: landmarkFeatures,
      }),
      declutter: true,
      style: (feature) => {
        const view = mapInstanceRef.current?.getView();
        const zoom = view?.getZoom() ?? 9.5;
        const category = feature.get("category") as string;
        const landmarkId = feature.get("landmarkId") as string;
        const isSelected = selectedLandmarkIdRef.current === landmarkId;
        const isLanding = category === "Landing Site";

        // Progressive decluttering: at low zoom (< 8.5), only show landing site and major craters/planitia
        if (zoom < 8.5 && !isLanding && category !== "Crater" && !isSelected) {
          return undefined;
        }

        const baseColor = isSelected
          ? "#D97943"
          : isLanding
          ? "#D97943"
          : "#E7E9E8";

        return new Style({
          image: new CircleStyle({
            radius: isSelected ? 6.5 : isLanding ? 5 : 3.5,
            fill: new Fill({ color: baseColor }),
            stroke: new Stroke({
              color: "#0B0D0E",
              width: isSelected ? 2.5 : 1.5,
            }),
          }),
          text: new Text({
            text: feature.get("name") as string,
            font: isSelected ? "bold 11px sans-serif" : "10px sans-serif",
            fill: new Fill({ color: isSelected ? "#D97943" : "#E7E9E8" }),
            stroke: new Stroke({ color: "#0B0D0E", width: 3 }),
            offsetY: -11,
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
        color: "rgba(146, 155, 158, 0.18)",
        width: 0.75,
        lineDash: [3, 4],
      }),
      showLabels: true,
      wrapX: false,
      latLabelStyle: new Text({
        font: "10px monospace",
        textBaseline: "middle",
        textAlign: "right",
        offsetX: -6,
        fill: new Fill({ color: "rgba(146, 155, 158, 0.75)" }),
        stroke: new Stroke({ color: "rgba(11, 13, 14, 0.9)", width: 2.5 }),
      }),
      lonLabelStyle: new Text({
        font: "10px monospace",
        textBaseline: "bottom",
        textAlign: "center",
        offsetY: -6,
        fill: new Fill({ color: "rgba(146, 155, 158, 0.75)" }),
        stroke: new Stroke({ color: "rgba(11, 13, 14, 0.9)", width: 2.5 }),
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
      minWidth: 110,
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
      landmarksLayer.changed();
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
      setIsMapReady(true);
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
  }, [setTileLoading, setIsMapReady, setBaseMapError]);

  // Synchronize layer visibility from Zustand without reconstructing map
  useEffect(() => {
    const registry = layersMapRef.current;
    if (!registry) return;
    const layers = visibleLayers || [];
    Object.keys(registry).forEach((id) => {
      const layer = registry[id];
      const isVisible = layers.includes(id);
      if (layer.getVisible() !== isVisible) {
        layer.setVisible(isVisible);
      }
    });
    mapInstanceRef.current?.render();
  }, [visibleLayers]);

  // Dynamically promote the selected/active overlay to the top z-index (18 / 16)
  useEffect(() => {
    const registry = layersMapRef.current;
    if (!registry) return;

    MARS_DATASETS.forEach((dataset) => {
      const layer = registry[dataset.id];
      if (!layer) return;

      if (dataset.isBaseMap) {
        layer.setZIndex(1);
      } else {
        const isSelected = selectedDatasetId === dataset.id;
        const isActive = activeOverlayId === dataset.id;
        const baseZ = dataset.zIndex ?? 10;
        // Promote active/selected overlay to top of imagery stack so it is never occluded
        layer.setZIndex(isSelected ? 18 : isActive ? 16 : baseZ);
      }
    });

    mapInstanceRef.current?.render();
  }, [selectedDatasetId, activeOverlayId, visibleLayers]);

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
      landmarksLayerRef.current.changed();
    }
  }, [showLandmarks, selectedLandmarkId]);

  useEffect(() => {
    if (footprintsLayerRef.current) {
      footprintsLayerRef.current.changed();
    }
  }, [showFootprints, hoveredDatasetId, selectedDatasetId, activeOverlayId]);

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
        duration: 800,
      });
    }
    landmarksLayerRef.current?.changed();
  }, [selectedLandmarkId, landmarkNonce]);

  // Navigation Helpers
  const handleZoomIn = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const zoom = view.getZoom() ?? 9;
      view.animate({ zoom: zoom + 1, duration: 200 });
    }
  };

  const handleZoomOut = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const zoom = view.getZoom() ?? 9;
      view.animate({ zoom: zoom - 1, duration: 200 });
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
          duration: 350,
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
        duration: 450,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col bg-[#0B0D0E] overflow-hidden select-none min-h-0">
      {/* Map Canvas Element */}
      <div
        ref={mapElementRef}
        data-native-cursor="true"
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing outline-none"
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      />

      {/* Hovered Landmark HUD Pill */}
      {hoveredLandmark && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#101315]/90 border border-[#292F32] backdrop-blur-md text-xs text-[#E7E9E8] shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <MapPin className="w-3.5 h-3.5 text-[#D97943]" />
          <span className="font-medium">{hoveredLandmark}</span>
        </div>
      )}

      {/* Base Map Load Error Banner */}
      {loadError && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-2 rounded bg-red-950/80 border border-red-800 text-xs text-red-200 shadow-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Viewport Floating Controls Toolbar (Compact & Accessible) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1 bg-[#101315]/90 border border-[#292F32] p-1 rounded-md backdrop-blur-md shadow-xl">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom In"
          className="p-1.5 text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="p-1.5 text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-[#292F32]" />

        <button
          onClick={handleResetJezero}
          title="Focus Jezero Crater"
          aria-label="Focus Jezero Crater"
          className="p-1.5 text-[#D97943] hover:text-[#E7E9E8] hover:bg-[#171B1D] rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleGlobalMars}
          title="Global Mars Hemisphere View"
          aria-label="Global Mars View"
          className="p-1.5 text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] rounded transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-[#292F32]" />

        <button
          onClick={() => setShowGraticule((prev) => !prev)}
          title={showGraticule ? "Hide Coordinate Grid" : "Show Coordinate Grid"}
          aria-label={showGraticule ? "Hide Coordinate Grid" : "Show Coordinate Grid"}
          className={`p-1.5 rounded transition-colors ${
            showGraticule
              ? "text-[#D97943] bg-[#171B1D]"
              : "text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLandmarks((prev) => !prev)}
          title={showLandmarks ? "Hide Surface Landmarks" : "Show Surface Landmarks"}
          aria-label={showLandmarks ? "Hide Surface Landmarks" : "Show Surface Landmarks"}
          className={`p-1.5 rounded transition-colors ${
            showLandmarks
              ? "text-[#D97943] bg-[#171B1D]"
              : "text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
          }`}
        >
          <MapPin className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowFootprints((prev) => !prev)}
          title={showFootprints ? "Hide Instrument Footprints" : "Show Instrument Footprints"}
          aria-label={showFootprints ? "Hide Instrument Footprints" : "Show Instrument Footprints"}
          className={`p-1.5 rounded transition-colors ${
            showFootprints
              ? "text-[#D97943] bg-[#171B1D]"
              : "text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Status Ribbon HUD (Compact, restrained scientific status) */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono text-[#929B9E]">
        {/* Coordinates & Zoom readout */}
        <div className="bg-[#101315]/90 border border-[#292F32] px-3 py-1.5 rounded backdrop-blur-md pointer-events-auto flex items-center space-x-3 shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-[#D97943]" />
          {mouseCoord ? (
            <span>
              LON: <strong className="text-[#E7E9E8]">{mouseCoord.lon}° E</strong> | LAT:{" "}
              <strong className="text-[#E7E9E8]">{mouseCoord.lat}° N</strong>
            </span>
          ) : (
            <span className="text-[#929B9E]">HOVER OVER MAP FOR COORDINATES</span>
          )}
          <span className="text-[#292F32]">|</span>
          <span>
            ZOOM: <strong className="text-[#E7E9E8]">{currentZoom}</strong>
          </span>
          <span className="text-[#292F32] hidden sm:inline">|</span>
          <span className="text-[10px] text-[#929B9E] hidden sm:inline">MARS EQ (IAU 2000)</span>
        </div>

        {/* Active Base Map & Stream Status Indicator */}
        <div className="bg-[#101315]/90 border border-[#292F32] px-3 py-1.5 rounded backdrop-blur-md pointer-events-auto flex items-center space-x-2.5 shadow-lg">
          {isLoading ? (
            <div className="flex items-center space-x-1.5 text-[10px] text-[#D97943]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>STREAMING TILES...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[#929B9E]">LIVE • TREK</span>
            </div>
          )}
          <span className="text-[#292F32]">|</span>
          <span className="text-[#E7E9E8] font-medium">{activeBaseMap.shortName}</span>
          {activeOverlayCount > 0 && (
            <>
              <span className="text-[#292F32]">|</span>
              <span className="text-[#D97943]">+{activeOverlayCount} OVERLAY{activeOverlayCount > 1 ? "S" : ""}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
