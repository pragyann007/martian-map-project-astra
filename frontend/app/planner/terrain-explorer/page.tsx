"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TerrainExplorer from "@/components/planner/TerrainExplorer";

function TerrainExplorerWrapper() {
  const searchParams = useSearchParams();
  const lonParam = searchParams.get("lon");
  const latParam = searchParams.get("lat");
  const sourceParam = searchParams.get("source");

  const lon = lonParam ? parseFloat(lonParam) : null;
  const lat = latParam ? parseFloat(latParam) : null;

  return <TerrainExplorer lon={lon} lat={lat} source={sourceParam} />;
}

export default function TerrainExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-[#090A0C] text-[#E8E5DF] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#17191D] border-t-[#E9A16A] animate-spin" />
            <p className="font-heading text-xs uppercase tracking-wider text-[#777C83]">
              Initializing 3D Terrain Explorer...
            </p>
          </div>
        </div>
      }
    >
      <TerrainExplorerWrapper />
    </Suspense>
  );
}
