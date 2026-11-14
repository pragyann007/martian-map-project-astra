"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { fromExtent } from "ol/geom/Polygon";
import { Style, Stroke, Fill, Text } from "ol/style";
import { defaults as defaultControls } from "ol/control/defaults";
import "ol/ol.css";

import { MARS_DATASETS, THEMIS_DAY } from "@/lib/data/mars-datasets";
import { MARS_GEOGRAPHIC } from "@/lib/map/mars-projection";
import { createRasterLayer } from "@/lib/map/layer-factory";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import { ZoomIn, ZoomOut, Maximize2, AlertCircle, Loader2 } from "lucide-react";

export default function MapContainer() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const layersMapRef = useRef<Record<string, ImageLayer<ImageStatic>>>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ lon: string; lat: string } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<string>("9.2");

  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);

  // Initialize Map once
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Build raster layers for all registered datasets
    const layerRegistry: Record<string, ImageLayer<ImageStatic>> = {};
    const initialLayers: (ImageLayer<ImageStatic> | VectorLayer<VectorSource>)[] = [];

    // Subtle Jezero AOI boundary reference frame
    const aoiPolygon = fromExtent(THEMIS_DAY.extent);
    const aoiFeature = new Feature({
      geometry: aoiPolygon,
      name: "Jezero Crater Study Boundary",
    });

    const aoiVectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [aoiFeature],
      }),
      style: new Style({
        stroke: new Stroke({
          color: "rgba(198, 107, 61, 0.7)",
          width: 1.5,
          lineDash: [6, 4],
        }),
        fill: new Fill({
          color: "rgba(198, 107, 61, 0.02)",
        }),
        text: new Text({
          text: "JEZERO CRATER STUDY REGION (THEMIS DAY IR)",
          font: "10px monospace",
          fill: new Fill({ color: "rgba(233, 161, 106, 0.8)" }),
          stroke: new Stroke({ color: "rgba(9, 10, 12, 0.9)", width: 3 }),
          placement: "line",
          offsetY: -10,
        }),
      }),
      zIndex: 10,
    });

    initialLayers.push(aoiVectorLayer);

    MARS_DATASETS.forEach((dataset) => {
      const layer = createRasterLayer(dataset);
      layerRegistry[dataset.id] = layer;
      initialLayers.push(layer);

      // Track image load lifecycle
      const source = layer.getSource();
      if (source) {
        source.on("imageloadstart", () => {
          setIsLoading(true);
          setLoadError(null);
        });
        source.on("imageloadend", () => {
          setIsLoading(false);
        });
        source.on("imageloaderror", () => {
          setIsLoading(false);
          setLoadError(`Failed to load raster image: ${dataset.name}`);
        });
      }
    });

    layersMapRef.current = layerRegistry;

    // Center directly on Jezero Crater coordinates [77.50014, 18.49969]
    // Zoom 9.2 gives resolution ~0.0024 deg/px, fitting the 2° extent across 800+ px
    const initialView = new View({
      projection: MARS_GEOGRAPHIC,
      center: [77.50014, 18.49969],
      zoom: 9.2,
      minZoom: 5,
      maxZoom: 15,
      enableRotation: false,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: initialLayers,
      view: initialView,
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    // Update coordinates and zoom state
    map.on("pointermove", (event) => {
      if (event.coordinate) {
        const [lon, lat] = event.coordinate;
        setMouseCoord({
          lon: lon.toFixed(4),
          lat: lat.toFixed(4),
        });
      }
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

    // Trigger an immediate layout sync on next frame
    requestAnimationFrame(() => {
      map.updateSize();
      const size = map.getSize();
      if (size && size[0] > 50 && size[1] > 50) {
        initialView.fit(THEMIS_DAY.extent, {
          size,
          padding: [32, 32, 32, 32],
        });
      }
    });

    const fitTimer = setTimeout(() => {
      map.updateSize();
      const size = map.getSize();
      if (size && size[0] > 50 && size[1] > 50) {
        initialView.fit(THEMIS_DAY.extent, {
          size,
          padding: [32, 32, 32, 32],
        });
      }
    }, 150);

    return () => {
      clearTimeout(fitTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.setTarget(undefined);
      mapInstanceRef.current = null;
      layersMapRef.current = {};
    };
  }, []);

  // Synchronize layer visibility from Zustand without reconstructing map
  useEffect(() => {
    const registry = layersMapRef.current;
    Object.keys(registry).forEach((id) => {
      const layer = registry[id];
      const isVisible = visibleLayers.includes(id);
      if (layer.getVisible() !== isVisible) {
        layer.setVisible(isVisible);
      }
    });
  }, [visibleLayers]);

  // Synchronize layer opacity from Zustand
  useEffect(() => {
    const registry = layersMapRef.current;
    Object.keys(registry).forEach((id) => {
      const layer = registry[id];
      const opacity = layerOpacity[id] !== undefined ? layerOpacity[id] : 1;
      if (layer.getOpacity() !== opacity) {
        layer.setOpacity(opacity);
      }
    });
  }, [layerOpacity]);

  // Controls helper functions
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

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    const view = map?.getView();
    if (map && view) {
      map.updateSize();
      const size = map.getSize();
      if (size && size[0] > 50 && size[1] > 50) {
        view.fit(THEMIS_DAY.extent, {
          size,
          padding: [32, 32, 32, 32],
          duration: 350,
        });
      }
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
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded bg-[#090A0C]/90 border border-[#777C83]/30 backdrop-blur-md text-xs text-[#E9A16A]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading THEMIS Day IR raster...</span>
        </div>
      )}

      {/* Error Banner */}
      {loadError && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-2 rounded bg-red-950/80 border border-red-800 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Viewport Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#090A0C]/90 border border-[#17191D] p-1 rounded backdrop-blur-md shadow-xl">
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
          onClick={handleResetView}
          title="Fit Jezero Crater AOI"
          aria-label="Fit Jezero Crater AOI"
          className="p-2 text-[#E9A16A] hover:text-white hover:bg-[#17191D] rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Status Ribbon HUD */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono uppercase tracking-wider text-[#777C83]">
        <div className="bg-[#090A0C]/90 border border-[#17191D] px-3 py-1.5 rounded backdrop-blur-md pointer-events-auto flex items-center space-x-3">
          {mouseCoord ? (
            <span>
              LON: <strong className="text-[#E8E5DF]">{mouseCoord.lon}° E</strong> | LAT:{" "}
              <strong className="text-[#E8E5DF]">{mouseCoord.lat}° N</strong>
            </span>
          ) : (
            <span>HOVER OVER MAP FOR COORDINATES</span>
          )}
          <span className="text-[#17191D]">|</span>
          <span>
            ZOOM: <strong className="text-[#E9A16A]">{currentZoom}</strong>
          </span>
        </div>

        <div className="bg-[#090A0C]/90 border border-[#17191D] px-3 py-1.5 rounded backdrop-blur-md pointer-events-auto flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[#E8E5DF]">THEMIS DAY IR</span>
          <span className="text-[#777C83]">[100 M/PX]</span>
          <span className="text-[#17191D]">|</span>
          <span className="text-[#E9A16A]">MARS:GEOGRAPHIC</span>
        </div>
      </div>
    </div>
  );
}
