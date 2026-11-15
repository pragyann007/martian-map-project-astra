"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { TerrainGrid } from "@/lib/domain/terrain-grid";
import { DEG, M_PER_DEG } from "@/lib/domain/mars-math";
import type { LonLat } from "@/lib/domain/types";
import { SIM_SCALE } from "./MarsSurface3D";

// Deterministic pseudo-random noise for Mars regolith roughness
function pseudoNoise(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x: number, z: number): number {
  const i = Math.floor(x);
  const j = Math.floor(z);
  const fx = x - i;
  const fz = z - j;
  // Cubic Hermite
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);

  const n00 = pseudoNoise(i, j);
  const n10 = pseudoNoise(i + 1, j);
  const n01 = pseudoNoise(i, j + 1);
  const n11 = pseudoNoise(i + 1, j + 1);

  return (
    n00 * (1 - u) * (1 - v) +
    n10 * u * (1 - v) +
    n01 * (1 - u) * v +
    n11 * u * v
  );
}

const BASE_ELEVATION_M = -2600;

export function EnhancedTerrain3D({
  grid,
  origin,
}: {
  grid: TerrainGrid;
  origin: LonLat;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 1. Generate DEM-displaced geometry with procedural rocky regolith noise
  const { geometry, rocks } = useMemo(() => {
    const widthM = (grid.east - grid.west) * M_PER_DEG * Math.cos(origin.lat * DEG);
    const heightM = (grid.north - grid.south) * M_PER_DEG;

    const segX = 160;
    const segY = 160;
    const geo = new THREE.PlaneGeometry(
      widthM * SIM_SCALE,
      heightM * SIM_SCALE,
      segX,
      segY
    );
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const dCol = (grid.cols - 1) / segX;
    const dRow = (grid.rows - 1) / segY;

    // Displace vertices with DEM elevation + multi-octave micro-topography
    for (let j = 0; j <= segY; j++) {
      const row = Math.min(grid.rows - 1, Math.max(0, Math.round(j * dRow)));
      for (let i = 0; i <= segX; i++) {
        const col = Math.min(grid.cols - 1, Math.max(0, Math.round(i * dCol)));
        const idx = j * (segX + 1) + i;

        const elev = grid.elev[row * grid.cols + col];
        const baseElevation = Number.isFinite(elev) ? elev : BASE_ELEVATION_M;

        // Micro-roughness noise: adds subtle rocky texture (0.3m to 0.8m)
        const microNoise =
          (smoothNoise(i * 0.45, j * 0.45) * 0.7 +
            smoothNoise(i * 1.8, j * 1.8) * 0.3) *
          0.85;

        const y = (baseElevation - BASE_ELEVATION_M) * 1.4 * SIM_SCALE + microNoise;
        pos.setY(idx, y);
      }
    }

    geo.computeVertexNormals();

    // Palette for Mars geological strata
    const norm = geo.attributes.normal;
    const colorValley = new THREE.Color("#B85A30"); // Regolith basin sand
    const colorCanyon = new THREE.Color("#7F2C15"); // Dark basalt bedrock
    const colorCliffHazard = new THREE.Color("#E03E22"); // Steep scarp face (>18°)
    const colorHighland = new THREE.Color("#E28B54"); // Light dust plateau

    for (let k = 0; k < pos.count; k++) {
      const ny = norm.getY(k);
      const y = pos.getY(k);
      const slopeDeg = (Math.acos(Math.min(1, Math.max(-1, ny))) / Math.PI) * 180;

      const vertexColor = colorValley.clone();

      if (slopeDeg > 18) {
        // High hazard slope (Jezero Delta Scarp)
        vertexColor.lerp(colorCliffHazard, Math.min(1, (slopeDeg - 18) / 9));
      } else if (y > 22) {
        // Highland plateau
        vertexColor.lerp(colorHighland, Math.min(1, (y - 22) / 25));
      } else {
        // Canyon floor / layered bedrock
        vertexColor.lerp(colorCanyon, Math.min(1, y / 18));
      }

      colors[k * 3] = vertexColor.r;
      colors[k * 3 + 1] = vertexColor.g;
      colors[k * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // 2. Procedural Rock Field Distribution
    const rockList: {
      position: [number, number, number];
      scale: [number, number, number];
      rotation: [number, number, number];
    }[] = [];

    const numRocks = 70;
    for (let r = 0; r < numRocks; r++) {
      const sampleI = Math.floor(10 + pseudoNoise(r, 1) * (segX - 20));
      const sampleJ = Math.floor(10 + pseudoNoise(r, 2) * (segY - 20));
      const vIdx = sampleJ * (segX + 1) + sampleI;

      const rx = pos.getX(vIdx);
      const ry = pos.getY(vIdx);
      const rz = pos.getZ(vIdx);

      const rScale = 0.25 + pseudoNoise(r, 3) * 0.6;
      rockList.push({
        position: [rx, ry + rScale * 0.4, rz],
        scale: [
          rScale * (0.8 + pseudoNoise(r, 4) * 0.4),
          rScale * (0.6 + pseudoNoise(r, 5) * 0.4),
          rScale * (0.8 + pseudoNoise(r, 6) * 0.4),
        ],
        rotation: [
          pseudoNoise(r, 7) * Math.PI,
          pseudoNoise(r, 8) * Math.PI * 2,
          pseudoNoise(r, 9) * Math.PI,
        ],
      });
    }

    return { geometry: geo, rocks: rockList };
  }, [grid, origin]);

  return (
    <group>
      {/* Reconstructed Surface Mesh with Enhanced Shaders */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.92}
          metalness={0.08}
          flatShading={false}
        />
      </mesh>

      {/* Scattered Martian Boulders & Rock Outcrops */}
      <group>
        {rocks.map((rock, idx) => (
          <mesh
            key={`boulder-${idx}`}
            position={rock.position}
            scale={rock.scale}
            rotation={rock.rotation}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#6E2B18"
              roughness={0.95}
              metalness={0.15}
            />
          </mesh>
        ))}
      </group>

      {/* Ambient Mars Regolith Dust Particles */}
      <MarsDustStorm count={300} />
    </group>
  );
}

// Drifting Martian Dust Particles in thin atmosphere
function MarsDustStorm({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoNoise(i, 11) - 0.5) * 160;
      pos[i * 3 + 1] = 2 + pseudoNoise(i, 12) * 25;
      pos[i * 3 + 2] = (pseudoNoise(i, 13) - 0.5) * 160;
    }
    return { positions: pos };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let x = attr.getX(i) + delta * 2.5; // Wind drift east
      let y = attr.getY(i) - delta * 0.4; // Settling
      if (x > 80) x = -80;
      if (y < 1) y = 25;
      attr.setX(i, x);
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#D97746"
        size={0.35}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}
