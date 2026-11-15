"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { Style, Stroke, Fill, Circle as CircleStyle, Text, Icon } from "ol/style";
import Graticule from "ol/layer/Graticule";
import ScaleLine from "ol/control/ScaleLine";
import Translate from "ol/interaction/Translate";
import type Layer from "ol/layer/Layer";
import { defaults as defaultControls } from "ol/control/defaults";
import "ol/ol.css";

import { MARS_GEOGRAPHIC } from "@/lib/map/mars-projection";
import { createDatasetLayer } from "@/lib/map/layer-factory";
import { JEZ_CTX, VIKING_MDIM21, MOLA_CLRSHADE } from "@/lib/data/mars-datasets";
import { usePlannerStore } from "@/lib/state/planner-store";
import { formatLonLat } from "@/lib/domain/mars-math";
import type { LonLat, Strategy } from "@/lib/domain/types";
import {
  Crosshair,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Radio,
  Play,
  Pause,
} from "lucide-react";

function createRoverSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
    <circle cx="18" cy="18" r="8" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/>
    <polygon points="18,4 23,22 18,18 13,22" fill="${color}"/>
    <circle cx="18" cy="18" r="3" fill="#FFFFFF"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export default function PlannerMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const routeVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const markersVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const poisVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const roverVectorSourceRef = useRef<VectorSource>(new VectorSource());
  const roverFeatureRef = useRef<Feature<Point> | null>(null);

  const [mouseCoord, setMouseCoord] = useState<LonLat | null>(null);
  const [currentZoom, setCurrentZoom] = useState<string>("10.5");
  const [activeBasemap, setActiveBasemap] = useState<"ctx" | "mola" | "viking">("ctx");
  const [isRoverSimPlaying, setIsRoverSimPlaying] = useState<boolean>(true);

  const ctxLayerRef = useRef<Layer | null>(null);
  const molaLayerRef = useRef<Layer | null>(null);
  const vikingLayerRef = useRef<Layer | null>(null);

  const startPoint = usePlannerStore((s) => s.startPoint);
  const destinationPoint = usePlannerStore((s) => s.destinationPoint);
  const pickMode = usePlannerStore((s) => s.pickMode);
  const setPickMode = usePlannerStore((s) => s.setPickMode);
  const setStartPoint = usePlannerStore((s) => s.setStartPoint);
  const setDestinationPoint = usePlannerStore((s) => s.setDestinationPoint);
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);
  const scienceTargets = usePlannerStore((s) => s.scienceTargets);
  const selectScienceTarget = usePlannerStore((s) => s.selectScienceTarget);

  // Initialize OpenLayers Map with Draggable Translation
  useEffect(() => {
    if (!mapElementRef.current) return;

    // 1. Basemap Layers
    const vikingLayer = createDatasetLayer(VIKING_MDIM21);
    const ctxLayer = createDatasetLayer(JEZ_CTX);
    ctxLayer.setOpacity(0.95);
    const molaLayer = createDatasetLayer(MOLA_CLRSHADE);
    molaLayer.setVisible(false);
    molaLayer.setOpacity(0.85);

    ctxLayerRef.current = ctxLayer;
    molaLayerRef.current = molaLayer;
    vikingLayerRef.current = vikingLayer;

    // 2. Vector Layers
    const routeLayer = new VectorLayer({
      source: routeVectorSourceRef.current,
      zIndex: 10,
    });

    const poisLayer = new VectorLayer({
      source: poisVectorSourceRef.current,
      zIndex: 15,
    });

    const markersLayer = new VectorLayer({
      source: markersVectorSourceRef.current,
      zIndex: 20,
    });

    const roverLayer = new VectorLayer({
      source: roverVectorSourceRef.current,
      zIndex: 25,
    });

    // 3. Graticule
    const graticule = new Graticule({
      strokeStyle: new Stroke({
        color: "rgba(233, 161, 106, 0.2)",
        width: 1,
        lineDash: [4, 4],
      }),
      showLabels: true,
      lonLabelPosition: 0.05,
      latLabelPosition: 0.95,
      wrapX: false,
    });

    const view = new View({
      projection: MARS_GEOGRAPHIC,
      center: [77.4509, 18.4446],
      zoom: 10.5,
      minZoom: 8,
      maxZoom: 14,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [vikingLayer, ctxLayer, molaLayer, graticule, routeLayer, poisLayer, markersLayer, roverLayer],
      view,
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }).extend([
        new ScaleLine({
          units: "metric",
          bar: true,
          steps: 4,
          text: true,
          minWidth: 100,
        }),
      ]),
    });

    mapInstanceRef.current = map;

    // 4. Draggable Marker Interaction (Drag Start / Destination pins)
    const translate = new Translate({
      layers: [markersLayer],
    });

    translate.on("translateend", (evt) => {
      const feat = evt.features.item(0);
      if (!feat) return;
      const geom = feat.getGeometry() as Point;
      const coord = geom.getCoordinates();
      const role = feat.get("role");

      if (role === "start") {
        setStartPoint({ lon: coord[0], lat: coord[1] });
      } else if (role === "destination") {
        setDestinationPoint({ lon: coord[0], lat: coord[1] });
      }
    });

    map.addInteraction(translate);

    // Pointer move listener
    map.on("pointermove", (e) => {
      const coord = e.coordinate;
      if (coord && coord.length >= 2) {
        setMouseCoord({ lon: coord[0], lat: coord[1] });
      }
    });

    view.on("change:resolution", () => {
      const z = view.getZoom();
      if (z !== undefined) setCurrentZoom(z.toFixed(1));
    });

    // Single click handler for interactive coordinate dropping
    map.on("singleclick", (e) => {
      const [lon, lat] = e.coordinate;
      const currentPickMode = usePlannerStore.getState().pickMode;

      if (currentPickMode === "start") {
        setStartPoint({ lon, lat });
        setPickMode(null);
      } else if (currentPickMode === "destination") {
        setDestinationPoint({ lon, lat });
        setPickMode(null);
      } else {
        map.forEachFeatureAtPixel(e.pixel, (f) => {
          const targetId = f.get("targetId");
          if (targetId) {
            selectScienceTarget(targetId);
            return true;
          }
          return false;
        });
      }
    });

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [setStartPoint, setDestinationPoint, setPickMode, selectScienceTarget]);

  // Basemap Switcher
  const handleBasemapChange = (type: "ctx" | "mola" | "viking") => {
    setActiveBasemap(type);
    if (!ctxLayerRef.current || !molaLayerRef.current || !vikingLayerRef.current) return;

    if (type === "ctx") {
      ctxLayerRef.current.setVisible(true);
      ctxLayerRef.current.setOpacity(0.95);
      molaLayerRef.current.setVisible(false);
      vikingLayerRef.current.setVisible(true);
    } else if (type === "mola") {
      ctxLayerRef.current.setVisible(false);
      molaLayerRef.current.setVisible(true);
      molaLayerRef.current.setOpacity(0.95);
      vikingLayerRef.current.setVisible(false);
    } else if (type === "viking") {
      ctxLayerRef.current.setVisible(false);
      molaLayerRef.current.setVisible(false);
      vikingLayerRef.current.setVisible(true);
    }
  };

  // Render Science Exploration POIs
  useEffect(() => {
    const src = poisVectorSourceRef.current;
    src.clear();

    scienceTargets.forEach((target) => {
      const feat = new Feature({
        geometry: new Point([target.location.lon, target.location.lat]),
        targetId: target.id,
        name: target.name,
      });

      feat.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5.5,
            fill: new Fill({ color: "#4ADE80" }),
            stroke: new Stroke({ color: "#090A0C", width: 2 }),
          }),
          text: new Text({
            text: target.name.split(" ")[0],
            font: "10px sans-serif",
            fill: new Fill({ color: "#E8E5DF" }),
            stroke: new Stroke({ color: "#090A0C", width: 3 }),
            offsetY: -12,
          }),
        })
      );

      src.addFeature(feat);
    });
  }, [scienceTargets]);

  // Render Draggable Start & Destination Markers
  useEffect(() => {
    const src = markersVectorSourceRef.current;
    src.clear();

    if (startPoint) {
      const startFeat = new Feature({
        geometry: new Point([startPoint.lon, startPoint.lat]),
        role: "start",
      });
      startFeat.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({ color: "#38BDF8" }),
            stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
          }),
          text: new Text({
            text: "START (DRAG TO MOVE)",
            font: "bold 10px sans-serif",
            fill: new Fill({ color: "#38BDF8" }),
            stroke: new Stroke({ color: "#090A0C", width: 3 }),
            offsetY: 18,
          }),
        })
      );
      src.addFeature(startFeat);
    }

    if (destinationPoint) {
      const destFeat = new Feature({
        geometry: new Point([destinationPoint.lon, destinationPoint.lat]),
        role: "destination",
      });
      destFeat.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({ color: "#E9A16A" }),
            stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
          }),
          text: new Text({
            text: "TARGET (DRAG TO MOVE)",
            font: "bold 10px sans-serif",
            fill: new Fill({ color: "#E9A16A" }),
            stroke: new Stroke({ color: "#090A0C", width: 3 }),
            offsetY: 18,
          }),
        })
      );
      src.addFeature(destFeat);
    }
  }, [startPoint, destinationPoint]);

  // Render Routes on OpenLayers Canvas
  useEffect(() => {
    const src = routeVectorSourceRef.current;
    src.clear();
    if (!routes) return;

    const strategyConfigs: Array<{
      strategy: Strategy;
      width: number;
      dash?: number[];
      zIndex: number;
    }> = [
      { strategy: "shortest", width: 2.5, dash: [6, 4], zIndex: 11 },
      { strategy: "energy", width: 2.5, zIndex: 12 },
      { strategy: "science", width: 3.5, zIndex: 13 },
      { strategy: "survival", width: 4.5, zIndex: 14 },
    ];

    strategyConfigs.forEach(({ strategy, width, dash, zIndex }) => {
      const r = routes[strategy];
      if (!r || !r.found || r.coordinates.length < 2) return;

      const coords = r.coordinates.map((c) => [c.lon, c.lat]);
      const feat = new Feature({
        geometry: new LineString(coords),
        strategy,
      });

      const isSelected = strategy === activeStrategy;

      feat.setStyle(
        new Style({
          stroke: new Stroke({
            color: isSelected ? r.color : `${r.color}44`,
            width: isSelected ? width + 1.5 : width,
            lineDash: isSelected ? undefined : dash,
          }),
          zIndex: isSelected ? zIndex + 5 : zIndex,
        })
      );

      src.addFeature(feat);
    });
  }, [routes, activeStrategy]);

  // Continuous Rover Vehicle Animation Loop along Active Route LineString
  useEffect(() => {
    const activeRoute = routes ? routes[activeStrategy] : null;
    if (!activeRoute || !activeRoute.found || activeRoute.coordinates.length < 2) {
      roverVectorSourceRef.current.clear();
      roverFeatureRef.current = null;
      return;
    }

    const coords = activeRoute.coordinates.map((c) => [c.lon, c.lat]);
    const routeLine = new LineString(coords);

    let roverFeat = roverFeatureRef.current;
    if (!roverFeat) {
      roverFeat = new Feature(new Point(coords[0]));
      roverVectorSourceRef.current.clear();
      roverVectorSourceRef.current.addFeature(roverFeat);
      roverFeatureRef.current = roverFeat;
    }

    let animFrame: number;
    let startTime: number | null = null;
    const durationMs = 14000; // 14-second loop along route transect

    const animateRover = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % durationMs) / durationMs;

      // Interpolate position along actual route geometry
      const currentPos = routeLine.getCoordinateAt(progress);
      const aheadPos = routeLine.getCoordinateAt(Math.min(1.0, progress + 0.015));

      if (currentPos && aheadPos && roverFeat) {
        (roverFeat.getGeometry() as Point).setCoordinates(currentPos);

        // Directional Heading Angle (radians)
        const dx = aheadPos[0] - currentPos[0];
        const dy = aheadPos[1] - currentPos[1];
        const headingRad = Math.atan2(dy, dx);
        // Convert to OpenLayers rotation: 0 is North (up), so clockwise offset
        const olRotation = Math.PI / 2 - headingRad;

        roverFeat.setStyle(
          new Style({
            image: new Icon({
              src: createRoverSvg(activeRoute.color),
              rotation: olRotation,
              rotateWithView: true,
              scale: 0.9,
            }),
            zIndex: 30,
          })
        );
      }

      if (isRoverSimPlaying) {
        animFrame = requestAnimationFrame(animateRover);
      }
    };

    animFrame = requestAnimationFrame(animateRover);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [routes, activeStrategy, isRoverSimPlaying]);

  // Recenter View Handler
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.getView().animate({
      center: [77.4509, 18.4446],
      zoom: 10.5,
      duration: 500,
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#090A0C] overflow-hidden">
      {/* Pick Mode Notification Banner */}
      {pickMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#C66B3D] text-white px-5 py-2 rounded-full shadow-2xl flex items-center space-x-2.5 text-xs font-semibold animate-pulse border border-white/20">
          <Crosshair className="w-4 h-4 animate-spin" />
          <span>Click anywhere on Mars terrain to drop {pickMode.toUpperCase()} pin</span>
          <button
            onClick={() => setPickMode(null)}
            className="ml-3 underline text-white/80 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Map Viewport Container */}
      <div
        ref={mapElementRef}
        className={`w-full h-full relative ${pickMode ? "cursor-crosshair" : "cursor-grab"}`}
      />

      {/* Floating Basemap Selector HUD */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-[#090A0C]/90 p-1 rounded-lg border border-[#17191D] backdrop-blur-md shadow-xl text-xs space-x-1">
        <button
          onClick={() => handleBasemapChange("ctx")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
            activeBasemap === "ctx"
              ? "bg-[#C66B3D] text-white"
              : "text-[#777C83] hover:text-[#E8E5DF]"
          }`}
        >
          CTX 6m (Sharp)
        </button>
        <button
          onClick={() => handleBasemapChange("mola")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
            activeBasemap === "mola"
              ? "bg-[#C66B3D] text-white"
              : "text-[#777C83] hover:text-[#E8E5DF]"
          }`}
        >
          MOLA Elevation
        </button>
        <button
          onClick={() => handleBasemapChange("viking")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
            activeBasemap === "viking"
              ? "bg-[#C66B3D] text-white"
              : "text-[#777C83] hover:text-[#E8E5DF]"
          }`}
        >
          Viking Color
        </button>
      </div>

      {/* Floating Zoom & Simulation Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={() => mapInstanceRef.current?.getView().animate({ zoom: (mapInstanceRef.current?.getView().getZoom() || 10.5) + 1, duration: 250 })}
          className="p-2.5 rounded bg-[#17191D]/90 border border-[#777C83]/30 text-[#E8E5DF] hover:border-[#E9A16A] hover:text-[#E9A16A] transition-all shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.getView().animate({ zoom: (mapInstanceRef.current?.getView().getZoom() || 10.5) - 1, duration: 250 })}
          className="p-2.5 rounded bg-[#17191D]/90 border border-[#777C83]/30 text-[#E8E5DF] hover:border-[#E9A16A] hover:text-[#E9A16A] transition-all shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded bg-[#17191D]/90 border border-[#777C83]/30 text-[#E8E5DF] hover:border-[#E9A16A] hover:text-[#E9A16A] transition-all shadow-lg"
          title="Recenter on Jezero Crater"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsRoverSimPlaying(!isRoverSimPlaying)}
          className={`p-2.5 rounded border transition-all shadow-lg ${
            isRoverSimPlaying
              ? "bg-[#17191D]/90 border-[#4ADE80]/40 text-[#4ADE80]"
              : "bg-[#17191D]/90 border-[#777C83]/30 text-[#777C83]"
          }`}
          title={isRoverSimPlaying ? "Pause Rover Simulation" : "Play Rover Simulation"}
        >
          {isRoverSimPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Rover Simulation Badge */}
      <div className="absolute top-16 right-4 z-20 px-2.5 py-1 rounded bg-[#090A0C]/90 border border-[#17191D] text-[10px] font-mono text-[#4ADE80] flex items-center space-x-1.5 shadow-md">
        <Radio className="w-3 h-3 animate-pulse" />
        <span>SIMULATED TRAJECTORY (ROVER TRANSECT)</span>
      </div>

      {/* Bottom Telemetry Status Bar */}
      <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded bg-[#090A0C]/90 border border-[#17191D] text-[11px] font-mono text-[#777C83] flex items-center space-x-3 backdrop-blur-md">
        <span>ZOOM: {currentZoom}</span>
        <span>•</span>
        <span>CURSOR: {mouseCoord ? formatLonLat(mouseCoord, 4) : "77.4509°E, 18.4446°N"}</span>
        <span>•</span>
        <span className="text-[#38BDF8]">START: CYAN PIN</span>
        <span>•</span>
        <span className="text-[#E9A16A]">TARGET: GOLD PIN</span>
      </div>
    </div>
  );
}
