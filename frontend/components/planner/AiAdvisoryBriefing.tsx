"use client";

import { usePlannerStore } from "@/lib/state/planner-store";
import { Bot, Sparkles, Loader2 } from "lucide-react";

export default function AiAdvisoryBriefing() {
  const aiBriefing = usePlannerStore((s) => s.aiBriefing);
  const isGeneratingAi = usePlannerStore((s) => s.isGeneratingAi);
  const requestAiBriefing = usePlannerStore((s) => s.requestAiBriefing);
  const routes = usePlannerStore((s) => s.routes);

  return (
    <div className="p-4 rounded bg-[#17191D]/60 border border-[#777C83]/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E9A16A]/20 border border-[#E9A16A]/40 flex items-center justify-center text-[#E9A16A]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#E8E5DF] uppercase tracking-wider">
              AI Flight Surgeon & Mission Officer
            </div>
            <div className="text-[10px] text-[#777C83]">
              Gemini 2.5 Flash • Multi-Objective Reasoning Layer
            </div>
          </div>
        </div>

        <button
          onClick={requestAiBriefing}
          disabled={isGeneratingAi || !routes}
          className="px-3 py-1.5 rounded bg-[#C66B3D] hover:bg-[#E9A16A] text-white font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50"
        >
          {isGeneratingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiBriefing ? "Refresh Advisory" : "Consult AI"}</span>
            </>
          )}
        </button>
      </div>

      {/* AI Content Display */}
      {aiBriefing ? (
        <div className="p-3.5 rounded bg-[#090A0C] border border-[#17191D] text-xs text-[#E8E5DF] leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
          {aiBriefing}
        </div>
      ) : (
        <div className="p-3 rounded bg-[#090A0C]/40 border border-[#17191D] text-[11px] text-[#777C83] leading-relaxed">
          Click <span className="text-[#E9A16A] font-semibold">Consult AI</span> to generate a mission briefing synthesizing real-time terrain slopes, oxygen burn dynamics, and scientific exploration tradeoffs.
        </div>
      )}
    </div>
  );
}
