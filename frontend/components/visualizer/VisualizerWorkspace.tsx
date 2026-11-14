"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Navigation,
  Map as MapIcon,
  Sliders,
  Layers,
  Compass,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
} from "lucide-react";
import DatasetPanel from "./DatasetPanel";
import DatasetInspector from "./DatasetInspector";
import LandmarksPanel from "./LandmarksPanel";
import { useVisualizerStore } from "@/lib/state/visualizer-store";

// OpenLayers client-only dynamic import without SSR
const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex-1 flex items-center justify-center bg-[#090A0C]">
      <div className="flex flex-col items-center space-y-3 text-xs text-[#E9A16A]">
        <div className="w-8 h-8 rounded-full border-2 border-[#C66B3D] border-t-transparent animate-spin" />
        <span className="font-mono uppercase tracking-wider text-[11px]">
          Initializing Mars OpenLayers Canvas &amp; WMTS Stream...
        </span>
      </div>
    </div>
  ),
});

export default function VisualizerWorkspace() {
  const [mobileTab, setMobileTab] = useState<"map" | "sidebar">("map");

  const isSidebarOpen = useVisualizerStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useVisualizerStore((state) => state.setSidebarOpen);
  const activeSidebarTab = useVisualizerStore((state) => state.activeSidebarTab);
  const setActiveSidebarTab = useVisualizerStore((state) => state.setActiveSidebarTab);

  return (
    <div className="h-screen w-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col font-sans overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 shrink-0 border-b border-[#17191D] bg-[#090A0C]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Desktop Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="hidden lg:flex items-center justify-center p-1.5 rounded text-[#777C83] hover:text-[#E8E5DF] hover:bg-[#17191D] transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-[#E9A16A]" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-[#777C83] hover:text-[#E8E5DF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Project Astra</span>
          </Link>
          <span className="text-[#17191D] hidden sm:inline">|</span>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#E9A16A] animate-pulse" />
            <span className="font-bold text-xs sm:text-sm text-[#E8E5DF] uppercase tracking-wider">
              Mars GIS Visualizer
            </span>
            <span className="text-[10px] text-[#E9A16A] px-2 py-0.5 rounded bg-[#17191D] border border-[#C66B3D]/30 hidden md:inline-block font-mono">
              JEZERO CRATER [18.50° N, 77.50° E]
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Live NASA WMTS Stream Status */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] font-mono text-[#777C83] px-2 py-0.5 rounded bg-[#17191D] border border-[#17191D]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE • TREK.NASA.GOV</span>
          </div>

          {/* Mobile view toggle */}
          <div className="flex lg:hidden rounded bg-[#17191D] p-0.5 border border-[#777C83]/20">
            <button
              onClick={() => setMobileTab("map")}
              className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-colors flex items-center space-x-1 ${
                mobileTab === "map"
                  ? "bg-[#C66B3D] text-white"
                  : "text-[#777C83] hover:text-[#E8E5DF]"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMobileTab("sidebar")}
              className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-colors flex items-center space-x-1 ${
                mobileTab === "sidebar"
                  ? "bg-[#C66B3D] text-white"
                  : "text-[#777C83] hover:text-[#E8E5DF]"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Layers</span>
            </button>
          </div>

          <Link
            href="/planner"
            className="hidden md:inline-flex items-center space-x-1.5 text-xs text-[#E9A16A] hover:text-[#C66B3D] transition-colors uppercase font-mono tracking-wider font-semibold px-2.5 py-1 rounded bg-[#17191D] border border-[#C66B3D]/30"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route Planner →</span>
          </Link>
          <span className="px-2 py-0.5 rounded bg-[#17191D] border border-[#777C83]/30 text-[#A3A8B0] text-[10px] font-mono uppercase tracking-wider hidden sm:inline-block">
            MARS 2000
          </span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Left Sidebar: Dataset Selection & Inspector */}
        <aside
          className={`w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-[#17191D] bg-[#090A0C] p-4 sm:p-5 flex flex-col justify-between space-y-4 overflow-y-auto z-20 shrink-0 h-full transition-all duration-300 ease-in-out ${
            mobileTab === "sidebar"
              ? "block"
              : isSidebarOpen
              ? "hidden lg:flex"
              : "hidden"
          }`}
        >
          <div className="space-y-4">
            {/* Header / Study Area */}
            <div className="border-b border-[#17191D] pb-3">
              <div className="flex items-center justify-between text-[10px] text-[#E9A16A] uppercase tracking-widest font-mono font-semibold mb-1">
                <span>Planetary Exploration GIS</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#17191D] border border-[#C66B3D]/30">
                  JEZERO BASIN
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#E8E5DF] uppercase tracking-tight">
                Jezero Crater Basin
              </h1>
              <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                45 km open-basin crater at 18.50° N, 77.50° E. Exploring ancient river delta deposits, smectite clays, and thermophysical properties via NASA Mars Trek WMTS.
              </p>
            </div>

            {/* Sidebar Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#17191D] border border-[#17191D]">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("layers")}
                className={`py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "layers"
                    ? "bg-[#C66B3D] text-white shadow"
                    : "text-[#777C83] hover:text-[#E8E5DF]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("landmarks")}
                className={`py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "landmarks"
                    ? "bg-[#C66B3D] text-white shadow"
                    : "text-[#777C83] hover:text-[#E8E5DF]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Landmarks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("telemetry")}
                className={`py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "telemetry"
                    ? "bg-[#C66B3D] text-white shadow"
                    : "text-[#777C83] hover:text-[#E8E5DF]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Telemetry</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeSidebarTab === "layers" && <DatasetPanel />}
              {activeSidebarTab === "landmarks" && <LandmarksPanel />}
              {activeSidebarTab === "telemetry" && <DatasetInspector />}
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="pt-3 border-t border-[#17191D] text-[10px] text-[#777C83] leading-relaxed shrink-0 space-y-1">
            <div className="flex items-center space-x-1 text-[#E9A16A] font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>NASA Mars Trek Provenance</span>
            </div>
            <p className="text-[10px] text-[#777C83]">
              Streaming calibrated planetary observation mosaics (MRO CTX 6m, MRO HiRISE 25cm, HRSC 12m, THEMIS Day/Night IR 100m, MOLA Elevation, and Viking MDIM 2.1 Color).
            </p>
          </div>
        </aside>

        {/* Floating Sidebar Re-expand Button when collapsed on desktop */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            title="Expand Sidebar"
            className="hidden lg:flex absolute top-4 left-4 z-30 p-2 rounded-lg bg-[#090A0C]/90 border border-[#C66B3D]/40 text-[#E9A16A] hover:bg-[#17191D] hover:text-white transition-all shadow-xl backdrop-blur-md items-center space-x-2 text-xs font-mono"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span>EXPAND DATA CONTROLS</span>
          </button>
        )}

        {/* Right Map Canvas: OpenLayers Viewport */}
        <main
          className={`flex-1 w-full h-full relative overflow-hidden bg-[#090A0C] flex flex-col min-h-0 ${
            mobileTab === "map" ? "flex" : "hidden lg:flex"
          }`}
        >
          <MapContainer />
        </main>
      </div>
    </div>
  );
}
