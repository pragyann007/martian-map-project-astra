"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  Mountain,
  Layers,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Compass,
  Maximize2,
  Minimize2,
  HelpCircle,
  Eye,
  Crosshair,
} from "lucide-react";
import {
  loadArcGISMars,
  MARS_SCENE_CONFIG,
  type ArcGISMarsView,
  type ArcGISMarsLayer,
} from "@/lib/map/arcgis-mars-loader";
import type { MarsLocation } from "@/lib/state/visualizer-store";

interface Mars3DViewProps {
  location?: MarsLocation | null;
  onBackTo2D: () => void;
}

export default function Mars3DView({ location, onBackTo2D }: Mars3DViewProps) {
  const [activeMode, setActiveMode] = useState<"native" | "iframe">("native");
  const [loadingStage, setLoadingStage] = useState<string>("Initializing Mars 3D Engine...");
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [showColorDem, setShowColorDem] = useState(false);
  const [elevationEnabled, setElevationEnabled] = useState(true);

  // Real-time camera telemetry
  const [cameraInfo, setCameraInfo] = useState<{
    lon: number;
    lat: number;
    alt: number;
    heading: number;
    tilt: number;
  }>({
    lon: location?.longitude ?? MARS_SCENE_CONFIG.jezeroDefault.lon,
    lat: location?.latitude ?? MARS_SCENE_CONFIG.jezeroDefault.lat,
    alt: MARS_SCENE_CONFIG.jezeroDefault.altitude,
    heading: MARS_SCENE_CONFIG.jezeroDefault.heading,
    tilt: MARS_SCENE_CONFIG.jezeroDefault.tilt,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneViewRef = useRef<ArcGISMarsView | null>(null);
  const colorDemLayerRef = useRef<ArcGISMarsLayer | null>(null);
  const marsElevationRef = useRef<ArcGISMarsLayer | null>(null);

  // Initialize Native SceneView
  useEffect(() => {
    if (activeMode !== "native") return;
    let isCancelled = false;

    async function initScene() {
      try {
        setLoadingStage("Loading ArcGIS Maps SDK 4.28...");
        setErrorMsg(null);
        setIsReady(false);

        const { Map, SceneView, TileLayer, ElevationLayer, Camera, SpatialReference } =
          await loadArcGISMars();

        if (isCancelled || !containerRef.current) return;

        setLoadingStage("Configuring Mars MDEM200M elevation surface...");

        // 1. Elevation layer
        const marsElevation = new ElevationLayer({
          url: MARS_SCENE_CONFIG.elevationUrl,
          copyright: MARS_SCENE_CONFIG.elevationCopyright,
        });
        marsElevationRef.current = marsElevation;

        // 2. CTX Mosaic Layer (Caltech Murray Lab V01)
        setLoadingStage("Streaming Caltech Global CTX Mosaic (V01)...");
        const ctxLayer = new TileLayer({
          url: MARS_SCENE_CONFIG.ctxTileUrl,
          title: MARS_SCENE_CONFIG.ctxTitle,
          copyright: MARS_SCENE_CONFIG.ctxCopyright,
        });

        // 3. Shaded relief DEM layer (optional overlay)
        const colorDemLayer = new TileLayer({
          url: MARS_SCENE_CONFIG.colorDemUrl,
          title: "Mars Color Shaded Relief DEM",
          copyright: MARS_SCENE_CONFIG.colorDemCopyright,
          visible: false,
          opacity: 0.65,
        });
        colorDemLayerRef.current = colorDemLayer;

        // 4. Map with Martian ground
        const map = new Map({
          ground: {
            layers: [marsElevation],
          },
          layers: [ctxLayer, colorDemLayer],
        });

        // Determine starting coordinates from hand-off location or Jezero default
        const targetLon = location?.longitude ?? MARS_SCENE_CONFIG.jezeroDefault.lon;
        const targetLat = location?.latitude ?? MARS_SCENE_CONFIG.jezeroDefault.lat;

        setLoadingStage("Mounting Mars 3D SceneView (WKID 104971)...");

        const view = new SceneView({
          container: containerRef.current,
          map,
          qualityProfile: "high",
          spatialReference: new SpatialReference({ wkid: MARS_SCENE_CONFIG.wkid }),
          camera: new Camera({
            position: {
              x: targetLon,
              y: targetLat,
              z: MARS_SCENE_CONFIG.jezeroDefault.altitude,
              spatialReference: { wkid: MARS_SCENE_CONFIG.wkid },
            },
            heading: MARS_SCENE_CONFIG.jezeroDefault.heading,
            tilt: MARS_SCENE_CONFIG.jezeroDefault.tilt,
          }),
          ui: {
            components: ["compass", "navigation-toggle"],
          },
          environment: {
            atmosphereEnabled: false,
            starsEnabled: true,
          },
        });

        sceneViewRef.current = view;

        await view.when(() => {
          if (isCancelled) return;
          setIsReady(true);
          setLoadingStage("Ready");
        });

        // Watch camera position changes
        view.watch("camera", (cam: unknown) => {
          if (!cam || typeof cam !== "object") return;
          const c = cam as {
            position?: { x?: number; y?: number; z?: number };
            heading?: number;
            tilt?: number;
          };
          if (c.position && typeof c.position.x === "number" && typeof c.position.y === "number") {
            setCameraInfo({
              lon: c.position.x,
              lat: c.position.y,
              alt: Math.round(c.position.z ?? 0),
              heading: Math.round(c.heading ?? 0),
              tilt: Math.round(c.tilt ?? 0),
            });
          }
        });
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Mars 3D View init failed:", err);
          const msg = err instanceof Error ? err.message : String(err);
          setErrorMsg(msg || "Could not initialize native 3D SceneView.");
        }
      }
    }

    initScene();

    return () => {
      isCancelled = true;
      if (sceneViewRef.current) {
        try {
          sceneViewRef.current.destroy();
        } catch (e) {
          console.warn("SceneView cleanup error:", e);
        }
        sceneViewRef.current = null;
      }
    };
  }, [activeMode, location?.longitude, location?.latitude]);

  // Camera navigation helpers
  const handleResetJezero = useCallback(() => {
    if (!sceneViewRef.current) return;
    sceneViewRef.current.goTo(
      {
        position: {
          x: MARS_SCENE_CONFIG.jezeroDefault.lon,
          y: MARS_SCENE_CONFIG.jezeroDefault.lat,
          z: MARS_SCENE_CONFIG.jezeroDefault.altitude,
          spatialReference: { wkid: MARS_SCENE_CONFIG.wkid },
        },
        heading: MARS_SCENE_CONFIG.jezeroDefault.heading,
        tilt: MARS_SCENE_CONFIG.jezeroDefault.tilt,
      },
      { duration: 1500 }
    );
  }, []);

  const handleFlyToTarget = useCallback(() => {
    if (!sceneViewRef.current || !location) return;
    sceneViewRef.current.goTo(
      {
        position: {
          x: location.longitude,
          y: location.latitude,
          z: 28000,
          spatialReference: { wkid: MARS_SCENE_CONFIG.wkid },
        },
        heading: 335,
        tilt: 65,
      },
      { duration: 1500 }
    );
  }, [location]);

  const handleToggleColorDem = () => {
    if (!colorDemLayerRef.current) return;
    const next = !showColorDem;
    colorDemLayerRef.current.visible = next;
    setShowColorDem(next);
  };

  const handleToggleElevation = () => {
    if (!sceneViewRef.current || !marsElevationRef.current) return;
    const next = !elevationEnabled;
    marsElevationRef.current.visible = next;
    setElevationEnabled(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!wrapperRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await wrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen toggle error:", e);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full bg-[#0B0D0E] text-[#E7E9E8] flex flex-col overflow-hidden font-sans select-none"
    >
      {/* 1. Header Navigation Bar */}
      <header className="h-12 bg-[#101315]/95 backdrop-blur-md border-b border-[#292F32] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackTo2D}
            className="inline-flex items-center space-x-1.5 text-xs text-[#929B9E] hover:text-[#E7E9E8] transition-colors py-1 px-2.5 rounded bg-[#171B1D] border border-[#292F32] hover:border-[#D97943]/40"
          >
            <ArrowLeft className="w-4 h-4 text-[#D97943]" />
            <span className="font-semibold">Back to 2D Map</span>
          </button>

          <span className="text-[#292F32] hidden sm:inline">|</span>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97943] animate-pulse" />
            <span className="font-semibold text-xs sm:text-sm text-[#E7E9E8] uppercase tracking-wider">
              Mars 3D Terrain
            </span>
            <span className="text-[10px] text-[#929B9E] px-2 py-0.5 rounded bg-[#171B1D] border border-[#292F32] hidden md:inline-block font-mono">
              Caltech CTX V01 (5 m/px)
            </span>
          </div>
        </div>

        {/* Center: Selected Coordinate Hand-off Pill */}
        {location && (
          <div className="hidden lg:flex items-center space-x-2 bg-[#171B1D]/80 border border-[#292F32] px-3 py-1 rounded-full text-[11px] font-mono text-[#D97943]">
            <Compass className="w-3.5 h-3.5 text-[#D97943]" />
            <span>
              2D CONTEXT: {location.longitude.toFixed(2)}° E, {location.latitude.toFixed(2)}° N
              {location.label ? ` [${location.label}]` : ""}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Mode Switcher */}
          <div className="flex rounded bg-[#171B1D] p-0.5 border border-[#292F32]">
            <button
              onClick={() => setActiveMode("native")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeMode === "native"
                  ? "bg-[#D97943] text-white"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              Native
            </button>
            <button
              onClick={() => setActiveMode("iframe")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeMode === "iframe"
                  ? "bg-[#D97943] text-white"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              Caltech Iframe
            </button>
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-1.5 rounded transition-colors ${
              showHelp
                ? "bg-[#D97943]/20 text-[#D97943] border border-[#D97943]/40"
                : "text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D]"
            }`}
            title="Toggle Controls Guide"
            aria-label="Toggle Controls Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <a
            href={MARS_SCENE_CONFIG.caltechViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] transition-colors hidden sm:inline-flex"
            title="Open external Caltech viewer in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main 3D View Container */}
      <main className="flex-1 relative w-full h-full bg-[#0B0D0E]">
        {activeMode === "native" ? (
          <>
            {/* Native SceneView Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading Overlay */}
            {!isReady && !errorMsg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0D0E] text-center p-6 space-y-4">
                <Loader2 className="w-10 h-10 text-[#D97943] animate-spin" />
                <div>
                  <p className="font-semibold text-sm text-[#E7E9E8] uppercase tracking-wider">
                    {loadingStage}
                  </p>
                  <p className="text-xs text-[#929B9E] mt-1 max-w-md">
                    Connecting to NASA/JPL/Esri OnMars service and streaming Caltech Global CTX Mosaic V01...
                  </p>
                </div>
              </div>
            )}

            {/* Failure Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0D0E] text-center p-6 space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="font-bold text-sm text-[#E7E9E8] uppercase">
                  Native 3D Scene Initialization Failed
                </p>
                <p className="text-xs text-[#929B9E] max-w-md">{errorMsg}</p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setActiveMode("iframe")}
                    className="px-4 py-2 rounded bg-[#D97943] text-white font-semibold text-xs hover:bg-[#E96A3D] transition-colors"
                  >
                    Switch to Caltech Hosted Viewer (Fallback)
                  </button>
                  <button
                    onClick={onBackTo2D}
                    className="px-4 py-2 rounded bg-[#171B1D] border border-[#292F32] text-xs text-[#E7E9E8]"
                  >
                    Return to 2D Map
                  </button>
                </div>
              </div>
            )}

            {/* Floating Navigation Controls & Status Toolbar */}
            {isReady && (
              <div className="absolute top-4 left-4 z-20 bg-[#101315]/90 backdrop-blur-md border border-[#292F32] p-3 rounded-xl max-w-xs text-xs space-y-2.5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#292F32] pb-1.5">
                  <span className="font-mono text-[10px] text-[#D97943] font-semibold uppercase flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Mars Orbit Telemetry (WKID 104971)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#E7E9E8]">
                  <div>
                    <span className="text-[#929B9E] block text-[9px]">LONGITUDE</span>
                    {cameraInfo.lon.toFixed(4)}° E
                  </div>
                  <div>
                    <span className="text-[#929B9E] block text-[9px]">LATITUDE</span>
                    {cameraInfo.lat.toFixed(4)}° N
                  </div>
                  <div>
                    <span className="text-[#929B9E] block text-[9px]">ALTITUDE</span>
                    {(cameraInfo.alt / 1000).toFixed(1)} km
                  </div>
                  <div>
                    <span className="text-[#929B9E] block text-[9px]">TILT / HEADING</span>
                    {cameraInfo.tilt}° / {cameraInfo.heading}°
                  </div>
                </div>

                {/* Quick Toolbar */}
                <div className="pt-2 border-t border-[#292F32] flex flex-wrap gap-1.5">
                  {location && (
                    <button
                      onClick={handleFlyToTarget}
                      className="px-2.5 py-1 rounded bg-[#D97943]/20 hover:bg-[#D97943]/30 border border-[#D97943]/50 text-[10px] text-[#D97943] inline-flex items-center gap-1 transition-colors"
                      title="Fly camera to selected location from 2D map"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Target Point</span>
                    </button>
                  )}

                  <button
                    onClick={handleResetJezero}
                    className="px-2.5 py-1 rounded bg-[#171B1D] hover:bg-[#202528] border border-[#292F32] text-[10px] text-[#E7E9E8] inline-flex items-center gap-1 transition-colors"
                    title="Return camera to Jezero Crater default view"
                  >
                    <RotateCcw className="w-3 h-3 text-[#D97943]" />
                    <span>Jezero Overview</span>
                  </button>

                  <button
                    onClick={handleToggleElevation}
                    className={`px-2.5 py-1 rounded border text-[10px] inline-flex items-center gap-1 transition-colors ${
                      elevationEnabled
                        ? "bg-[#D97943]/20 border-[#D97943]/50 text-[#D97943]"
                        : "bg-[#171B1D] border-[#292F32] text-[#929B9E]"
                    }`}
                  >
                    <Mountain className="w-3 h-3" />
                    <span>Elevation {elevationEnabled ? "ON" : "OFF"}</span>
                  </button>

                  <button
                    onClick={handleToggleColorDem}
                    className={`px-2.5 py-1 rounded border text-[10px] inline-flex items-center gap-1 transition-colors ${
                      showColorDem
                        ? "bg-[#D97943]/20 border-[#D97943]/50 text-[#D97943]"
                        : "bg-[#171B1D] border-[#292F32] text-[#929B9E]"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Color DEM {showColorDem ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Help Card */}
            {showHelp && (
              <div className="absolute top-4 right-4 z-20 bg-[#101315]/95 backdrop-blur-md border border-[#292F32] shadow-2xl p-3.5 rounded-xl max-w-xs text-xs text-[#E7E9E8] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-[#292F32] pb-2 mb-2">
                  <span className="font-semibold text-[11px] uppercase text-[#D97943] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    3D Scene Navigation
                  </span>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-[#929B9E] hover:text-[#E7E9E8] text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#929B9E]">
                  <div>
                    <span className="text-white font-mono">Left Click + Drag:</span> Pan terrain
                  </div>
                  <div>
                    <span className="text-white font-mono">Right Click + Drag:</span> Tilt &amp; rotate camera
                  </div>
                  <div>
                    <span className="text-white font-mono">Mouse Wheel:</span> Zoom in / out
                  </div>
                  <div>
                    <span className="text-white font-mono">Ctrl + Drag:</span> Orbit around focus point
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Caltech Hosted Iframe Fallback Container */
          <div className="w-full h-full relative">
            <iframe
              src={MARS_SCENE_CONFIG.caltechViewerUrl}
              title="Caltech Murray Lab Global CTX Mosaic 3D Viewer"
              className="w-full h-full border-0"
              allow="fullscreen; xr-spatial-tracking"
            />
          </div>
        )}

        {/* 3. Scientific Attribution and Disclaimer Footer */}
        <div className="absolute bottom-2 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#929B9E] bg-[#101315]/85 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-[#292F32] pointer-events-none">
          <div className="pointer-events-auto flex items-center space-x-2">
            <span>Imagery: </span>
            <span className="text-[#E7E9E8] font-semibold">
              NASA/JPL/MSSS/The Murray Lab (Global CTX Mosaic V01)
            </span>
            <span>• Topography: MDEM200M (NASA GSFC, DLR, USGS, Esri)</span>
          </div>
          <div className="mt-1 sm:mt-0 text-[10px] text-[#929B9E]">
            <span>ArcGIS Online Beta Service • Absolute Registration &lt;200m</span>
          </div>
        </div>
      </main>
    </div>
  );
}
