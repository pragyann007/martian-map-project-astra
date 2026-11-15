"use client";

import dynamic from "next/dynamic";
import SimulationHUD from "./SimulationHUD";
import { SimulationErrorBoundary } from "./SimulationErrorBoundary";

// Dynamically import Three.js Canvas with ssr: false
const MarsSurface3D = dynamic(() => import("./MarsSurface3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0C] text-[#E9A16A] space-y-3 font-mono text-xs">
      <div className="w-6 h-6 border-2 border-[#E9A16A] border-t-transparent rounded-full animate-spin" />
      <span>Initializing WebGL 3D Planetary Engine (USGS Jezero DTM)...</span>
    </div>
  ),
});

export default function MarsSimulationView() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#090A0C] overflow-hidden">
      <SimulationErrorBoundary>
        <MarsSurface3D />
      </SimulationErrorBoundary>
      <SimulationHUD />
    </div>
  );
}
