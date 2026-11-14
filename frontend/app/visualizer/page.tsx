import VisualizerWorkspace from "@/components/visualizer/VisualizerWorkspace";

export const metadata = {
  title: "Dataset Visualizer — Martian Map | Project Astra",
  description: "Explore 2D OpenLayers Mars datasets across Jezero Crater. THEMIS daytime thermal infrared imagery.",
};

export default function VisualizerPage() {
  return <VisualizerWorkspace />;
}
