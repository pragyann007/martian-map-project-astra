"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

interface Astronaut3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isMoving?: boolean;
  isFailed?: boolean;
  isCompleted?: boolean;
  showBadge?: boolean;
  name?: string;
  oxygenLevel?: number;
}

export function Astronaut3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  isMoving = false,
  isFailed = false,
  isCompleted = false,
  showBadge = true,
  name = "Cmdr. Alex (EVA-1)",
  oxygenLevel = 100,
}: Astronaut3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Materials
  const suitMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EDECE8",
        roughness: 0.45,
        metalness: 0.15,
      }),
    []
  );

  const darkTrimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1E2229",
        roughness: 0.6,
        metalness: 0.2,
      }),
    []
  );

  const goldVisorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isFailed ? "#D9452B" : "#FBBF24",
        metalness: 0.95,
        roughness: 0.08,
        emissive: isFailed ? "#D9452B" : "#D97706",
        emissiveIntensity: isFailed ? 0.7 : 0.25,
      }),
    [isFailed]
  );

  const packMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#374151",
        roughness: 0.35,
        metalness: 0.4,
      }),
    []
  );

  const o2LedColor = isFailed
    ? "#D9452B"
    : oxygenLevel < 25
    ? "#F59E0B"
    : isCompleted
    ? "#10B981"
    : "#38BDF8";

  // Procedural Stride & Collapse Animation Loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 7.5;

    if (isFailed) {
      // Collapse / Fallen sequence
      if (torsoRef.current) {
        torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, -0.4, 0.1);
        torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, 1.25, 0.1);
        torsoRef.current.rotation.z = THREE.MathUtils.lerp(torsoRef.current.rotation.z, 0.3, 0.1);
      }
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.8, 0.1);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -1.1, 0.1);
      }
      return;
    }

    if (isMoving) {
      // Natural humanoid stride kinematics
      const legAngle = Math.sin(t) * 0.55;
      const armAngle = -Math.sin(t) * 0.45;
      const bob = Math.abs(Math.cos(t)) * 0.08;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legAngle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legAngle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -armAngle;

      if (torsoRef.current) {
        torsoRef.current.position.y = bob;
        torsoRef.current.rotation.z = Math.sin(t) * 0.03;
        torsoRef.current.rotation.x = 0.08; // slight forward lean
      }
    } else {
      // Idle breathing
      if (torsoRef.current) {
        torsoRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.02;
        torsoRef.current.rotation.x = 0;
        torsoRef.current.rotation.z = 0;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Torso, Head, Pack & Arms */}
      <group ref={torsoRef}>
        {/* Upper Torso Suit Core */}
        <mesh position={[0, 1.45, 0]} material={suitMaterial} castShadow>
          <capsuleGeometry args={[0.38, 0.65, 8, 16]} />
        </mesh>

        {/* Chest Display & Control Unit */}
        <mesh position={[0, 1.52, 0.32]} material={darkTrimMaterial}>
          <boxGeometry args={[0.32, 0.3, 0.1]} />
        </mesh>
        {/* Chest Status Screen */}
        <mesh position={[0, 1.55, 0.38]}>
          <planeGeometry args={[0.22, 0.12]} />
          <meshBasicMaterial color={o2LedColor} />
        </mesh>

        {/* Helmet Sphere */}
        <mesh position={[0, 2.18, 0]} material={suitMaterial} castShadow>
          <sphereGeometry args={[0.36, 24, 24]} />
        </mesh>

        {/* Gold Reflective Visor */}
        <mesh position={[0, 2.18, 0.16]} material={goldVisorMaterial}>
          <sphereGeometry args={[0.27, 24, 24, 0, Math.PI, 0, Math.PI]} />
        </mesh>

        {/* Helmet Side Light Beacons */}
        <mesh position={[-0.34, 2.22, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#E8E5DF" emissive="#FFFFFF" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.34, 2.22, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#E8E5DF" emissive="#FFFFFF" emissiveIntensity={0.6} />
        </mesh>

        {/* Life Support Backpack (PLSS) */}
        <group position={[0, 1.52, -0.34]}>
          <mesh material={packMaterial} castShadow>
            <boxGeometry args={[0.62, 0.82, 0.34]} />
          </mesh>

          {/* Dual O2 Cylinders inside pack */}
          <mesh position={[-0.18, 0.05, -0.06]} material={darkTrimMaterial}>
            <cylinderGeometry args={[0.1, 0.1, 0.72, 12]} />
          </mesh>
          <mesh position={[0.18, 0.05, -0.06]} material={darkTrimMaterial}>
            <cylinderGeometry args={[0.1, 0.1, 0.72, 12]} />
          </mesh>

          {/* O2 Status LED Bar on backpack */}
          <mesh position={[0, 0.28, -0.18]}>
            <boxGeometry args={[0.36, 0.06, 0.02]} />
            <meshStandardMaterial color={o2LedColor} emissive={o2LedColor} emissiveIntensity={1.2} />
          </mesh>

          {/* Thermal Radiator Grill */}
          <mesh position={[0, -0.18, -0.18]} material={darkTrimMaterial}>
            <boxGeometry args={[0.42, 0.24, 0.02]} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.46, 1.7, 0]}>
          {/* Shoulder */}
          <mesh material={suitMaterial}>
            <sphereGeometry args={[0.12, 12, 12]} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0, -0.28, 0]} material={suitMaterial}>
            <cylinderGeometry args={[0.1, 0.09, 0.44, 8]} />
          </mesh>
          {/* Glove & Cuff */}
          <mesh position={[0, -0.56, 0.04]} material={darkTrimMaterial}>
            <boxGeometry args={[0.11, 0.16, 0.14]} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.46, 1.7, 0]}>
          {/* Shoulder */}
          <mesh material={suitMaterial}>
            <sphereGeometry args={[0.12, 12, 12]} />
          </mesh>
          {/* Upper Arm */}
          <mesh position={[0, -0.28, 0]} material={suitMaterial}>
            <cylinderGeometry args={[0.1, 0.09, 0.44, 8]} />
          </mesh>
          {/* Glove & Cuff */}
          <mesh position={[0, -0.56, 0.04]} material={darkTrimMaterial}>
            <boxGeometry args={[0.11, 0.16, 0.14]} />
          </mesh>
        </group>
      </group>

      {/* Pelvis & Legs */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.2, 0.95, 0]}>
        <mesh position={[0, -0.4, 0]} material={suitMaterial} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.72, 8]} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.42, 0.04]} material={darkTrimMaterial}>
          <boxGeometry args={[0.16, 0.12, 0.12]} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.84, 0.08]} material={darkTrimMaterial}>
          <boxGeometry args={[0.18, 0.16, 0.32]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.2, 0.95, 0]}>
        <mesh position={[0, -0.4, 0]} material={suitMaterial} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.72, 8]} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.42, 0.04]} material={darkTrimMaterial}>
          <boxGeometry args={[0.16, 0.12, 0.12]} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.84, 0.08]} material={darkTrimMaterial}>
          <boxGeometry args={[0.18, 0.16, 0.32]} />
        </mesh>
      </group>

      {/* Floating Status Badge */}
      {showBadge && (
        <Html position={[0, 2.9, 0]} center distanceFactor={32}>
          <div className="px-2.5 py-1 rounded-lg bg-[#090A0C]/90 border border-[#E9A16A]/50 text-white font-mono text-[10px] whitespace-nowrap shadow-2xl backdrop-blur-md flex items-center space-x-1.5 select-none pointer-events-none">
            {isFailed ? (
              <span className="text-[#D9452B] font-bold flex items-center space-x-1">
                <span>⚠️</span>
                <span>CRITICAL HYPOXIA</span>
              </span>
            ) : isCompleted ? (
              <span className="text-[#10B981] font-bold flex items-center space-x-1">
                <span>✓</span>
                <span>SAFE HAVEN REACHED</span>
              </span>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span className="text-[#E8E5DF] font-semibold">{name}</span>
                <span className="text-[#777C83]">|</span>
                <span
                  className={
                    oxygenLevel < 25
                      ? "text-[#F59E0B] font-bold"
                      : "text-[#38BDF8] font-bold"
                  }
                >
                  {oxygenLevel.toFixed(0)}% O₂
                </span>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
