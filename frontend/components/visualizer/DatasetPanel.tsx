"use client";

import { MARS_DATASETS } from "@/lib/data/mars-datasets";
import { useVisualizerStore } from "@/lib/state/visualizer-store";
import DatasetCard from "./DatasetCard";
import { Layers, Clock } from "lucide-react";

export default function DatasetPanel() {
  const activeDatasetId = useVisualizerStore((state) => state.activeDatasetId);
  const setActiveDataset = useVisualizerStore((state) => state.setActiveDataset);

  // Planned future datasets for roadmap awareness, clearly marked as unavailable
  const plannedDatasets = [
    {
      id: "themis-night",
      name: "THEMIS Night IR",
      instrument: "THEMIS",
      mission: "Mars Odyssey",
      status: "Pipeline Pending",
    },
    {
      id: "mola-dem",
      name: "MOLA Elevation Grid",
      instrument: "MOLA",
      mission: "MGS",
      status: "Pipeline Pending",
    },
    {
      id: "ctx-mosaic",
      name: "CTX Context Mosaic",
      instrument: "CTX",
      mission: "MRO",
      status: "High-Res Tiling Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#777C83]">
          <Layers className="w-4 h-4 text-[#E9A16A]" />
          <span>Active Visualizer Layers</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17191D] border border-[#C66B3D]/30 text-[#E9A16A]">
          1 ONLINE
        </span>
      </div>

      {/* Available Datasets */}
      <div className="space-y-3">
        {MARS_DATASETS.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            isActive={activeDatasetId === dataset.id}
            onSelect={() => setActiveDataset(dataset.id)}
          />
        ))}
      </div>

      {/* Planned / Pending Datasets */}
      <div className="pt-4 border-t border-[#17191D] space-y-3">
        <div className="text-[11px] uppercase tracking-wider text-[#777C83] flex items-center space-x-1.5 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Roadmap Datasets (Unprocessed)</span>
        </div>
        <div className="space-y-2">
          {plannedDatasets.map((ds) => (
            <div
              key={ds.id}
              className="p-3 rounded bg-[#17191D]/30 border border-[#17191D] opacity-60 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-medium text-[#777C83]">{ds.name}</div>
                <div className="text-[10px] text-[#777C83]/70">
                  {ds.instrument} • {ds.mission}
                </div>
              </div>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#090A0C] border border-[#777C83]/20 text-[#777C83]">
                {ds.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
