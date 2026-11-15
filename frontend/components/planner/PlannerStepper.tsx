"use client";

import { useState } from "react";
import {
  Compass,
  MapPin,
  Crosshair,
  Activity,
  Route,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

import { usePlannerStore, type PlannerStep } from "@/lib/state/planner-store";
import {
  START_PRESETS,
  HAVEN_PRESETS,
} from "@/lib/domain/science-targets";
import { formatKm, formatDuration, formatLonLat } from "@/lib/domain/mars-math";
import AiAdvisoryBriefing from "./AiAdvisoryBriefing";

export default function PlannerStepper() {
  const currentStep = usePlannerStore((s) => s.currentStep);
  const setStep = usePlannerStore((s) => s.setStep);
  const nextStep = usePlannerStore((s) => s.nextStep);
  const prevStep = usePlannerStore((s) => s.prevStep);

  const mode = usePlannerStore((s) => s.mode);
  const setMode = usePlannerStore((s) => s.setMode);

  const startPoint = usePlannerStore((s) => s.startPoint);
  const destinationPoint = usePlannerStore((s) => s.destinationPoint);
  const selectedStartPresetId = usePlannerStore((s) => s.selectedStartPresetId);
  const selectedHavenPresetId = usePlannerStore((s) => s.selectedHavenPresetId);
  const selectedTargetId = usePlannerStore((s) => s.selectedTargetId);
  const pickMode = usePlannerStore((s) => s.pickMode);
  const setPickMode = usePlannerStore((s) => s.setPickMode);
  const setStartPoint = usePlannerStore((s) => s.setStartPoint);
  const setDestinationPoint = usePlannerStore((s) => s.setDestinationPoint);
  const selectStartPreset = usePlannerStore((s) => s.selectStartPreset);
  const selectHavenPreset = usePlannerStore((s) => s.selectHavenPreset);
  const selectScienceTarget = usePlannerStore((s) => s.selectScienceTarget);
  const setViewMode = usePlannerStore((s) => s.setViewMode);

  const astronaut = usePlannerStore((s) => s.astronaut);
  const updateAstronaut = usePlannerStore((s) => s.updateAstronaut);
  const toggleEmergencyLeak = usePlannerStore((s) => s.toggleEmergencyLeak);

  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);
  const setActiveStrategy = usePlannerStore((s) => s.setActiveStrategy);
  const scienceTargets = usePlannerStore((s) => s.scienceTargets);
  const recalculateRoutes = usePlannerStore((s) => s.recalculateRoutes);

  // Manual coordinate entry local state
  const [manualStartLon, setManualStartLon] = useState(startPoint.lon.toFixed(4));
  const [manualStartLat, setManualStartLat] = useState(startPoint.lat.toFixed(4));
  const [manualDestLon, setManualDestLon] = useState(destinationPoint.lon.toFixed(4));
  const [manualDestLat, setManualDestLat] = useState(destinationPoint.lat.toFixed(4));
  const [showAdvancedCrew, setShowAdvancedCrew] = useState(false);

  const steps: Array<{ step: PlannerStep; title: string; icon: typeof Compass }> = [
    { step: 1, title: "Mission Mode", icon: Compass },
    { step: 2, title: "Start Site", icon: MapPin },
    { step: 3, title: "Destination", icon: Crosshair },
    { step: 4, title: "Crew & Constraints", icon: Activity },
    { step: 5, title: "Routes & AI", icon: Route },
  ];

  const handleApplyStartCoords = () => {
    const lon = parseFloat(manualStartLon);
    const lat = parseFloat(manualStartLat);
    if (!isNaN(lon) && !isNaN(lat)) {
      setStartPoint({ lon, lat });
    }
  };

  const handleApplyDestCoords = () => {
    const lon = parseFloat(manualDestLon);
    const lat = parseFloat(manualDestLat);
    if (!isNaN(lon) && !isNaN(lat)) {
      setDestinationPoint({ lon, lat });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Progressive Stepper Navigation Bar */}
      <div className="bg-[#17191D]/70 p-2.5 rounded-xl border border-[#777C83]/20">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <div key={s.step} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setStep(s.step)}
                  className={`flex flex-col items-center group focus:outline-none transition-all ${
                    isActive ? "scale-105" : ""
                  }`}
                  title={s.title}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                      isActive
                        ? "bg-[#E9A16A] text-[#090A0C] ring-2 ring-[#E9A16A]/50 ring-offset-2 ring-offset-[#090A0C]"
                        : isCompleted
                        ? "bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/50"
                        : "bg-[#090A0C] text-[#777C83] border border-[#777C83]/30 group-hover:border-[#777C83]/70"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider mt-1 font-semibold hidden sm:inline-block ${
                      isActive ? "text-[#E9A16A]" : isCompleted ? "text-[#E8E5DF]" : "text-[#777C83]"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[1.5px] flex-1 mx-1.5 transition-colors ${
                      isCompleted ? "bg-[#4ADE80]/50" : "bg-[#777C83]/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Step Title & Subtitle */}
      <div className="flex items-center justify-between border-b border-[#17191D] pb-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#E9A16A] font-bold font-mono">
            STEP {currentStep} OF 5
          </span>
          <h2 className="text-base font-heading font-bold text-[#E8E5DF]">
            {steps[currentStep - 1].title}
          </h2>
        </div>
        <span className="text-[11px] text-[#777C83] font-mono">
          {mode === "survival" ? "SURVIVAL MODE" : "SCIENCE MODE"}
        </span>
      </div>

      {/* 3. Dynamic Step Content Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
        {/* ================= STEP 1: MISSION MODE ================= */}
        {currentStep === 1 && (
          <div className="space-y-3.5">
            <p className="text-xs text-[#777C83] leading-relaxed">
              Select your primary operational objective. The navigation engine will optimize path weights for life support or scientific yield.
            </p>

            {/* Astronaut Survival Mode Card */}
            <div
              onClick={() => setMode("survival")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                mode === "survival"
                  ? "bg-[#C66B3D]/15 border-[#E9A16A] shadow-lg shadow-[#C66B3D]/10"
                  : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#777C83]/50 hover:bg-[#17191D]/70"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === "survival"
                      ? "bg-[#E9A16A] text-[#090A0C]"
                      : "bg-[#17191D] text-[#777C83] border border-[#777C83]/30"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#E8E5DF]">
                      Astronaut Survival Navigation
                    </h3>
                    {mode === "survival" && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#E9A16A]/20 text-[#E9A16A] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#777C83] mt-1 leading-relaxed">
                    Prioritizes crew life support, oxygen margin, and slope safety. Dynamically reroutes around treacherous delta scarps during emergency breaches.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      O2 Burn Model
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      0.38g Work Load
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      Scarp Hazard Filter
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Exploration Mode Card */}
            <div
              onClick={() => setMode("science")}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                mode === "science"
                  ? "bg-[#4ADE80]/15 border-[#4ADE80] shadow-lg shadow-[#4ADE80]/10"
                  : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#777C83]/50 hover:bg-[#17191D]/70"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === "science"
                      ? "bg-[#4ADE80] text-[#090A0C]"
                      : "bg-[#17191D] text-[#777C83] border border-[#777C83]/30"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#E8E5DF]">
                      Scientific Exploration Planning
                    </h3>
                    {mode === "science" && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#4ADE80]/20 text-[#4ADE80] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#777C83] mt-1 leading-relaxed">
                    Evaluates verified astrobiology outcrops, clay/carbonate deposits, and crater ejecta with multi-criteria mission success scoring.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      USGS SIM 3464
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      Mineral Richness
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#090A0C] text-[#E8E5DF] border border-[#777C83]/30">
                      Traversability Fit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: STARTING LOCATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[#777C83] leading-relaxed">
              Define your expedition starting point. Choose from verified base presets, click the map to drop a pin, or enter exact coordinates.
            </p>

            {/* Method A: Base Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF] flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Base Location Presets</span>
              </label>
              <select
                value={selectedStartPresetId ?? ""}
                onChange={(e) => {
                  if (e.target.value) selectStartPreset(e.target.value);
                }}
                className="w-full bg-[#17191D] border border-[#777C83]/30 rounded-lg px-3 py-2 text-xs text-[#E8E5DF] focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="" disabled>
                  Choose a Base Camp or Landing Site...
                </option>
                {START_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatLonLat(p.location)})
                  </option>
                ))}
              </select>
            </div>

            {/* Method B: Interactive Map Drop Pin */}
            <div className="p-3.5 rounded-xl bg-[#17191D]/50 border border-[#777C83]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF]">
                  Interactive Map Placement
                </span>
                <span className="text-[10px] text-[#38BDF8] font-mono">CYAN PIN</span>
              </div>
              <button
                onClick={() => setPickMode(pickMode === "start" ? null : "start")}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
                  pickMode === "start"
                    ? "bg-[#38BDF8] text-[#090A0C] animate-pulse"
                    : "bg-[#17191D] border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/10"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {pickMode === "start"
                    ? "Click on Mars Map to Set Pin..."
                    : "📍 Drop Start Pin on Map"}
                </span>
              </button>
              {pickMode === "start" && (
                <p className="text-[11px] text-[#38BDF8] text-center font-mono">
                  Crosshair active: Click any location inside Jezero Crater.
                </p>
              )}
            </div>

            {/* Method C: Manual Coordinates Input */}
            <div className="p-3.5 rounded-xl bg-[#17191D]/50 border border-[#777C83]/20 space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF]">
                Manual Coordinates (Mars Geographic)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#777C83] block mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualStartLon}
                    onChange={(e) => setManualStartLon(e.target.value)}
                    className="w-full bg-[#090A0C] border border-[#777C83]/30 rounded px-2.5 py-1.5 text-xs font-mono text-[#E8E5DF] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#777C83] block mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualStartLat}
                    onChange={(e) => setManualStartLat(e.target.value)}
                    className="w-full bg-[#090A0C] border border-[#777C83]/30 rounded px-2.5 py-1.5 text-xs font-mono text-[#E8E5DF] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyStartCoords}
                className="w-full py-1.5 rounded bg-[#17191D] border border-[#777C83]/30 hover:border-[#38BDF8] text-xs font-semibold text-[#E8E5DF] transition-colors"
              >
                Update Start Pin
              </button>
            </div>

            {/* Current Active Pin Status */}
            <div className="p-3 rounded-lg bg-[#090A0C] border border-[#38BDF8]/30 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#38BDF8] font-bold block">Current Start Point:</span>
                <span className="text-[#E8E5DF]">{formatLonLat(startPoint)}</span>
              </div>
              <span className="text-[10px] text-[#777C83] font-sans">
                💡 Draggable on map
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DESTINATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-[#777C83] leading-relaxed">
              {mode === "survival"
                ? "Select a designated emergency refuge habitat, mobile rover, or drop a custom destination pin."
                : "Select an astrobiology target. Locations are ranked by mineral richness and terrain traversability."}
            </p>

            {mode === "survival" ? (
              <div className="space-y-3.5">
                {/* Survival Safe Havens */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF] flex items-center space-x-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-[#E9A16A]" />
                    <span>Safe Haven & Refuge Presets</span>
                  </label>
                  <select
                    value={selectedHavenPresetId ?? ""}
                    onChange={(e) => {
                      if (e.target.value) selectHavenPreset(e.target.value);
                    }}
                    className="w-full bg-[#17191D] border border-[#777C83]/30 rounded-lg px-3 py-2 text-xs text-[#E8E5DF] focus:outline-none focus:border-[#E9A16A]"
                  >
                    <option value="" disabled>
                      Choose a Refuge Station or Cache...
                    </option>
                    {HAVEN_PRESETS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({formatLonLat(h.location)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drop Destination Pin */}
                <div className="p-3.5 rounded-xl bg-[#17191D]/50 border border-[#777C83]/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF]">
                      Interactive Map Placement
                    </span>
                    <span className="text-[10px] text-[#E9A16A] font-mono">GOLD PIN</span>
                  </div>
                  <button
                    onClick={() => setPickMode(pickMode === "destination" ? null : "destination")}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
                      pickMode === "destination"
                        ? "bg-[#E9A16A] text-[#090A0C] animate-pulse"
                        : "bg-[#17191D] border border-[#E9A16A]/40 text-[#E9A16A] hover:bg-[#E9A16A]/10"
                    }`}
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>
                      {pickMode === "destination"
                        ? "Click on Mars Map to Set Pin..."
                        : "🎯 Drop Destination Pin on Map"}
                    </span>
                  </button>
                  {pickMode === "destination" && (
                    <p className="text-[11px] text-[#E9A16A] text-center font-mono">
                      Crosshair active: Click any target location inside Jezero Crater.
                    </p>
                  )}
                </div>

                {/* Manual Coords Input */}
                <div className="p-3.5 rounded-xl bg-[#17191D]/50 border border-[#777C83]/20 space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF]">
                    Manual Destination Coordinates
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[#777C83] block mb-1">Longitude (°E)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={manualDestLon}
                        onChange={(e) => setManualDestLon(e.target.value)}
                        className="w-full bg-[#090A0C] border border-[#777C83]/30 rounded px-2.5 py-1.5 text-xs font-mono text-[#E8E5DF] focus:outline-none focus:border-[#E9A16A]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#777C83] block mb-1">Latitude (°N)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={manualDestLat}
                        onChange={(e) => setManualDestLat(e.target.value)}
                        className="w-full bg-[#090A0C] border border-[#777C83]/30 rounded px-2.5 py-1.5 text-xs font-mono text-[#E8E5DF] focus:outline-none focus:border-[#E9A16A]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApplyDestCoords}
                    className="w-full py-1.5 rounded bg-[#17191D] border border-[#777C83]/30 hover:border-[#E9A16A] text-xs font-semibold text-[#E8E5DF] transition-colors"
                  >
                    Update Destination Pin
                  </button>
                </div>
              </div>
            ) : (
              /* Science Mode Targets List */
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8E5DF]">
                  Ranked Astrobiology & Mineral Targets
                </span>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {scienceTargets.map((target, idx) => {
                    const isSelected = target.id === selectedTargetId;
                    return (
                      <div
                        key={target.id}
                        onClick={() => selectScienceTarget(target.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4ADE80]/15 border-[#4ADE80] shadow-md"
                            : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#4ADE80]/40 hover:bg-[#17191D]/70"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-[#17191D] border border-[#777C83]/40 text-[10px] font-mono flex items-center justify-center text-[#E9A16A]">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-xs text-[#E8E5DF]">
                                {target.name}
                              </div>
                              <span className="text-[10px] text-[#4ADE80] uppercase tracking-wider">
                                {target.category}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 font-mono font-bold text-[10px]">
                            {target.missionSuccessScore}% FIT
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {target.minerals.slice(0, 3).map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.2 rounded text-[9px] bg-[#090A0C] border border-[#777C83]/20 text-[#777C83]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Active Destination Status */}
            <div className="p-3 rounded-lg bg-[#090A0C] border border-[#E9A16A]/30 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[#E9A16A] font-bold block">Current Destination:</span>
                <span className="text-[#E8E5DF]">{formatLonLat(destinationPoint)}</span>
              </div>
              <span className="text-[10px] text-[#777C83] font-sans">
                💡 Draggable on map
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CREW & CONSTRAINTS ================= */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-[#777C83] leading-relaxed">
              Configure astronaut physiological telemetry and suit constraints. Test emergency breach scenarios with real-time dynamic rerouting.
            </p>

            {/* Emergency Breach Simulation Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                astronaut.isEmergencyLeak
                  ? "bg-[#D9452B]/15 border-[#D9452B] shadow-lg shadow-[#D9452B]/10 animate-pulse"
                  : "bg-[#17191D]/40 border-[#777C83]/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert
                    className={`w-4 h-4 ${
                      astronaut.isEmergencyLeak ? "text-[#D9452B]" : "text-[#E9A16A]"
                    }`}
                  />
                  <span className="font-semibold uppercase tracking-wider text-xs">
                    Simulate Suit O2 Leak
                  </span>
                </div>
                <button
                  onClick={toggleEmergencyLeak}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all shadow-md ${
                    astronaut.isEmergencyLeak
                      ? "bg-[#D9452B] text-white hover:bg-[#D9452B]/80"
                      : "bg-[#17191D] text-[#E9A16A] border border-[#E9A16A]/40 hover:bg-[#E9A16A]/20"
                  }`}
                >
                  {astronaut.isEmergencyLeak ? "Seal Leak" : "Trigger Leak"}
                </button>
              </div>

              {astronaut.isEmergencyLeak ? (
                <div className="mt-2.5 text-[11px] text-[#D9452B] flex items-center space-x-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    PRESSURE VENTING: -{astronaut.leakRateLpm} L/min! Algorithm is prioritizing steepest safe descent to refuge.
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-[#777C83] leading-relaxed">
                  Simulate a micrometeorite puncture. Pathfinder adapts in real-time to maximize survival probability under rapid hypoxia constraints.
                </p>
              )}
            </div>

            {/* Sliders: Oxygen Tank, Battery, Speed */}
            <div className="space-y-3.5 p-4 rounded-xl bg-[#17191D]/50 border border-[#777C83]/20 text-xs">
              {/* Oxygen Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#E8E5DF] font-semibold">Oxygen Reserves</span>
                  <span className="font-mono text-[#4ADE80] font-bold">
                    {astronaut.oxygenRemainingL.toFixed(0)} Liters
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={astronaut.oxygenRemainingL}
                  onChange={(e) => updateAstronaut({ oxygenRemainingL: parseFloat(e.target.value) })}
                  className="w-full accent-[#4ADE80] cursor-pointer"
                />
                <span className="text-[10px] text-[#777C83] block">
                  Autonomy: ~{((astronaut.oxygenRemainingL / 0.8) * 60).toFixed(0)} min walking on flat terrain
                </span>
              </div>

              {/* Battery Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#E8E5DF] font-semibold">Suit Battery State</span>
                  <span className="font-mono text-[#38BDF8] font-bold">
                    {astronaut.batteryRemainingPct}% ({((astronaut.batteryRemainingPct / 100) * astronaut.batteryCapacityWh).toFixed(0)} Wh)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={astronaut.batteryRemainingPct}
                  onChange={(e) => updateAstronaut({ batteryRemainingPct: parseFloat(e.target.value) })}
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
              </div>

              {/* Walking Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#E8E5DF] font-semibold">Astronaut Walking Speed</span>
                  <span className="font-mono text-[#E9A16A] font-bold">
                    {astronaut.nominalSpeedKmh.toFixed(1)} km/h ({(astronaut.nominalSpeedKmh / 3.6).toFixed(2)} m/s)
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.2"
                  value={astronaut.nominalSpeedKmh}
                  onChange={(e) => updateAstronaut({ nominalSpeedKmh: parseFloat(e.target.value) })}
                  className="w-full accent-[#E9A16A] cursor-pointer"
                />
              </div>
            </div>

            {/* Advanced Constraints Toggle */}
            <div className="p-3 rounded-lg bg-[#17191D]/30 border border-[#777C83]/20">
              <button
                onClick={() => setShowAdvancedCrew(!showAdvancedCrew)}
                className="w-full flex items-center justify-between text-xs text-[#777C83] hover:text-[#E8E5DF]"
              >
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    Advanced Suit Physics
                  </span>
                </div>
                {showAdvancedCrew ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedCrew && (
                <div className="mt-3 pt-3 border-t border-[#17191D] space-y-2 text-[11px] font-mono text-[#777C83]">
                  <div className="flex justify-between">
                    <span>Astronaut + Suit Mass:</span>
                    <span className="text-[#E8E5DF]">145 kg (55.1 kg at 0.38g)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Safe Incline:</span>
                    <span className="text-[#E8E5DF]">18.0° (Jezero Scarp Limit)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metabolic Resting Burn:</span>
                    <span className="text-[#E8E5DF]">0.25 L/min O2</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 5: ROUTE COMPARISON & AI ================= */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <p className="text-xs text-[#777C83] leading-relaxed">
              Compare multi-objective route alternatives. Click any card to highlight its path on the map and animate the rover.
            </p>

            {/* Launch 3D Simulation CTA Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#C66B3D]/25 via-[#E9A16A]/15 to-[#17191D] border border-[#E9A16A]/60 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E9A16A] font-bold block">
                  Interactive 3D Planetary Simulation
                </span>
                <span className="text-xs text-[#E8E5DF] font-semibold block mt-0.5">
                  Walk or drive this route in 3D Mars terrain
                </span>
              </div>
              <button
                onClick={() => setViewMode("3d")}
                className="px-3.5 py-1.5 rounded-lg bg-[#E9A16A] hover:bg-[#E9A16A]/90 text-[#090A0C] font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-all active:scale-95 shrink-0 ml-2"
              >
                <span>Launch 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Route Cards */}
            <div className="space-y-2.5">
              {/* Card 1: Recommended Survival Route */}
              {(() => {
                const r = routes?.survival;
                const m = r?.metrics;
                const isSelected = activeStrategy === "survival";
                return (
                  <div
                    onClick={() => setActiveStrategy("survival")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#E9A16A]/15 border-[#E9A16A] shadow-md shadow-[#E9A16A]/10"
                        : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#E9A16A]/40 hover:bg-[#17191D]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E9A16A]" />
                        <h4 className="font-semibold text-xs text-[#E8E5DF]">
                          Recommended Survival Route
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#E9A16A]/20 text-[#E9A16A] border border-[#E9A16A]/40 font-mono font-bold text-[10px]">
                        RECOMMENDED
                      </span>
                    </div>

                    <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                      Skirts steep delta cliffs while minimizing metabolic exertion and hypoxia risk.
                    </p>

                    {m && (
                      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Dist</span>
                          <span className="text-[#E8E5DF] font-bold">{formatKm(m.distanceM)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Time</span>
                          <span className="text-[#E8E5DF] font-bold">{formatDuration(m.estimatedDurationSec)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Slope</span>
                          <span className="text-[#4ADE80] font-bold">{m.maxSlopeDeg.toFixed(1)}°</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Survival</span>
                          <span className="text-[#4ADE80] font-bold">
                            {(m.survivalProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 2: Shortest Direct Path (High Risk Scarp) */}
              {(() => {
                const r = routes?.shortest;
                const m = r?.metrics;
                const isSelected = activeStrategy === "shortest";
                return (
                  <div
                    onClick={() => setActiveStrategy("shortest")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#D9452B]/15 border-[#D9452B] shadow-md shadow-[#D9452B]/10"
                        : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#D9452B]/40 hover:bg-[#17191D]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D9452B]" />
                        <h4 className="font-semibold text-xs text-[#E8E5DF]">
                          Shortest Direct Path
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#D9452B]/20 text-[#D9452B] border border-[#D9452B]/40 font-mono font-bold text-[10px]">
                        ⚠️ SCARP HAZARD
                      </span>
                    </div>

                    <p className="text-[11px] text-[#D9452B] mt-1 leading-relaxed">
                      Traverses dangerous delta dropoffs &gt;25°. High fall hazard and severe oxygen depletion.
                    </p>

                    {m && (
                      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Dist</span>
                          <span className="text-[#E8E5DF] font-bold">{formatKm(m.distanceM)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Time</span>
                          <span className="text-[#E8E5DF] font-bold">{formatDuration(m.estimatedDurationSec)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Slope</span>
                          <span className="text-[#D9452B] font-bold">{m.maxSlopeDeg.toFixed(1)}°</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Survival</span>
                          <span className="text-[#D9452B] font-bold">
                            {(m.survivalProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 3: Minimum Energy Route */}
              {(() => {
                const r = routes?.energy;
                const m = r?.metrics;
                const isSelected = activeStrategy === "energy";
                return (
                  <div
                    onClick={() => setActiveStrategy("energy")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#38BDF8]/15 border-[#38BDF8] shadow-md shadow-[#38BDF8]/10"
                        : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#38BDF8]/40 hover:bg-[#17191D]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <h4 className="font-semibold text-xs text-[#E8E5DF]">
                          Minimum Energy Route
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-mono font-bold text-[10px]">
                        ENERGY CONSERVING
                      </span>
                    </div>

                    <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                      Flattest contour path minimizing gravitational mechanical work and suit battery drain.
                    </p>

                    {m && (
                      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Dist</span>
                          <span className="text-[#E8E5DF] font-bold">{formatKm(m.distanceM)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Time</span>
                          <span className="text-[#E8E5DF] font-bold">{formatDuration(m.estimatedDurationSec)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Slope</span>
                          <span className="text-[#38BDF8] font-bold">{m.maxSlopeDeg.toFixed(1)}°</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Work</span>
                          <span className="text-[#38BDF8] font-bold">{m.energyConsumedKj.toFixed(0)} kJ</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 4: Science Focused Route */}
              {(() => {
                const r = routes?.science;
                const m = r?.metrics;
                const isSelected = activeStrategy === "science";
                return (
                  <div
                    onClick={() => setActiveStrategy("science")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4ADE80]/15 border-[#4ADE80] shadow-md shadow-[#4ADE80]/10"
                        : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#4ADE80]/40 hover:bg-[#17191D]/70"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
                        <h4 className="font-semibold text-xs text-[#E8E5DF]">
                          Science Focused Route
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 font-mono font-bold text-[10px]">
                        MAX SCIENCE
                      </span>
                    </div>

                    <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                      Passes near carbonate and clay sediment layers for maximum mineral sampling yield.
                    </p>

                    {m && (
                      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Dist</span>
                          <span className="text-[#E8E5DF] font-bold">{formatKm(m.distanceM)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Time</span>
                          <span className="text-[#E8E5DF] font-bold">{formatDuration(m.estimatedDurationSec)}</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Slope</span>
                          <span className="text-[#4ADE80] font-bold">{m.maxSlopeDeg.toFixed(1)}°</span>
                        </div>
                        <div className="p-1.5 rounded bg-[#090A0C]">
                          <span className="text-[#777C83] block">Sampling</span>
                          <span className="text-[#4ADE80] font-bold">Optimal</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* AI Advisory Layer */}
            <AiAdvisoryBriefing />
          </div>
        )}
      </div>

      {/* 4. Sequential Stepper Navigation Footer */}
      <div className="pt-3 border-t border-[#17191D] flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-3.5 py-2 rounded-lg bg-[#17191D] hover:bg-[#17191D]/80 disabled:opacity-30 disabled:hover:bg-[#17191D] text-xs font-semibold uppercase tracking-wider text-[#E8E5DF] flex items-center space-x-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {currentStep === 5 ? (
            <button
              onClick={() => {
                recalculateRoutes();
              }}
              className="px-4 py-2 rounded-lg bg-[#E9A16A] hover:bg-[#E9A16A]/90 text-[#090A0C] font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recalculate Routes</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-lg bg-[#E9A16A] hover:bg-[#E9A16A]/90 text-[#090A0C] font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
            >
              <span>{currentStep === 4 ? "Calculate Routes" : "Next Step"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
