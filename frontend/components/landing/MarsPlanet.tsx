"use client";

import { useRef, Suspense } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { PlanetAtmosphere } from "./PlanetAtmosphere";
import { usePlanetScrollStore } from "./planetScrollStore";

// Preload the Mars equirectangular texture
if (typeof window !== "undefined") {
  useTexture.preload("/assets/mars/mars-hero-texture.jpg");
}

function TexturedSphere({
  radius,
  meshRef,
}: {
  radius: number;
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  const texture = useTexture("/assets/mars/mars-hero-texture.jpg", (tex) => {
    if (tex instanceof THREE.Texture) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
    }
  });

  // Jezero Crater coordinates: 18.38° N, 77.58° E
  const latRad = THREE.MathUtils.degToRad(18.38);
  const lonRad = THREE.MathUtils.degToRad(77.58);
  const r = radius * 1.002;
  const jx = r * Math.cos(latRad) * Math.sin(lonRad);
  const jy = r * Math.sin(latRad);
  const jz = r * Math.cos(latRad) * Math.cos(lonRad);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.75}
        metalness={0.02}
      />

      {/* Jezero Crater Landmark Pin */}
      <group position={[jx, jy, jz]}>
        <mesh>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#E9A16A" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.035, 0.045, 32]} />
          <meshBasicMaterial
            color="#E9A16A"
            transparent={true}
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </mesh>
  );
}

function FallbackSphere({
  radius,
  meshRef,
}: {
  radius: number;
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial color="#C66B3D" roughness={0.8} />
    </mesh>
  );
}

export function MarsPlanet({ radius = 2.15 }: { radius?: number }) {
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const planetPivotRef = useRef<THREE.Group>(null);
  const interactionGroupRef = useRef<THREE.Group>(null);
  const scrollTransformGroupRef = useRef<THREE.Group>(null);

  const accumulatedSpin = useRef(0);

  // Subscribe to scroll store without re-rendering component every frame
  const transform = usePlanetScrollStore((s) => s.transform);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // 1. Continuous slow axial rotation
    accumulatedSpin.current += delta * 0.035;

    // 2. Smoothly damp the position and scale based on scroll trigger targets
    if (scrollTransformGroupRef.current) {
      const damp = 1 - Math.exp(-delta * 3.5);

      scrollTransformGroupRef.current.position.x +=
        (transform.x - scrollTransformGroupRef.current.position.x) * damp;

      const floatY = Math.sin(elapsed * 0.35) * 0.03;
      scrollTransformGroupRef.current.position.y +=
        (transform.y + floatY - scrollTransformGroupRef.current.position.y) * damp;

      scrollTransformGroupRef.current.position.z +=
        (transform.z - scrollTransformGroupRef.current.position.z) * damp;

      const currentScale = scrollTransformGroupRef.current.scale.x;
      const targetScale = transform.scale;
      const nextScale = currentScale + (targetScale - currentScale) * damp;
      scrollTransformGroupRef.current.scale.set(nextScale, nextScale, nextScale);
    }

    // 3. Mesh rotation combining axial spin, scroll orientation, and mouse parallax
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y =
        accumulatedSpin.current + transform.rotY;
    }

    // 4. Gentle mouse parallax
    if (interactionGroupRef.current) {
      const targetRotX = state.pointer.y * 0.08 + transform.rotX;
      const targetRotY = state.pointer.x * 0.12;

      const damp = 1 - Math.exp(-delta * 2.2);
      interactionGroupRef.current.rotation.x +=
        (targetRotX - interactionGroupRef.current.rotation.x) * damp;
      interactionGroupRef.current.rotation.y +=
        (targetRotY - interactionGroupRef.current.rotation.y) * damp;
    }
  });

  return (
    <group ref={scrollTransformGroupRef}>
      <group ref={interactionGroupRef}>
        {/* Planetary Pivot with Mars' real axial obliquity (25.19°) */}
        <group
          ref={planetPivotRef}
          rotation={[0, 0, THREE.MathUtils.degToRad(25.19)]}
        >
          <Suspense
            fallback={<FallbackSphere radius={radius} meshRef={planetMeshRef} />}
          >
            <TexturedSphere radius={radius} meshRef={planetMeshRef} />
          </Suspense>

          {/* Restrained atmospheric limb haze */}
          <PlanetAtmosphere radius={radius} />
        </group>
      </group>
    </group>
  );
}
