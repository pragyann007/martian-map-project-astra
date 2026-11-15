import * as THREE from "three";

export type TerrainShadingMode = "ctx" | "elevation" | "slope" | "wireframe";

export interface TerrainMaterialOptions {
  shadingMode?: TerrainShadingMode;
  wireframe?: boolean;
}

let cachedCtxTexture: THREE.Texture | null = null;

/**
 * Loads and caches the companion USGS Jezero CTX orthomosaic texture.
 */
export function loadCtxTexture(): Promise<THREE.Texture> {
  if (cachedCtxTexture) return Promise.resolve(cachedCtxTexture);

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    // Prefer web-optimized 2048x1940 texture matching the DTM extent exactly
    loader.load(
      "/data/dem/jez_ctx_mosaic_2048.jpg",
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        cachedCtxTexture = texture;
        resolve(texture);
      },
      undefined,
      (err) => {
        console.warn("[ASTRA] CTX texture load error, using fallback shading:", err);
        reject(err);
      }
    );
  });
}

/**
 * Creates appropriate Three.js material based on selected surface shading mode.
 */
export function createTerrainMaterial(
  mode: TerrainShadingMode = "ctx",
  ctxTexture?: THREE.Texture | null
): THREE.Material {
  switch (mode) {
    case "ctx":
      if (ctxTexture) {
        return new THREE.MeshStandardMaterial({
          map: ctxTexture,
          color: new THREE.Color("#E8A882"), // Subtle warm Martian dust grading
          roughness: 0.88,
          metalness: 0.04,
          flatShading: false,
        });
      }
      // If texture not yet ready, use vertex colors
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.85,
        metalness: 0.05,
      });

    case "elevation":
    case "slope":
      return new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.75,
        metalness: 0.08,
      });

    case "wireframe":
      return new THREE.MeshStandardMaterial({
        color: "#E9A16A",
        wireframe: true,
        roughness: 0.5,
      });

    default:
      return new THREE.MeshStandardMaterial({
        color: "#C66B3D",
        roughness: 0.85,
      });
  }
}
