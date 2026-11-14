import Link from "next/link";
import { Compass, Layers } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090A0C] text-[#E8E5DF] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full border border-[#C66B3D] flex items-center justify-center bg-[#17191D]">
          <Compass className="w-8 h-8 text-[#E9A16A]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-[#E8E5DF]">
            Martian Map
          </h1>
          <p className="text-xs text-[#777C83] uppercase tracking-widest mt-1">
            Project Astra • NASA Space Apps Challenge 2026
          </p>
        </div>
        <p className="text-sm text-[#A3A8B0] leading-relaxed">
          Interactive planetary exploration platform for Jezero Crater, Mars.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/visualizer"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded bg-[#C66B3D] hover:bg-[#E9A16A] text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#C66B3D]/20"
          >
            <Layers className="w-4 h-4" />
            <span>Launch Visualizer</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
