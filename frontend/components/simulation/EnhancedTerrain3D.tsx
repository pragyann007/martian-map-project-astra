"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { TerrainGrid } from "@/lib/domain/terrain-grid";
import type { TerrainCoordinateAdapter } from "@/lib/terrain/terrain-coordinate-adapter";
import { buildTerrainBufferGeometry } from "@/lib/terrain/terrain-geometry-builder";
import {
  loadCtxTexture,
  createTerrainMaterial,
  type TerrainShadingMode,
} from "@/lib/terrain/terrain-material-factory";

interface EnhancedTerrain3DProps {
  grid: TerrainGrid;
  adapter: TerrainCoordinateAdapter;
  shadingMode?: TerrainShadingMode;
  wireframe?: boolean;
}

export function EnhancedTerrain3D({
  grid,
  adapter,
  shadingMode = "ctx",
  wireframe = false,
}: EnhancedTerrain3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [ctxTexture, setCtxTexture] = useState<THREE.Texture | null>(null);

  // Load the georeferenced USGS Jezero CTX orthomosaic texture
  useEffect(() => {
    let cancelled = false;
    loadCtxTexture()
      .then((tex) => {
        if (!cancelled) setCtxTexture(tex);
      })
      .catch((err) => {
        console.warn("[ASTRA] CTX texture load skipped:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 1. Generate georeferenced Three.js BufferGeometry directly from the USGS DTM
  const geometry = useMemo(() => {
    return buildTerrainBufferGeometry(grid, adapter, {
      sampleStride: 2, // 266x252 vertices = 67,000 points (buttery smooth 60fps)
      colorMode:
        shadingMode === "slope"
          ? "slope"
          : shadingMode === "elevation"
          ? "elevation"
          : "natural",
    });
  }, [grid, adapter, shadingMode]);

  // 2. Build material based on active shading mode (CTX drape, elevation ramp, slope hazard, or wireframe)
  const material = useMemo(() => {
    if (wireframe) {
      return createTerrainMaterial("wireframe");
    }
    return createTerrainMaterial(shadingMode, ctxTexture);
  }, [shadingMode, ctxTexture, wireframe]);

  return (
    <group>
      {/* Real USGS Jezero Crater Topography Mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        receiveShadow
        castShadow
      />

      {/* Ambient Mars Regolith Dust Drift */}
      <MarsDustStorm count={250} />
    </group>
  );
}

// Deterministic pseudo-random generator for particle positioning
function pseudoNoise(seed: number): number {
  const s = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

// Drifting Martian Dust Particles in thin atmosphere
function MarsDustStorm({ count = 250 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoNoise(i * 3 + 1) - 0.5) * 600;
      pos[i * 3 + 1] = 5 + pseudoNoise(i * 3 + 2) * 40;
      pos[i * 3 + 2] = (pseudoNoise(i * 3 + 3) - 0.5) * 600;
    }
    return { positions: pos };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let x = attr.getX(i) + delta * 3.5; // Wind drift east
      let y = attr.getY(i) - delta * 0.3; // Settling
      if (x > 300) x = -300;
      if (y < 2) y = 45;
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
        size={0.45}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </points>
  );
}
