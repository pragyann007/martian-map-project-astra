"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { MarsPlanet } from "./MarsPlanet";

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function SubtleDistantStars({ count = 600 }: { count?: number }) {
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const baseWhite = [0.92, 0.91, 0.89];
    const titanium = [0.45, 0.47, 0.5];
    const faintRust = [0.9, 0.72, 0.6];

    for (let i = 0; i < count; i++) {
      const r = 35 + pseudoRandom(i * 3) * 30;
      const theta = pseudoRandom(i * 3 + 1) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(i * 3 + 2) - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const roll = pseudoRandom(i * 7);
      const choice = roll > 0.8 ? faintRust : roll > 0.4 ? baseWhite : titanium;
      const dim = 0.12 + pseudoRandom(i * 11) * 0.3;

      col[i * 3] = choice[0] * dim;
      col[i * 3 + 1] = choice[1] * dim;
      col[i * 3 + 2] = choice[2] * dim;
    }

    return { positions: pos, colors: col };
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors={true}
        transparent={true}
        opacity={0.55}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}

function WebGLPosterFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div
        className="w-[280px] h-[280px] sm:w-[440px] sm:h-[440px] rounded-full relative"
        style={{
          backgroundImage: "url('/assets/mars/mars-hero-texture.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow:
            "inset -30px -30px 60px rgba(0,0,0,0.9), 0 0 50px rgba(198, 107, 61, 0.2)",
        }}
      />
    </div>
  );
}

export default function MarsScene() {
  const [hasWebGL] = useState<boolean>(() =>
    typeof window !== "undefined" ? checkWebGLSupport() : true
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (hasWebGL === false) {
    return <WebGLPosterFallback />;
  }

  const planetRadius = isMobile ? 1.65 : 2.15;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <Suspense fallback={null}>
          <SubtleDistantStars count={isMobile ? 350 : 600} />

          {/* Deep space ambient light */}
          <ambientLight color="#24222E" intensity={0.3} />

          {/* Primary Directional Sunlight from upper left, matching reference */}
          <directionalLight
            position={[-4.2, 3.4, 4.8]}
            color="#FFF6EA"
            intensity={3.2}
          />

          {/* Subtle rim light for shadow silhouette */}
          <directionalLight
            position={[4.5, -2, -3]}
            color="#381B10"
            intensity={0.35}
          />

          {/* Mars Planet with smooth scroll-driven transforms */}
          <group position={[0, 0, 0]}>
            <MarsPlanet radius={planetRadius} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
