"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

import { usePlannerStore } from "@/lib/state/planner-store";
import { lonLatToWorldMeters } from "@/lib/domain/mars-math";
import type { Point3D, LonLat, Strategy } from "@/lib/domain/types";
import { Astronaut3D } from "./Astronaut3D";
import { Rover3D } from "./Rover3D";
import { EnhancedTerrain3D } from "./EnhancedTerrain3D";

function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// Scale: 1 unit in 3D = 25 meters on Mars
export const SIM_SCALE = 0.04;
const BASE_ELEVATION_M = -2600;

export function toSimCoords(p: Point3D, origin: LonLat): [number, number, number] {
  const [x, , z] = lonLatToWorldMeters(p, origin);
  const y = (p.elevM - BASE_ELEVATION_M) * 1.4; // 1.4x subtle vertical relief exaggeration
  return [x * SIM_SCALE, y * SIM_SCALE, z * SIM_SCALE];
}

// ---------------------------------------------------------------------------
// 1. 3D Route Splines (Active + Alternatives)
// ---------------------------------------------------------------------------
function RouteSplines({
  origin,
}: {
  origin: LonLat;
}) {
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);

  if (!routes) return null;

  const strategies: Strategy[] = ["shortest", "survival", "energy", "science"];

  return (
    <group>
      {strategies.map((strat) => {
        const r = routes[strat];
        if (!r || !r.found || r.coordinates3d.length < 2) return null;

        const isSelected = strat === activeStrategy;
        const pts = r.coordinates3d.map((pt) => {
          const [x, y, z] = toSimCoords(pt, origin);
          return new THREE.Vector3(x, y + 0.6, z); // slight ground offset
        });

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(
          curve,
          Math.min(pts.length * 3, 200),
          isSelected ? 0.35 : 0.12,
          6,
          false
        );

        return (
          <group key={strat}>
            <mesh geometry={tubeGeo}>
              <meshStandardMaterial
                color={r.color}
                emissive={r.color}
                emissiveIntensity={isSelected ? 0.8 : 0.25}
                roughness={0.3}
                transparent
                opacity={isSelected ? 0.95 : 0.4}
              />
            </mesh>

            {/* Critical Scarp Warning Marker on Shortest Path */}
            {strat === "shortest" && r.metrics && r.metrics.maxSlopeDeg > 20 && (
              <group position={pts[Math.floor(pts.length * 0.45)]}>
                <mesh position={[0, 3, 0]}>
                  <octahedronGeometry args={[1.2]} />
                  <meshStandardMaterial color="#D9452B" emissive="#D9452B" emissiveIntensity={0.8} />
                </mesh>
                <Html position={[0, 4.5, 0]} center distanceFactor={40}>
                  <div className="px-2 py-0.5 rounded bg-[#D9452B] text-white font-mono text-[10px] font-bold shadow-lg border border-white/40 whitespace-nowrap animate-pulse">
                    ⚠️ 26.4° SCARP CLIFF
                  </div>
                </Html>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. 3D Science Exploration Target Beacons
// ---------------------------------------------------------------------------
function ScienceBeacons({ origin }: { origin: LonLat }) {
  const scienceTargets = usePlannerStore((s) => s.scienceTargets);
  const selectedTargetId = usePlannerStore((s) => s.selectedTargetId);
  const selectScienceTarget = usePlannerStore((s) => s.selectScienceTarget);

  return (
    <group>
      {scienceTargets.map((target, idx) => {
        const [x, y, z] = toSimCoords(
          { lon: target.location.lon, lat: target.location.lat, elevM: target.elevationM },
          origin
        );
        const isSelected = target.id === selectedTargetId;

        return (
          <group key={target.id} position={[x, y, z]}>
            {/* Hologram Light Pillar */}
            <mesh position={[0, 6, 0]}>
              <cylinderGeometry args={[0.2, 0.6, 12, 12]} />
              <meshStandardMaterial
                color="#4ADE80"
                emissive="#4ADE80"
                emissiveIntensity={isSelected ? 1.0 : 0.4}
                transparent
                opacity={isSelected ? 0.6 : 0.25}
              />
            </mesh>

            {/* Rotating Gem Marker */}
            <mesh position={[0, 12, 0]}>
              <octahedronGeometry args={[0.9]} />
              <meshStandardMaterial
                color={isSelected ? "#E9A16A" : "#4ADE80"}
                emissive={isSelected ? "#E9A16A" : "#4ADE80"}
                emissiveIntensity={0.9}
              />
            </mesh>

            {/* Interactive 3D Label */}
            <Html position={[0, 14, 0]} center distanceFactor={50}>
              <div
                onClick={() => selectScienceTarget(target.id)}
                className={`p-1.5 rounded-lg border backdrop-blur-md cursor-pointer transition-all whitespace-nowrap shadow-xl ${
                  isSelected
                    ? "bg-[#090A0C]/90 border-[#4ADE80] text-white ring-2 ring-[#4ADE80]/50"
                    : "bg-[#090A0C]/75 border-[#777C83]/40 text-[#E8E5DF] hover:border-[#4ADE80]"
                }`}
              >
                <div className="flex items-center space-x-1.5 text-[10px]">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#17191D] text-[#E9A16A] font-mono flex items-center justify-center font-bold">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold font-sans">{target.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#4ADE80]/20 text-[#4ADE80] font-mono font-bold">
                    {target.missionSuccessScore}% FIT
                  </span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. Procedural 3D Mars Astronaut Character & Simulation Physics
// ---------------------------------------------------------------------------
function AstronautAgent({
  origin,
}: {
  origin: LonLat;
}) {
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);
  const simStatus = usePlannerStore((s) => s.simStatus);
  const simProgress = usePlannerStore((s) => s.simProgress);
  const simSpeed = usePlannerStore((s) => s.simSpeed);
  const setSimProgress = usePlannerStore((s) => s.setSimProgress);
  const setSimStatus = usePlannerStore((s) => s.setSimStatus);
  const simCameraMode = usePlannerStore((s) => s.simCameraMode);
  const astronaut = usePlannerStore((s) => s.astronaut);

  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const activeRoute = routes ? routes[activeStrategy] : null;

  // Build 3D spline curve for movement
  const spline = useMemo(() => {
    if (!activeRoute || !activeRoute.found || activeRoute.coordinates3d.length < 2) return null;
    const pts = activeRoute.coordinates3d.map((pt) => {
      const [x, y, z] = toSimCoords(pt, origin);
      return new THREE.Vector3(x, y + 0.4, z);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, [activeRoute, origin]);

  // Animation frame loop
  useFrame((_, delta) => {
    if (!spline || !groupRef.current) return;

    if (simStatus === "playing") {
      const totalDuration = activeRoute?.metrics?.estimatedDurationSec ?? 300;
      const progressDelta = (delta * simSpeed * 4) / Math.max(20, totalDuration / 10);
      const nextProgress = Math.min(1, simProgress + progressDelta);

      // Check oxygen burn and critical hypoxia
      if (activeRoute?.metrics?.profile) {
        const profIdx = Math.floor(nextProgress * (activeRoute.metrics.profile.length - 1));
        const currentProfile = activeRoute.metrics.profile[profIdx];

        // Shortest route cliff fail condition
        if (currentProfile && currentProfile.o2RemainingL <= 0) {
          setSimStatus("failed", "CRITICAL HYPOXIA: Oxygen fully exhausted attempting to scale 26° delta cliff!");
          return;
        }
      }

      if (nextProgress >= 1) {
        setSimProgress(1);
        setSimStatus("completed");
      } else {
        setSimProgress(nextProgress);
      }
    }

    // Position astronaut along spline
    const pos = spline.getPointAt(simProgress);
    const tangent = spline.getTangentAt(simProgress).normalize();

    groupRef.current.position.copy(pos);
    const lookTarget = pos.clone().add(tangent);
    groupRef.current.lookAt(lookTarget);

    // Stride bobbing
    if (simStatus === "playing") {
      const bob = Math.sin(simProgress * 120) * 0.15;
      groupRef.current.position.y += bob;
    }

    // Camera follow mode (Third Person Chase)
    if (simCameraMode === "chase") {
      const camOffset = tangent.clone().multiplyScalar(-18).add(new THREE.Vector3(0, 10, 0));
      const targetCamPos = pos.clone().add(camOffset);
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(pos.clone().add(new THREE.Vector3(0, 2, 0)));
    }
  });

  if (!spline) return null;

  const isFailed = simStatus === "failed";
  const isCompleted = simStatus === "completed";

  return (
    <group ref={groupRef}>
      <Astronaut3D
        scale={0.85}
        isMoving={simStatus === "playing"}
        isFailed={isFailed}
        isCompleted={isCompleted}
        showBadge={true}
        name={astronaut.name}
        oxygenLevel={Math.max(
          0,
          100 - simProgress * (activeStrategy === "shortest" ? 100 : 35)
        )}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. Habitat / Start Base Camp Marker & Robotic Rover
// ---------------------------------------------------------------------------
function HabitatBaseMarker({ origin }: { origin: LonLat }) {
  const startPoint = usePlannerStore((s) => s.startPoint);
  const destinationPoint = usePlannerStore((s) => s.destinationPoint);

  const [sx, sy, sz] = toSimCoords({ lon: startPoint.lon, lat: startPoint.lat, elevM: -2570 }, origin);
  const [dx, dy, dz] = toSimCoords({ lon: destinationPoint.lon, lat: destinationPoint.lat, elevM: -2515 }, origin);

  return (
    <group>
      {/* Start Base Hab */}
      <group position={[sx, sy, sz]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[2.5, 3.2, 2.4, 16]} />
          <meshStandardMaterial color="#E8E5DF" metalness={0.3} roughness={0.4} />
        </mesh>
        <Html position={[0, 3.5, 0]} center distanceFactor={40}>
          <div className="px-2 py-0.5 rounded bg-[#38BDF8] text-[#090A0C] font-mono text-[10px] font-bold shadow-lg border border-white/50">
            BASE HAB
          </div>
        </Html>
      </group>

      {/* Autonomous Scout Rover at Base */}
      <group position={[sx + 5, sy, sz + 3]}>
        <Rover3D scale={0.75} name="Astra Rover-1" showBadge={true} isDriving={false} />
      </group>

      {/* Destination Haven */}
      <group position={[dx, dy, dz]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[2.2, 2.8, 2.4, 16]} />
          <meshStandardMaterial color="#E9A16A" emissive="#E9A16A" emissiveIntensity={0.2} />
        </mesh>
        <Html position={[0, 3.5, 0]} center distanceFactor={40}>
          <div className="px-2 py-0.5 rounded bg-[#E9A16A] text-[#090A0C] font-mono text-[10px] font-bold shadow-lg border border-white/50">
            DESTINATION REFUGE
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main 3D Canvas Exporter
// ---------------------------------------------------------------------------
export default function MarsSurface3D() {
  const terrain = usePlannerStore((s) => s.terrain);
  const grid = terrain.grid;
  const simCameraMode = usePlannerStore((s) => s.simCameraMode);
  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());

  const origin = useMemo<LonLat>(() => {
    if (!grid) return { lon: 77.4297, lat: 18.4661 };
    return {
      lon: (grid.west + grid.east) / 2,
      lat: (grid.south + grid.north) / 2,
    };
  }, [grid]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0C] text-[#E8E5DF] p-6 space-y-3">
        <div className="w-10 h-10 rounded-full bg-[#E9A16A]/20 border border-[#E9A16A] flex items-center justify-center text-[#E9A16A]">
          ⚠️
        </div>
        <div className="text-center max-w-sm">
          <div className="font-heading font-bold text-xs uppercase tracking-wider text-[#E9A16A]">
            WebGL Acceleration Required
          </div>
          <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
            Please enable hardware WebGL in your browser settings to render the 3D Martian terrain mesh.
          </p>
        </div>
      </div>
    );
  }

  if (!grid) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#090A0C] text-[#E9A16A] font-mono text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-ping" />
          <span>Reconstructing 3D Jezero Topography from USGS DEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 45, 65], fov: 45, near: 0.5, far: 3000 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full bg-[#090A0C]"
      >
        {/* Martian Atmosphere Fog & Sky */}
        <color attach="background" args={["#1A0B05"]} />
        <fog attach="fog" args={["#2E1408", 40, 450]} />

        {/* Sunlight & Ambient Lighting */}
        <ambientLight intensity={0.55} color="#FCE7D0" />
        <directionalLight
          position={[120, 150, 80]}
          intensity={1.8}
          color="#FFE2C4"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-80, 40, -60]} intensity={0.35} color="#8B3A1C" />

        {/* 1. Enhanced Rocky DEM Terrain */}
        <EnhancedTerrain3D grid={grid} origin={origin} />

        {/* 2. Base & Destination Markers */}
        <HabitatBaseMarker origin={origin} />

        {/* 3. 3D Route Splines */}
        <RouteSplines origin={origin} />

        {/* 4. Science Beacons */}
        <ScienceBeacons origin={origin} />

        {/* 5. Animated Astronaut Agent */}
        <AstronautAgent origin={origin} />

        {/* Camera Controls (Disabled in chase mode to let camera track astronaut) */}
        {simCameraMode !== "chase" && (
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.05} // don't dip below terrain
            minDistance={8}
            maxDistance={350}
          />
        )}
      </Canvas>
    </div>
  );
}
