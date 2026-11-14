"use client";

import Link from "next/link";
import { ArrowLeft, Navigation } from "lucide-react";
import MapContainer from "./MapContainer";
import DatasetPanel from "./DatasetPanel";
import DatasetInspector from "./DatasetInspector";

export default function VisualizerWorkspace() {
  return (
    <div className="min-h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col font-sans">
      {/* Workspace Header */}
      <header className="h-14 border-b border-[#17191D] bg-[#090A0C]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#777C83] hover:text-[#E8E5DF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Martian Map Home</span>
          </Link>
          <span className="text-[#17191D]">|</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#E9A16A] animate-pulse" />
            <span className="font-bold text-sm text-[#E8E5DF] uppercase tracking-wider">
              Dataset Visualizer
            </span>
            <span className="text-[11px] text-[#E9A16A] px-2 py-0.5 rounded bg-[#17191D] border border-[#C66B3D]/30 hidden sm:inline-block font-mono">
              JEZERO CRATER [18.50° N, 77.50° E]
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <Link
            href="/planner"
            className="hidden md:inline-flex items-center space-x-1.5 text-[#777C83] hover:text-[#E8E5DF] transition-colors uppercase tracking-wider"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Planner →</span>
          </Link>
          <span className="px-2 py-0.5 rounded bg-[#17191D] border border-[#777C83]/30 text-[#E9A16A] text-[10px] font-mono uppercase tracking-wider">
            MARS 2000
          </span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
        {/* Left Sidebar: Dataset Selection & Inspector */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-[#17191D] bg-[#090A0C] p-5 flex flex-col justify-between space-y-6 overflow-y-auto z-10 shrink-0">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] text-[#E9A16A] uppercase tracking-widest mb-1 font-mono font-semibold">
                Study Area Overview
              </div>
              <h1 className="text-xl font-bold text-[#E8E5DF] uppercase tracking-tight">
                Jezero Crater Basin
              </h1>
              <p className="text-xs text-[#777C83] mt-1 leading-relaxed">
                45 km impact crater situated in the Syrtis Major quadrangle. Exploring ancient lacustrine delta deposits and thermal inertia properties.
              </p>
            </div>

            {/* Datasets List */}
            <DatasetPanel />

            {/* Inspector */}
            <div className="pt-4 border-t border-[#17191D]">
              <DatasetInspector />
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="pt-4 border-t border-[#17191D] text-[10px] text-[#777C83] leading-relaxed">
            <span className="text-[#E9A16A] font-semibold uppercase tracking-wider">
              Data Provenance:
            </span>{" "}
            Visualizer layers display published planetary observations (THEMIS Day IR, ASU 100m). Raw digital numbers are uncalibrated grayscale DNs.
          </div>
        </aside>

        {/* Right Map Canvas: OpenLayers Viewport */}
        <main className="flex-1 w-full h-full min-h-[500px] relative bg-[#090A0C] flex flex-col">
          <MapContainer />
        </main>
      </div>
    </div>
  );
}
