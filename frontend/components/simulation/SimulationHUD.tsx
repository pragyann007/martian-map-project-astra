"use client";

import { usePlannerStore } from "@/lib/state/planner-store";
import { formatKm, formatDuration } from "@/lib/domain/mars-math";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Video,
  Globe,
  Compass,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Battery,
  Map as MapIcon,
  Sparkles,
} from "lucide-react";

export default function SimulationHUD() {
  const setViewMode = usePlannerStore((s) => s.setViewMode);
  const mode = usePlannerStore((s) => s.mode);
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);
  const setActiveStrategy = usePlannerStore((s) => s.setActiveStrategy);

  const simStatus = usePlannerStore((s) => s.simStatus);
  const simProgress = usePlannerStore((s) => s.simProgress);
  const simSpeed = usePlannerStore((s) => s.simSpeed);
  const simCameraMode = usePlannerStore((s) => s.simCameraMode);
  const simFailureReason = usePlannerStore((s) => s.simFailureReason);

  const setSimStatus = usePlannerStore((s) => s.setSimStatus);
  const setSimProgress = usePlannerStore((s) => s.setSimProgress);
  const setSimSpeed = usePlannerStore((s) => s.setSimSpeed);
  const setSimCameraMode = usePlannerStore((s) => s.setSimCameraMode);

  const astronaut = usePlannerStore((s) => s.astronaut);
  const activeRoute = routes ? routes[activeStrategy] : null;
  const metrics = activeRoute?.metrics;

  // Calculate live telemetry at current simulation progress
  const profIdx = metrics?.profile
    ? Math.min(
        metrics.profile.length - 1,
        Math.floor(simProgress * (metrics.profile.length - 1))
      )
    : 0;

  const currentProf = metrics?.profile ? metrics.profile[profIdx] : null;
  const currentSlope = currentProf?.slopeDeg ?? (metrics?.maxSlopeDeg ?? 0) * simProgress;
  const currentO2Remaining = currentProf
    ? Math.max(0, currentProf.o2RemainingL)
    : Math.max(0, astronaut.oxygenRemainingL - (metrics?.oxygenConsumedL ?? 0) * simProgress);

  const isScarpHazard = currentSlope > 18;
  const isHypoxia = currentO2Remaining <= 0;

  const handlePlayPause = () => {
    if (simStatus === "playing") {
      setSimStatus("paused");
    } else if (simStatus === "failed" || simStatus === "completed") {
      setSimProgress(0);
      setSimStatus("playing");
    } else {
      setSimStatus("playing");
    }
  };

  const handleRestart = () => {
    setSimProgress(0);
    setSimStatus("stopped");
  };

  const toggleSpeed = () => {
    if (simSpeed === 1) setSimSpeed(2);
    else if (simSpeed === 2) setSimSpeed(4);
    else setSimSpeed(1);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-30 font-sans selection:bg-[#C66B3D]">
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left Title & Return to 2D */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode("2d")}
            className="px-3 py-1.5 rounded-lg bg-[#090A0C]/90 hover:bg-[#17191D] border border-[#777C83]/30 text-xs font-semibold uppercase tracking-wider text-[#E8E5DF] flex items-center space-x-1.5 transition-all shadow-xl backdrop-blur-md"
          >
            <MapIcon className="w-3.5 h-3.5 text-[#E9A16A]" />
            <span>← 2D Planning Map</span>
          </button>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#090A0C]/80 border border-[#17191D] backdrop-blur-md text-xs">
            <span className="w-2 h-2 rounded-full bg-[#E9A16A] animate-ping" />
            <span className="font-heading font-bold text-[#E8E5DF] uppercase tracking-wider">
              3D Planetary Simulation
            </span>
            <span className="text-[#777C83] font-mono">| Jezero Crater, Mars</span>
          </div>
        </div>

        {/* Center: Route Strategy Selector */}
        <div className="flex items-center bg-[#090A0C]/90 p-1 rounded-xl border border-[#777C83]/30 shadow-2xl backdrop-blur-md text-xs">
          <button
            onClick={() => setActiveStrategy("shortest")}
            className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              activeStrategy === "shortest"
                ? "bg-[#D9452B] text-white shadow-lg"
                : "text-[#777C83] hover:text-[#E8E5DF]"
            }`}
          >
            <span>⚠️ Route A: Shortest (Cliff)</span>
          </button>

          <button
            onClick={() => setActiveStrategy("survival")}
            className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              activeStrategy === "survival"
                ? "bg-[#E9A16A] text-[#090A0C] font-bold shadow-lg"
                : "text-[#777C83] hover:text-[#E8E5DF]"
            }`}
          >
            <span>🛡️ Route B: Survival</span>
          </button>

          {mode === "science" && (
            <button
              onClick={() => setActiveStrategy("science")}
              className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                activeStrategy === "science"
                  ? "bg-[#4ADE80] text-[#090A0C] font-bold shadow-lg"
                  : "text-[#777C83] hover:text-[#E8E5DF]"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Science Target</span>
            </button>
          )}
        </div>

        {/* Right: Camera Mode Selector */}
        <div className="flex items-center bg-[#090A0C]/90 p-1 rounded-xl border border-[#777C83]/30 shadow-2xl backdrop-blur-md text-xs">
          <button
            onClick={() => setSimCameraMode("chase")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
              simCameraMode === "chase"
                ? "bg-[#38BDF8] text-[#090A0C]"
                : "text-[#777C83] hover:text-[#E8E5DF]"
            }`}
            title="Astronaut Follow Cam"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] uppercase">Chase Cam</span>
          </button>

          <button
            onClick={() => setSimCameraMode("orbit")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
              simCameraMode === "orbit"
                ? "bg-[#38BDF8] text-[#090A0C]"
                : "text-[#777C83] hover:text-[#E8E5DF]"
            }`}
            title="Free Orbit Camera"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] uppercase">Orbit</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE ALERT BANNER (The Core Demonstration) */}
      <div className="flex items-start justify-between gap-4 pointer-events-none mt-2">
        {/* Left: Experiment Guidance Box */}
        <div className="max-w-sm pointer-events-auto bg-[#090A0C]/90 border border-[#777C83]/30 p-3.5 rounded-xl shadow-2xl backdrop-blur-md space-y-2">
          {activeStrategy === "shortest" ? (
            <div>
              <div className="flex items-center space-x-1.5 text-[#D9452B] font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Experiment A: Shortest Transect</span>
              </div>
              <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                Scales a vertical 26.4° delta cliff. High metabolic exertion will deplete the oxygen tank before reaching refuge. Press <strong className="text-white">Play</strong> to test.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-1.5 text-[#E9A16A] font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Experiment B: Survival Route</span>
              </div>
              <p className="text-[11px] text-[#777C83] mt-1 leading-relaxed">
                Detours through natural canyon grades (&lt;6° slope). Conserves oxygen and mechanical energy for 100% mission survival.
              </p>
            </div>
          )}

          {/* Simulation Outcome Toast */}
          {simStatus === "failed" && (
            <div className="p-2.5 rounded-lg bg-[#D9452B]/20 border border-[#D9452B] text-xs text-[#D9452B] space-y-1 animate-pulse">
              <div className="font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Mission Failed: Crew Hypoxia</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[#E8E5DF]">
                {simFailureReason ?? "Oxygen exhausted scaling steep delta scarp. Shortest path is non-survivable."}
              </p>
            </div>
          )}

          {simStatus === "completed" && (
            <div className="p-2.5 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80] text-xs text-[#4ADE80] space-y-1">
              <div className="font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mission Success: Habitat Reached!</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[#E8E5DF]">
                Astronaut successfully reached destination with {currentO2Remaining.toFixed(1)} L of reserve oxygen intact.
              </p>
            </div>
          )}
        </div>

        {/* Right: Live Telemetry HUD Gauges */}
        <div className="pointer-events-auto bg-[#090A0C]/90 border border-[#777C83]/30 p-3.5 rounded-xl shadow-2xl backdrop-blur-md space-y-3 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-[#17191D] pb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#777C83] font-semibold">
              Live Suit Telemetry
            </span>
            <span className="text-[10px] font-mono text-[#4ADE80] uppercase">
              {simStatus === "playing" ? "TRACKING" : "STANDBY"}
            </span>
          </div>

          {/* Oxygen Reserve Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#777C83] flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Oxygen Reserve</span>
              </span>
              <span
                className={`font-mono font-bold ${
                  isHypoxia
                    ? "text-[#D9452B] animate-pulse"
                    : currentO2Remaining < 25
                    ? "text-[#E9A16A]"
                    : "text-[#38BDF8]"
                }`}
              >
                {currentO2Remaining.toFixed(1)} L
              </span>
            </div>
            <div className="w-full bg-[#17191D] h-2 rounded-full overflow-hidden border border-[#777C83]/30">
              <div
                className={`h-full transition-all duration-150 ${
                  currentO2Remaining <= 0
                    ? "bg-[#D9452B]"
                    : currentO2Remaining < 25
                    ? "bg-[#E9A16A]"
                    : "bg-[#38BDF8]"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, (currentO2Remaining / astronaut.oxygenCapacityL) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Slope Inclinometer */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#777C83] font-sans flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-[#E9A16A]" />
              <span>Terrain Incline</span>
            </span>
            <span
              className={`font-bold ${
                isScarpHazard ? "text-[#D9452B] animate-pulse" : "text-[#E8E5DF]"
              }`}
            >
              {currentSlope.toFixed(1)}°
              {isScarpHazard && (
                <span className="text-[9px] block text-[#D9452B] font-sans text-right">
                  ⚠️ SCARP HAZARD
                </span>
              )}
            </span>
          </div>

          {/* Metabolic Burn Rate */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#777C83] font-sans flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-[#C66B3D]" />
              <span>Metabolic Burn</span>
            </span>
            <span className="text-[#E8E5DF] font-bold">
              {(astronaut.oxygenBurnBaseLpm * (1 + (currentSlope / 10) * 1.5)).toFixed(2)} L/min
            </span>
          </div>

          {/* Suit Battery */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#777C83] font-sans flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Suit Battery</span>
            </span>
            <span className="text-[#4ADE80] font-bold">
              {Math.max(0, Math.round(astronaut.batteryRemainingPct - simProgress * 15))}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TIMELINE & SIMULATION CONTROLLER */}
      <div className="pointer-events-auto bg-[#090A0C]/95 border border-[#777C83]/30 p-3 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md space-y-2.5 max-w-2xl mx-auto w-full">
        {/* Playback Scrubber & Progress */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-[#777C83] text-[11px] w-12">
            {formatKm((metrics?.distanceM ?? 0) * simProgress)}
          </span>

          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={simProgress}
            onChange={(e) => {
              setSimProgress(parseFloat(e.target.value));
              if (simStatus === "failed" || simStatus === "completed") {
                setSimStatus("paused");
              }
            }}
            className="flex-1 accent-[#E9A16A] cursor-pointer h-1.5 bg-[#17191D] rounded-lg"
          />

          <span className="text-[#E8E5DF] text-[11px] w-12 text-right">
            {formatKm(metrics?.distanceM ?? 0)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play / Pause Button */}
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 rounded-xl bg-[#E9A16A] hover:bg-[#E9A16A]/90 text-[#090A0C] font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-lg active:scale-95"
            >
              {simStatus === "playing" ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{simProgress > 0 && simProgress < 1 ? "Resume" : "Start Simulation"}</span>
                </>
              )}
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-[#17191D] hover:bg-[#17191D]/80 text-[#777C83] hover:text-[#E8E5DF] border border-[#777C83]/30 transition-all"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Simulation Speed Pill */}
            <button
              onClick={toggleSpeed}
              className="px-2.5 py-1.5 rounded-xl bg-[#17191D] hover:bg-[#17191D]/80 text-[#38BDF8] border border-[#38BDF8]/30 font-mono text-xs font-bold transition-all flex items-center space-x-1"
              title="Simulation speed multiplier"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{simSpeed}x</span>
            </button>
          </div>

          {/* Current State Readout */}
          <div className="text-right text-[11px] text-[#777C83] font-mono hidden sm:block">
            <span>Estimated Duration: </span>
            <span className="text-[#E8E5DF]">
              {formatDuration((metrics?.estimatedDurationSec ?? 0) * (1 - simProgress))} remaining
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
