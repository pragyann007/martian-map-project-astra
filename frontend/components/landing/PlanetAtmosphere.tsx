"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface AtmosphereProps {
  radius?: number;
}

const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uPower;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
      rim = pow(rim, uPower);

      float alpha = rim * uIntensity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

export function PlanetAtmosphere({ radius = 2.15 }: AtmosphereProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#C66B3D") },
      uIntensity: { value: 0.18 }, // Very subtle, physically authentic
      uPower: { value: 5.5 }, // Tight to the limb, no thick halos
    }),
    []
  );

  return (
    <mesh scale={1.012}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={AtmosphereShader.vertexShader}
        fragmentShader={AtmosphereShader.fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
