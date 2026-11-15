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
  Eye,
} from "lucide-react";
import DatasetPanel from "./DatasetPanel";
import DatasetInspector from "./DatasetInspector";
import LandmarksPanel from "./LandmarksPanel";
import { useVisualizerStore } from "@/lib/state/visualizer-store";

// OpenLayers client-only dynamic import without SSR
const MapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex-1 flex items-center justify-center bg-[#0B0D0E]">
      <div className="flex flex-col items-center space-y-3 text-xs text-[#D97943]">
        <div className="w-7 h-7 rounded-full border-2 border-[#D97943] border-t-transparent animate-spin" />
        <span className="font-mono text-[11px] text-[#929B9E]">
          Initializing Mars OpenLayers Canvas...
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
    <div className="h-screen w-screen bg-[#0B0D0E] text-[#E7E9E8] flex flex-col font-sans overflow-hidden">
      {/* Workspace Header (Restrained & Minimal) */}
      <header className="h-12 shrink-0 border-b border-[#292F32] bg-[#101315]/95 backdrop-blur-md px-4 sm:px-5 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          {/* Desktop Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="hidden lg:flex items-center justify-center p-1.5 rounded text-[#929B9E] hover:text-[#E7E9E8] hover:bg-[#171B1D] transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-[#D97943]" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-[#929B9E] hover:text-[#E7E9E8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Project Astra</span>
          </Link>
          <span className="text-[#292F32] hidden sm:inline">/</span>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs sm:text-sm text-[#E7E9E8]">
              Dataset Visualizer
            </span>
            <span className="text-[10px] text-[#929B9E] px-2 py-0.5 rounded bg-[#171B1D] border border-[#292F32] hidden md:inline-block font-mono">
              Jezero Crater [18.50° N, 77.50° E]
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden rounded bg-[#171B1D] p-0.5 border border-[#292F32]">
            <button
              onClick={() => setMobileTab("map")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center space-x-1 ${
                mobileTab === "map"
                  ? "bg-[#D97943] text-white"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMobileTab("sidebar")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center space-x-1 ${
                mobileTab === "sidebar"
                  ? "bg-[#D97943] text-white"
                  : "text-[#929B9E] hover:text-[#E7E9E8]"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Layers</span>
            </button>
          </div>

          <Link
            href="/planner/terrain-explorer?lon=77.50&lat=18.50&source=visualizer"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-[#E7E9E8] hover:text-[#D97943] transition-colors font-mono font-medium px-2.5 py-1 rounded bg-[#171B1D] border border-[#292F32] hover:border-[#D97943]/40"
            title="Explore Jezero Crater in 3D (First-Person)"
          >
            <Eye className="w-3 h-3 text-[#D97943]" />
            <span>3D Explorer ↗</span>
          </Link>

          <Link
            href="/planner"
            className="inline-flex items-center space-x-1.5 text-xs text-[#E7E9E8] hover:text-white transition-colors font-mono font-medium px-2.5 py-1 rounded bg-[#171B1D] border border-[#292F32] hover:border-[#D97943]/40"
          >
            <Navigation className="w-3 h-3 text-[#D97943]" />
            <span>Route Planner →</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Left Sidebar: Dataset Selection & Inspector (Target 350px) */}
        <aside
          className={`w-full lg:w-[350px] border-b lg:border-b-0 lg:border-r border-[#292F32] bg-[#101315] flex flex-col z-20 shrink-0 h-full overflow-hidden transition-all duration-200 ease-in-out ${
            mobileTab === "sidebar"
              ? "flex"
              : isSidebarOpen
              ? "hidden lg:flex"
              : "hidden"
          }`}
        >
          {/* Fixed Header & Study Area Summary + Tab Switcher */}
          <div className="p-3.5 sm:p-4 pb-3 shrink-0 border-b border-[#292F32] space-y-3 bg-[#101315]">
            {/* Header / Study Area Summary */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-[#929B9E] font-mono mb-1">
                <span>Planetary GIS Workstation</span>
                <span className="text-[#D97943]">Jezero Basin</span>
              </div>
              <h1 className="text-base font-semibold text-[#E7E9E8]">
                Jezero Crater Region
              </h1>
              <p className="text-[11px] text-[#929B9E] mt-0.5 leading-relaxed">
                45 km open-basin crater exploring delta deposits, smectite clays, and thermophysical surface properties via NASA Mars Trek WMTS.
              </p>
            </div>

            {/* Sidebar Tab Switcher (Layers, Places, Details) */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-[#0B0D0E] border border-[#292F32]">
              <button
                type="button"
                onClick={() => setActiveSidebarTab("layers")}
                className={`py-1.5 text-[11px] font-medium rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "layers"
                    ? "bg-[#171B1D] text-[#E7E9E8] border border-[#292F32] shadow-sm"
                    : "text-[#929B9E] hover:text-[#E7E9E8]"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D97943]" />
                <span>Layers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("landmarks")}
                className={`py-1.5 text-[11px] font-medium rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "landmarks"
                    ? "bg-[#171B1D] text-[#E7E9E8] border border-[#292F32] shadow-sm"
                    : "text-[#929B9E] hover:text-[#E7E9E8]"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#D97943]" />
                <span>Places</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab("details")}
                className={`py-1.5 text-[11px] font-medium rounded flex items-center justify-center space-x-1.5 transition-colors ${
                  activeSidebarTab === "details"
                    ? "bg-[#171B1D] text-[#E7E9E8] border border-[#292F32] shadow-sm"
                    : "text-[#929B9E] hover:text-[#E7E9E8]"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#D97943]" />
                <span>Details</span>
              </button>
            </div>
          </div>

          {/* Scrollable Center: Tab Contents */}
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-4"
          >
            {activeSidebarTab === "layers" && <DatasetPanel />}
            {activeSidebarTab === "landmarks" && <LandmarksPanel />}
            {activeSidebarTab === "details" && <DatasetInspector />}
          </div>

          {/* Fixed Provenance Footer */}
          <div className="p-3.5 sm:p-4 pt-3 border-t border-[#292F32] text-[10px] text-[#929B9E] leading-relaxed shrink-0 space-y-1 bg-[#101315]">
            <div className="flex items-center space-x-1 text-[#E7E9E8] font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>NASA Mars Trek Provenance</span>
            </div>
            <p className="text-[10px] text-[#60686B]">
              Streaming calibrated planetary observation mosaics (MRO CTX 6m, MRO HiRISE 25cm, HRSC 12m, THEMIS IR 100m, MOLA Elevation, and Viking Color).
            </p>
          </div>
        </aside>

        {/* Floating Sidebar Re-expand Button when collapsed on desktop */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            title="Expand Sidebar"
            className="hidden lg:flex absolute top-4 left-4 z-30 p-2 rounded-md bg-[#101315]/90 border border-[#292F32] text-[#E7E9E8] hover:bg-[#171B1D] transition-all shadow-xl backdrop-blur-md items-center space-x-2 text-xs font-mono"
          >
            <PanelLeftOpen className="w-4 h-4 text-[#D97943]" />
            <span>DATA CONTROLS</span>
          </button>
        )}

        {/* Right Map Canvas: OpenLayers Viewport */}
        <main
          className={`flex-1 w-full h-full relative overflow-hidden bg-[#0B0D0E] flex flex-col min-h-0 ${
            mobileTab === "map" ? "flex" : "hidden lg:flex"
          }`}
        >
          <MapContainer />
        </main>
      </div>
    </div>
  );
}
