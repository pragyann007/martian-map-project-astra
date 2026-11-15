"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

interface Rover3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isDriving?: boolean;
  name?: string;
  showBadge?: boolean;
}

export function Rover3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  isDriving = false,
  name = "Astra Rover-1",
  showBadge = true,
}: Rover3DProps) {
  const wheelsRef = useRef<THREE.Group[]>([]);
  const mastRef = useRef<THREE.Group>(null);

  // Materials
  const chassisMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EDECE8",
        roughness: 0.35,
        metalness: 0.3,
      }),
    []
  );

  const solarPanelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1E3A8A",
        roughness: 0.2,
        metalness: 0.85,
      }),
    []
  );

  const darkMetalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#27272A",
        roughness: 0.5,
        metalness: 0.6,
      }),
    []
  );

  const wheelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#52525B",
        roughness: 0.7,
        metalness: 0.35,
      }),
    []
  );

  const goldFoilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EAB308",
        roughness: 0.15,
        metalness: 0.9,
      }),
    []
  );

  // Rotate wheels when driving
  useFrame(({ clock }) => {
    if (isDriving) {
      const rot = clock.getElapsedTime() * 4;
      wheelsRef.current.forEach((wheel) => {
        if (wheel) wheel.rotation.x = rot;
      });
    }

    // Subtle sensor mast scanning
    if (mastRef.current) {
      mastRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.35;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* 1. Main Chassis & Electronics Box */}
      <group position={[0, 0.75, 0]}>
        <mesh material={chassisMaterial} castShadow>
          <boxGeometry args={[1.4, 0.55, 1.9]} />
        </mesh>

        {/* Gold Thermal Foil Underbody */}
        <mesh position={[0, -0.22, 0]} material={goldFoilMaterial}>
          <boxGeometry args={[1.35, 0.12, 1.85]} />
        </mesh>

        {/* Top Solar Deck */}
        <mesh position={[0, 0.28, 0]} material={solarPanelMaterial}>
          <boxGeometry args={[1.35, 0.04, 1.8]} />
        </mesh>

        {/* RTG Nuclear Power Unit (Rear Cylindrical Generator) */}
        <mesh position={[0, 0.15, -1.1]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.55, 12]} />
        </mesh>
        {/* RTG Cooling Fins */}
        <mesh position={[0, 0.15, -1.1]} material={darkMetalMaterial}>
          <boxGeometry args={[0.65, 0.04, 0.5]} />
        </mesh>

        {/* High-Gain Parabolic Communications Dish */}
        <group position={[0.42, 0.45, -0.6]} rotation={[-0.3, 0.4, 0]}>
          <mesh material={chassisMaterial}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} material={chassisMaterial}>
            <sphereGeometry args={[0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3]} />
          </mesh>
        </group>

        {/* Robotic Arm with Core Drill Turret (Front Left) */}
        <group position={[-0.45, 0.1, 0.95]} rotation={[0.4, -0.3, 0]}>
          <mesh material={darkMetalMaterial}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          </mesh>
          <mesh position={[0, 0.3, 0.15]} material={darkMetalMaterial}>
            <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
          </mesh>
          {/* Sample Drill Turret */}
          <mesh position={[0, 0.55, 0.25]} material={goldFoilMaterial}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
          </mesh>
        </group>

        {/* Mastcam & SuperCam Sensor Mast (Front Center) */}
        <group ref={mastRef} position={[0, 0.3, 0.65]}>
          {/* Mast Pillar */}
          <mesh position={[0, 0.5, 0]} material={chassisMaterial}>
            <cylinderGeometry args={[0.06, 0.06, 1.0, 8]} />
          </mesh>
          {/* Camera Head Unit */}
          <mesh position={[0, 1.05, 0]} material={chassisMaterial}>
            <boxGeometry args={[0.38, 0.18, 0.22]} />
          </mesh>
          {/* Stereo Lenses */}
          <mesh position={[-0.1, 1.05, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          </mesh>
          <mesh position={[0.1, 1.05, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          </mesh>
        </group>
      </group>

      {/* 2. 6-Wheel Rocker-Bogie Suspension & Wheels */}
      {/* Left 3 Wheels */}
      {[-0.7, 0, 0.7].map((zPos, idx) => (
        <group
          key={`l-wheel-${idx}`}
          position={[-0.95, 0.38, zPos]}
          ref={(el) => {
            if (el) wheelsRef.current[idx] = el;
          }}
        >
          {/* Ribbed Tread Wheel */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={wheelMaterial} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 16]} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial}>
            <cylinderGeometry args={[0.14, 0.14, 0.28, 12]} />
          </mesh>
        </group>
      ))}

      {/* Right 3 Wheels */}
      {[-0.7, 0, 0.7].map((zPos, idx) => (
        <group
          key={`r-wheel-${idx}`}
          position={[0.95, 0.38, zPos]}
          ref={(el) => {
            if (el) wheelsRef.current[idx + 3] = el;
          }}
        >
          {/* Ribbed Tread Wheel */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={wheelMaterial} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 16]} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={darkMetalMaterial}>
            <cylinderGeometry args={[0.14, 0.14, 0.28, 12]} />
          </mesh>
        </group>
      ))}

      {/* Floating Rover Name Tag */}
      {showBadge && (
        <Html position={[0, 2.4, 0]} center distanceFactor={35}>
          <div className="px-2 py-0.8 rounded bg-[#090A0C]/90 border border-[#38BDF8]/40 text-[#38BDF8] font-mono text-[9px] whitespace-nowrap shadow-xl flex items-center space-x-1.5 select-none pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
            <span className="font-bold uppercase tracking-wider">{name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
