"use client";

import { usePlannerStore } from "@/lib/state/planner-store";
import { formatKm, formatDuration } from "@/lib/domain/mars-math";
import type { Strategy } from "@/lib/domain/types";

export default function RouteComparisonTable() {
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);
  const setActiveStrategy = usePlannerStore((s) => s.setActiveStrategy);

  if (!routes) {
    return (
      <div className="p-4 rounded bg-[#17191D]/30 border border-[#777C83]/20 text-xs text-[#777C83] text-center">
        Calculating multi-objective route alternatives...
      </div>
    );
  }

  const strategies: Strategy[] = ["survival", "shortest", "energy", "science"];

  return (
    <div className="overflow-x-auto rounded border border-[#17191D] bg-[#090A0C]">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-[#17191D] bg-[#17191D]/40 text-[#777C83] text-[10px] uppercase tracking-wider">
            <th className="py-2.5 px-3">Route Strategy</th>
            <th className="py-2.5 px-3">Distance</th>
            <th className="py-2.5 px-3">Est. Time</th>
            <th className="py-2.5 px-3">Max Slope</th>
            <th className="py-2.5 px-3">O2 Burn</th>
            <th className="py-2.5 px-3">Survival %</th>
            <th className="py-2.5 px-3 text-right">Select</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#17191D]/60 font-mono">
          {strategies.map((strat) => {
            const r = routes[strat];
            const m = r?.metrics;
            const isSelected = strat === activeStrategy;

            if (!r || !r.found || !m) {
              return (
                <tr key={strat} className="text-[#777C83] opacity-60">
                  <td className="py-2.5 px-3 font-sans font-medium">{r?.label ?? strat}</td>
                  <td colSpan={6} className="py-2.5 px-3 text-[#D9452B]">
                    {r?.error ?? "Path impassable"}
                  </td>
                </tr>
              );
            }

            const hasCriticalSlope = m.criticalSlopeSegments > 0;
            const isHypoxic = m.survivalProbability <= 0.0;

            return (
              <tr
                key={strat}
                onClick={() => setActiveStrategy(strat)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#17191D]/80 text-[#E8E5DF]"
                    : "hover:bg-[#17191D]/40 text-[#777C83]"
                }`}
              >
                <td className="py-2.5 px-3 font-sans font-medium flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className={isSelected ? "text-[#E8E5DF] font-semibold" : ""}>
                    {r.label}
                  </span>
                </td>
                <td className="py-2.5 px-3">{formatKm(m.distanceM)}</td>
                <td className="py-2.5 px-3">{formatDuration(m.estimatedDurationSec)}</td>
                <td className="py-2.5 px-3">
                  <span className={hasCriticalSlope ? "text-[#D9452B] font-bold" : ""}>
                    {m.maxSlopeDeg.toFixed(1)}°
                  </span>
                  {hasCriticalSlope && (
                    <span className="text-[10px] text-[#D9452B] block font-sans">
                      ⚠️ SCARP
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className={isHypoxic ? "text-[#D9452B] font-bold" : ""}>
                    {m.oxygenConsumedL.toFixed(1)} L
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`font-bold ${
                      m.survivalProbability > 0.8
                        ? "text-[#4ADE80]"
                        : m.survivalProbability > 0.4
                        ? "text-[#E9A16A]"
                        : "text-[#D9452B]"
                    }`}
                  >
                    {(m.survivalProbability * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStrategy(strat);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-sans font-semibold tracking-wider transition-all ${
                      isSelected
                        ? "bg-[#E9A16A] text-black"
                        : "bg-[#17191D] text-[#777C83] hover:text-[#E8E5DF]"
                    }`}
                  >
                    {isSelected ? "Active" : "View"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
