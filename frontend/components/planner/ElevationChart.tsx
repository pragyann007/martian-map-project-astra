"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePlannerStore } from "@/lib/state/planner-store";
import { Mountain } from "lucide-react";

export default function ElevationChart() {
  const routes = usePlannerStore((s) => s.routes);
  const activeStrategy = usePlannerStore((s) => s.activeStrategy);

  const activeRoute = routes ? routes[activeStrategy] : null;
  const profile = activeRoute?.metrics?.profile;

  const chartData = useMemo(() => {
    if (!profile || profile.length === 0) return [];
    // Downsample to max 50 points for smooth rendering
    const step = Math.max(1, Math.floor(profile.length / 50));
    return profile
      .filter((_, i) => i % step === 0 || i === profile.length - 1)
      .map((p) => ({
        distKm: Number((p.distM / 1000).toFixed(2)),
        elevation: Math.round(p.elev),
        slopeDeg: Number(p.slopeDeg.toFixed(1)),
        o2Remaining: Number(p.o2RemainingL.toFixed(1)),
      }));
  }, [profile]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-44 rounded bg-[#17191D]/30 border border-[#777C83]/20 flex items-center justify-center text-xs text-[#777C83]">
        Calculating elevation transect profile...
      </div>
    );
  }

  const minElev = Math.min(...chartData.map((d) => d.elevation)) - 10;
  const maxElev = Math.max(...chartData.map((d) => d.elevation)) + 10;

  return (
    <div className="p-4 rounded bg-[#090A0C] border border-[#17191D] space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Mountain className="w-4 h-4 text-[#E9A16A]" />
          <span className="font-semibold uppercase tracking-wider text-[#E8E5DF]">
            Terrain Elevation & Slope Profile
          </span>
          <span className="text-[10px] text-[#777C83] font-mono">
            ({activeRoute?.label})
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono text-[#777C83]">
          <span>MIN: {minElev + 10} m</span>
          <span>MAX: {maxElev - 10} m</span>
          <span className="text-[#E9A16A]">MAX SLOPE: {activeRoute?.metrics?.maxSlopeDeg.toFixed(1)}°</span>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C66B3D" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#C66B3D" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#17191D" />
            <XAxis
              dataKey="distKm"
              tick={{ fill: "#777C83", fontSize: 10 }}
              tickLine={{ stroke: "#17191D" }}
              unit=" km"
            />
            <YAxis
              domain={[minElev, maxElev]}
              tick={{ fill: "#777C83", fontSize: 10 }}
              tickLine={{ stroke: "#17191D" }}
              unit=" m"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded bg-[#17191D]/95 border border-[#777C83]/30 text-xs shadow-2xl backdrop-blur-md space-y-1">
                      <div className="font-mono text-[#E9A16A] font-bold">
                        Transect: {data.distKm} km
                      </div>
                      <div className="text-[11px] text-[#E8E5DF]">
                        Elevation: <span className="font-mono">{data.elevation} m</span>
                      </div>
                      <div className="text-[11px] text-[#E8E5DF]">
                        Slope: <span className={`font-mono ${data.slopeDeg > 20 ? 'text-[#D9452B] font-bold' : ''}`}>{data.slopeDeg}°</span>
                      </div>
                      <div className="text-[11px] text-[#38BDF8]">
                        O2 Margin: <span className="font-mono">{data.o2Remaining} L</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#C66B3D"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#elevGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
