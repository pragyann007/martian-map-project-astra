"use client";

import { usePlannerStore } from "@/lib/state/planner-store";
import { formatKm } from "@/lib/domain/mars-math";
import {
  Sparkles,
  TrendingUp,
  Target,
} from "lucide-react";

export default function ScienceMissionPanel() {
  const scienceTargets = usePlannerStore((s) => s.scienceTargets);
  const selectedTargetId = usePlannerStore((s) => s.selectedTargetId);
  const selectScienceTarget = usePlannerStore((s) => s.selectScienceTarget);

  return (
    <div className="space-y-4 text-xs text-[#E8E5DF]">
      {/* Exploration Header */}
      <div className="p-3.5 rounded bg-[#17191D]/70 border border-[#777C83]/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80]/40 flex items-center justify-center text-[#4ADE80]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#E8E5DF]">
              Mineral & Astrobiology Targets
            </div>
            <div className="text-[11px] text-[#777C83]">
              USGS SIM 3464 & Mars 2020 Spectral Discoveries
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#090A0C] border border-[#777C83]/30 text-[#4ADE80]">
          {scienceTargets.length} SITES RANKED
        </span>
      </div>

      <p className="text-[11px] text-[#777C83] leading-relaxed">
        Destinations are algorithmically ranked using multi-criteria optimization: Mineral richness (45%), proximity to base (35%), and topographic traversability (20%).
      </p>

      {/* Ranked Targets List */}
      <div className="space-y-2.5">
        {scienceTargets.map((target, idx) => {
          const isSelected = target.id === selectedTargetId;

          return (
            <div
              key={target.id}
              className={`p-3.5 rounded border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#4ADE80]/15 border-[#4ADE80] shadow-lg"
                  : "bg-[#17191D]/40 border-[#777C83]/20 hover:border-[#4ADE80]/40 hover:bg-[#17191D]/70"
              }`}
              onClick={() => selectScienceTarget(target.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-[#17191D] border border-[#777C83]/40 text-[9px] font-mono flex items-center justify-center text-[#E9A16A]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-[#E8E5DF]">
                      {target.name}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#4ADE80] block mt-0.5">
                    {target.category} • Elev: {target.elevationM} m
                  </span>
                </div>

                {/* Score Badges */}
                <div className="text-right">
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 font-mono font-bold text-[11px]">
                    <TrendingUp className="w-3 h-3" />
                    <span>{target.missionSuccessScore}% FIT</span>
                  </div>
                  <div className="text-[10px] text-[#777C83] mt-1 font-mono">
                    {target.distanceFromStartM ? formatKm(target.distanceFromStartM) : "--"}
                  </div>
                </div>
              </div>

              {/* Sourced Minerals */}
              <div className="mt-2 flex flex-wrap gap-1">
                {target.minerals.map((m) => (
                  <span
                    key={m}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-[#090A0C] border border-[#777C83]/20 text-[#E8E5DF]/90 font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="mt-2 text-[11px] text-[#777C83] leading-relaxed">
                {target.scientificSignificance}
              </p>

              {/* Selection Button */}
              <div className="mt-2.5 pt-2 border-t border-[#17191D] flex items-center justify-between text-[11px]">
                <span className="text-[#777C83]">
                  Slope Hazard Score: {target.slopeDifficultyScore}/100
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectScienceTarget(target.id);
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                    isSelected
                      ? "bg-[#4ADE80] text-black"
                      : "bg-[#17191D] text-[#4ADE80] border border-[#4ADE80]/40 hover:bg-[#4ADE80]/20"
                  }`}
                >
                  <Target className="w-3 h-3" />
                  <span>{isSelected ? "Active Target" : "Select Target"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
