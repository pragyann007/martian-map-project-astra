"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowLeft,
  Compass,
  Loader2,
} from "lucide-react";
import { loadRealDem } from "@/lib/domain/dem-loader";
import type { TerrainGrid } from "@/lib/domain/terrain-grid";
import {
  TerrainCoordinateAdapter,
} from "@/lib/terrain/terrain-coordinate-adapter";
import {
  buildTerrainBufferGeometry,
} from "@/lib/terrain/terrain-geometry-builder";
import {
  loadCtxTexture,
  createTerrainMaterial,
  type TerrainShadingMode,
} from "@/lib/terrain/terrain-material-factory";

// Known geodetic landmarks for coordinate validation
const TEST_LANDMARKS = [
  { name: "Octavia E. Butler Landing", lon: 77.4509, lat: 18.4446, color: "#38BDF8" },
  { name: "Western Delta Scarp", lon: 77.3820, lat: 18.4280, color: "#E9A16A" },
  { name: "Kodiak Mesa Butte", lon: 77.3512, lat: 18.4021, color: "#4ADE80" },
];

function StandaloneTerrainMesh({
  grid,
  adapter,
  shadingMode,
  wireframe,
}: {
  grid: TerrainGrid;
  adapter: TerrainCoordinateAdapter;
  shadingMode: TerrainShadingMode;
  wireframe: boolean;
}) {
  const [ctxTexture, setCtxTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCtxTexture()
      .then((tex) => {
        if (!cancelled) setCtxTexture(tex);
      })
      .catch((err) => console.warn("Texture load skipped:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const geometry = useMemo(() => {
    return buildTerrainBufferGeometry(grid, adapter, {
      sampleStride: 2, // 266x252 vertices = 67,000 points (smooth 60fps)
      colorMode: shadingMode === "slope" ? "slope" : shadingMode === "elevation" ? "elevation" : "natural",
    });
  }, [grid, adapter, shadingMode]);

  const material = useMemo(() => {
    if (wireframe) {
      return createTerrainMaterial("wireframe");
    }
    return createTerrainMaterial(shadingMode, ctxTexture);
  }, [shadingMode, ctxTexture, wireframe]);

  return (
    <group>
      <mesh geometry={geometry} material={material} receiveShadow castShadow />

      {/* Validation Landmark Markers */}
      {TEST_LANDMARKS.map((lm) => {
        const pos = adapter.lonLatToScene({ lon: lm.lon, lat: lm.lat });
        const elev = adapter.sampleElevation({ lon: lm.lon, lat: lm.lat });

        return (
          <group key={lm.name} position={[pos.x, pos.y, pos.z]}>
            {/* Vertical pin pillar */}
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.2, 0.4, 8, 12]} />
              <meshStandardMaterial color={lm.color} emissive={lm.color} emissiveIntensity={0.8} />
            </mesh>
            {/* Beacon head */}
            <mesh position={[0, 8.5, 0]}>
              <octahedronGeometry args={[1.2]} />
              <meshStandardMaterial color={lm.color} emissive={lm.color} emissiveIntensity={1.0} />
            </mesh>
            {/* Ground label */}
            <Html position={[0, 10.5, 0]} center distanceFactor={50}>
              <div className="px-2 py-1 rounded bg-[#090A0C]/90 border border-[#777C83]/40 text-white font-mono text-[10px] whitespace-nowrap shadow-xl backdrop-blur-md">
                <div className="font-bold flex items-center gap-1" style={{ color: lm.color }}>
                  <span>📍</span> {lm.name}
                </div>
                <div className="text-[9px] text-[#A6ABB2]">
                  {lm.lon.toFixed(4)}° E, {lm.lat.toFixed(4)}° N ({elev.toFixed(1)} m)
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function Standalone3DTerrainLab() {
  const [grid, setGrid] = useState<TerrainGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [shadingMode, setShadingMode] = useState<TerrainShadingMode>("ctx");
  const [vertExaggeration, setVertExaggeration] = useState<number>(1.2);
  const [wireframe, setWireframe] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    loadRealDem(false).then((loadedGrid) => {
      if (!cancelled) {
        setGrid(loadedGrid);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const adapter = useMemo(() => {
    if (!grid) return null;
    return new TerrainCoordinateAdapter(grid, {
      simScale: 0.04,
      verticalExaggeration: vertExaggeration,
      baseElevationM: -2600,
    });
  }, [grid, vertExaggeration]);

  return (
    <div className="h-screen w-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col font-sans overflow-hidden select-none">
      {/* 1. Header */}
      <header className="h-12 bg-[#101315]/95 backdrop-blur-md border-b border-[#292F32] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <Link
            href="/planner"
            className="inline-flex items-center space-x-1.5 text-xs text-[#929B9E] hover:text-[#E7E9E8] transition-colors py-1 px-2.5 rounded bg-[#171B1D] border border-[#292F32] hover:border-[#E9A16A]/50"
          >
            <ArrowLeft className="w-4 h-4 text-[#E9A16A]" />
            <span className="font-semibold">Back to Planner</span>
          </Link>
          <span className="text-[#292F32]">|</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-pulse" />
            <h1 className="font-semibold text-xs sm:text-sm text-[#E8E5DF] uppercase tracking-wider">
              ASTRA Phase 1/2 — Three.js Jezero DTM Lab
            </h1>
          </div>
        </div>

        {/* Shading Mode Switcher */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex rounded bg-[#171B1D] p-0.5 border border-[#292F32]">
            <button
              onClick={() => {
                setShadingMode("ctx");
                setWireframe(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                shadingMode === "ctx" && !wireframe
                  ? "bg-[#E9A16A] text-[#090A0C] font-bold"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              CTX Texture
            </button>
            <button
              onClick={() => {
                setShadingMode("elevation");
                setWireframe(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                shadingMode === "elevation" && !wireframe
                  ? "bg-[#E9A16A] text-[#090A0C] font-bold"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              Elevation
            </button>
            <button
              onClick={() => {
                setShadingMode("slope");
                setWireframe(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                shadingMode === "slope" && !wireframe
                  ? "bg-[#E9A16A] text-[#090A0C] font-bold"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              Slope Hazard
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                wireframe
                  ? "bg-[#E9A16A] text-[#090A0C] font-bold"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              Wireframe
            </button>
          </div>

          <div className="flex rounded bg-[#171B1D] p-0.5 border border-[#292F32]">
            <button
              onClick={() => setVertExaggeration(1.0)}
              className={`px-2 py-1 text-[10px] font-mono rounded ${
                vertExaggeration === 1.0 ? "bg-[#292F32] text-white" : "text-[#777C83]"
              }`}
              title="1.0x True Scale"
            >
              1.0×
            </button>
            <button
              onClick={() => setVertExaggeration(1.4)}
              className={`px-2 py-1 text-[10px] font-mono rounded ${
                vertExaggeration === 1.4 ? "bg-[#292F32] text-white" : "text-[#777C83]"
              }`}
              title="1.4x Enhanced Relief"
            >
              1.4×
            </button>
            <button
              onClick={() => setVertExaggeration(2.0)}
              className={`px-2 py-1 text-[10px] font-mono rounded ${
                vertExaggeration === 2.0 ? "bg-[#292F32] text-white" : "text-[#777C83]"
              }`}
              title="2.0x Exaggerated Relief"
            >
              2.0×
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main 3D Canvas */}
      <div className="flex-1 relative w-full h-full bg-[#090A0C]">
        {loading || !grid || !adapter ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3 font-mono text-xs text-[#E9A16A]">
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Parsing Real USGS Jezero CTX DTM &amp; Building Mesh...</span>
          </div>
        ) : (
          <>
            <Canvas
              camera={{ position: [0, 60, 90], fov: 45, near: 0.5, far: 4000 }}
              shadows
              gl={{ antialias: true, alpha: false }}
              className="w-full h-full bg-[#090A0C]"
            >
              <color attach="background" args={["#120804"]} />
              <fog attach="fog" args={["#200D06", 50, 600]} />

              <ambientLight intensity={0.65} color="#FFE6D0" />
              <directionalLight
                position={[100, 160, 80]}
                intensity={1.8}
                color="#FFF2E2"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <directionalLight position={[-80, 50, -60]} intensity={0.4} color="#7F3518" />

              <StandaloneTerrainMesh
                grid={grid}
                adapter={adapter}
                shadingMode={shadingMode}
                wireframe={wireframe}
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.08}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={10}
                maxDistance={500}
              />
            </Canvas>

            {/* Telemetry Card */}
            <div className="absolute top-4 left-4 z-20 bg-[#101315]/90 backdrop-blur-md border border-[#292F32] p-3 rounded-xl max-w-xs text-xs space-y-2 shadow-2xl font-mono">
              <div className="flex items-center justify-between border-b border-[#292F32] pb-1.5 text-[10px] text-[#E9A16A] font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Jezero Topography Validation
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#E7E9E8]">
                <div>
                  <span className="text-[#777C83] block text-[8px]">COLUMNS / ROWS</span>
                  {grid.cols} × {grid.rows}
                </div>
                <div>
                  <span className="text-[#777C83] block text-[8px]">DTM SPACING</span>
                  {grid.resolutionM} m/pixel
                </div>
                <div>
                  <span className="text-[#777C83] block text-[8px]">ELEVATION RANGE</span>
                  {grid.minElev.toFixed(0)}m to {grid.maxElev.toFixed(0)}m
                </div>
                <div>
                  <span className="text-[#777C83] block text-[8px]">TEXTURE SOURCE</span>
                  USGS CTX (6m)
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#292F32] text-[9px] text-[#929B9E] leading-relaxed">
                Mouse controls: Left drag to orbit, right drag to pan, scroll to zoom.
              </div>
            </div>
          </>
        )}

        {/* Attribution Footer */}
        <div className="absolute bottom-2 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#777C83] bg-[#090A0C]/85 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-[#292F32] pointer-events-none font-mono">
          <div className="pointer-events-auto">
            <span>Terrain Topography: </span>
            <span className="text-[#E8E5DF] font-semibold">
              USGS Mars 2020 Jezero CTX DTM ({grid?.resolutionM ?? 60}m)
            </span>
            <span> • Draped Texture: USGS CTX Orthomosaic (6m)</span>
          </div>
          <div className="mt-1 sm:mt-0 text-[10px]">
            <span>IAU 2000 Mars Equirectangular Projection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
