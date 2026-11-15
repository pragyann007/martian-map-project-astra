"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SimulationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[ASTRA] 3D Simulation error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[460px] flex flex-col items-center justify-center bg-[#090A0C] text-[#E8E5DF] p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#D9452B]/20 border border-[#D9452B] flex items-center justify-center text-[#D9452B]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-center max-w-md space-y-2">
            <h3 className="font-heading font-bold text-sm text-[#E8E5DF] uppercase tracking-wider">
              3D Planetary Simulation Suspended
            </h3>
            <p className="text-xs text-[#777C83] leading-relaxed">
              WebGL hardware acceleration is required to render the 3D Martian terrain mesh.
              {this.state.error?.message ? ` (${this.state.error.message})` : ""}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-[#17191D] hover:bg-[#17191D]/80 border border-[#777C83]/40 text-xs font-semibold text-[#E9A16A] flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry 3D Initializer</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
