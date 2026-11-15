"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mountain,
  Layers,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Compass,
} from "lucide-react";
import {
  loadArcGISMars,
  MARS_SCENE_CONFIG,
  type ArcGISMarsView,
  type ArcGISMarsLayer,
} from "@/lib/map/arcgis-mars-loader";

export default function ThreeDLabPage() {
  const [activeTab, setActiveTab] = useState<"native" | "iframe">("native");
  const [loadingStage, setLoadingStage] = useState<string>("Initializing ArcGIS Maps SDK...");
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Readouts
  const [cameraInfo, setCameraInfo] = useState<{
    lon: number;
    lat: number;
    alt: number;
    heading: number;
    tilt: number;
  }>({
    lon: MARS_SCENE_CONFIG.jezeroDefault.lon,
    lat: MARS_SCENE_CONFIG.jezeroDefault.lat,
    alt: MARS_SCENE_CONFIG.jezeroDefault.altitude,
    heading: MARS_SCENE_CONFIG.jezeroDefault.heading,
    tilt: MARS_SCENE_CONFIG.jezeroDefault.tilt,
  });

  const [showColorDem, setShowColorDem] = useState(false);
  const [elevationEnabled, setElevationEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneViewRef = useRef<ArcGISMarsView | null>(null);
  const colorDemLayerRef = useRef<ArcGISMarsLayer | null>(null);
  const marsElevationRef = useRef<ArcGISMarsLayer | null>(null);

  useEffect(() => {
    if (activeTab !== "native") return;
    let isCancelled = false;

    async function initNativeScene() {
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
        setLoadingStage("Configuring Caltech Global CTX Mosaic (V01)...");
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

        // 5. SceneView in Mars 2000 Sphere (WKID 104971)
        setLoadingStage("Mounting Mars 3D SceneView (WKID 104971)...");

        const view = new SceneView({
          container: containerRef.current,
          map,
          qualityProfile: "medium",
          spatialReference: new SpatialReference({ wkid: MARS_SCENE_CONFIG.wkid }),
          camera: new Camera({
            position: {
              x: MARS_SCENE_CONFIG.jezeroDefault.lon,
              y: MARS_SCENE_CONFIG.jezeroDefault.lat,
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

        // Watch camera changes
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
          console.error("3D Lab native scene initialization error:", err);
          const msg = err instanceof Error ? err.message : String(err);
          setErrorMsg(msg || "Failed to initialize native 3D SceneView.");
        }
      }
    }

    initNativeScene();

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
  }, [activeTab]);

  const handleResetJezero = () => {
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
  };

  const handleToggleColorDem = () => {
    if (!colorDemLayerRef.current) return;
    const nextVal = !showColorDem;
    colorDemLayerRef.current.visible = nextVal;
    setShowColorDem(nextVal);
  };

  const handleToggleElevation = () => {
    if (!sceneViewRef.current || !marsElevationRef.current) return;
    const nextVal = !elevationEnabled;
    marsElevationRef.current.visible = nextVal;
    setElevationEnabled(nextVal);
  };

  return (
    <div className="h-screen w-screen bg-[#0B0D0E] text-[#E7E9E8] flex flex-col font-sans overflow-hidden select-none">
      {/* 1. Header */}
      <header className="h-13 bg-[#101315] border-b border-[#292F32] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <Link
            href="/visualizer"
            className="inline-flex items-center space-x-1.5 text-xs text-[#929B9E] hover:text-[#E7E9E8] transition-colors py-1 px-2 rounded hover:bg-[#171B1D]"
          >
            <ArrowLeft className="w-4 h-4 text-[#D97943]" />
            <span className="font-semibold">Back to 2D Visualizer</span>
          </Link>
          <span className="text-[#292F32]">|</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97943] animate-pulse" />
            <h1 className="font-semibold text-xs sm:text-sm text-[#E7E9E8] uppercase tracking-wider">
              ASTRA 3D Lab — Caltech CTX Validation
            </h1>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 bg-[#0B0D0E] p-1 rounded-lg border border-[#292F32] text-xs">
          <button
            onClick={() => setActiveTab("native")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "native"
                ? "bg-[#D97943] text-white"
                : "text-[#929B9E] hover:text-[#E7E9E8]"
            }`}
          >
            Native SceneView (Test B)
          </button>
          <button
            onClick={() => setActiveTab("iframe")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "iframe"
                ? "bg-[#D97943] text-white"
                : "text-[#929B9E] hover:text-[#E7E9E8]"
            }`}
          >
            Caltech Hosted Iframe (Test A)
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <a
            href={MARS_SCENE_CONFIG.caltechViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-[#929B9E] hover:text-[#E7E9E8] transition-colors py-1 px-2 rounded hover:bg-[#171B1D]"
          >
            <span className="hidden sm:inline">Caltech Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 2. Main Area */}
      <div className="flex-1 relative w-full h-full bg-[#0B0D0E]">
        {activeTab === "native" ? (
          <>
            {/* Native 3D Container */}
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

            {/* Error Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0D0E] text-center p-6 space-y-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="font-bold text-sm text-[#E7E9E8] uppercase">
                  Native SceneView Failed
                </p>
                <p className="text-xs text-[#929B9E] max-w-md">{errorMsg}</p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setActiveTab("iframe")}
                    className="px-4 py-2 rounded bg-[#D97943] text-white font-semibold text-xs hover:bg-[#E96A3D] transition-colors"
                  >
                    Switch to Caltech Hosted Viewer (Fallback)
                  </button>
                  <Link
                    href="/visualizer"
                    className="px-4 py-2 rounded bg-[#171B1D] border border-[#292F32] text-xs text-[#E7E9E8]"
                  >
                    Return to 2D
                  </Link>
                </div>
              </div>
            )}

            {/* Floating Telemetry & Controls HUD */}
            {isReady && (
              <div className="absolute top-4 left-4 z-20 bg-[#101315]/90 backdrop-blur-md border border-[#292F32] p-3 rounded-xl max-w-xs text-xs space-y-2.5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#292F32] pb-1.5">
                  <span className="font-mono text-[10px] text-[#D97943] font-semibold uppercase flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Mars 3D Telemetry (WKID 104971)
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

                {/* Toolbar */}
                <div className="pt-2 border-t border-[#292F32] flex flex-wrap gap-1.5">
                  <button
                    onClick={handleResetJezero}
                    className="px-2.5 py-1 rounded bg-[#171B1D] hover:bg-[#202528] border border-[#292F32] text-[10px] text-[#E7E9E8] inline-flex items-center gap-1 transition-colors"
                    title="Return camera to Jezero Crater default view"
                  >
                    <RotateCcw className="w-3 h-3 text-[#D97943]" />
                    <span>Reset Jezero</span>
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

        {/* 3. Bottom Attribution & Scientific Disclaimer */}
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
      </div>
    </div>
  );
}
