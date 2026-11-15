"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LineChart,
} from "lucide-react";

import { usePlannerStore } from "@/lib/state/planner-store";
import PlannerMap from "@/components/planner/PlannerMap";
import PlannerStepper from "@/components/planner/PlannerStepper";
import ElevationChart from "@/components/planner/ElevationChart";
import RouteComparisonTable from "@/components/planner/RouteComparisonTable";

export default function PlannerPage() {
  const terrain = usePlannerStore((s) => s.terrain);
  const initTerrain = usePlannerStore((s) => s.initTerrain);
  const isCalculating = usePlannerStore((s) => s.isCalculating);
  const startPoint = usePlannerStore((s) => s.startPoint);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize USGS terrain DTM on mount
  useEffect(() => {
    initTerrain();
  }, [initTerrain]);

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col font-sans selection:bg-[#C66B3D] selection:text-white">
      {/* 1. Mission Control Header */}
      <header className="h-14 border-b border-[#17191D] bg-[#090A0C]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#777C83] hover:text-[#E8E5DF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <span className="text-[#17191D]">|</span>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-ping" />
            <span className="font-heading font-bold text-xs sm:text-sm text-[#E8E5DF] uppercase tracking-wider">
              Project Astra • Mission Control
            </span>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/visualizer"
            className="hidden md:inline-flex items-center space-x-1.5 text-[#777C83] hover:text-[#E8E5DF] transition-colors uppercase tracking-wider"
          >
            <span>← Dataset Visualizer</span>
          </Link>
          <Link
            href={`/planner/terrain-explorer?lon=${startPoint.lon.toFixed(4)}&lat=${startPoint.lat.toFixed(4)}&source=planner-header`}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#17191D] border border-[#E9A16A]/40 text-[#E9A16A] hover:bg-[#E9A16A]/10 hover:border-[#E9A16A] transition-colors uppercase tracking-wider font-semibold text-[11px]"
            title="Explore Jezero Crater in 3D first-person mode"
          >
            <span>3D Explorer ↗</span>
          </Link>
          <span className="px-2.5 py-1 rounded bg-[#17191D] border border-[#777C83]/30 text-[#E9A16A] font-mono text-[11px] hidden sm:inline-block">
            {terrain.status === "ready"
              ? "TERRAIN: 100% REAL USGS DTM (20m)"
              : "INITIALIZING ELEVATION DTM..."}
          </span>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Guided Sidebar: Step-by-Step Workflow */}
        <aside className="w-full lg:w-[460px] xl:w-[480px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#17191D] bg-[#090A0C] p-4 sm:p-5 flex flex-col overflow-y-auto z-20 shadow-2xl">
          <PlannerStepper />
        </aside>

        {/* Right Main Map & Telemetry Canvas */}
        <main className="flex-1 flex flex-col relative bg-[#090A0C] overflow-hidden">
          {/* Interactive OpenLayers Map Viewport */}
          <div className="flex-1 relative w-full h-full min-h-[460px]">
            <PlannerMap />

            {/* Pathfinding In-Progress Toast */}
            {isCalculating && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#17191D]/90 backdrop-blur-md border border-[#E9A16A] px-4 py-2 rounded-full text-xs font-mono text-[#E9A16A] flex items-center space-x-2.5 shadow-2xl z-30">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E9A16A] animate-ping" />
                <span>Computing Multi-Objective A* Paths on Jezero Topography...</span>
              </div>
            )}
          </div>

          {/* 3. Bottom Telemetry Drawer (Collapsible) */}
          <div className="border-t border-[#17191D] bg-[#090A0C] z-20 flex flex-col shadow-2xl">
            <div
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="px-4 py-2.5 bg-[#17191D]/60 hover:bg-[#17191D]/90 transition-colors border-b border-[#17191D] flex items-center justify-between text-xs cursor-pointer select-none"
            >
              <div className="flex items-center space-x-2.5">
                <LineChart className="w-4 h-4 text-[#E9A16A]" />
                <span className="font-semibold uppercase tracking-wider text-[#E8E5DF]">
                  Elevation Cross-Section & Numerical Telemetry
                </span>
                <span className="text-[10px] text-[#777C83] font-mono hidden sm:inline">
                  (Shortest vs Survival vs Minimum Energy vs Science)
                </span>
              </div>
              <button
                className="text-xs text-[#777C83] hover:text-[#E8E5DF] flex items-center space-x-1 focus:outline-none"
                aria-label={isDrawerOpen ? "Collapse Drawer" : "Expand Drawer"}
              >
                <span className="text-[11px] font-mono">
                  {isDrawerOpen ? "Hide Telemetry" : "Inspect Raw Profile"}
                </span>
                {isDrawerOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#E9A16A]" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-[#E9A16A]" />
                )}
              </button>
            </div>

            {isDrawerOpen && (
              <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-72 overflow-y-auto">
                <ElevationChart />
                <RouteComparisonTable />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
