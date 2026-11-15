"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

import { usePlannerStore } from "@/lib/state/planner-store";
import { TerrainCoordinateAdapter } from "@/lib/terrain/terrain-coordinate-adapter";
import type { Strategy } from "@/lib/domain/types";
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
export const BASE_ELEVATION_M = -2600;

// ---------------------------------------------------------------------------
// 1. 3D Route Splines Draped over USGS DTM (Active + Alternatives)
// ---------------------------------------------------------------------------
function RouteSplines({ adapter }: { adapter: TerrainCoordinateAdapter }) {
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

        // Drape every coordinate over the real USGS DTM height
        const pts = r.coordinates3d.map((pt) => {
          const v = adapter.lonLatToScene(pt, pt.elevM);
          return new THREE.Vector3(v.x, v.y + (isSelected ? 0.45 : 0.25), v.z);
        });

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(
          curve,
          Math.min(pts.length * 4, 300),
          isSelected ? 0.35 : 0.12,
          8,
          false
        );

        return (
          <group key={strat}>
            <mesh geometry={tubeGeo}>
              <meshStandardMaterial
                color={r.color}
                emissive={r.color}
                emissiveIntensity={isSelected ? 0.85 : 0.25}
                roughness={0.25}
                transparent
                opacity={isSelected ? 0.95 : 0.35}
              />
            </mesh>

            {/* Critical Scarp Warning Marker on Shortest Path (Delta Cliff > 20°) */}
            {strat === "shortest" && r.metrics && r.metrics.maxSlopeDeg > 20 && (
              <group position={pts[Math.floor(pts.length * 0.45)]}>
                <mesh position={[0, 3.5, 0]}>
                  <octahedronGeometry args={[1.2]} />
                  <meshStandardMaterial
                    color="#D9452B"
                    emissive="#D9452B"
                    emissiveIntensity={0.9}
                  />
                </mesh>
                <Html position={[0, 5.2, 0]} center distanceFactor={45}>
                  <div className="px-2.5 py-1 rounded bg-[#D9452B] text-white font-mono text-[10px] font-bold shadow-xl border border-white/50 whitespace-nowrap animate-pulse">
                    ⚠️ 26.4° SCARP CLIFF HAZARD
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
// 2. 3D Science Exploration Target Beacons
// ---------------------------------------------------------------------------
function ScienceBeacons({ adapter }: { adapter: TerrainCoordinateAdapter }) {
  const scienceTargets = usePlannerStore((s) => s.scienceTargets);
  const selectedTargetId = usePlannerStore((s) => s.selectedTargetId);
  const selectScienceTarget = usePlannerStore((s) => s.selectScienceTarget);

  return (
    <group>
      {scienceTargets.map((target, idx) => {
        const pos = adapter.lonLatToScene(target.location, target.elevationM);
        const isSelected = target.id === selectedTargetId;

        return (
          <group key={target.id} position={[pos.x, pos.y, pos.z]}>
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
            <Html position={[0, 14.5, 0]} center distanceFactor={50}>
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
// 3. Habitat / Start Base Camp Marker & Destination Refuge
// ---------------------------------------------------------------------------
function HabitatBaseMarker({ adapter }: { adapter: TerrainCoordinateAdapter }) {
  const startPoint = usePlannerStore((s) => s.startPoint);
  const destinationPoint = usePlannerStore((s) => s.destinationPoint);

  const startPos = adapter.lonLatToScene(startPoint);
  const destPos = adapter.lonLatToScene(destinationPoint);

  return (
    <group>
      {/* Start Base Hab */}
      <group position={[startPos.x, startPos.y, startPos.z]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[2.5, 3.2, 2.4, 16]} />
          <meshStandardMaterial color="#E8E5DF" metalness={0.3} roughness={0.4} />
        </mesh>
        <Html position={[0, 3.8, 0]} center distanceFactor={40}>
          <div className="px-2 py-0.5 rounded bg-[#38BDF8] text-[#090A0C] font-mono text-[10px] font-bold shadow-lg border border-white/50 whitespace-nowrap">
            BASE HAB: OCTAVIA BUTLER
          </div>
        </Html>
      </group>

      {/* Destination Haven */}
      <group position={[destPos.x, destPos.y, destPos.z]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[2.2, 2.8, 2.4, 16]} />
          <meshStandardMaterial
            color="#E9A16A"
            emissive="#E9A16A"
            emissiveIntensity={0.25}
          />
        </mesh>
        <Html position={[0, 3.8, 0]} center distanceFactor={40}>
          <div className="px-2 py-0.5 rounded bg-[#E9A16A] text-[#090A0C] font-mono text-[10px] font-bold shadow-lg border border-white/50 whitespace-nowrap">
            DESTINATION REFUGE
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. Rover & Astronaut Mission Simulation Agent
// ---------------------------------------------------------------------------
function MissionSimulationAgent({
  adapter,
}: {
  adapter: TerrainCoordinateAdapter;
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

  const roverRef = useRef<THREE.Group>(null);
  const astronautRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const activeRoute = routes ? routes[activeStrategy] : null;

  // Build high-resolution 3D spline curve for the active route
  const spline = useMemo(() => {
    if (!activeRoute || !activeRoute.found || activeRoute.coordinates3d.length < 2)
      return null;

    const pts = activeRoute.coordinates3d.map((pt) => {
      const v = adapter.lonLatToScene(pt, pt.elevM);
      return new THREE.Vector3(v.x, v.y + 0.1, v.z);
    });

    return new THREE.CatmullRomCurve3(pts);
  }, [activeRoute, adapter]);

  // Main animation frame loop
  useFrame((_, delta) => {
    if (!spline || !roverRef.current) return;

    if (simStatus === "playing") {
      const totalDuration = activeRoute?.metrics?.estimatedDurationSec ?? 300;
      const progressDelta =
        (delta * simSpeed * 4) / Math.max(20, totalDuration / 10);
      const nextProgress = Math.min(1, simProgress + progressDelta);

      // Evaluate life support & cliff hypoxia fail condition
      if (activeRoute?.metrics?.profile) {
        const profIdx = Math.floor(
          nextProgress * (activeRoute.metrics.profile.length - 1)
        );
        const currentProfile = activeRoute.metrics.profile[profIdx];

        if (currentProfile && currentProfile.o2RemainingL <= 0) {
          setSimStatus(
            "failed",
            "CRITICAL HYPOXIA: Oxygen fully exhausted attempting to scale vertical delta cliff!"
          );
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

    // 1. Compute Rover 3D position & forward tangent
    const pos = spline.getPointAt(simProgress);
    const tangent = spline.getTangentAt(simProgress).normalize();

    // 2. Query terrain surface normal at rover location to align pitch & roll
    const currentLonLat = adapter.sceneToLonLat(pos);
    const surfaceNormal = adapter.sampleNormal(currentLonLat);

    // Compute coordinate frame: Z = forward, Y = up (terrain normal), X = right
    const forward = tangent.clone();
    const up = surfaceNormal.clone();
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(forward, right).normalize();

    const rotMatrix = new THREE.Matrix4().makeBasis(right, correctedUp, forward);
    roverRef.current.position.copy(pos);
    roverRef.current.quaternion.setFromRotationMatrix(rotMatrix);

    // 3. Position accompanying Astronaut alongside the rover
    if (astronautRef.current) {
      const astroOffset = right.clone().multiplyScalar(2.2);
      const astroPos = pos.clone().add(astroOffset);
      astronautRef.current.position.copy(astroPos);
      astronautRef.current.lookAt(astroPos.clone().add(forward));

      // Walk cycle stride bobbing
      if (simStatus === "playing") {
        const bob = Math.sin(simProgress * 140) * 0.12;
        astronautRef.current.position.y += bob;
      }
    }

    // 4. Camera Modes
    if (simCameraMode === "chase") {
      // Third-person chase camera positioned behind and above the rover
      const camOffset = forward
        .clone()
        .multiplyScalar(-14)
        .add(correctedUp.clone().multiplyScalar(5.5));
      const targetCamPos = pos.clone().add(camOffset);
      camera.position.lerp(targetCamPos, 0.08);

      const lookAhead = pos
        .clone()
        .add(forward.clone().multiplyScalar(10))
        .add(correctedUp.clone().multiplyScalar(1.5));
      camera.lookAt(lookAhead);
    } else if (simCameraMode === "cockpit") {
      // First-person MastCam viewpoint from the rover's mast looking forward
      const cockpitOffset = forward
        .clone()
        .multiplyScalar(0.7)
        .add(correctedUp.clone().multiplyScalar(1.8));
      const cockpitCamPos = pos.clone().add(cockpitOffset);
      camera.position.lerp(cockpitCamPos, 0.25);

      const lookAhead = pos
        .clone()
        .add(forward.clone().multiplyScalar(25))
        .add(correctedUp.clone().multiplyScalar(1.4));
      camera.lookAt(lookAhead);
    } else if (simCameraMode === "topdown") {
      // Tactical overhead satellite view
      const overheadPos = pos.clone().add(new THREE.Vector3(0, 50, 0));
      camera.position.lerp(overheadPos, 0.08);
      camera.lookAt(pos);
    }
  });

  if (!spline) return null;

  const isFailed = simStatus === "failed";
  const isCompleted = simStatus === "completed";

  return (
    <group>
      {/* 1. Autonomous Mars Rover */}
      <group ref={roverRef}>
        <Rover3D
          scale={0.8}
          name="Astra Jezero Explorer"
          showBadge={true}
          isDriving={simStatus === "playing"}
        />
      </group>

      {/* 2. Mission Astronaut on EVA */}
      <group ref={astronautRef}>
        <Astronaut3D
          scale={0.8}
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
  const simShadingMode = usePlannerStore((s) => s.simShadingMode);
  const simVerticalExaggeration = usePlannerStore((s) => s.simVerticalExaggeration);

  const [hasWebGL] = useState<boolean>(() => isWebGLSupported());

  // Geodetic Coordinate Adapter
  const adapter = useMemo(() => {
    if (!grid) return null;
    return new TerrainCoordinateAdapter(grid, {
      simScale: SIM_SCALE,
      verticalExaggeration: simVerticalExaggeration,
      baseElevationM: BASE_ELEVATION_M,
    });
  }, [grid, simVerticalExaggeration]);

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

  if (!grid || !adapter) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#090A0C] text-[#E9A16A] font-mono text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-ping" />
          <span>Reconstructing 3D Jezero Topography from USGS DTM & CTX Imagery...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 45, 65], fov: 45, near: 0.5, far: 3500 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="w-full h-full bg-[#090A0C]"
      >
        {/* Martian Atmosphere Fog & Sky */}
        <color attach="background" args={["#1A0B05"]} />
        <fog attach="fog" args={["#2E1408", 50, 1000]} />

        {/* Sunlight & Ambient Lighting */}
        <ambientLight intensity={0.55} color="#FCE7D0" />
        <directionalLight
          position={[120, 160, 80]}
          intensity={1.8}
          color="#FFE2C4"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-90, 50, -70]}
          intensity={0.35}
          color="#8B3A1C"
        />

        {/* 1. Real USGS Jezero Crater Topography Mesh with CTX Orthomosaic */}
        <EnhancedTerrain3D
          grid={grid}
          adapter={adapter}
          shadingMode={simShadingMode}
          wireframe={simShadingMode === "wireframe"}
        />

        {/* 2. Base & Destination Markers */}
        <HabitatBaseMarker adapter={adapter} />

        {/* 3. 3D Route Splines */}
        <RouteSplines adapter={adapter} />

        {/* 4. Science Beacons */}
        <ScienceBeacons adapter={adapter} />

        {/* 5. Animated Rover & Astronaut Mission Agent */}
        <MissionSimulationAgent adapter={adapter} />

        {/* Camera Controls (Enabled in Orbit mode) */}
        {simCameraMode === "orbit" && (
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2 - 0.04} // Clamped so camera never clips beneath terrain
            minDistance={6}
            maxDistance={500}
          />
        )}
      </Canvas>
    </div>
  );
}
