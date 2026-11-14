"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col font-sans">
      {/* Workspace Header */}
      <header className="h-16 border-b border-[#17191D] bg-[#090A0C]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#777C83] hover:text-[#E8E5DF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Martian Map Home</span>
          </Link>
          <span className="text-[#17191D]">|</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#E9A16A] animate-ping" />
            <span className="font-heading font-bold text-sm text-[#E8E5DF] uppercase tracking-wider">
              Route Planner Workspace
            </span>
            <span className="text-xs text-[#E9A16A] px-2 py-0.5 rounded bg-[#17191D] border border-[#C66B3D]/30 hidden sm:inline-block">
              EXPERIMENTAL DEMO
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <Link
            href="/visualizer"
            className="hidden md:inline-flex items-center space-x-1.5 text-[#777C83] hover:text-[#E8E5DF] transition-colors uppercase tracking-wider"
          >
            <span>← Dataset Visualizer</span>
          </Link>
          <span className="px-2.5 py-1 rounded bg-[#17191D] border border-[#777C83]/30 text-[#E9A16A] uppercase tracking-wider">
            STATUS: READY
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Planner Controls Sidebar */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-[#17191D] bg-[#090A0C] p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="text-xs text-[#E9A16A] uppercase tracking-widest mb-1 font-semibold">
                Traverse Planning Module
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#E8E5DF] uppercase tracking-tight">
                Hypothetical Route Engine
              </h1>
              <p className="text-xs text-[#777C83] mt-1.5 leading-relaxed">
                Computational demonstration evaluating slope gradients against
                straight-line distance to simulate feasible rover paths across
                Jezero Crater terrain.
              </p>
            </div>

            {/* Strategy Parameters */}
            <div className="space-y-3">
              <div className="text-xs text-[#777C83] uppercase tracking-wider flex items-center justify-between">
                <span>Optimization Strategies</span>
                <span className="text-[#E9A16A]">3 MODES</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-[#17191D] border border-[#C66B3D]/50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#E8E5DF]">
                      Terrain-Conscious Path
                    </div>
                    <div className="text-[10px] text-[#777C83]">
                      Weights slope penalty to minimize tilt risk
                    </div>
                  </div>
                  <span className="text-[10px] text-[#E9A16A] uppercase">Active</span>
                </div>

                <div className="p-3 rounded bg-[#17191D]/50 border border-[#777C83]/20 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#E8E5DF]">
                      Shortest Euclidean Distance
                    </div>
                    <div className="text-[10px] text-[#777C83]">
                      Direct geometric straight line
                    </div>
                  </div>
                  <span className="text-[10px] text-[#777C83] uppercase">Option</span>
                </div>

                <div className="p-3 rounded bg-[#17191D]/50 border border-[#777C83]/20 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#E8E5DF]">
                      Science-Prioritized Transect
                    </div>
                    <div className="text-[10px] text-[#777C83]">
                      Visits designated mineral target waypoints
                    </div>
                  </div>
                  <span className="text-[10px] text-[#777C83] uppercase">Option</span>
                </div>
              </div>
            </div>

            {/* Safety Limits Notice */}
            <div className="p-4 rounded bg-[#17191D]/40 border border-[#777C83]/20 space-y-2 text-xs">
              <div className="text-[11px] uppercase tracking-wider text-[#E9A16A] font-semibold">
                Traversability Constraints
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[#777C83] block">CRITICAL SLOPE:</span>
                  <span className="text-[#C66B3D] font-bold">&gt;22.0° LIMIT</span>
                </div>
                <div>
                  <span className="text-[#777C83] block">SAND DUNE HAZARD:</span>
                  <span className="text-[#E8E5DF] font-bold">AVOID RIPPLES</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Honesty Notice */}
          <div className="p-3 rounded bg-[#17191D]/30 border border-[#C66B3D]/30 text-[11px] text-[#777C83] leading-relaxed">
            <span className="text-[#E9A16A] font-semibold uppercase tracking-wider">
              Simulation Disclaimer:
            </span>{" "}
            A route generated from a demonstration grid is a software prototype,
            not an operational flight recommendation or certified astronaut path.
          </div>
        </div>

        {/* Right Planner Map Area */}
        <div className="flex-1 bg-[#090A0C] relative flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />

          {/* Planner Viewport Frame */}
          <div className="relative z-10 w-full max-w-4xl aspect-[16/10] rounded border border-[#777C83]/30 bg-[#090A0C]/90 shadow-2xl overflow-hidden flex flex-col justify-between p-6">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#777C83] border-b border-[#17191D] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#E9A16A]" />
                <span className="text-[#E8E5DF] font-semibold">
                  A* Heuristic Route Canvas
                </span>
              </div>
              <span>COST-SURFACE MATRIX READY</span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full border border-[#C66B3D] flex items-center justify-center bg-[#17191D]/50 relative">
                <Navigation className="w-8 h-8 text-[#E9A16A]" />
              </div>

              <div>
                <h3 className="text-xl font-heading font-bold uppercase tracking-tight text-[#E8E5DF]">
                  Martian Map Route Planner
                </h3>
                <p className="text-xs text-[#777C83] max-w-md mx-auto mt-1 uppercase tracking-wider">
                  OpenLayers Traverse Canvas • Jezero Crater Grid
                </p>
              </div>

              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#17191D] border border-[#C66B3D]/40 text-xs text-[#E9A16A] uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9A16A]" />
                <span>Heuristic Grid Engine Configured</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#777C83] border-t border-[#17191D] pt-3">
              <div>ALGORITHM: A* HEURISTIC PATHFINDING</div>
              <div>CLASSIFICATION: SIMULATED DEMO</div>
              <div>NASA SPACE APPS 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
