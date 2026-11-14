"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";
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

  const visibleLayers = useVisualizerStore((state) => state.visibleLayers);
  const layerOpacity = useVisualizerStore((state) => state.layerOpacity);

  // Initialize Map once
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Build raster layers for all registered datasets
    const layerRegistry: Record<string, ImageLayer<ImageStatic>> = {};
    const initialLayers: ImageLayer<ImageStatic>[] = [];

    MARS_DATASETS.forEach((dataset) => {
      const layer = createRasterLayer(dataset);
      layerRegistry[dataset.id] = layer;
      initialLayers.push(layer);

      // Bind image loading status for primary dataset
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

    const initialView = new View({
      projection: MARS_GEOGRAPHIC,
      center: [77.5, 18.5],
      resolution: 0.003,
      enableRotation: false,
      minZoom: 4,
      maxZoom: 16,
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

    // Pointer move listener for coordinates
    map.on("pointermove", (event) => {
      if (event.coordinate) {
        const [lon, lat] = event.coordinate;
        setMouseCoord({
          lon: lon.toFixed(4),
          lat: lat.toFixed(4),
        });
      }
    });

    mapInstanceRef.current = map;

    // After size is ready, fit Jezero extent with padding
    const fitTimer = setTimeout(() => {
      map.updateSize();
      initialView.fit(THEMIS_DAY.extent, {
        size: map.getSize(),
        padding: [32, 32, 32, 32],
        duration: 400,
      });
    }, 100);

    return () => {
      clearTimeout(fitTimer);
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
      const zoom = view.getZoom() ?? 8;
      view.animate({ zoom: zoom + 1, duration: 250 });
    }
  };

  const handleZoomOut = () => {
    const view = mapInstanceRef.current?.getView();
    if (view) {
      const zoom = view.getZoom() ?? 8;
      view.animate({ zoom: zoom - 1, duration: 250 });
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    const view = map?.getView();
    if (map && view) {
      map.updateSize();
      view.fit(THEMIS_DAY.extent, {
        size: map.getSize(),
        padding: [32, 32, 32, 32],
        duration: 400,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#090A0C] overflow-hidden select-none">
      {/* Map Canvas Element */}
      <div
        ref={mapElementRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing outline-none"
        style={{ minHeight: "400px" }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded bg-[#090A0C]/80 border border-[#777C83]/30 backdrop-blur-md text-xs text-[#E9A16A]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading THEMIS Raster...</span>
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
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#090A0C]/90 border border-[#17191D] p-1 rounded backdrop-blur-md shadow-lg">
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
          title="Fit Jezero AOI"
          aria-label="Fit Jezero AOI"
          className="p-2 text-[#E8E5DF] hover:text-white hover:bg-[#17191D] rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[11px] font-mono uppercase tracking-wider text-[#777C83]">
        <div className="bg-[#090A0C]/80 border border-[#17191D] px-2.5 py-1 rounded backdrop-blur-sm pointer-events-auto">
          {mouseCoord ? (
            <span>
              LON: <strong className="text-[#E8E5DF]">{mouseCoord.lon}° E</strong> | LAT:{" "}
              <strong className="text-[#E8E5DF]">{mouseCoord.lat}° N</strong>
            </span>
          ) : (
            <span>HOVER OVER MAP FOR COORDINATES</span>
          )}
        </div>

        <div className="bg-[#090A0C]/80 border border-[#17191D] px-2.5 py-1 rounded backdrop-blur-sm pointer-events-auto">
          PROJECTION: <strong className="text-[#E9A16A]">MARS:GEOGRAPHIC</strong> (PLANETOCENTRIC)
        </div>
      </div>
    </div>
  );
}
