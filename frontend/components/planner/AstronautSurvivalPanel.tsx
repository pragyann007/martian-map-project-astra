"use client";

import { usePlannerStore } from "@/lib/state/planner-store";
import { formatDuration } from "@/lib/domain/mars-math";
import {
  AlertTriangle,
  Battery,
  ShieldAlert,
  Wind,
  Gauge,
  Activity,
} from "lucide-react";

export default function AstronautSurvivalPanel() {
  const astronaut = usePlannerStore((s) => s.astronaut);
  const updateAstronaut = usePlannerStore((s) => s.updateAstronaut);
  const toggleEmergencyLeak = usePlannerStore((s) => s.toggleEmergencyLeak);
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);

  const activeRoute = routes ? routes[activeStrategy] : null;
  const metrics = activeRoute?.metrics;
  const shortest = routes?.shortest?.metrics;

  const remainingO2 = astronaut.oxygenRemainingL - (metrics?.oxygenConsumedL ?? 0);
  const survivalPct = Math.round((metrics?.survivalProbability ?? 1) * 100);

  const isCritical = (metrics?.survivalProbability ?? 1) < 0.4 || remainingO2 <= 0;
  const isElevated = !isCritical && ((metrics?.survivalProbability ?? 1) < 0.8 || remainingO2 < 20);

  return (
    <div className="space-y-5 text-xs text-[#E8E5DF]">
      {/* Astronaut Identity Banner */}
      <div className="p-3.5 rounded bg-[#17191D]/70 border border-[#777C83]/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#E9A16A]/20 border border-[#E9A16A]/50 flex items-center justify-center text-[#E9A16A]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#E8E5DF]">{astronaut.name}</div>
            <div className="text-[11px] text-[#777C83]">
              Mars 2026 EVA Suit • Mass: {astronaut.suitMassKg + astronaut.bodyMassKg} kg (0.38g)
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#090A0C] border border-[#777C83]/30 text-[#4ADE80]">
            HUD ONLINE
          </span>
        </div>
      </div>

      {/* Emergency Scenario Simulation Trigger */}
      <div className={`p-4 rounded border transition-all ${
        astronaut.isEmergencyLeak
          ? 'bg-[#D9452B]/15 border-[#D9452B] animate-pulse'
          : 'bg-[#17191D]/40 border-[#777C83]/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className={`w-4 h-4 ${astronaut.isEmergencyLeak ? 'text-[#D9452B]' : 'text-[#E9A16A]'}`} />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Emergency Breach Simulation
            </span>
          </div>
          <button
            onClick={toggleEmergencyLeak}
            className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md ${
              astronaut.isEmergencyLeak
                ? 'bg-[#D9452B] text-white hover:bg-[#D9452B]/80'
                : 'bg-[#17191D] text-[#E9A16A] border border-[#E9A16A]/40 hover:bg-[#E9A16A]/20'
            }`}
          >
            {astronaut.isEmergencyLeak ? 'Seal Breach (Reset)' : 'Trigger O2 Leak'}
          </button>
        </div>

        {astronaut.isEmergencyLeak ? (
          <div className="mt-2 text-[11px] text-[#D9452B] flex items-center space-x-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>ACTIVE PRESSURE LEAK: -{astronaut.leakRateLpm} L/min continuous venting! Algorithm rerouting for immediate survival.</span>
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-[#777C83] leading-relaxed">
            Simulate a micrometeorite or puncture failure. The pathfinder will dynamically recalculate survival probability and find the fastest gentle route to refuge.
          </p>
        )}
      </div>

      {/* Survival Probability Gauge Card */}
      <div className={`p-4 rounded border flex items-center justify-between ${
        isCritical
          ? 'bg-[#D9452B]/20 border-[#D9452B]'
          : isElevated
          ? 'bg-[#E9A16A]/20 border-[#E9A16A]'
          : 'bg-[#4ADE80]/10 border-[#4ADE80]/40'
      }`}>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#777C83]">
            Survival Probability Index
          </div>
          <div className={`text-2xl font-bold font-mono ${
            isCritical ? 'text-[#D9452B]' : isElevated ? 'text-[#E9A16A]' : 'text-[#4ADE80]'
          }`}>
            {survivalPct}%
          </div>
          <div className="text-[11px] mt-0.5">
            {isCritical
              ? 'FATAL: Hypoxia or severe rollover cliff ahead.'
              : isElevated
              ? 'ELEVATED RISK: Narrow consumable reserve margin.'
              : 'NOMINAL: Trajectory within safe life support margins.'}
          </div>
        </div>

        <div className="text-right font-mono text-[11px] space-y-1">
          <div>
            <span className="text-[#777C83]">O2 RESERVE: </span>
            <span className={remainingO2 <= 10 ? 'text-[#D9452B] font-bold' : 'text-[#E8E5DF]'}>
              {remainingO2.toFixed(1)} L
            </span>
          </div>
          <div>
            <span className="text-[#777C83]">TRANSIT TIME: </span>
            <span className="text-[#E8E5DF]">{formatDuration(metrics?.estimatedDurationSec ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Sliders */}
      <div className="p-4 rounded bg-[#17191D]/50 border border-[#777C83]/20 space-y-4">
        <div className="text-xs uppercase tracking-wider text-[#777C83] font-semibold flex items-center justify-between">
          <span>Life Support Telemetry Inputs</span>
          <span className="text-[#E9A16A]">REAL-TIME CONSTRAINTS</span>
        </div>

        {/* Oxygen Remaining Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-[#777C83] flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Oxygen In Tank</span>
            </span>
            <span className="font-mono text-[#38BDF8] font-bold">{astronaut.oxygenRemainingL} L / {astronaut.oxygenCapacityL} L</span>
          </div>
          <input
            type="range"
            min="20"
            max="240"
            step="5"
            value={astronaut.oxygenRemainingL}
            onChange={(e) => updateAstronaut({ oxygenRemainingL: Number(e.target.value) })}
            className="w-full accent-[#38BDF8] cursor-pointer"
          />
        </div>

        {/* Suit Battery Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-[#777C83] flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Suit Battery Charge</span>
            </span>
            <span className="font-mono text-[#4ADE80] font-bold">{astronaut.batteryRemainingPct}% ({((astronaut.batteryCapacityWh * astronaut.batteryRemainingPct) / 100).toFixed(0)} Wh)</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={astronaut.batteryRemainingPct}
            onChange={(e) => updateAstronaut({ batteryRemainingPct: Number(e.target.value) })}
            className="w-full accent-[#4ADE80] cursor-pointer"
          />
        </div>

        {/* Walking Cadence Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-[#777C83] flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-[#E9A16A]" />
              <span>Nominal Walking Cadence</span>
            </span>
            <span className="font-mono text-[#E9A16A] font-bold">{astronaut.nominalSpeedKmh.toFixed(1)} km/h ({(astronaut.nominalSpeedKmh / 3.6).toFixed(1)} m/s)</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="5.0"
            step="0.2"
            value={astronaut.nominalSpeedKmh}
            onChange={(e) => updateAstronaut({ nominalSpeedKmh: Number(e.target.value) })}
            className="w-full accent-[#E9A16A] cursor-pointer"
          />
        </div>
      </div>

      {/* Shortest vs Survival Warning Callout */}
      {shortest && shortest.criticalSlopeSegments > 0 && (
        <div className="p-3.5 rounded bg-[#D9452B]/10 border border-[#D9452B]/40 text-[11px] text-[#E8E5DF] space-y-1">
          <div className="text-[#D9452B] font-semibold flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>CRITICAL TERRAIN WARNING — EUCLIDEAN PATH</span>
          </div>
          <p className="text-[#777C83] leading-relaxed">
            The straight-line path crosses {shortest.criticalSlopeSegments} scarp segments exceeding the {astronaut.maxSlopeLimitDeg}° limit (Max slope: {shortest.maxSlopeDeg.toFixed(1)}°).
            The survival algorithm diverts distance to keep grade safe.
          </p>
        </div>
      )}
    </div>
  );
}
